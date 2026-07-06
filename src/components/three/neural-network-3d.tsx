"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useRef, useMemo, Suspense, useEffect, useState } from "react";
import * as THREE from "three";

/**
 * NeuralNetwork3D — an animated neural network background with mouse
 * interaction.
 *
 * Design:
 *  • Nodes arranged in vertical LAYERS (left → right), the classic NN
 *    silhouette. Each layer is a column of glowing nodes.
 *  • Connection lines between adjacent layers (sparse, ~2-3 per node).
 *  • Signal pulses continuously travel left → right along the connections,
 *    lighting up edges as they pass. This is the "thinking" animation.
 *  • Mouse interaction:
 *     - The whole network tilts toward the cursor (parallax).
 *     - Nodes near the cursor (unprojected to 3D) scale up + brighten.
 *     - Moving the mouse over input-layer nodes triggers extra signal bursts.
 *     - Click anywhere → burst of signals from all input nodes.
 *
 *  • Theme-aware via CSS variables (--nn-node, --nn-node-alt, --nn-line).
 */

// Layer sizes: input → hidden → output
const LAYOUT = [4, 7, 7, 5, 3];
const LAYER_SPACING = 2.2; // X distance between layers
const NODE_SPACING = 1.1; // Y distance between nodes in a layer
const CONNECTS_PER_NODE = 3;
const MAX_SIGNALS = 18;
const SIGNAL_SPEED = 1.8; // units per second
const SPAWN_INTERVAL = 0.4; // seconds between auto-spawned signals
const MOUSE_RADIUS = 2.0;

interface Node {
  pos: THREE.Vector3;
  layer: number;
  indexInLayer: number;
  outEdges: number[]; // indices into edges[]
  activation: number;
}

interface Edge {
  from: number;
  to: number;
  energy: number;
}

interface Signal {
  edgeIdx: number;
  t: number; // 0..1 progress along edge
  speed: number;
  alive: boolean;
}

function buildNetwork() {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const layerStart: number[] = [];
  const totalLayers = LAYOUT.length;
  const xOffset = -((totalLayers - 1) * LAYER_SPACING) / 2;

  for (let l = 0; l < totalLayers; l++) {
    layerStart.push(nodes.length);
    const count = LAYOUT[l];
    const x = xOffset + l * LAYER_SPACING;
    const yOffset = -((count - 1) * NODE_SPACING) / 2;
    for (let i = 0; i < count; i++) {
      nodes.push({
        pos: new THREE.Vector3(x, yOffset + i * NODE_SPACING, 0),
        layer: l,
        indexInLayer: i,
        outEdges: [],
        activation: 0,
      });
    }
  }

  // Build sparse forward connections.
  for (let l = 0; l < totalLayers - 1; l++) {
    const nextStart = layerStart[l + 1];
    const nextCount = LAYOUT[l + 1];
    for (let i = layerStart[l]; i < layerStart[l] + LAYOUT[l]; i++) {
      const a = nodes[i];
      // Connect to nearest neighbors in next layer.
      const ranked: { j: number; d: number }[] = [];
      for (let j = 0; j < nextCount; j++) {
        const b = nodes[nextStart + j];
        ranked.push({ j: nextStart + j, d: Math.abs(a.pos.y - b.pos.y) });
      }
      ranked.sort((p, q) => p.d - q.d);
      const k = Math.min(CONNECTS_PER_NODE, nextCount);
      for (let n = 0; n < k; n++) {
        const edgeIdx = edges.length;
        edges.push({ from: i, to: ranked[n].j, energy: 0 });
        a.outEdges.push(edgeIdx);
      }
    }
  }

  return { nodes, edges, layerStart };
}

function readThemeColors() {
  if (typeof window === "undefined") {
    return {
      node: "#5eead4",
      nodeAlt: "#a78bfa",
      line: new THREE.Color(0.12, 0.3, 0.28),
    };
  }
  const cs = getComputedStyle(document.documentElement);
  const node = cs.getPropertyValue("--nn-node").trim() || "#5eead4";
  const nodeAlt = cs.getPropertyValue("--nn-node-alt").trim() || "#a78bfa";
  const lineVar = cs.getPropertyValue("--nn-line").trim();
  const line = new THREE.Color();
  const normalized =
    lineVar && lineVar.startsWith("#") && lineVar.length === 9
      ? lineVar.slice(0, 7)
      : lineVar;
  if (normalized) {
    try {
      line.setStyle(normalized);
    } catch {
      line.set(0.12, 0.3, 0.28);
    }
  } else {
    line.set(0.12, 0.3, 0.28);
  }
  return { node, nodeAlt, line };
}

function Network({ isMobile }: { isMobile: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const nodeRef = useRef<THREE.InstancedMesh>(null);
  const lineRef = useRef<THREE.LineSegments>(null);
  const pulseRef = useRef<THREE.InstancedMesh>(null);
  const { camera, gl } = useThree();

  // Mutable simulation state.
  const netRef = useRef<ReturnType<typeof buildNetwork>>(null);
  if (netRef.current == null) netRef.current = buildNetwork();
  const { nodes, edges, layerStart } = netRef.current;
  const nodeCount = nodes.length;
  const edgeCount = edges.length;

  // Signals.
  const signalsRef = useRef<Signal[]>(
    Array.from({ length: MAX_SIGNALS }, () => ({
      edgeIdx: -1,
      t: 0,
      speed: SIGNAL_SPEED,
      alive: false,
    }))
  );
  const lastSpawn = useRef(0);

  // Theme colors (reactive).
  const colorsRef = useRef(readThemeColors());
  useEffect(() => {
    const update = () => {
      colorsRef.current = readThemeColors();
    };
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);

  // Build line geometry (vertex-colored for per-edge brightness).
  const lineGeometry = useMemo(() => {
    const positions = new Float32Array(edgeCount * 6);
    const colors = new Float32Array(edgeCount * 6);
    const base = colorsRef.current.line;
    edges.forEach((e, i) => {
      const a = nodes[e.from];
      const b = nodes[e.to];
      positions[i * 6] = a.pos.x;
      positions[i * 6 + 1] = a.pos.y;
      positions[i * 6 + 2] = a.pos.z;
      positions[i * 6 + 3] = b.pos.x;
      positions[i * 6 + 4] = b.pos.y;
      positions[i * 6 + 5] = b.pos.z;
      for (let v = 0; v < 2; v++) {
        colors[i * 6 + v * 3] = base.r;
        colors[i * 6 + v * 3 + 1] = base.g;
        colors[i * 6 + v * 3 + 2] = base.b;
      }
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [edges, nodes]);

  // Window-level pointer tracking (canvas is behind content at z -10).
  const pointerRef = useRef({ x: 0, y: 0, active: false });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      pointerRef.current = {
        x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
        y: -(((e.clientY - rect.top) / rect.height) * 2 - 1),
        active: true,
      };
    };
    const onLeave = () => {
      pointerRef.current.active = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [gl]);

  // Spawn a signal from a given node.
  const spawnSignal = (fromNode: number) => {
    const slot = signalsRef.current.find((s) => !s.alive);
    if (!slot) return;
    const node = nodes[fromNode];
    if (!node || node.outEdges.length === 0) return;
    slot.edgeIdx = node.outEdges[Math.floor(Math.random() * node.outEdges.length)];
    slot.t = 0;
    slot.speed = SIGNAL_SPEED * (0.8 + Math.random() * 0.4);
    slot.alive = true;
  };

  // Click → burst from all input nodes.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest('a, button, [role="button"], input, textarea, select, [cmdk-input]'))
        return;
      // layerStart[0] is the index of the first input-layer node.
      for (let i = 0; i < LAYOUT[0]; i++) spawnSignal(layerStart[0] + i);
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  // Scratch objects.
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

    // Parallax tilt — obvious but smooth.
    const targetRotY = ptr.active ? ptr.x * 0.3 : 0;
    const targetRotX = ptr.active ? -ptr.y * 0.2 : 0;
    groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.05;
    groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.05;
    groupRef.current.position.y = Math.sin(time * 0.2) * 0.12;

    // Unproject pointer to world XY plane (z=0).
    let mx = 9999;
    let my = 9999;
    if (ptr.active) {
      tmpVec.set(ptr.x, ptr.y, 0.5);
      tmpVec.unproject(camera);
      rayDir.copy(tmpVec).sub(camera.position).normalize();
      const dist = -camera.position.z / rayDir.z;
      mouseWorld.copy(camera.position).add(rayDir.multiplyScalar(dist));
      mx = mouseWorld.x;
      my = mouseWorld.y;
    }

    // Auto-spawn signals.
    lastSpawn.current += dt;
    if (lastSpawn.current > SPAWN_INTERVAL) {
      lastSpawn.current = 0;
      const start = layerStart[0] + Math.floor(Math.random() * LAYOUT[0]);
      spawnSignal(start);
    }

    // Decay edge energy + node activation.
    for (let i = 0; i < edges.length; i++) edges[i].energy *= 0.9;
    for (let i = 0; i < nodes.length; i++) nodes[i].activation *= 0.93;

    // Advance signals.
    for (const s of signalsRef.current) {
      if (!s.alive) continue;
      const edge = edges[s.edgeIdx];
      const a = nodes[edge.from].pos;
      const b = nodes[edge.to].pos;
      const len = a.distanceTo(b);
      // eslint-disable-next-line react-hooks/immutability
      s.t += (s.speed * dt) / len;
      edge.energy = Math.max(edge.energy, 0.9);
      nodes[edge.from].activation = Math.max(nodes[edge.from].activation, 0.5);
      nodes[edge.to].activation = Math.max(nodes[edge.to].activation, 0.7);

      if (s.t >= 1) {
        // Hop to a random outgoing edge of the destination, or die.
        const dest = nodes[edge.to];
        if (dest.outEdges.length > 0 && dest.layer < LAYOUT.length - 1) {
          s.edgeIdx = dest.outEdges[Math.floor(Math.random() * dest.outEdges.length)];
          s.t = 0;
          s.speed = SIGNAL_SPEED * (0.8 + Math.random() * 0.4);
        } else {
          s.alive = false;
        }
      }
    }

    // Mouse activation.
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const dx = n.pos.x - mx;
      const dy = n.pos.y - my;
      const d2 = dx * dx + dy * dy;
      if (d2 < MOUSE_RADIUS * MOUSE_RADIUS) {
        const intensity = 1 - Math.sqrt(d2) / MOUSE_RADIUS;
        n.activation = Math.max(n.activation, intensity);
        // Occasionally emit a signal from an activated input node.
        if (n.layer === 0 && intensity > 0.4 && Math.random() < dt * 3) {
          spawnSignal(i);
        }
      }
    }

    // Update node instances.
    if (nodeRef.current) {
      cNode.set(colorsRef.current.node);
      cAlt.set(colorsRef.current.nodeAlt);
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const breath = 0.7 + Math.sin(time * 1.5 + i * 0.5) * 0.1;
        const act = n.activation;
        const scale = 0.08 + breath * 0.02 + act * 0.12;
        dummy.position.copy(n.pos);
        dummy.scale.setScalar(scale);
        dummy.updateMatrix();
        nodeRef.current.setMatrixAt(i, dummy.matrix);
        tmpColor.copy(cNode).lerp(cAlt, act);
        tmpColor.multiplyScalar(1 + act * 0.8);
        nodeRef.current.setColorAt(i, tmpColor);
      }
      nodeRef.current.instanceMatrix.needsUpdate = true;
      if (nodeRef.current.instanceColor)
        nodeRef.current.instanceColor.needsUpdate = true;
    }

    // Update line vertex colors from edge energy.
    if (lineRef.current) {
      const colorAttr = lineRef.current.geometry.getAttribute(
        "color"
      ) as THREE.BufferAttribute;
      const base = colorsRef.current.line;
      for (let i = 0; i < edges.length; i++) {
        const e = edges[i];
        tmpColor.copy(base).lerp(cAlt, e.energy * 0.7);
        tmpColor.multiplyScalar(1 + e.energy * 1.5);
        colorAttr.setXYZ(i * 2, tmpColor.r, tmpColor.g, tmpColor.b);
        colorAttr.setXYZ(i * 2 + 1, tmpColor.r, tmpColor.g, tmpColor.b);
      }
      colorAttr.needsUpdate = true;
    }

    // Update signal pulse instances.
    if (pulseRef.current) {
      let written = 0;
      for (const s of signalsRef.current) {
        if (!s.alive) continue;
        const edge = edges[s.edgeIdx];
        const a = nodes[edge.from].pos;
        const b = nodes[edge.to].pos;
        tmpVec.lerpVectors(a, b, s.t);
        dummy.position.copy(tmpVec);
        const intensity = Math.sin(s.t * Math.PI);
        dummy.scale.setScalar(0.06 + intensity * 0.1);
        dummy.updateMatrix();
        pulseRef.current.setMatrixAt(written, dummy.matrix);
        tmpColor
          .copy(cNode)
          .lerp(cAlt, intensity)
          .multiplyScalar(1.8);
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
      if (pulseRef.current.instanceColor)
        pulseRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Connection lines */}
      <lineSegments ref={lineRef} geometry={lineGeometry}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.8}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* Neuron cores */}
      <instancedMesh ref={nodeRef} args={[undefined, undefined, nodeCount]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial color="#5eead4" toneMapped={false} />
      </instancedMesh>

      {/* Signal pulses */}
      <instancedMesh ref={pulseRef} args={[undefined, undefined, MAX_SIGNALS]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial
          color="#a78bfa"
          toneMapped={false}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
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
    const update = () => {
      setIsMobile(mq.matches);
      setReducedMotion(rmq.matches);
    };
    update();
    mq.addEventListener("change", update);
    rmq.addEventListener("change", update);
    return () => {
      mq.removeEventListener("change", update);
      rmq.removeEventListener("change", update);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className={className} aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        gl={{
          antialias: !isMobile,
          alpha: true,
          powerPreference: "high-performance",
        }}
        frameloop={reducedMotion ? "demand" : "always"}
        style={{ width: "100%", height: "100%" }}
      >
        <Suspense fallback={null}>
          <Network isMobile={isMobile} />
          {!isMobile && !reducedMotion && (
            <EffectComposer>
              <Bloom
                intensity={0.8}
                luminanceThreshold={0.1}
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
