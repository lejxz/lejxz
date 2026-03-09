/**
 * three-bg.js
 * Three.js backgrounds for Hero, About, Projects, and Research sections.
 * Uses IntersectionObserver for performance — only renders visible sections.
 */
(function () {
  'use strict';

  if (typeof THREE === 'undefined') return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Shared mouse tracking ---- */
  let mx = 0, my = 0;
  if (!reduced) {
    window.addEventListener('mousemove', (e) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
  }

  /* ---- Helpers ---- */
  function makeRenderer(canvas, prLimit) {
    var r = new THREE.WebGLRenderer({ canvas: canvas, antialias: !reduced, alpha: true });
    r.setPixelRatio(Math.min(window.devicePixelRatio, prLimit || 1.5));
    r.setClearColor(0x000000, 0);
    return r;
  }

  function autoResize(canvas, renderer, camera) {
    var fn = function () {
      var p = canvas.parentElement;
      var w = p ? p.clientWidth : window.innerWidth;
      var h = p ? p.clientHeight : window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    fn();
    window.addEventListener('resize', fn, { passive: true });
  }

  /* ---- Section-scene factory with visibility management ---- */
  function createSection(canvasId, setupFn) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;

    var renderer = makeRenderer(canvas, 1.5);
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    autoResize(canvas, renderer, camera);

    var clock = new THREE.Clock();
    var visible = false;
    var rafId = null;

    var animate = setupFn(scene, camera);

    function render() {
      if (!visible) return;
      rafId = requestAnimationFrame(render);
      animate(clock.getElapsedTime());
      renderer.render(scene, camera);
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !visible) {
          visible = true;
          clock.start();
          render();
        } else if (!entry.isIntersecting && visible) {
          visible = false;
          if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        }
      });
    }, { threshold: 0 });

    observer.observe(canvas.parentElement || canvas);

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        visible = false;
      } else {
        var rect = (canvas.parentElement || canvas).getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          visible = true;
          render();
        }
      }
    });
  }

  /* ====================================================
     HERO — particles + connection lines
     ==================================================== */
  (function initHero() {
    var canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    var renderer = makeRenderer(canvas, reduced ? 1.2 : 2);
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    camera.position.z = 5;

    var particleCount = reduced ? 220 : 680;
    var positions = new Float32Array(particleCount * 3);
    for (var i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }

    var pointsGeo = new THREE.BufferGeometry();
    pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    var points = new THREE.Points(pointsGeo, new THREE.PointsMaterial({
      color: 0xb660eb, size: 0.06, transparent: true, opacity: 0.5, sizeAttenuation: true,
    }));
    scene.add(points);

    var linePositions = [];
    var sampleCount = Math.min(particleCount, reduced ? 80 : 200);
    var thresholdSq = 2.5 * 2.5;
    for (var i = 0; i < sampleCount; i++) {
      for (var j = i + 1; j < sampleCount; j++) {
        var dx = positions[i * 3] - positions[j * 3];
        var dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        var dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        if (dx * dx + dy * dy + dz * dz < thresholdSq) {
          linePositions.push(
            positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
            positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
          );
        }
      }
    }

    var lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
    var lines = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({
      color: 0x7800bf, transparent: true, opacity: 0.1,
    }));
    scene.add(lines);

    autoResize(canvas, renderer, camera);

    var clock = new THREE.Clock();
    var rafId = null;
    var running = true;

    function render() {
      if (!running) return;
      rafId = requestAnimationFrame(render);
      var t = clock.getElapsedTime();
      points.rotation.y = t * 0.03;
      points.rotation.x = t * 0.015;
      lines.rotation.y = t * 0.03;
      lines.rotation.x = t * 0.015;
      var breathe = 1 + Math.sin(t * 0.4) * 0.02;
      points.scale.set(breathe, breathe, breathe);
      if (!reduced) {
        scene.rotation.y += (mx * 0.08 - scene.rotation.y) * 0.04;
        scene.rotation.x += (-my * 0.05 - scene.rotation.x) * 0.04;
      }
      renderer.render(scene, camera);
    }
    render();

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        running = false;
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      } else if (!running) {
        running = true;
        render();
      }
    });
  })();

  /* ====================================================
     ABOUT — floating wireframe polyhedra
     ==================================================== */
  createSection('about-canvas', function (scene, camera) {
    camera.position.z = 10;

    var geoTypes = [
      new THREE.IcosahedronGeometry(1, 0),
      new THREE.OctahedronGeometry(0.9, 0),
      new THREE.TetrahedronGeometry(0.7, 0),
      new THREE.DodecahedronGeometry(0.8, 0),
    ];

    var shapes = [];
    var count = reduced ? 5 : 12;
    for (var i = 0; i < count; i++) {
      var geo = geoTypes[i % geoTypes.length];
      var mat = new THREE.MeshBasicMaterial({
        color: 0xb660eb, wireframe: true, transparent: true,
        opacity: 0.06 + Math.random() * 0.1,
      });
      var mesh = new THREE.Mesh(geo, mat);
      var s = 0.4 + Math.random() * 1.6;
      mesh.scale.set(s, s, s);
      mesh.position.set(
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 8
      );
      mesh.userData = {
        rx: (Math.random() - 0.5) * 0.4,
        ry: (Math.random() - 0.5) * 0.4,
        fOff: Math.random() * Math.PI * 2,
        fSpd: 0.25 + Math.random() * 0.35,
        fAmp: 0.15 + Math.random() * 0.35,
        baseY: mesh.position.y,
      };
      scene.add(mesh);
      shapes.push(mesh);
    }

    return function (t) {
      for (var i = 0; i < shapes.length; i++) {
        var sh = shapes[i];
        sh.rotation.x += sh.userData.rx * 0.008;
        sh.rotation.y += sh.userData.ry * 0.008;
        sh.position.y = sh.userData.baseY + Math.sin(t * sh.userData.fSpd + sh.userData.fOff) * sh.userData.fAmp;
      }
      if (!reduced) {
        scene.rotation.y += (mx * 0.05 - scene.rotation.y) * 0.025;
        scene.rotation.x += (-my * 0.03 - scene.rotation.x) * 0.025;
      }
    };
  });

  /* ====================================================
     PROJECTS — constellation network
     ==================================================== */
  createSection('projects-canvas', function (scene, camera) {
    camera.position.z = 7;

    var nodeCount = reduced ? 40 : 120;
    var positions = new Float32Array(nodeCount * 3);
    for (var i = 0; i < nodeCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }

    var pointsGeo = new THREE.BufferGeometry();
    pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    var points = new THREE.Points(pointsGeo, new THREE.PointsMaterial({
      color: 0x9b30e0, size: 0.07, transparent: true, opacity: 0.55, sizeAttenuation: true,
    }));
    scene.add(points);

    var linePos = [];
    var thresh = 3.0;
    var thSq = thresh * thresh;
    var check = Math.min(nodeCount, reduced ? 40 : 100);
    for (var i = 0; i < check; i++) {
      for (var j = i + 1; j < check; j++) {
        var dx = positions[i * 3] - positions[j * 3];
        var dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        var dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        if (dx * dx + dy * dy + dz * dz < thSq) {
          linePos.push(
            positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
            positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
          );
        }
      }
    }

    var lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePos), 3));
    var lines = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({
      color: 0x7800bf, transparent: true, opacity: 0.07,
    }));
    scene.add(lines);

    return function (t) {
      points.rotation.y = t * 0.018;
      lines.rotation.y = t * 0.018;
      var b = 1 + Math.sin(t * 0.45) * 0.015;
      points.scale.set(b, b, b);
      if (!reduced) {
        scene.rotation.y += (mx * 0.06 - scene.rotation.y) * 0.025;
        scene.rotation.x += (-my * 0.04 - scene.rotation.x) * 0.025;
      }
    };
  });

  /* ====================================================
     RESEARCH — wave-field particles
     ==================================================== */
  createSection('research-canvas', function (scene, camera) {
    camera.position.set(0, 4, 9);
    camera.lookAt(0, 0, 0);

    var cols = reduced ? 22 : 48;
    var rows = reduced ? 16 : 32;
    var total = cols * rows;
    var spacing = 0.45;
    var positions = new Float32Array(total * 3);

    for (var c = 0; c < cols; c++) {
      for (var r = 0; r < rows; r++) {
        var idx = c * rows + r;
        positions[idx * 3] = (c - cols / 2) * spacing;
        positions[idx * 3 + 1] = 0;
        positions[idx * 3 + 2] = (r - rows / 2) * spacing;
      }
    }

    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    var pts = new THREE.Points(geo, new THREE.PointsMaterial({
      color: 0xb660eb, size: 0.045, transparent: true, opacity: 0.45, sizeAttenuation: true,
    }));
    scene.add(pts);

    return function (t) {
      var pos = geo.attributes.position.array;
      for (var c = 0; c < cols; c++) {
        for (var r = 0; r < rows; r++) {
          var idx = c * rows + r;
          var x = (c - cols / 2) * spacing;
          var z = (r - rows / 2) * spacing;
          pos[idx * 3 + 1] =
            Math.sin(x * 0.5 + t * 0.7) * 0.35 +
            Math.cos(z * 0.4 + t * 0.55) * 0.25 +
            Math.sin((x + z) * 0.3 + t * 0.4) * 0.15;
        }
      }
      geo.attributes.position.needsUpdate = true;
      if (!reduced) {
        scene.rotation.y += (mx * 0.04 - scene.rotation.y) * 0.02;
      }
    };
  });

})();
