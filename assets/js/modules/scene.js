import { isReducedMotion } from "./utils.js";

export function setupScrollReveal() {
  const reveals = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  reveals.forEach((item, index) => {
    item.style.transitionDelay = `${index * 80}ms`;
    observer.observe(item);
  });
}

export function setupCardTilt() {
  if (isReducedMotion()) {
    return;
  }

  const cards = document.querySelectorAll(".panel-card");

  cards.forEach((card) => {
    card.onmousemove = (event) => {
      const bounds = card.getBoundingClientRect();
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      const offsetX = (event.clientX - centerX) / 18;
      const offsetY = (event.clientY - centerY) / 22;
      card.style.transform = `rotateX(${-offsetY}deg) rotateY(${offsetX}deg) translateZ(1px)`;
    };

    card.onmouseleave = () => {
      card.style.transform = "rotateX(0deg) rotateY(0deg)";
    };
  });
}

export function setupThreeScene(canvas) {
  if (!window.THREE || !canvas || isReducedMotion()) {
    return;
  }

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
  });

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
  camera.position.set(0, 0, 7);

  const light = new THREE.PointLight(0x6be9ff, 2.4, 28);
  light.position.set(2, 2, 5);
  scene.add(light);

  const fill = new THREE.AmbientLight(0x88a1c9, 0.55);
  scene.add(fill);

  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.1, 1),
    new THREE.MeshStandardMaterial({
      color: 0x00d2ff,
      emissive: 0x073250,
      metalness: 0.65,
      roughness: 0.28,
      flatShading: true
    })
  );

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.85, 0.08, 16, 120),
    new THREE.MeshStandardMaterial({
      color: 0xff8a3d,
      emissive: 0x3b1700,
      metalness: 0.75,
      roughness: 0.3
    })
  );

  scene.add(core);
  scene.add(ring);

  const particlesCount = 520;
  const positions = new Float32Array(particlesCount * 3);

  for (let i = 0; i < particlesCount; i += 1) {
    const radius = 2.5 + Math.random() * 1.35;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }

  const particlesGeometry = new THREE.BufferGeometry();
  particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const particlesMaterial = new THREE.PointsMaterial({
    color: 0x9de9ff,
    size: 0.028,
    transparent: true,
    opacity: 0.82
  });

  const particles = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particles);

  let animationFrame = 0;
  let paused = false;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function animate() {
    if (paused) {
      return;
    }

    core.rotation.x += 0.004;
    core.rotation.y += 0.005;
    ring.rotation.x -= 0.006;
    ring.rotation.z += 0.004;
    particles.rotation.y += 0.0008;

    renderer.render(scene, camera);
    animationFrame = requestAnimationFrame(animate);
  }

  let pointerX = 0;
  let pointerY = 0;

  const onPointerMove = (event) => {
    pointerX = (event.clientX / window.innerWidth - 0.5) * 0.9;
    pointerY = (event.clientY / window.innerHeight - 0.5) * 0.9;
    camera.position.x += (pointerX - camera.position.x) * 0.05;
    camera.position.y += (-pointerY - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
  };

  const onVisibilityChange = () => {
    paused = document.hidden;

    if (!paused) {
      animate();
    } else {
      cancelAnimationFrame(animationFrame);
    }
  };

  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", onVisibilityChange);

  resize();
  animate();
}
