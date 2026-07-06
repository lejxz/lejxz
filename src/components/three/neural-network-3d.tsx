"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useRef, useMemo, Suspense } from "react";
import * as THREE from "three";

/**
 * NeuralNetwork3D — a clean, interactive 3D particle network.
 *
 * Sparse neurons spread across a wide 3D volume, connected to nearby
 * neighbors. The whole scene tilts and drifts toward the pointer (obvious
 * parallax). Signal pulses travel along edges. Bloom adds the glow.
 *
 * Design choices to avoid "clustered" look:
 * - Fewer neurons (desktop 36, mobile 18) spread across a wide volume
 * - Only connect nearest neighbors (max 3 per node), not full bipartite
 * - Larger camera distance so the network floats in space
 */

const NODE_COUNT_DESKTOP = 36;
const NODE_COUNT_MOBILE = 18;
const CONNECT_DISTANCE = 3.2;

interface NodeData {
  pos: THREE.Vector3;
  basePos: THREE.Vector3;
  vel: THREE.Vector3;
  neighbors: number[];
}

function buildNodes(count: number): NodeData[] {
  const nodes: NodeData[] = [];
  const range = 8;
  for (let i = 0; i < count; i++) {
    const pos = new THREE.Vector3(
      (Math.random() - 0.5) * range,
      (Math.random() - 0.5) * range * 0.7,
      (Math.random() - 0.5) * range * 0.5
    );
    nodes.push({
      pos: pos.clone(),
      basePos: pos.clone(),
      vel: new THREE.Vector3(
        (Math.random() - 0.5) * 0.008,
        (Math.random() - 0.5) * 0.008,
        (Math.random() - 0.5) * 0.004
      ),
      neighbors: [],
    });
  }
  // connect nearest neighbors
  for (let i = 0; i < count; i++) {
    const dists: { j: number; d: number }[] = [];
    for (let j = 0; j < count; j++) {
      if (i === j) continue;
      const d = nodes[i].pos.distanceTo(nodes[j].pos);
      if (d < CONNECT_DISTANCE) dists.push({ j, d });
    }
    dists.sort((a, b) => a.d - b.d);
    nodes[i].neighbors = dists.slice(0, 3).map((x) => x.j);
  }
  return nodes;
}

function Network({ isMobile }: { isMobile: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const nodeRef = useRef<THREE.InstancedMesh>(null);
  const lineRef = useRef<THREE.LineSegments>(null);
  const pulseRef = useRef<THREE.InstancedMesh>(null);
  const { pointer } = useThree();

  const count = isMobile ? NODE_COUNT_MOBILE : NODE_COUNT_DESKTOP;
  const nodes = useMemo(() => buildNodes(count), [count]);

  // build line segments from neighbor connections (dedupe pairs)
  const { lineGeometry, lineCount } = useMemo(() => {
    const pairs = new Set<string>();
    const segs: [number, number][] = [];
    nodes.forEach((n, i) => {
      n.neighbors.forEach((j) => {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!pairs.has(key)) {
          pairs.add(key);
          segs.push([i, j]);
        }
      });
    });
    const positions = new Float32Array(segs.length * 6);
    segs.forEach(([a, b], i) => {
      positions[i * 6] = nodes[a].pos.x;
      positions[i * 6 + 1] = nodes[a].pos.y;
      positions[i * 6 + 2] = nodes[a].pos.z;
      positions[i * 6 + 3] = nodes[b].pos.x;
      positions[i * 6 + 4] = nodes[b].pos.y;
      positions[i * 6 + 5] = nodes[b].pos.z;
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return { lineGeometry: geo, lineCount: segs.length };
  }, [nodes]);

  // pulse data — traveling sparks along random edges
  const pulseCount = isMobile ? 8 : 18;
  const pulses = useRef(
    Array.from({ length: pulseCount }, () => ({
      edge: Math.floor(Math.random() * 20),
      t: Math.random(),
      speed: 0.2 + Math.random() * 0.4,
    }))
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colorTeal = useMemo(() => new THREE.Color("#5eead4"), []);
  const colorViolet = useMemo(() => new THREE.Color("#a78bfa"), []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (!groupRef.current) return;

    // Obvious parallax tilt — follows pointer strongly
    const targetRotY = pointer.x * 0.5;
    const targetRotX = -pointer.y * 0.35;
    groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.06;
    groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.06;
    // gentle vertical drift
    groupRef.current.position.y = Math.sin(time * 0.25) * 0.2;

    // animate nodes — drift around base position
    if (nodeRef.current) {
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.pos.add(n.vel);
        // pull back toward base
        n.pos.lerp(n.basePos, 0.01);
        // wrap slightly
        const limit = 5;
        if (n.pos.x > limit) n.vel.x = -Math.abs(n.vel.x);
        if (n.pos.x < -limit) n.vel.x = Math.abs(n.vel.x);
        if (n.pos.y > limit * 0.7) n.vel.y = -Math.abs(n.vel.y);
        if (n.pos.y < -limit * 0.7) n.vel.y = Math.abs(n.vel.y);

        const pulse = 0.85 + Math.sin(time * 1.5 + i * 0.7) * 0.25;
        dummy.position.copy(n.pos);
        dummy.scale.setScalar(pulse);
        dummy.updateMatrix();
        nodeRef.current.setMatrixAt(i, dummy.matrix);
        nodeRef.current.setColorAt(i, i % 4 === 0 ? colorViolet : colorTeal);
      }
      nodeRef.current.instanceMatrix.needsUpdate = true;
      if (nodeRef.current.instanceColor) nodeRef.current.instanceColor.needsUpdate = true;
    }

    // update line positions to follow nodes
    if (lineRef.current) {
      const posAttr = lineRef.current.geometry.getAttribute("position") as THREE.BufferAttribute;
      let pi = 0;
      const seen = new Set<string>();
      nodes.forEach((n, i) => {
        n.neighbors.forEach((j) => {
          const key = i < j ? `${i}-${j}` : `${j}-${i}`;
          if (seen.has(key)) return;
          seen.add(key);
          posAttr.setXYZ(pi, nodes[i].pos.x, nodes[i].pos.y, nodes[i].pos.z);
          pi++;
          posAttr.setXYZ(pi, nodes[j].pos.x, nodes[j].pos.y, nodes[j].pos.z);
          pi++;
        });
      });
      posAttr.needsUpdate = true;
      const mat = lineRef.current.material as THREE.LineBasicMaterial;
      mat.opacity = 0.2 + Math.sin(time * 0.7) * 0.05;
    }

    // animate pulses
    if (pulseRef.current) {
      const ps = pulses.current;
      const edges: [number, number][] = [];
      const seen = new Set<string>();
      nodes.forEach((n, i) => {
        n.neighbors.forEach((j) => {
          const key = i < j ? `${i}-${j}` : `${j}-${i}`;
          if (seen.has(key)) return;
          seen.add(key);
          edges.push([i, j]);
        });
      });
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        p.t += p.speed * 0.016;
        if (p.t >= 1) {
          p.t = 0;
          p.edge = Math.floor(Math.random() * edges.length);
        }
        const [a, b] = edges[p.edge] || edges[0];
        dummy.position.lerpVectors(nodes[a].pos, nodes[b].pos, p.t);
        const intensity = Math.sin(p.t * Math.PI);
        dummy.scale.setScalar(0.06 + intensity * 0.1);
        dummy.updateMatrix();
        pulseRef.current.setMatrixAt(i, dummy.matrix);
        pulseRef.current.setColorAt(i, intensity > 0.5 ? colorViolet : colorTeal);
      }
      pulseRef.current.instanceMatrix.needsUpdate = true;
      if (pulseRef.current.instanceColor) pulseRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      {/* connection lines */}
      <lineSegments ref={lineRef} geometry={lineGeometry}>
        <lineBasicMaterial color="#5eead4" transparent opacity={0.2} />
      </lineSegments>

      {/* neuron cores */}
      <instancedMesh ref={nodeRef} args={[undefined, undefined, count]}>
        <sphereGeometry args={[0.09, 12, 12]} />
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
        camera={{ position: [0, 0, 11], fov: 50 }}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        gl={{ antialias: !isMobile, alpha: true, powerPreference: "high-performance" }}
        frameloop={reducedMotion ? "demand" : "always"}
        style={{ width: "100%", height: "100%" }}
      >
        <Suspense fallback={null}>
          <Network isMobile={isMobile} />
          {!isMobile && (
            <EffectComposer>
              <Bloom
                intensity={0.7}
                luminanceThreshold={0.15}
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
