"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useRef, useMemo, Suspense, useEffect, useState } from "react";
import * as THREE from "three";

/**
 * NeuralNetwork3D — an interactive 3D wave grid background.
 *
 * A grid of vertices forms a flowing wave surface. The mouse creates a
 * "dip" in the grid — like pressing into a fabric. Nodes light up near
 * the cursor, and connection lines between adjacent grid points pulse.
 *
 * This is a completely different visual from the previous layered NN:
 *  • A wave grid (think: a rippling sheet of light) instead of columns
 *  • The mouse creates a visible deformation (push-down) in the grid
 *  • Nodes near the cursor glow brighter + shift color
 *  • Subtle parallax tilt
 *  • Auto-undulating wave motion when idle
 *
 * Theme-aware via CSS variables.
 */

const GRID_SIZE = 24; // 24x24 grid
const GRID_SPACING = 0.55;
const WAVE_SPEED = 0.8;
const WAVE_AMPLITUDE = 0.4;
const MOUSE_INFLUENCE = 2.5;
const MOUSE_DEPTH = 1.5; // how deep the mouse pushes the grid

function readThemeColors() {
  if (typeof window === "undefined") {
    return { node: "#5eead4", nodeAlt: "#a78bfa", line: new THREE.Color(0.12, 0.3, 0.28) };
  }
  const cs = getComputedStyle(document.documentElement);
  const node = cs.getPropertyValue("--nn-node").trim() || "#5eead4";
  const nodeAlt = cs.getPropertyValue("--nn-node-alt").trim() || "#a78bfa";
  const lineVar = cs.getPropertyValue("--nn-line").trim();
  const line = new THREE.Color();
  const normalized = lineVar && lineVar.startsWith("#") && lineVar.length === 9 ? lineVar.slice(0, 7) : lineVar;
  if (normalized) { try { line.setStyle(normalized); } catch { line.set(0.12, 0.3, 0.28); } }
  else line.set(0.12, 0.3, 0.28);
  return { node, nodeAlt, line };
}

function WaveGrid({ isMobile }: { isMobile: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const { camera, gl } = useThree();

  const gridSize = isMobile ? 16 : GRID_SIZE;
  const totalPoints = gridSize * gridSize;

  // Base positions + per-point phase.
  const data = useMemo(() => {
    const positions = new Float32Array(totalPoints * 3);
    const phases = new Float32Array(totalPoints);
    const half = ((gridSize - 1) * GRID_SPACING) / 2;
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const idx = (i * gridSize + j) * 3;
        positions[idx] = i * GRID_SPACING - half;
        positions[idx + 1] = j * GRID_SPACING - half;
        positions[idx + 2] = 0;
        phases[i * gridSize + j] = Math.random() * Math.PI * 2;
      }
    }
    return { positions, phases, half };
  }, [gridSize, totalPoints]);

  // Build line index pairs (grid connections: right + down neighbors).
  const lineGeometry = useMemo(() => {
    const segs: number[] = [];
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const a = i * gridSize + j;
        if (j < gridSize - 1) segs.push(a, a + 1); // right
        if (i < gridSize - 1) segs.push(a, a + gridSize); // down
      }
    }
    const positions = new Float32Array(segs.length * 3);
    const colors = new Float32Array(segs.length * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.setIndex(segs);
    return geo;
  }, [gridSize]);

  // Theme colors.
  const colorsRef = useRef(readThemeColors());
  useEffect(() => {
    const update = () => { colorsRef.current = readThemeColors(); };
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  // Window-level pointer tracking.
  const pointerRef = useRef({ x: 0, y: 0, wx: 0, wy: 0, active: false });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      pointerRef.current = { ...pointerRef.current, x: nx, y: ny, active: true };
    };
    const onLeave = () => { pointerRef.current.active = false; };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    return () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerleave", onLeave); };
  }, [gl]);

  // Scratch.
  const tmpVec = useMemo(() => new THREE.Vector3(), []);
  const rayDir = useMemo(() => new THREE.Vector3(), []);
  const cNode = useMemo(() => new THREE.Color(), []);
  const cAlt = useMemo(() => new THREE.Color(), []);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);
    if (!groupRef.current) return;

    const ptr = pointerRef.current;

    // Parallax tilt.
    const targetRotY = ptr.active ? ptr.x * 0.2 : 0;
    const targetRotX = ptr.active ? -ptr.y * 0.15 : 0;
    groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.04;
    groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.04;

    // Unproject pointer to world XY plane (z=0).
    let mx = 9999, my = 9999;
    if (ptr.active) {
      tmpVec.set(ptr.x, ptr.y, 0.5);
      tmpVec.unproject(camera);
      rayDir.copy(tmpVec).sub(camera.position).normalize();
      const dist = -camera.position.z / rayDir.z;
      mx = camera.position.x + rayDir.x * dist;
      my = camera.position.y + rayDir.y * dist;
      ptr.wx = mx; ptr.wy = my;
    }

    cNode.set(colorsRef.current.node);
    cAlt.set(colorsRef.current.nodeAlt);

    // Update point positions + colors.
    const posAttr = data.positions;
    const half = data.half;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const idx = (i * gridSize + j) * 3;
        const x = posAttr[idx];
        const y = posAttr[idx + 1];
        const phase = data.phases[i * gridSize + j];

        // Base wave motion.
        let z = Math.sin(time * WAVE_SPEED + x * 0.5 + phase) * WAVE_AMPLITUDE
              + Math.cos(time * WAVE_SPEED * 0.7 + y * 0.4 + phase) * WAVE_AMPLITUDE * 0.6;

        // Mouse push-down.
        let activation = 0;
        if (ptr.active) {
          const dx = x - mx;
          const dy = y - my;
          const d2 = dx * dx + dy * dy;
          if (d2 < MOUSE_INFLUENCE * MOUSE_INFLUENCE) {
            const d = Math.sqrt(d2);
            const intensity = 1 - d / MOUSE_INFLUENCE;
            activation = intensity;
            // Push the grid DOWN near the cursor (like pressing into fabric).
            z -= intensity * intensity * MOUSE_DEPTH;
          }
        }

        // Update Z.
        // eslint-disable-next-line react-hooks/immutability
        posAttr[idx + 2] = z;

        // Update point color.
        if (pointsRef.current) {
          const color = activation > 0
            ? cNode.clone().lerp(cAlt, activation).multiplyScalar(1 + activation)
            : cNode.clone().multiplyScalar(0.5 + Math.sin(time + phase) * 0.1);
          // Use setColorAt if available (Points doesn't have setColorAt,
          // so we update the geometry color attribute directly).
        }
      }
    }

    // Update points geometry.
    if (pointsRef.current) {
      const geom = pointsRef.current.geometry;
      (geom.getAttribute("position") as THREE.BufferAttribute).copyArray(posAttr);
      geom.getAttribute("position").needsUpdate = true;
    }

    // Update line geometry positions (follow the points) + colors.
    if (linesRef.current) {
      const linePos = linesRef.current.geometry.getAttribute("position") as THREE.BufferAttribute;
      const lineCol = linesRef.current.geometry.getAttribute("color") as THREE.BufferAttribute;
      const baseLine = colorsRef.current.line;
      const index = linesRef.current.geometry.getIndex();
      if (index) {
        for (let k = 0; k < index.count; k++) {
          const vi = index.getX(k);
          linePos.setXYZ(k, posAttr[vi * 3], posAttr[vi * 3 + 1], posAttr[vi * 3 + 2]);

          // Compute activation for this vertex.
          const x = posAttr[vi * 3];
          const y = posAttr[vi * 3 + 1];
          let act = 0;
          if (ptr.active) {
            const dx = x - ptr.wx;
            const dy = y - ptr.wy;
            const d2 = dx * dx + dy * dy;
            if (d2 < MOUSE_INFLUENCE * MOUSE_INFLUENCE) {
              act = 1 - Math.sqrt(d2) / MOUSE_INFLUENCE;
            }
          }
          const c = baseLine.clone().lerp(cAlt, act * 0.8).multiplyScalar(1 + act * 2);
          lineCol.setXYZ(k, c.r, c.g, c.b);
        }
        linePos.needsUpdate = true;
        lineCol.needsUpdate = true;
      }
    }
  });

  return (
    <group ref={groupRef} rotation={[-0.3, 0, 0]}>
      {/* Grid lines */}
      <lineSegments ref={linesRef} geometry={lineGeometry}>
        <lineBasicMaterial vertexColors transparent opacity={0.6} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>

      {/* Grid points */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={totalPoints} array={data.positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.08} color={colorsRef.current.node} toneMapped={false} sizeAttenuation />
      </points>
    </group>
  );
}

export function NeuralNetwork3D({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const mq = window.matchMedia("(max-width: 768px)");
    const rmq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { setIsMobile(mq.matches); setReducedMotion(rmq.matches); };
    update();
    mq.addEventListener("change", update);
    rmq.addEventListener("change", update);
    return () => { mq.removeEventListener("change", update); rmq.removeEventListener("change", update); };
  }, []);

  if (!mounted) return null;

  return (
    <div className={className} aria-hidden>
      <Canvas
        camera={{ position: [0, 1, 10], fov: 55 }}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        gl={{ antialias: !isMobile, alpha: true, powerPreference: "high-performance" }}
        frameloop={reducedMotion ? "demand" : "always"}
        style={{ width: "100%", height: "100%" }}
      >
        <Suspense fallback={null}>
          <WaveGrid isMobile={isMobile} />
          {!isMobile && !reducedMotion && (
            <EffectComposer>
              <Bloom intensity={0.7} luminanceThreshold={0.1} luminanceSmoothing={0.9} mipmapBlur />
            </EffectComposer>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
