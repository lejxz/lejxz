"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useRef, useMemo, Suspense, useEffect, useState } from "react";
import * as THREE from "three";

/**
 * NeuralNetwork3D — a proper layered neural network with direct mouse
 * interaction.
 *
 * Design goals (per request: "proper neural network, minimal yet unique and
 * aesthetic with interactions to the mouse"):
 *
 *  • Structure: nodes are arranged in LAYERS along the X axis (input →
 *    hidden → output), each layer a vertical column with slight Z jitter
 *    for depth. Connections run between adjacent layers only — the classic
 *    NN silhouette, kept sparse (2–3 links per node) so it reads as minimal.
 *
 *  • Signals: pulses continuously travel left → right through the network,
 *    hopping from node to connected node and lighting up the edge they
 *    traverse. This gives the network a sense of "thinking".
 *
 *  • Mouse interaction (the headline feature):
 *     - The pointer is unprojected onto the network's plane. Nodes within a
 *       radius of the cursor are "activated" — they scale up, brighten, and
 *       each emits a fresh signal toward the next layer.
 *     - A subtle parallax tilt follows the cursor so the whole network
 *       feels like it's leaning toward you.
 *     - Clicking emits a burst of signals from the input layer.
 *
 *  • Theme-aware: node / line / accent colors are read from CSS variables
 *    (--nn-node, --nn-node-alt, --nn-line) so the network matches the active
 *    dark/light palette. A MutationObserver re-reads them when the theme
 *    class on <html> changes.
 */

// Layer sizes — deliberately asymmetric so the "flow" direction is obvious.
const LAYOUT = [5, 8, 8, 6, 4];
const LAYER_X_SPREAD = 8; // total X extent
const NODE_Y_SPREAD = 3.4; // half-height of a layer column
const NODE_Z_JITTER = 1.2; // depth variation per node

const CONNECT_PER_NODE = 3; // max forward links per node
const MAX_SIGNALS = 14; // concurrent traveling pulses
const SPAWN_INTERVAL = 0.55; // seconds between auto-spawned signals
const MOUSE_RADIUS = 2.6; // activation radius (world units, XY plane)

interface Neuron {
  pos: THREE.Vector3;
  basePos: THREE.Vector3;
  layer: number;
  indexInLayer: number;
  // forward connection indices into the flat `connections` array
  outEdges: number[];
  // activation 0..1, decays each frame; boosted by mouse proximity + signals
  activation: number;
}

interface Edge {
  fromNode: number; // index into flat neurons[]
  toNode: number;
  // signal intensity 0..1 on this edge (decays), brightened when a pulse is on it
  energy: number;
}

interface Signal {
  edgeIndex: number;
  t: number; // 0..1 progress along the edge
  speed: number;
  alive: boolean;
}

function buildNetwork() {
  const neurons: Neuron[] = [];
  const layerStart: number[] = []; // index of first node in each layer

  LAYOUT.forEach((count, layer) => {
    layerStart.push(neurons.length);
    const x =
      LAYOUT.length === 1
        ? 0
        : (layer / (LAYOUT.length - 1) - 0.5) * LAYER_X_SPREAD;
    for (let i = 0; i < count; i++) {
      // Spread nodes vertically. For single-node layers, center them.
      const y =
        count === 1
          ? 0
          : (i / (count - 1) - 0.5) * NODE_Y_SPREAD * 2;
      // Deterministic-ish Z jitter from indices so it's stable across rebuilds.
      const z = (Math.sin(layer * 1.7 + i * 2.3) * 0.5) * NODE_Z_JITTER;
      const pos = new THREE.Vector3(x, y, z);
      neurons.push({
        pos: pos.clone(),
        basePos: pos.clone(),
        layer,
        indexInLayer: i,
        outEdges: [],
        activation: 0,
      });
    }
  });

  // Build sparse forward connections: each node links to its 2–3 nearest
  // neighbors in the NEXT layer (by Y distance).
  const edges: Edge[] = [];
  for (let l = 0; l < LAYOUT.length - 1; l++) {
    const nextStart = layerStart[l + 1];
    const nextCount = LAYOUT[l + 1];
    for (let i = layerStart[l]; i < layerStart[l] + LAYOUT[l]; i++) {
      const a = neurons[i];
      // rank next-layer nodes by Y proximity to this node
      const ranked = [];
      for (let j = 0; j < nextCount; j++) {
        const b = neurons[nextStart + j];
        const dy = a.pos.y - b.pos.y;
        ranked.push({ j, d: Math.abs(dy) + Math.random() * 0.6 });
      }
      ranked.sort((p, q) => p.d - q.d);
      const k = Math.min(CONNECT_PER_NODE, nextCount);
      for (let n = 0; n < k; n++) {
        const toNode = nextStart + ranked[n].j;
        const edgeIndex = edges.length;
        edges.push({ fromNode: i, toNode, energy: 0 });
        a.outEdges.push(edgeIndex);
      }
    }
  }

  return { neurons, edges, layerStart };
}

/** Read theme colors from the document root's CSS variables. */
function readThemeColors() {
  if (typeof window === "undefined") {
    return {
      node: "#5eead4",
      nodeAlt: "#a78bfa",
      line: new THREE.Color(0.18, 0.42, 0.38),
    };
  }
  const cs = getComputedStyle(document.documentElement);
  const node = cs.getPropertyValue("--nn-node").trim() || "#5eead4";
  const nodeAlt = cs.getPropertyValue("--nn-node-alt").trim() || "#a78bfa";
  const lineVar = cs.getPropertyValue("--nn-line").trim();
  const line = new THREE.Color();
  // Browsers may serialize rgba() as #rrggbbaa (8-digit hex). THREE.Color's
  // setStyle doesn't reliably parse the alpha-padded form, so strip the alpha
  // digits before parsing — we only need the RGB channel (alpha is handled
  // by the material's `opacity` / `transparent` flags).
  const normalized =
    lineVar && lineVar.startsWith("#") && lineVar.length === 9
      ? lineVar.slice(0, 7)
      : lineVar;
  if (normalized) {
    try {
      line.setStyle(normalized);
    } catch {
      line.set(0.18, 0.42, 0.38);
    }
  } else {
    line.set(0.18, 0.42, 0.38);
  }
  return { node, nodeAlt, line };
}

function Network({ isMobile }: { isMobile: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const nodeRef = useRef<THREE.InstancedMesh>(null);
  const lineRef = useRef<THREE.LineSegments>(null);
  const pulseRef = useRef<THREE.InstancedMesh>(null);
  const { camera, gl } = useThree();

  // Window-level pointer tracking. The canvas sits behind the page content
  // (z-index -10), so r3f's built-in `pointer` state never receives
  // pointermove events — they're intercepted by the content layer above. We
  // listen on `window` instead and store the normalized device coordinates
  // (-1..1) in a ref, which useFrame reads each tick.
  const pointerRef = useRef({ x: 0, y: 0, active: false });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      pointerRef.current = { x: nx, y: ny, active: true };
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

  // Mutable simulation state. We keep neurons/edges in a ref (not useMemo)
  // because they are mutated every frame — the immutability lint rule
  // (correctly) flags mutation of values returned by useMemo. Refs are the
  // intended escape hatch for mutable, non-reactive values.
  const networkRef = useRef<ReturnType<typeof buildNetwork>>(null);
  if (!networkRef.current) networkRef.current = buildNetwork();
  const { neurons, edges } = networkRef.current;
  const nodeCount = neurons.length;
  const edgeCount = edges.length;

  // Theme colors (reactive). We store them in a ref and re-read when the
  // <html> class changes (dark/light toggle).
  const colorsRef = useRef(readThemeColors());
  useEffect(() => {
    const update = () => {
      colorsRef.current = readThemeColors();
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // Build line geometry with vertex colors so we can brighten individual
  // edges when a signal travels along them.
  const lineGeometry = useMemo(() => {
    const positions = new Float32Array(edgeCount * 6);
    const colors = new Float32Array(edgeCount * 6);
    const baseLine = colorsRef.current.line;
    edges.forEach((e, i) => {
      const a = neurons[e.fromNode];
      const b = neurons[e.toNode];
      positions[i * 6] = a.pos.x;
      positions[i * 6 + 1] = a.pos.y;
      positions[i * 6 + 2] = a.pos.z;
      positions[i * 6 + 3] = b.pos.x;
      positions[i * 6 + 4] = b.pos.y;
      positions[i * 6 + 5] = b.pos.z;
      for (let v = 0; v < 2; v++) {
        colors[i * 6 + v * 3] = baseLine.r;
        colors[i * 6 + v * 3 + 1] = baseLine.g;
        colors[i * 6 + v * 3 + 2] = baseLine.b;
      }
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
    // neurons/edges come from a stable ref — build once.
  }, []);

  // Signals — traveling pulses along edges.
  const signals = useRef<Signal[]>(
    Array.from({ length: MAX_SIGNALS }, () => ({
      edgeIndex: -1,
      t: 0,
      speed: 0.6 + Math.random() * 0.5,
      alive: false,
    }))
  );
  const lastSpawn = useRef(0);
  const inputLayerStart = 0;
  const inputLayerCount = LAYOUT[0];

  // Spawn a signal at a given input node (or a random one).
  const spawnSignal = (fromNode?: number) => {
    const slot = signals.current.find((s) => !s.alive);
    if (!slot) return;
    const start =
      fromNode ?? inputLayerStart + Math.floor(Math.random() * inputLayerCount);
    const neuron = neurons[start];
    if (neuron.outEdges.length === 0) return;
    slot.edgeIndex =
      neuron.outEdges[Math.floor(Math.random() * neuron.outEdges.length)];
    slot.t = 0;
    slot.speed = 0.7 + Math.random() * 0.6;
    slot.alive = true;
  };

  // Click → burst of signals from all input nodes. Listen on window because
  // the canvas is behind the content layer and won't receive direct clicks.
  // Ignore clicks on interactive elements (buttons, links, inputs) so normal
  // navigation doesn't spam the network.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest('a, button, [role="button"], input, textarea, select, [cmdk-input]')) {
        return;
      }
      for (let i = 0; i < inputLayerCount; i++) spawnSignal(inputLayerStart + i);
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  // Scratch objects (avoid per-frame allocation).
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tmpColor = useMemo(() => new THREE.Color(), []);
  const tmpVec = useMemo(() => new THREE.Vector3(), []);
  const mouseWorld = useMemo(() => new THREE.Vector3(), []);
  const rayDir = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05); // clamp for stability
    if (!groupRef.current) return;

    const ptr = pointerRef.current;

    // ---- Parallax tilt (subtle) -------------------------------------------
    const targetRotY = ptr.active ? ptr.x * 0.32 : 0;
    const targetRotX = ptr.active ? -ptr.y * 0.22 : 0;
    groupRef.current.rotation.y +=
      (targetRotY - groupRef.current.rotation.y) * 0.05;
    groupRef.current.rotation.x +=
      (targetRotX - groupRef.current.rotation.x) * 0.05;
    groupRef.current.position.y = Math.sin(time * 0.22) * 0.18;

    // ---- Unproject pointer to world XY plane (z=0) -----------------------
    // Only when pointer is active (inside the viewport).
    let mx = 9999;
    let my = 9999;
    if (ptr.active) {
      tmpVec.set(ptr.x, ptr.y, 0.5);
      tmpVec.unproject(camera);
      rayDir.copy(tmpVec).sub(camera.position).normalize();
      const distance = -camera.position.z / rayDir.z;
      mouseWorld
        .copy(camera.position)
        .add(rayDir.multiplyScalar(distance));
      mx = mouseWorld.x;
      my = mouseWorld.y;
    }

    // ---- Auto-spawn signals ----------------------------------------------
    lastSpawn.current += dt;
    if (lastSpawn.current > SPAWN_INTERVAL) {
      lastSpawn.current = 0;
      spawnSignal();
    }

    // ---- Advance signals + energize edges --------------------------------
    // Decay all edge energy first.
    for (let i = 0; i < edges.length; i++) edges[i].energy *= 0.92;
    // Decay all node activation.
    for (let i = 0; i < neurons.length; i++) neurons[i].activation *= 0.94;

    for (const s of signals.current) {
      if (!s.alive) continue;
      const edge = edges[s.edgeIndex];
      // refs hold mutable simulation state — mutation here is intentional and
      // safe (the animation loop is the only writer outside of spawnSignal).
      // eslint-disable-next-line react-hooks/immutability
      s.t += s.speed * dt;
      // energize the edge the signal is currently on
      edge.energy = Math.max(edge.energy, 0.9);
      // also activate the from/to nodes
      neurons[edge.fromNode].activation = Math.max(
        neurons[edge.fromNode].activation,
        0.6
      );
      neurons[edge.toNode].activation = Math.max(
        neurons[edge.toNode].activation,
        0.8
      );
      if (s.t >= 1) {
        // arrived — hop to a random outgoing edge of the destination node
        const dest = neurons[edge.toNode];
        if (dest.outEdges.length > 0 && dest.layer < LAYOUT.length - 1) {
          s.edgeIndex =
            dest.outEdges[
              Math.floor(Math.random() * dest.outEdges.length)
            ];
          s.t = 0;
          s.speed = 0.7 + Math.random() * 0.6;
        } else {
          s.alive = false;
        }
      }
    }

    // ---- Mouse activation: boost nearby nodes + emit signals -------------
    // Throttle signal emission from mouse activation using time-based gate.
    for (let i = 0; i < neurons.length; i++) {
      const n = neurons[i];
      const dx = n.pos.x - mx;
      const dy = n.pos.y - my;
      const d2 = dx * dx + dy * dy;
      if (d2 < MOUSE_RADIUS * MOUSE_RADIUS) {
        const intensity = 1 - Math.sqrt(d2) / MOUSE_RADIUS;
        n.activation = Math.max(n.activation, intensity);
        // Occasionally emit a signal from an activated input-layer node.
        if (
          n.layer === 0 &&
          intensity > 0.4 &&
          Math.random() < dt * 2.5
        ) {
          spawnSignal(i);
        }
      }
    }

    // ---- Update node instances -------------------------------------------
    if (nodeRef.current) {
      const cNode = new THREE.Color(colorsRef.current.node);
      const cAlt = new THREE.Color(colorsRef.current.nodeAlt);
      for (let i = 0; i < neurons.length; i++) {
        const n = neurons[i];
        // gentle idle breathing
        const breath = 0.7 + Math.sin(time * 1.4 + i * 0.5) * 0.12;
        const act = n.activation;
        const scale = 0.12 + breath * 0.04 + act * 0.22;
        dummy.position.copy(n.pos);
        dummy.scale.setScalar(scale);
        dummy.updateMatrix();
        nodeRef.current.setMatrixAt(i, dummy.matrix);
        // color: blend from base node color toward alt color as activation rises
        tmpColor.copy(cNode).lerp(cAlt, act);
        // brighten with activation
        tmpColor.multiplyScalar(1 + act * 0.8);
        nodeRef.current.setColorAt(i, tmpColor);
      }
      nodeRef.current.instanceMatrix.needsUpdate = true;
      if (nodeRef.current.instanceColor)
        nodeRef.current.instanceColor.needsUpdate = true;
    }

    // ---- Update line vertex colors from edge energy ----------------------
    if (lineRef.current) {
      const colorAttr = lineRef.current.geometry.getAttribute(
        "color"
      ) as THREE.BufferAttribute;
      const baseLine = colorsRef.current.line;
      const cNode = new THREE.Color(colorsRef.current.node);
      const cAlt = new THREE.Color(colorsRef.current.nodeAlt);
      for (let i = 0; i < edges.length; i++) {
        const e = edges[i];
        // base color → bright accent as energy rises
        tmpColor.copy(baseLine).lerp(cAlt, e.energy * 0.7);
        tmpColor.multiplyScalar(1 + e.energy * 1.2);
        const r = tmpColor.r;
        const g = tmpColor.g;
        const b = tmpColor.b;
        colorAttr.setXYZ(i * 2, r, g, b);
        colorAttr.setXYZ(i * 2 + 1, r, g, b);
      }
      colorAttr.needsUpdate = true;
      const mat = lineRef.current.material as THREE.LineBasicMaterial;
      mat.opacity = 0.9;
    }

    // ---- Update pulse instances (traveling spark on each alive signal) ---
    if (pulseRef.current) {
      const cNode = new THREE.Color(colorsRef.current.node);
      const cAlt = new THREE.Color(colorsRef.current.nodeAlt);
      let written = 0;
      for (const s of signals.current) {
        if (!s.alive) continue;
        const edge = edges[s.edgeIndex];
        const a = neurons[edge.fromNode].pos;
        const b = neurons[edge.toNode].pos;
        tmpVec.lerpVectors(a, b, s.t);
        dummy.position.copy(tmpVec);
        const intensity = Math.sin(s.t * Math.PI);
        dummy.scale.setScalar(0.08 + intensity * 0.14);
        dummy.updateMatrix();
        pulseRef.current.setMatrixAt(written, dummy.matrix);
        tmpColor.copy(cNode).lerp(cAlt, intensity);
        tmpColor.multiplyScalar(1.6);
        pulseRef.current.setColorAt(written, tmpColor);
        written++;
      }
      // hide the rest by scaling to 0
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
      {/* connection lines (vertex-colored so individual edges can light up) */}
      <lineSegments ref={lineRef} geometry={lineGeometry}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.9}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* neuron cores */}
      <instancedMesh ref={nodeRef} args={[undefined, undefined, nodeCount]}>
        <sphereGeometry args={[1, 14, 14]} />
        <meshBasicMaterial color="#5eead4" toneMapped={false} />
      </instancedMesh>

      {/* signal pulses */}
      <instancedMesh
        ref={pulseRef}
        args={[undefined, undefined, MAX_SIGNALS]}
      >
        <sphereGeometry args={[1, 10, 10]} />
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
        camera={{ position: [0, 0, 11], fov: 50 }}
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
                luminanceThreshold={0.12}
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
