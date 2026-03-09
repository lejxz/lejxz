/**
 * three-bg.js
 * Initialises a Three.js animated particle-field background in the hero section.
 * Design decision: a sparse, floating particle network reinforces the
 * AR/VR-inspired, AI-generative aesthetic without heavy GPU cost.
 */
(function () {
  'use strict';

  /* Guard — THREE must be available from the CDN script loaded before this file */
  if (typeof THREE === 'undefined') return;

  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  /* ---- Renderer ---- */
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,          // transparent background so CSS gradient shows through
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);  // fully transparent

  /* ---- Scene & Camera ---- */
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
  camera.position.z = 5;

  /* ---- Particles ---- */
  const PARTICLE_COUNT = 700;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const sizes     = new Float32Array(PARTICLE_COUNT);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 20;  // x
    positions[i * 3 + 1] = (Math.random() - 0.5) * 14;  // y
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;  // z
    sizes[i] = Math.random() * 2.5 + 0.5;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

  /* Custom shader material for glowing purple dots */
  const material = new THREE.PointsMaterial({
    color: 0xB660EB,
    size: 0.06,
    transparent: true,
    opacity: 0.55,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  /* ---- Connection lines (sparse network effect) ---- */
  const LINE_THRESHOLD_SQ = 2.5 * 2.5;   // only connect nearby particles
  const linePositions = [];
  const sampleCount   = Math.min(PARTICLE_COUNT, 200); // limit to keep geometry light

  for (let i = 0; i < sampleCount; i++) {
    for (let j = i + 1; j < sampleCount; j++) {
      const dx = positions[i * 3]     - positions[j * 3];
      const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
      const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
      const distSq = dx * dx + dy * dy + dz * dz;
      if (distSq < LINE_THRESHOLD_SQ) {
        linePositions.push(
          positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
          positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
        );
      }
    }
  }

  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x7800BF,
    transparent: true,
    opacity: 0.12,
  });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lines);

  /* ---- Mouse parallax ---- */
  let mouseX = 0;
  let mouseY = 0;
  const handleMouseMove = (e) => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  };
  window.addEventListener('mousemove', handleMouseMove, { passive: true });

  /* ---- Resize handler ---- */
  function onResize() {
    const hero = canvas.parentElement;
    const w = hero.clientWidth;
    const h = hero.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', onResize, { passive: true });
  onResize();

  /* ---- Animation loop ---- */
  let rafId;
  const clock = new THREE.Clock();

  function animate() {
    rafId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    /* Slowly rotate particle cloud */
    points.rotation.y = t * 0.03;
    points.rotation.x = t * 0.015;
    lines.rotation.y  = t * 0.03;
    lines.rotation.x  = t * 0.015;

    /* Subtle breathing scale */
    const breathe = 1 + Math.sin(t * 0.4) * 0.02;
    points.scale.set(breathe, breathe, breathe);

    /* Mouse parallax — gently tilt the scene */
    scene.rotation.y += (mouseX * 0.08 - scene.rotation.y) * 0.04;
    scene.rotation.x += (-mouseY * 0.05 - scene.rotation.x) * 0.04;

    renderer.render(scene, camera);
  }
  animate();

  /* ---- Pause when tab is hidden (performance) ---- */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      clock.start();
      animate();
    }
  });
})();
