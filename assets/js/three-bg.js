/**
 * three-bg.js
 * Hero-only Three.js background scene.
 * Non-hero sections and cards intentionally use CSS visuals for lower distraction.
 */
(function () {
  'use strict';

  if (typeof THREE === 'undefined') return;

  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !prefersReducedMotion,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, prefersReducedMotion ? 1.2 : 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
  camera.position.z = 5;

  const particleCount = prefersReducedMotion ? 220 : 680;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }

  const pointsGeo = new THREE.BufferGeometry();
  pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const points = new THREE.Points(
    pointsGeo,
    new THREE.PointsMaterial({
      color: 0xb660eb,
      size: 0.06,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true,
    })
  );
  scene.add(points);

  const linePositions = [];
  const sampleCount = Math.min(particleCount, prefersReducedMotion ? 80 : 200);
  const thresholdSq = 2.5 * 2.5;

  for (let i = 0; i < sampleCount; i++) {
    for (let j = i + 1; j < sampleCount; j++) {
      const dx = positions[i * 3] - positions[j * 3];
      const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
      const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
      const distSq = dx * dx + dy * dy + dz * dz;
      if (distSq < thresholdSq) {
        linePositions.push(
          positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
          positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
        );
      }
    }
  }

  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
  const lines = new THREE.LineSegments(
    lineGeo,
    new THREE.LineBasicMaterial({
      color: 0x7800bf,
      transparent: true,
      opacity: 0.1,
    })
  );
  scene.add(lines);

  let mouseX = 0;
  let mouseY = 0;
  if (!prefersReducedMotion) {
    window.addEventListener(
      'mousemove',
      (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      },
      { passive: true }
    );
  }

  function resize() {
    const hero = canvas.parentElement;
    const width = hero ? hero.clientWidth : window.innerWidth;
    const height = hero ? hero.clientHeight : window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });

  const clock = new THREE.Clock();
  let rafId = null;
  let running = true;

  function render() {
    if (!running) return;

    rafId = requestAnimationFrame(render);
    const t = clock.getElapsedTime();

    points.rotation.y = t * 0.03;
    points.rotation.x = t * 0.015;
    lines.rotation.y = t * 0.03;
    lines.rotation.x = t * 0.015;

    const breathe = 1 + Math.sin(t * 0.4) * 0.02;
    points.scale.set(breathe, breathe, breathe);

    if (!prefersReducedMotion) {
      scene.rotation.y += (mouseX * 0.08 - scene.rotation.y) * 0.04;
      scene.rotation.x += (-mouseY * 0.05 - scene.rotation.x) * 0.04;
    }

    renderer.render(scene, camera);
  }

  render();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      running = false;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      return;
    }

    if (!running) {
      running = true;
      render();
    }
  });
})();
