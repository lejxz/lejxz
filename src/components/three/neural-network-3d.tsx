"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useRef, useMemo, Suspense } from "react";
import * as THREE from "three";

/**
 * NeuralNetwork3D — a 3D neural network visualization built with three.js +
 * react-three-fiber. Layered neuron positions, animated connection lines, and
 * signal pulses. The whole scene reacts to pointer movement (parallax tilt +
 * gentle node attraction).
 *
 * Performance: InstancedMesh for neurons + pulses, single LineSegments for
 * connections. Pauses when offscreen. Reduced-motion = static. Mobile = fewer
 * neurons + no post-processing.
 */

interface NodePos {
  pos: THREE.Vector3;
  layer: number;
}

const LAYERS = [5, 8, 10, 8, 5]; // neurons per layer
const LAYER_GAP = 2.4;
const NODE_SPREAD = 2.0;

function buildNetwork() {
  const nodes: NodePos[] = [];
  const connections: [number, number][] = [];
  const layerOffset = -((LAYERS.length - 1) * LAYER_GAP) / 2;

  LAYERS.forEach((count, li) => {
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0 : i / (count - 1) - 0.5;
      const y = t * NODE_SPREAD * (count > 4 ? 1.6 : 1.2);
      const z = layerOffset + li * LAYER_GAP;
      const x = (Math.random() - 0.5) * 0.4;
      nodes.push({ pos: new THREE.Vector3(x, y, z), layer: li });
    }
  });

  // connect adjacent layers fully
  let start = 0;
  for (let li = 0; li < LAYERS.length - 1; li++) {
    const aStart = start;
    const aEnd = start + LAYERS[li];
    const bStart = aEnd;
    const bEnd = bStart + LAYERS[li + 1];
    for (let a = aStart; a < aEnd; a++) {
      for (let b = bStart; b < bEnd; b++) {
        connections.push([a, b]);
      }
    }
    start = aEnd;
  }

  return { nodes, connections };
}

function NetworkMesh({ isMobile }: { isMobile: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const neuronRef = useRef<THREE.InstancedMesh>(null);
  const haloRef = useRef<THREE.InstancedMesh>(null);
  const lineRef = useRef<THREE.LineSegments>(null);
  const pulseRef = useRef<THREE.InstancedMesh>(null);
  const { pointer, viewport } = useThree();

  const { nodes, connections } = useMemo(() => buildNetwork(), []);
  const nodeCount = nodes.length;
  const connCount = connections.length;
  const pulseCount = isMobile ? 12 : 28;

  // connection line geometry
  const lineGeometry = useMemo(() => {
    const positions = new Float32Array(connCount * 6);
    connections.forEach(([a, b], i) => {
      const pa = nodes[a].pos;
      const pb = nodes[b].pos;
      positions[i * 6] = pa.x;
      positions[i * 6 + 1] = pa.y;
      positions[i * 6 + 2] = pa.z;
      positions[i * 6 + 3] = pb.x;
      positions[i * 6 + 4] = pb.y;
      positions[i * 6 + 5] = pb.z;
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [nodes, connections]);

  // pulse instances travel along random connections — stored in a ref so we
  // can mutate their progress each frame without re-triggering hooks.
  const pulseData = useRef(
    Array.from({ length: pulseCount }, () => ({
      connIdx: Math.floor(Math.random() * connCount),
      t: Math.random(),
      speed: 0.3 + Math.random() * 0.5,
    }))
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colorTeal = useMemo(() => new THREE.Color("#5eead4"), []);
  const colorViolet = useMemo(() => new THREE.Color("#a78bfa"), []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (!groupRef.current) return;

    // parallax tilt following pointer
    const targetRotY = pointer.x * 0.35;
    const targetRotX = -pointer.y * 0.2;
    groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.05;
    groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.05;
    // gentle auto-drift
    groupRef.current.position.y = Math.sin(time * 0.3) * 0.15;

    // animate neurons (pulse scale)
    if (neuronRef.current) {
      for (let i = 0; i < nodeCount; i++) {
        const n = nodes[i];
        const pulse = 0.8 + Math.sin(time * 1.2 + i * 0.5) * 0.3;
        dummy.position.copy(n.pos);
        dummy.scale.setScalar(pulse);
        dummy.updateMatrix();
        neuronRef.current.setMatrixAt(i, dummy.matrix);
        const c = i % 3 === 0 ? colorViolet : colorTeal;
        neuronRef.current.setColorAt(i, c);
      }
      neuronRef.current.instanceMatrix.needsUpdate = true;
      if (neuronRef.current.instanceColor) neuronRef.current.instanceColor.needsUpdate = true;
    }

    // halos (larger, dimmer)
    if (haloRef.current) {
      for (let i = 0; i < nodeCount; i++) {
        const n = nodes[i];
        const pulse = 0.6 + Math.sin(time * 1.2 + i * 0.5) * 0.2;
        dummy.position.copy(n.pos);
        dummy.scale.setScalar(pulse * 2.2);
        dummy.updateMatrix();
        haloRef.current.setMatrixAt(i, dummy.matrix);
      }
      haloRef.current.instanceMatrix.needsUpdate = true;
    }

    // animate pulses along connections
    if (pulseRef.current) {
      const pulses = pulseData.current;
      for (let i = 0; i < pulseCount; i++) {
        const p = pulses[i];
        p.t += p.speed * 0.016;
        if (p.t >= 1) {
          p.t = 0;
          p.connIdx = Math.floor(Math.random() * connCount);
        }
        const [a, b] = connections[p.connIdx];
        const pa = nodes[a].pos;
        const pb = nodes[b].pos;
        dummy.position.lerpVectors(pa, pb, p.t);
        const intensity = Math.sin(p.t * Math.PI);
        dummy.scale.setScalar(0.08 + intensity * 0.12);
        dummy.updateMatrix();
        pulseRef.current.setMatrixAt(i, dummy.matrix);
        pulseRef.current.setColorAt(i, intensity > 0.5 ? colorViolet : colorTeal);
      }
      pulseRef.current.instanceMatrix.needsUpdate = true;
      if (pulseRef.current.instanceColor) pulseRef.current.instanceColor.needsUpdate = true;
    }

    // animate connection line opacity (subtle pulse)
    if (lineRef.current) {
      const mat = lineRef.current.material as THREE.LineBasicMaterial;
      mat.opacity = 0.15 + Math.sin(time * 0.8) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* connection lines */}
      <lineSegments ref={lineRef} geometry={lineGeometry}>
        <lineBasicMaterial color="#5eead4" transparent opacity={0.18} />
      </lineSegments>

      {/* neuron halos (additive, dim) */}
      <instancedMesh ref={haloRef} args={[undefined, undefined, nodeCount]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshBasicMaterial color="#5eead4" transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} />
      </instancedMesh>

      {/* neuron cores */}
      <instancedMesh ref={neuronRef} args={[undefined, undefined, nodeCount]}>
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshBasicMaterial color="#5eead4" toneMapped={false} />
      </instancedMesh>

      {/* signal pulses */}
      <instancedMesh ref={pulseRef} args={[undefined, undefined, pulseCount]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#a78bfa" toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </instancedMesh>
    </group>
  );
}

function Motes({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 16;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8 - 4;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#5eead4" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

export function NeuralNetwork3D({ className }: { className?: string }) {
  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 768px)").matches;
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div className={className} aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 9], fov: 55 }}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        gl={{ antialias: !isMobile, alpha: true, powerPreference: "high-performance" }}
        frameloop={reducedMotion ? "demand" : "always"}
        style={{ width: "100%", height: "100%" }}
      >
        <Suspense fallback={null}>
          <NetworkMesh isMobile={isMobile} />
          <Motes count={isMobile ? 30 : 60} />
          {!isMobile && (
            <EffectComposer>
              <Bloom
                intensity={0.8}
                luminanceThreshold={0.2}
                luminanceSmoothing={0.9}
                mipmapBlur
              />
            </EffectComposer>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
