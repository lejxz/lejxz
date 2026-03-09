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
    let gridAttr = null;
    let gridXCount = 0;
    let gridZCount = 0;

    /* ---- ABOUT: Soft floating translucent orbs ---- */
    if (variant === 'about') {
      const count = prefersReducedMotion ? 6 : 14;
      for (let i = 0; i < count; i++) {
        const radius = Math.random() * 0.45 + 0.15;
        const sphere = new THREE.Mesh(
          new THREE.SphereGeometry(radius, 16, 16),
          new THREE.MeshStandardMaterial({
            color: i % 3 === 0 ? 0xb660eb : i % 3 === 1 ? 0x9b30e0 : 0xd17bff,
            emissive: 0x1a0d2e,
            metalness: 0.3,
            roughness: 0.6,
            transparent: true,
            opacity: 0.12 + Math.random() * 0.08,
          })
        );
        sphere.position.set(
          (Math.random() - 0.5) * 16,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 5
        );
        sphere.userData.speed = Math.random() * 0.25 + 0.08;
        sphere.userData.offset = Math.random() * Math.PI * 2;
        scene.add(sphere);
        objects.push(sphere);
      }
    }

    /* ---- PROJECTS: Animated wave grid + floating polyhedra ---- */
    if (variant === 'projects') {
      gridXCount = prefersReducedMotion ? 16 : 28;
      gridZCount = prefersReducedMotion ? 16 : 28;
      const spacing = 0.55;
      const total = gridXCount * gridZCount;
      const positions = new Float32Array(total * 3);
      const colors = new Float32Array(total * 3);

      for (let ix = 0; ix < gridXCount; ix++) {
        for (let iz = 0; iz < gridZCount; iz++) {
          const idx = (ix * gridZCount + iz) * 3;
          positions[idx]     = (ix - gridXCount / 2) * spacing;
          positions[idx + 1] = 0;
          positions[idx + 2] = (iz - gridZCount / 2) * spacing;
          colors[idx]     = 0.72;
          colors[idx + 1] = 0.38;
          colors[idx + 2] = 0.92;
        }
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const mat = new THREE.PointsMaterial({
        size: 0.055,
        vertexColors: true,
        transparent: true,
        opacity: 0.38,
        sizeAttenuation: true,
      });

      const grid = new THREE.Points(geo, mat);
      grid.rotation.x = -0.55;
      scene.add(grid);
      objects.push(grid);
      gridAttr = grid.geometry.attributes.position;

      const shapeCount = prefersReducedMotion ? 3 : 6;
      const geoTypes = [
        () => new THREE.TetrahedronGeometry(0.28, 0),
        () => new THREE.OctahedronGeometry(0.24, 0),
        () => new THREE.IcosahedronGeometry(0.22, 0),
      ];
      for (let i = 0; i < shapeCount; i++) {
        const mesh = new THREE.Mesh(
          geoTypes[i % 3](),
          new THREE.MeshBasicMaterial({
            color: i % 2 === 0 ? 0x3ddc84 : 0xb660eb,
            wireframe: true,
            transparent: true,
            opacity: 0.18,
          })
        );
        mesh.position.set(
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 3 + 2.5,
          (Math.random() - 0.5) * 4
        );
        mesh.userData.rotSpeed = Math.random() * 0.4 + 0.2;
        scene.add(mesh);
        objects.push(mesh);
      }
    }

    /* ---- RESEARCH: DNA double-helix structure ---- */
    if (variant === 'research') {
      const helixGroup = new THREE.Group();
      const nodeCount = prefersReducedMotion ? 30 : 60;

      for (let i = 0; i < nodeCount; i++) {
        const angle = (i / nodeCount) * Math.PI * 4;
        const y = (i / nodeCount - 0.5) * 12;

        const s1 = new THREE.Mesh(
          new THREE.SphereGeometry(0.06, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0xb660eb, transparent: true, opacity: 0.45 })
        );
        s1.position.set(Math.cos(angle) * 1.6, y, Math.sin(angle) * 1.6);
        helixGroup.add(s1);

        const s2 = new THREE.Mesh(
          new THREE.SphereGeometry(0.06, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0x3ddc84, transparent: true, opacity: 0.45 })
        );
        s2.position.set(Math.cos(angle + Math.PI) * 1.6, y, Math.sin(angle + Math.PI) * 1.6);
        helixGroup.add(s2);

        if (i % 4 === 0) {
          const bridgeGeo = new THREE.BufferGeometry();
          bridgeGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
            Math.cos(angle) * 1.6, y, Math.sin(angle) * 1.6,
            Math.cos(angle + Math.PI) * 1.6, y, Math.sin(angle + Math.PI) * 1.6,
          ]), 3));
          helixGroup.add(new THREE.Line(
            bridgeGeo,
            new THREE.LineBasicMaterial({ color: 0xd17bff, transparent: true, opacity: 0.18 })
          ));
        }
      }

      helixGroup.rotation.z = 0.3;
      helixGroup.position.x = 2;
      scene.add(helixGroup);
      objects.push(helixGroup);
    }

    /* ---- CONTACT: Constellation starfield with connections ---- */
    if (variant === 'contact') {
      const starCount = prefersReducedMotion ? 70 : 180;
      const starPositions = new Float32Array(starCount * 3);

      for (let i = 0; i < starCount; i++) {
        const angle = i * 0.38;
        const radius = (i / starCount) * 6.5 + Math.random() * 1.8;
        starPositions[i * 3]     = Math.cos(angle) * radius + (Math.random() - 0.5) * 2;
        starPositions[i * 3 + 1] = (Math.random() - 0.5) * 7;
        starPositions[i * 3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * 2;
      }

      const starGeo = new THREE.BufferGeometry();
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
        color: 0xe8d5ff,
        size: 0.055,
        transparent: true,
        opacity: 0.45,
        sizeAttenuation: true,
      }));
      scene.add(stars);
      objects.push(stars);

      const linePositions = [];
      const sampleMax = Math.min(starCount, 90);
      const threshold = 2.2;
      for (let i = 0; i < sampleMax; i++) {
        for (let j = i + 1; j < sampleMax; j++) {
          const dx = starPositions[i * 3]     - starPositions[j * 3];
          const dy = starPositions[i * 3 + 1] - starPositions[j * 3 + 1];
          const dz = starPositions[i * 3 + 2] - starPositions[j * 3 + 2];
          if (dx * dx + dy * dy + dz * dz < threshold * threshold) {
            linePositions.push(
              starPositions[i * 3], starPositions[i * 3 + 1], starPositions[i * 3 + 2],
              starPositions[j * 3], starPositions[j * 3 + 1], starPositions[j * 3 + 2]
            );
          }
        }
      }

      if (linePositions.length) {
        const lineGeo = new THREE.BufferGeometry();
        lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
        const lines = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({
          color: 0xb660eb,
          transparent: true,
          opacity: 0.07,
        }));
        scene.add(lines);
        objects.push(lines);
      }
    }

    const entry = registerScene({
      canvas,
      renderer,
      scene,
      camera,
      visible: true,
      update: (t) => {
        if (variant === 'about') {
          objects.forEach((obj) => {
            const s = obj.userData.speed || 0.15;
            const o = obj.userData.offset || 0;
            obj.position.y += Math.sin(t * s + o) * 0.0015;
            obj.position.x += Math.cos(t * s * 0.7 + o) * 0.0008;
            obj.rotation.y = t * 0.08;
          });
          scene.rotation.y = Math.sin(t * 0.06) * 0.03;
        }

        if (variant === 'projects' && gridAttr) {
          for (let ix = 0; ix < gridXCount; ix++) {
            for (let iz = 0; iz < gridZCount; iz++) {
              const idx = (ix * gridZCount + iz) * 3;
              const x = (ix - gridXCount / 2) * 0.55;
              const z = (iz - gridZCount / 2) * 0.55;
              gridAttr.array[idx + 1] =
                Math.sin(x * 0.5 + t * 0.7) * 0.35 +
                Math.cos(z * 0.5 + t * 0.55) * 0.25;
            }
          }
          gridAttr.needsUpdate = true;
          for (let i = 1; i < objects.length; i++) {
            const obj = objects[i];
            const rs = obj.userData.rotSpeed || 0.3;
            obj.rotation.x += 0.003 * rs;
            obj.rotation.y += 0.004 * rs;
            obj.position.y += Math.sin(t * 0.3 + i) * 0.0015;
          }
        }

        if (variant === 'research') {
          objects.forEach((obj) => { obj.rotation.y += 0.003; });
          scene.rotation.y = t * 0.04;
        }

        if (variant === 'contact') {
          objects.forEach((obj) => { obj.rotation.y += 0.0006; });
          scene.rotation.y = t * 0.03;
          scene.rotation.x = Math.sin(t * 0.12) * 0.025;
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
    initSectionBackgroundScene('about-canvas', 'about');
    initSectionBackgroundScene('projects-canvas', 'projects');
    initSectionBackgroundScene('research-canvas', 'research');
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
