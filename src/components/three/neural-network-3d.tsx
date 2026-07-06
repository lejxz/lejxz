"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useRef, useMemo, Suspense, useEffect, useState } from "react";
import * as THREE from "three";

/**
 * NeuralNetwork3D — a unique 3D neural network with spread-out nodes,
 * flowing connections, and mouse interaction.
 *
 * Design:
 *  • Nodes are spread across a wide 3D volume (not in rigid columns).
 *    Each node drifts slowly around its base position with organic
 *    per-node motion — the network feels "alive" and breathing.
 *  • Connections form dynamically: nodes within a threshold distance
 *    are linked with lines. As nodes drift, connections appear and
 *    disappear — the topology is always changing.
 *  • Signal pulses travel along active connections, lighting up edges.
 *  • Mouse interaction:
 *     - Nodes near the cursor (unprojected to 3D) brighten + scale up
 *       and shift color from teal → violet.
 *     - The cursor "activates" nodes, causing them to emit signals
 *       along their connections.
 *     - Subtle parallax tilt toward the cursor.
 *     - Click emits a burst of signals from nearby nodes.
 *
 *  • Theme-aware via CSS variables.
 *  • The whole network slowly rotates on the Y axis for a living feel.
 */

const NODE_COUNT_DESKTOP = 80;
const NODE_COUNT_MOBILE = 40;
const VOLUME = 10; // spread range
const CONNECT_DIST = 2.2; // max distance for a connection
const MAX_LINES = 300; // perf cap
const MAX_SIGNALS = 20;
const MOUSE_RADIUS = 2.5;
const SPAWN_INTERVAL = 0.35;

interface Node {
  pos: THREE.Vector3;
  basePos: THREE.Vector3;
  vel: THREE.Vector3;
  phase: number;
  activation: number;
  outNeighbors: number[];
}

interface Signal {
  fromIdx: number;
  toIdx: number;
  t: number; // 0..1
  speed: number;
  alive: boolean;
}

function readThemeColors() {
  if (typeof window === "undefined") {
    return { node: "#5eead4", nodeAlt: "#a78bfa", line: new THREE.Color(0.1, 0.25, 0.22) };
  }
  const cs = getComputedStyle(document.documentElement);
  const node = cs.getPropertyValue("--nn-node").trim() || "#5eead4";
  const nodeAlt = cs.getPropertyValue("--nn-node-alt").trim() || "#a78bfa";
  const lineVar = cs.getPropertyValue("--nn-line").trim();
  const line = new THREE.Color();
  const normalized = lineVar && lineVar.startsWith("#") && lineVar.length === 9 ? lineVar.slice(0, 7) : lineVar;
  if (normalized) { try { line.setStyle(normalized); } catch { line.set(0.1, 0.25, 0.22); } }
  else line.set(0.1, 0.25, 0.22);
  return { node, nodeAlt, line };
}

function buildNodes(count: number): Node[] {
  const nodes: Node[] = [];
  for (let i = 0; i < count; i++) {
    const pos = new THREE.Vector3(
      (Math.random() - 0.5) * VOLUME,
      (Math.random() - 0.5) * VOLUME * 0.7,
      (Math.random() - 0.5) * VOLUME * 0.4
    );
    nodes.push({
      pos: pos.clone(),
      basePos: pos.clone(),
      vel: new THREE.Vector3(
        (Math.random() - 0.5) * 0.008,
        (Math.random() - 0.5) * 0.008,
        (Math.random() - 0.5) * 0.004
      ),
      phase: Math.random() * Math.PI * 2,
      activation: 0,
      outNeighbors: [],
    });
  }
  return nodes;
}

function Network({ isMobile }: { isMobile: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const nodeRef = useRef<THREE.InstancedMesh>(null);
  const lineRef = useRef<THREE.LineSegments>(null);
  const pulseRef = useRef<THREE.InstancedMesh>(null);
  const { camera, gl } = useThree();

  const count = isMobile ? NODE_COUNT_MOBILE : NODE_COUNT_DESKTOP;

  // Mutable nodes.
  const nodesRef = useRef<Node[]>(null);
  if (nodesRef.current == null) nodesRef.current = buildNodes(count);
  const nodes = nodesRef.current;

  // Signals.
  const signalsRef = useRef<Signal[]>(
    Array.from({ length: MAX_SIGNALS }, () => ({ fromIdx: -1, toIdx: -1, t: 0, speed: 1, alive: false }))
  );
  const lastSpawn = useRef(0);

  // Theme colors.
  const colorsRef = useRef(readThemeColors());
  useEffect(() => {
    const update = () => { colorsRef.current = readThemeColors(); };
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  // Pre-allocate line geometry buffer.
  const lineGeometry = useMemo(() => {
    const positions = new Float32Array(MAX_LINES * 6);
    const colors = new Float32Array(MAX_LINES * 6);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
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

  // Spawn a signal from a node to a random neighbor.
  const spawnSignal = (fromIdx: number) => {
    const slot = signalsRef.current.find((s) => !s.alive);
    if (!slot) return;
    const node = nodes[fromIdx];
    if (!node) return;
    // Find neighbors within CONNECT_DIST.
    const neighbors: number[] = [];
    for (let j = 0; j < nodes.length; j++) {
      if (j === fromIdx) continue;
      const d = node.pos.distanceTo(nodes[j].pos);
      if (d < CONNECT_DIST) neighbors.push(j);
    }
    if (neighbors.length === 0) return;
    const toIdx = neighbors[Math.floor(Math.random() * neighbors.length)];
    const dist = node.pos.distanceTo(nodes[toIdx].pos);
    slot.fromIdx = fromIdx;
    slot.toIdx = toIdx;
    slot.t = 0;
    slot.speed = (1.5 + Math.random() * 1.0) / Math.max(dist, 0.1);
    slot.alive = true;
  };

  // Click → burst signals from nodes near cursor.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest('a, button, [role="button"], input, textarea, select, [cmdk-input]')) return;
      // Find nodes near the cursor and emit signals.
      const px = pointerRef.current.wx;
      const py = pointerRef.current.wy;
      for (let i = 0; i < nodes.length; i++) {
        const dx = nodes[i].pos.x - px;
        const dy = nodes[i].pos.y - py;
        if (dx * dx + dy * dy < MOUSE_RADIUS * MOUSE_RADIUS) {
          spawnSignal(i);
        }
      }
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  // Scratch.
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tmpColor = useMemo(() => new THREE.Color(), []);
  const tmpVec = useMemo(() => new THREE.Vector3(), []);
  const mouseWorld = useMemo(() => new THREE.Vector3(), []);
  const rayDir = useMemo(() => new THREE.Vector3(), []);
  const cNode = useMemo(() => new THREE.Color(), []);
  const cAlt = useMemo(() => new THREE.Color(), []);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);
    if (!groupRef.current) return;

    const ptr = pointerRef.current;

    // Slow auto-rotation for a "living" feel.
    groupRef.current.rotation.y += dt * 0.03;

    // Parallax tilt (additive on top of auto-rotation).
    const tiltY = ptr.active ? ptr.x * 0.15 : 0;
    const tiltX = ptr.active ? -ptr.y * 0.1 : 0;
    groupRef.current.rotation.x += (tiltX - groupRef.current.rotation.x) * 0.03;

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

    // Auto-spawn signals.
    lastSpawn.current += dt;
    if (lastSpawn.current > SPAWN_INTERVAL) {
      lastSpawn.current = 0;
      spawnSignal(Math.floor(Math.random() * nodes.length));
    }

    // Update nodes: drift + spring back + mouse activation.
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      // Organic drift.
      n.pos.add(n.vel);
      // Spring back toward base position.
      n.pos.lerp(n.basePos, 0.005);
      // Bounce off volume bounds.
      const lim = VOLUME / 2;
      if (n.pos.x > lim) n.vel.x = -Math.abs(n.vel.x);
      if (n.pos.x < -lim) n.vel.x = Math.abs(n.vel.x);
      if (n.pos.y > lim * 0.7) n.vel.y = -Math.abs(n.vel.y);
      if (n.pos.y < -lim * 0.7) n.vel.y = Math.abs(n.vel.y);

      // Mouse activation.
      let act = 0;
      if (ptr.active) {
        const dx = n.pos.x - mx;
        const dy = n.pos.y - my;
        const d2 = dx * dx + dy * dy;
        if (d2 < MOUSE_RADIUS * MOUSE_RADIUS) {
          act = 1 - Math.sqrt(d2) / MOUSE_RADIUS;
          // Occasionally emit a signal from an activated node.
          if (act > 0.3 && Math.random() < dt * 2) spawnSignal(i);
        }
      }
      n.activation = Math.max(act, n.activation * 0.92);
    }

    // Advance signals.
    for (const s of signalsRef.current) {
      if (!s.alive) continue;
      // eslint-disable-next-line react-hooks/immutability
      s.t += s.speed * dt;
      // Activate endpoints.
      if (nodes[s.fromIdx]) nodes[s.fromIdx].activation = Math.max(nodes[s.fromIdx].activation, 0.4);
      if (nodes[s.toIdx]) nodes[s.toIdx].activation = Math.max(nodes[s.toIdx].activation, 0.6);
      if (s.t >= 1) {
        // Hop to a new neighbor of the destination, or die.
        if (nodes[s.toIdx] && Math.random() < 0.5) {
          const dest = nodes[s.toIdx];
          const neighbors: number[] = [];
          for (let j = 0; j < nodes.length; j++) {
            if (j === s.toIdx) continue;
            if (dest.pos.distanceTo(nodes[j].pos) < CONNECT_DIST) neighbors.push(j);
          }
          if (neighbors.length > 0) {
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            s.fromIdx = s.toIdx;
            s.toIdx = next;
            s.t = 0;
            const dist = nodes[s.fromIdx].pos.distanceTo(nodes[s.toIdx].pos);
            s.speed = (1.5 + Math.random()) / Math.max(dist, 0.1);
          } else {
            s.alive = false;
          }
        } else {
          s.alive = false;
        }
      }
    }

    // Update node instances.
    cNode.set(colorsRef.current.node);
    cAlt.set(colorsRef.current.nodeAlt);
    if (nodeRef.current) {
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const breath = 0.7 + Math.sin(time * 1.2 + n.phase) * 0.15;
        const act = n.activation;
        const scale = 0.05 + breath * 0.02 + act * 0.1;
        dummy.position.copy(n.pos);
        dummy.scale.setScalar(scale);
        dummy.updateMatrix();
        nodeRef.current.setMatrixAt(i, dummy.matrix);
        tmpColor.copy(cNode).lerp(cAlt, act).multiplyScalar(1 + act * 0.8);
        nodeRef.current.setColorAt(i, tmpColor);
      }
      nodeRef.current.instanceMatrix.needsUpdate = true;
      if (nodeRef.current.instanceColor) nodeRef.current.instanceColor.needsUpdate = true;
    }

    // Rebuild connection lines dynamically (nodes drift, so connections change).
    if (lineRef.current) {
      const posAttr = lineRef.current.geometry.getAttribute("position") as THREE.BufferAttribute;
      const colorAttr = lineRef.current.geometry.getAttribute("color") as THREE.BufferAttribute;
      const baseLine = colorsRef.current.line;
      let li = 0;
      for (let i = 0; i < nodes.length && li < MAX_LINES; i++) {
        for (let j = i + 1; j < nodes.length && li < MAX_LINES; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const d = a.pos.distanceTo(b.pos);
          if (d < CONNECT_DIST) {
            const closeness = 1 - d / CONNECT_DIST;
            const act = Math.max(a.activation, b.activation);
            posAttr.setXYZ(li * 2, a.pos.x, a.pos.y, a.pos.z);
            posAttr.setXYZ(li * 2 + 1, b.pos.x, b.pos.y, b.pos.z);
            tmpColor.copy(baseLine).lerp(cAlt, act * 0.6).multiplyScalar(0.5 + closeness * 0.5 + act * 1.5);
            colorAttr.setXYZ(li * 2, tmpColor.r, tmpColor.g, tmpColor.b);
            colorAttr.setXYZ(li * 2 + 1, tmpColor.r, tmpColor.g, tmpColor.b);
            li++;
          }
        }
      }
      // Hide unused lines.
      for (let i = li; i < MAX_LINES; i++) {
        posAttr.setXYZ(i * 2, 0, 0, -1000);
        posAttr.setXYZ(i * 2 + 1, 0, 0, -1000);
      }
      posAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;
    }

    // Update signal pulse instances.
    if (pulseRef.current) {
      let written = 0;
      for (const s of signalsRef.current) {
        if (!s.alive) continue;
        if (!nodes[s.fromIdx] || !nodes[s.toIdx]) continue;
        const a = nodes[s.fromIdx].pos;
        const b = nodes[s.toIdx].pos;
        tmpVec.lerpVectors(a, b, s.t);
        dummy.position.copy(tmpVec);
        const intensity = Math.sin(s.t * Math.PI);
        dummy.scale.setScalar(0.05 + intensity * 0.08);
        dummy.updateMatrix();
        pulseRef.current.setMatrixAt(written, dummy.matrix);
        tmpColor.copy(cNode).lerp(cAlt, intensity).multiplyScalar(2);
        pulseRef.current.setColorAt(written, tmpColor);
        written++;
      }
      for (let i = written; i < MAX_SIGNALS; i++) {
        dummy.scale.setScalar(0);
        dummy.position.set(0, 0, -100);
        dummy.updateMatrix();
        pulseRef.current.setMatrixAt(i, dummy.matrix);
      }
      pulseRef.current.instanceMatrix.needsUpdate = true;
      if (pulseRef.current.instanceColor) pulseRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Dynamic connection lines */}
      <lineSegments ref={lineRef} geometry={lineGeometry}>
        <lineBasicMaterial vertexColors transparent opacity={0.7} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>

      {/* Nodes */}
      <instancedMesh ref={nodeRef} args={[undefined, undefined, count]}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshBasicMaterial color="#5eead4" toneMapped={false} />
      </instancedMesh>

      {/* Signal pulses */}
      <instancedMesh ref={pulseRef} args={[undefined, undefined, MAX_SIGNALS]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#a78bfa" toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </instancedMesh>
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
        camera={{ position: [0, 0, 11], fov: 50 }}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        gl={{ antialias: !isMobile, alpha: true, powerPreference: "high-performance" }}
        frameloop={reducedMotion ? "demand" : "always"}
        style={{ width: "100%", height: "100%" }}
      >
        <Suspense fallback={null}>
          <Network isMobile={isMobile} />
          {!isMobile && !reducedMotion && (
            <EffectComposer>
              <Bloom intensity={0.8} luminanceThreshold={0.1} luminanceSmoothing={0.9} mipmapBlur />
            </EffectComposer>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
