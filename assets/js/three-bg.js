/**
 * three-bg.js
 * Initialises multiple lightweight Three.js scenes:
 *   1) Hero particle network background
 *   2) About avatar hologram
 *   3) Project thumbnail glyph overlays
 *   4) Research thumbnail glyph overlays
 */
(function () {
  'use strict';

  if (typeof THREE === 'undefined') return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const managedScenes = [];
  const clock = new THREE.Clock();
  let rafId = null;
  let loopActive = false;

  function registerScene(entry) {
    managedScenes.push(entry);
    return entry;
  }

  function startLoop() {
    if (loopActive) return;
    loopActive = true;
    clock.start();

    const frame = () => {
      if (!loopActive) return;
      rafId = requestAnimationFrame(frame);
      const t = clock.getElapsedTime();

      managedScenes.forEach((entry) => {
        if (!entry.renderer || !entry.scene || !entry.camera) return;
        if (entry.canvas && entry.canvas.offsetParent === null) return;
        if (entry.visible === false) return;

        entry.update(t);
        entry.renderer.render(entry.scene, entry.camera);
      });
    };

    frame();
  }

  function stopLoop() {
    loopActive = false;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function makeRenderer(canvas, alpha) {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !prefersReducedMotion,
      alpha,
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, prefersReducedMotion ? 1.2 : 2));
    renderer.setClearColor(0x000000, alpha ? 0 : 1);
    return renderer;
  }

  function bindVisibility(entry, rootMargin) {
    if (!('IntersectionObserver' in window) || !entry.canvas) return;

    const observer = new IntersectionObserver((items) => {
      items.forEach((item) => {
        entry.visible = item.isIntersecting;
      });
    }, { rootMargin: rootMargin || '80px' });

    observer.observe(entry.canvas);
  }

  function bindResize(entry, getSize) {
    const applySize = () => {
      const dims = getSize();
      if (!dims || !dims.width || !dims.height) return;
      entry.renderer.setSize(dims.width, dims.height, false);
      entry.camera.aspect = dims.width / dims.height;
      entry.camera.updateProjectionMatrix();
    };

    entry.resize = applySize;
    applySize();
  }

  function initHeroScene() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const renderer = makeRenderer(canvas, true);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    camera.position.z = 5;

    const particleCount = prefersReducedMotion ? 220 : 700;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xB660EB,
      size: 0.06,
      transparent: true,
      opacity: 0.55,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const linePositions = [];
    const sampleCount = Math.min(particleCount, prefersReducedMotion ? 80 : 200);
    const lineThresholdSq = 2.5 * 2.5;

    for (let i = 0; i < sampleCount; i++) {
      for (let j = i + 1; j < sampleCount; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < lineThresholdSq) {
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

    let mouseX = 0;
    let mouseY = 0;
    if (!prefersReducedMotion) {
      window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      }, { passive: true });
    }

    const entry = registerScene({
      canvas,
      renderer,
      scene,
      camera,
      visible: true,
      update: (t) => {
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
      },
    });

    bindResize(entry, () => {
      const hero = canvas.parentElement;
      return {
        width: hero ? hero.clientWidth : window.innerWidth,
        height: hero ? hero.clientHeight : window.innerHeight,
      };
    });

    bindVisibility(entry, '200px');
  }

  function initAvatarScene() {
    const avatarInner = document.querySelector('.avatar-inner');
    if (!avatarInner || avatarInner.dataset.threeInit === 'true') return;
    avatarInner.dataset.threeInit = 'true';

    const canvas = document.createElement('canvas');
    canvas.className = 'avatar-three-canvas';
    avatarInner.prepend(canvas);
    avatarInner.classList.add('has-three-avatar');

    const renderer = makeRenderer(canvas, true);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 50);
    camera.position.z = 3;

    const knot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.55, 0.2, 90, 12),
      new THREE.MeshStandardMaterial({
        color: 0xb660eb,
        emissive: 0x550088,
        metalness: 0.45,
        roughness: 0.35,
        transparent: true,
        opacity: 0.9,
      })
    );

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.05, 0.03, 12, 90),
      new THREE.MeshBasicMaterial({ color: 0xd17bff, transparent: true, opacity: 0.55 })
    );

    const pointLight = new THREE.PointLight(0xd47dff, 1.2, 10);
    pointLight.position.set(1.8, 1.2, 2.6);

    const ambient = new THREE.AmbientLight(0x7b3ac3, 0.65);

    scene.add(knot);
    scene.add(ring);
    scene.add(pointLight);
    scene.add(ambient);

    const entry = registerScene({
      canvas,
      renderer,
      scene,
      camera,
      visible: true,
      update: (t) => {
        knot.rotation.x = t * 0.45;
        knot.rotation.y = t * 0.62;
        ring.rotation.z = t * 0.75;
        ring.scale.setScalar(1 + Math.sin(t * 1.6) * 0.035);
      },
    });

    bindResize(entry, () => ({
      width: avatarInner.clientWidth,
      height: avatarInner.clientHeight,
    }));

    bindVisibility(entry, '140px');
  }

  function pickColorFromStatus(statusText) {
    const token = (statusText || '').toLowerCase();
    if (token.includes('active')) return 0x3ddc84;
    if (token.includes('prototype')) return 0xf9c846;
    return 0xb660eb;
  }

  function createThumbGlyph(canvas, type, colorHex) {
    const renderer = makeRenderer(canvas, true);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 30);
    camera.position.z = 2.7;

    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    const point = new THREE.PointLight(colorHex, 1.25, 8);
    point.position.set(1.3, 1.1, 1.9);

    let core;
    if (type === 'research') {
      core = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.68, 0),
        new THREE.MeshStandardMaterial({
          color: colorHex,
          emissive: 0x2b1738,
          metalness: 0.3,
          roughness: 0.45,
          flatShading: true,
          transparent: true,
          opacity: 0.88,
        })
      );
    } else {
      core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.66, 0),
        new THREE.MeshStandardMaterial({
          color: colorHex,
          emissive: 0x2b1738,
          metalness: 0.5,
          roughness: 0.28,
          transparent: true,
          opacity: 0.9,
        })
      );
    }

    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(1.02, 0.02, 8, 72),
      new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.52 })
    );

    scene.add(ambient);
    scene.add(point);
    scene.add(core);
    scene.add(halo);

    const entry = registerScene({
      canvas,
      renderer,
      scene,
      camera,
      visible: true,
      update: (t) => {
        core.rotation.x = t * (type === 'research' ? 0.5 : 0.7);
        core.rotation.y = t * (type === 'research' ? 0.62 : 0.8);
        halo.rotation.z = t * 0.85;
        halo.rotation.y = t * 0.18;
      },
    });

    bindResize(entry, () => ({
      width: canvas.clientWidth,
      height: canvas.clientHeight,
    }));

    bindVisibility(entry, '140px');
  }

  function initThumbnailScenes() {
    const projectThumbs = Array.from(document.querySelectorAll('.project-thumbnail'));
    projectThumbs.forEach((thumb) => {
      if (thumb.dataset.threeInit === 'true') return;
      thumb.dataset.threeInit = 'true';

      const canvas = document.createElement('canvas');
      canvas.className = 'project-three-canvas';
      thumb.appendChild(canvas);

      const statusText = thumb.querySelector('.project-status-badge')?.textContent || '';
      createThumbGlyph(canvas, 'project', pickColorFromStatus(statusText));
    });

    const researchThumbs = Array.from(document.querySelectorAll('.research-thumbnail'));
    researchThumbs.forEach((thumb) => {
      if (thumb.dataset.threeInit === 'true') return;
      thumb.dataset.threeInit = 'true';

      const canvas = document.createElement('canvas');
      canvas.className = 'research-three-canvas';
      thumb.appendChild(canvas);

      const statusText = thumb.closest('.research-card')
        ?.querySelector('.project-status-badge')
        ?.textContent || '';
      createThumbGlyph(canvas, 'research', pickColorFromStatus(statusText));
    });
  }

  function initSectionBackgroundScene(canvasId, variant) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || canvas.dataset.threeInit === 'true') return;
    canvas.dataset.threeInit = 'true';

    const renderer = makeRenderer(canvas, true);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 80);
    camera.position.z = 9;

    const ambient = new THREE.AmbientLight(0xffffff, 0.75);
    const point = new THREE.PointLight(0xb660eb, 1.2, 24);
    point.position.set(3.4, 2.6, 5);
    scene.add(ambient);
    scene.add(point);

    const objects = [];

    if (variant === 'projects') {
      const count = prefersReducedMotion ? 10 : 18;
      for (let i = 0; i < count; i++) {
        const geo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
        const mat = new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? 0x9b30e0 : 0x3ddc84,
          wireframe: true,
          transparent: true,
          opacity: 0.24,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set((Math.random() - 0.5) * 16, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 6);
        mesh.rotation.set(Math.random(), Math.random(), Math.random());
        mesh.scale.setScalar(Math.random() * 0.7 + 0.6);
        scene.add(mesh);
        objects.push(mesh);
      }

      const particlesCount = prefersReducedMotion ? 120 : 240;
      const positions = new Float32Array(particlesCount * 3);
      for (let i = 0; i < particlesCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 22;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
      }
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const pMat = new THREE.PointsMaterial({
        color: 0xb660eb,
        size: 0.06,
        transparent: true,
        opacity: 0.35,
      });
      const points = new THREE.Points(pGeo, pMat);
      scene.add(points);
      objects.push(points);
    }

    if (variant === 'contact') {
      const ringGroup = new THREE.Group();
      const ringCount = prefersReducedMotion ? 4 : 7;
      for (let i = 0; i < ringCount; i++) {
        const radius = 1.2 + i * 0.55;
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(radius, 0.025, 8, 72),
          new THREE.MeshBasicMaterial({
            color: i % 2 === 0 ? 0xb660eb : 0xd17bff,
            transparent: true,
            opacity: 0.22,
          })
        );
        ring.rotation.x = Math.random() * Math.PI;
        ring.rotation.y = Math.random() * Math.PI;
        ringGroup.add(ring);
        objects.push(ring);
      }

      ringGroup.position.set(0, -0.2, -1.2);
      scene.add(ringGroup);

      const crystal = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.9, 0),
        new THREE.MeshStandardMaterial({
          color: 0x3ddc84,
          emissive: 0x1c4331,
          metalness: 0.5,
          roughness: 0.35,
          transparent: true,
          opacity: 0.42,
          flatShading: true,
        })
      );
      scene.add(crystal);
      objects.push(crystal);
    }

    const entry = registerScene({
      canvas,
      renderer,
      scene,
      camera,
      visible: true,
      update: (t) => {
        if (variant === 'projects') {
          objects.forEach((obj, idx) => {
            obj.rotation.x += 0.0007 + idx * 0.00002;
            obj.rotation.y += 0.001 + idx * 0.00002;
            if (idx < 18) {
              obj.position.y += Math.sin(t * 0.4 + idx) * 0.0008;
            }
          });
          scene.rotation.y = Math.sin(t * 0.12) * 0.08;
        }

        if (variant === 'contact') {
          objects.forEach((obj, idx) => {
            obj.rotation.z += 0.0012 + idx * 0.00005;
            obj.rotation.y += 0.0005 + idx * 0.00003;
          });
          scene.rotation.x = Math.sin(t * 0.2) * 0.05;
          scene.rotation.y = Math.cos(t * 0.22) * 0.06;
        }
      },
    });

    bindResize(entry, () => ({
      width: canvas.clientWidth,
      height: canvas.clientHeight,
    }));

    bindVisibility(entry, '220px');
  }

  function boot() {
    initHeroScene();
    initAvatarScene();
    initThumbnailScenes();
    initSectionBackgroundScene('projects-canvas', 'projects');
    initSectionBackgroundScene('contact-canvas', 'contact');
    startLoop();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('portfolio:rendered', () => {
    initThumbnailScenes();
  });

  window.addEventListener('resize', () => {
    managedScenes.forEach((entry) => {
      if (typeof entry.resize === 'function') entry.resize();
    });
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopLoop();
    } else {
      startLoop();
    }
  });
})();
