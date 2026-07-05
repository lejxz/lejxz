"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

function ParticleField({ count = 1400 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 5 + Math.random() * 9;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7;
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.018;
    ref.current.rotation.x += delta * 0.004;
    const targetY = state.pointer.x * 0.4;
    const targetX = -state.pointer.y * 0.25;
    ref.current.rotation.y += (targetY * 0.01 - 0);
    ref.current.rotation.x += (targetX * 0.01 - 0);
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.028}
        color="#5eead4"
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function CoreShape() {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.12;
      group.current.rotation.z += delta * 0.04;
      const ty = state.pointer.x * 0.5;
      const tx = -state.pointer.y * 0.35;
      group.current.position.x += (ty - group.current.position.x) * 0.04;
      group.current.position.y += (tx - group.current.position.y) * 0.04;
    }
    if (inner.current) {
      inner.current.rotation.y -= delta * 0.22;
      inner.current.rotation.x += delta * 0.1;
    }
  });

  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[2.3, 1]} />
        <meshBasicMaterial color="#5eead4" wireframe transparent opacity={0.22} />
      </mesh>
      <mesh ref={inner} scale={0.62}>
        <icosahedronGeometry args={[2.3, 0]} />
        <meshBasicMaterial color="#a78bfa" wireframe transparent opacity={0.4} />
      </mesh>
      <mesh scale={1.55}>
        <icosahedronGeometry args={[2.3, 0]} />
        <meshBasicMaterial color="#5eead4" wireframe transparent opacity={0.06} />
      </mesh>
    </group>
  );
}

function Rig() {
  useFrame((state) => {
    const scroll = typeof window !== "undefined" ? window.scrollY : 0;
    const max = typeof window !== "undefined" ? window.innerHeight : 800;
    const t = scroll / max;
    state.camera.position.y = t * 1.2;
    state.camera.position.z = 9 - t * 1.5;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function Background() {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 -z-10" aria-hidden>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 9], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <fog attach="fog" args={["#0b0d10", 9, 22]} />
        <ambientLight intensity={0.4} />
        <ParticleField />
        <CoreShape />
        <Rig />
      </Canvas>
    </div>
  );
}
