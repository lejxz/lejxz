"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useRef, useMemo, Suspense, useEffect, useState } from "react";
import * as THREE from "three";

/**
 * NeuralNetwork3D — a redesigned 3D particle constellation background.
 *
 * New approach (replacing the layered NN):
 *  • A field of particles drifts slowly in 3D space, forming a living
 *    "constellation." Nearby particles connect with faint lines that
 *    brighten as they get closer — a classic particle-network effect
 *    but in 3D with depth-of-field via perspective + bloom.
 *
 *  • Mouse interaction (the headline feature):
 *     - A 3D "cursor sphere" follows the mouse position unprojected onto
 *       the scene's XY plane. Particles within a radius are attracted
 *       toward it and brighten, creating a visible "stirring" effect.
 *     - The whole field tilts subtly toward the cursor (parallax).
 *     - Clicking creates a ripple shockwave that pushes particles outward
 *       from the click point, then they spring back.
 *
 *  • Theme-aware: colors read from --nn-node / --nn-node-alt / --nn-line
 *    CSS variables and re-read on theme change.
 *
 *  • Performance: instanced meshes for particles, LineSegments for
 *    connections (rebuilt per frame with a capped count), rAF-throttled.
 */

const PARTICLE_COUNT_DESKTOP = 70;
const PARTICLE_COUNT_MOBILE = 35;
const CONNECT_DISTANCE = 3.0; // max distance for a line to form
const MOUSE_RADIUS = 3.5; // attraction/activation radius
const MAX_LINES = 220; // cap to keep perf bounded

interface Particle {
  pos: THREE.Vector3;
  basePos: THREE.Vector3;
  vel: THREE.Vector3;
  activation: number; // 0..1, how "lit" this particle is
}

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

function buildParticles(count: number): Particle[] {
  const particles: Particle[] = [];
  const range = 12;
  for (let i = 0; i < count; i++) {
    const pos = new THREE.Vector3(
      (Math.random() - 0.5) * range,
      (Math.random() - 0.5) * range * 0.7,
      (Math.random() - 0.5) * range * 0.4
    );
    particles.push({
      pos: pos.clone(),
      basePos: pos.clone(),
      vel: new THREE.Vector3(
        (Math.random() - 0.5) * 0.012,
        (Math.random() - 0.5) * 0.012,
        (Math.random() - 0.5) * 0.006
      ),
      activation: 0,
    });
  }
  return particles;
}

function ParticleField({ isMobile }: { isMobile: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const particleRef = useRef<THREE.InstancedMesh>(null);
  const lineRef = useRef<THREE.LineSegments>(null);
  const cursorRef = useRef<THREE.Mesh>(null);
  const { camera, gl } = useThree();

  const count = isMobile ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;

  // Mutable simulation state in a ref (avoids useMemo immutability lint).
  // Use `== null` check per react-hooks/refs rule.
  const particlesRef = useRef<Particle[]>(null);
  if (particlesRef.current == null) particlesRef.current = buildParticles(count);
  const particles = particlesRef.current;

  // Theme colors (reactive via MutationObserver).
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

  // Pre-allocate the line geometry buffer (max lines × 2 vertices × 3 coords).
  const lineGeometry = useMemo(() => {
    const positions = new Float32Array(MAX_LINES * 6);
    const colors = new Float32Array(MAX_LINES * 6);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  // Window-level pointer tracking (the canvas is behind content at z -10).
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

  // Click → ripple shockwave: push particles away from the click point.
  const ripplesRef = useRef<{ x: number; y: number; t: number }[]>([]);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest('a, button, [role="button"], input, textarea, select, [cmdk-input]')) {
        return;
      }
      const rect = gl.domElement.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      // Unproject to world XY plane at z=0.
      const tmp = new THREE.Vector3(nx, ny, 0.5);
      tmp.unproject(camera);
      const dir = tmp.clone().sub(camera.position).normalize();
      const dist = -camera.position.z / dir.z;
      const wx = camera.position.x + dir.x * dist;
      const wy = camera.position.y + dir.y * dist;
      ripplesRef.current.push({ x: wx, y: wy, t: 0 });
      // Cap ripples to avoid unbounded growth.
      if (ripplesRef.current.length > 5) ripplesRef.current.shift();
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [camera, gl]);

  // Scratch objects (avoid per-frame allocation).
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

    // Parallax tilt.
    const targetRotY = ptr.active ? ptr.x * 0.25 : 0;
    const targetRotX = ptr.active ? -ptr.y * 0.18 : 0;
    groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.04;
    groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.04;
    groupRef.current.position.y = Math.sin(time * 0.15) * 0.15;

    // Unproject pointer to world XY plane (z=0).
    let mx = 9999;
    let my = 9999;
    if (ptr.active) {
      tmpVec.set(ptr.x, ptr.y, 0.5);
      tmpVec.unproject(camera);
      rayDir.copy(tmpVec).sub(camera.position).normalize();
      const distance = -camera.position.z / rayDir.z;
      mouseWorld.copy(camera.position).add(rayDir.multiplyScalar(distance));
      mx = mouseWorld.x;
      my = mouseWorld.y;
    }

    // Update cursor sphere position + visibility.
    if (cursorRef.current) {
      if (ptr.active) {
        cursorRef.current.position.set(mx, my, 0);
        cursorRef.current.visible = true;
        const pulse = 0.8 + Math.sin(time * 4) * 0.2;
        cursorRef.current.scale.setScalar(pulse);
      } else {
        cursorRef.current.visible = false;
      }
    }

    // Advance ripples.
    const ripples = ripplesRef.current;
    for (let i = ripples.length - 1; i >= 0; i--) {
      ripples[i].t += dt;
      if (ripples[i].t > 1.5) ripples.splice(i, 1);
    }

    // Update particles.
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Drift.
      p.pos.add(p.vel);
      // Pull back toward base position (spring).
      p.pos.lerp(p.basePos, 0.008);
      // Bounce off bounds.
      const limit = 6;
      if (p.pos.x > limit) p.vel.x = -Math.abs(p.vel.x);
      if (p.pos.x < -limit) p.vel.x = Math.abs(p.vel.x);
      if (p.pos.y > limit * 0.7) p.vel.y = -Math.abs(p.vel.y);
      if (p.pos.y < -limit * 0.7) p.vel.y = Math.abs(p.vel.y);

      // Mouse attraction + activation.
      let activation = 0;
      if (ptr.active) {
        const dx = p.pos.x - mx;
        const dy = p.pos.y - my;
        const d2 = dx * dx + dy * dy;
        if (d2 < MOUSE_RADIUS * MOUSE_RADIUS) {
          const d = Math.sqrt(d2);
          const intensity = 1 - d / MOUSE_RADIUS;
          activation = intensity;
          // Gentle attraction toward cursor.
          if (d > 0.01) {
            p.vel.x -= (dx / d) * intensity * 0.008;
            p.vel.y -= (dy / d) * intensity * 0.008;
          }
        }
      }

      // Ripple push.
      for (const r of ripples) {
        const rdx = p.pos.x - r.x;
        const rdy = p.pos.y - r.y;
        const rd = Math.sqrt(rdx * rdx + rdy * rdy);
        const rippleRadius = r.t * 5;
        const bandWidth = 1.5;
        if (rd > 0.01 && Math.abs(rd - rippleRadius) < bandWidth) {
          const force = (1 - Math.abs(rd - rippleRadius) / bandWidth) * (1 - r.t / 1.5);
          p.vel.x += (rdx / rd) * force * 0.06;
          p.vel.y += (rdy / rd) * force * 0.06;
          activation = Math.max(activation, force * 0.8);
        }
      }

      // Damping.
      p.vel.multiplyScalar(0.985);
      // Decay activation.
      p.activation = Math.max(activation, p.activation * 0.92);
    }

    // Write particle instances.
    if (particleRef.current) {
      cNode.set(colorsRef.current.node);
      cAlt.set(colorsRef.current.nodeAlt);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const breath = 0.7 + Math.sin(time * 1.2 + i * 0.5) * 0.15;
        const scale = 0.06 + breath * 0.02 + p.activation * 0.15;
        dummy.position.copy(p.pos);
        dummy.scale.setScalar(scale);
        dummy.updateMatrix();
        particleRef.current.setMatrixAt(i, dummy.matrix);
        tmpColor.copy(cNode).lerp(cAlt, p.activation);
        tmpColor.multiplyScalar(1 + p.activation * 0.8);
        particleRef.current.setColorAt(i, tmpColor);
      }
      particleRef.current.instanceMatrix.needsUpdate = true;
      if (particleRef.current.instanceColor)
        particleRef.current.instanceColor.needsUpdate = true;
    }

    // Build connection lines (capped at MAX_LINES).
    if (lineRef.current) {
      const posAttr = lineRef.current.geometry.getAttribute("position") as THREE.BufferAttribute;
      const colorAttr = lineRef.current.geometry.getAttribute("color") as THREE.BufferAttribute;
      const baseLine = colorsRef.current.line;
      let lineIdx = 0;

      for (let i = 0; i < particles.length && lineIdx < MAX_LINES; i++) {
        for (let j = i + 1; j < particles.length && lineIdx < MAX_LINES; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.pos.x - b.pos.x;
          const dy = a.pos.y - b.pos.y;
          const dz = a.pos.z - b.pos.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (dist < CONNECT_DISTANCE) {
            const closeness = 1 - dist / CONNECT_DISTANCE;
            const activation = Math.max(a.activation, b.activation);
            const alpha = closeness * (0.4 + activation * 0.6);

            posAttr.setXYZ(lineIdx * 2, a.pos.x, a.pos.y, a.pos.z);
            posAttr.setXYZ(lineIdx * 2 + 1, b.pos.x, b.pos.y, b.pos.z);

            tmpColor.copy(baseLine).lerp(cAlt, activation * 0.6);
            tmpColor.multiplyScalar(1 + alpha * 1.5);
            colorAttr.setXYZ(lineIdx * 2, tmpColor.r, tmpColor.g, tmpColor.b);
            colorAttr.setXYZ(lineIdx * 2 + 1, tmpColor.r, tmpColor.g, tmpColor.b);
            lineIdx++;
          }
        }
      }

      // Hide unused lines by setting zero-length segments far away.
      for (let i = lineIdx; i < MAX_LINES; i++) {
        posAttr.setXYZ(i * 2, 0, 0, -1000);
        posAttr.setXYZ(i * 2 + 1, 0, 0, -1000);
      }
      posAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Connection lines (vertex-colored) */}
      <lineSegments ref={lineRef} geometry={lineGeometry}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.85}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* Particles */}
      <instancedMesh ref={particleRef} args={[undefined, undefined, count]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial color="#5eead4" toneMapped={false} />
      </instancedMesh>

      {/* Cursor sphere — a glowing ring that follows the mouse in 3D space */}
      <mesh ref={cursorRef} visible={false}>
        <ringGeometry args={[0.35, 0.5, 32]} />
        <meshBasicMaterial
          color="#a78bfa"
          transparent
          opacity={0.4}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
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
        camera={{ position: [0, 0, 12], fov: 50 }}
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
          <ParticleField isMobile={isMobile} />
          {!isMobile && !reducedMotion && (
            <EffectComposer>
              <Bloom
                intensity={0.7}
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
