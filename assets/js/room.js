import * as THREE from "three";

const palette = {
  wallLight: 0xe2ddd4,
  wallDark: 0x2a231d,
  wood: 0x3f332a,
  woodAlt: 0x5a4a3f,
  metal: 0x121212,
  monitor: 0x181c22,
  screen: 0x8aa8bd,
  paper: 0xd9d6cb,
  cyan: 0x78b6d6,
  amber: 0xc88c50,
  mist: 0x9da6b1,
};

const SECTION_ORDER = ["intro", "about", "projects", "research", "skills", "contact"];

const sectionViews = {
  intro: {
    position: new THREE.Vector3(-2.1, 1.7, 3.9),
    target: new THREE.Vector3(1.2, 1.25, -0.85),
    subtitle: "The desk where ideas become systems.",
  },
  about: {
    position: new THREE.Vector3(-0.4, 1.55, 2.4),
    target: new THREE.Vector3(0.85, 1.3, -0.9),
    subtitle: "Who I am and what I build.",
  },
  projects: {
    position: new THREE.Vector3(2.25, 1.6, 1.45),
    target: new THREE.Vector3(1.8, 1.2, -0.7),
    subtitle: "Applied experiments and working prototypes.",
  },
  research: {
    position: new THREE.Vector3(2.55, 1.75, -0.25),
    target: new THREE.Vector3(1.15, 1.55, -2.1),
    subtitle: "Notes, methods, and technical depth.",
  },
  skills: {
    position: new THREE.Vector3(0.45, 1.75, -0.95),
    target: new THREE.Vector3(-1.55, 1.25, -1.15),
    subtitle: "Tools and languages I rely on daily.",
  },
  contact: {
    position: new THREE.Vector3(-1.95, 1.6, 0.85),
    target: new THREE.Vector3(-1.8, 1.35, -0.3),
    subtitle: "Ways to collaborate and connect.",
  },
};

export function buildSceneKit(scene) {
  const dynamic = {
    bobbing: [],
    monitors: [],
    particles: null,
    lamps: [],
  };

  buildEnvironment(scene);
  buildDeskZone(scene, dynamic);
  buildProjectShelf(scene, dynamic);
  buildResearchWall(scene, dynamic);
  buildSkillRack(scene, dynamic);
  buildContactDock(scene, dynamic);
  dynamic.particles = addParticles(scene);

  return {
    sections: SECTION_ORDER.map((id, index) => ({
      id,
      index,
      ...sectionViews[id],
    })),
    dynamic,
  };
}

export function updateSceneDynamics(dynamic, elapsedTime) {
  dynamic.bobbing.forEach((item, index) => {
    item.position.y = item.baseY + Math.sin(elapsedTime * item.speed + index * 0.9) * item.amp;
    item.rotation.y += item.spin;
  });

  dynamic.monitors.forEach((screen, index) => {
    const n = (Math.sin(elapsedTime * (1.2 + index * 0.2)) + 1) * 0.5;
    screen.material.opacity = 0.62 + n * 0.2;
  });

  dynamic.lamps.forEach((lamp, index) => {
    const jitter = Math.sin(elapsedTime * (2 + index * 0.4)) * 0.15;
    lamp.intensity = lamp.base + jitter;
  });

  if (dynamic.particles) {
    const arr = dynamic.particles.geometry.attributes.position.array;
    for (let i = 0; i < arr.length; i += 3) {
      arr[i + 1] += Math.sin(elapsedTime * 0.4 + i) * 0.0008;
      if (arr[i + 1] > 3.4) arr[i + 1] = 0.2;
    }
    dynamic.particles.geometry.attributes.position.needsUpdate = true;
  }
}

function material(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.65,
    metalness: 0.18,
    ...opts,
  });
}

function buildEnvironment(scene) {
  const room = new THREE.Group();

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    material(palette.wood, { roughness: 0.8, metalness: 0.08 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  room.add(floor);

  const trim = new THREE.Mesh(
    new THREE.RingGeometry(4.3, 4.95, 4),
    material(0x181818, { roughness: 0.5 })
  );
  trim.rotation.x = -Math.PI / 2;
  trim.position.y = 0.02;
  trim.rotation.z = Math.PI * 0.25;
  room.add(trim);

  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(7.5, 4.2), material(palette.wallDark, { roughness: 0.9 }));
  backWall.position.set(0, 2.1, -3.1);
  room.add(backWall);

  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(7.5, 4.2), material(palette.wallLight, { roughness: 0.95 }));
  leftWall.position.set(-3.7, 2.1, 0);
  leftWall.rotation.y = Math.PI / 2;
  room.add(leftWall);

  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(7.5, 4.2), material(palette.wallDark, { roughness: 0.9 }));
  rightWall.position.set(3.7, 2.1, 0);
  rightWall.rotation.y = -Math.PI / 2;
  room.add(rightWall);

  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    material(0x191919, { roughness: 0.7, metalness: 0.2 })
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 4.2;
  room.add(ceiling);

  const skylight = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 1.1),
    new THREE.MeshBasicMaterial({ color: 0xf3f5ff, transparent: true, opacity: 0.22 })
  );
  skylight.position.set(1.8, 4.17, -2.1);
  skylight.rotation.x = Math.PI / 2;
  room.add(skylight);

  scene.add(room);
}

function buildDeskZone(scene, dynamic) {
  const group = new THREE.Group();

  const deskTop = new THREE.Mesh(
    new THREE.BoxGeometry(4.6, 0.14, 1.35),
    material(palette.woodAlt, { roughness: 0.62 })
  );
  deskTop.position.set(0.9, 1.03, -1.15);
  deskTop.castShadow = true;
  group.add(deskTop);

  const sideTable = new THREE.Mesh(
    new THREE.BoxGeometry(1.7, 0.14, 1.4),
    material(palette.wood, { roughness: 0.62 })
  );
  sideTable.position.set(-1.05, 1.03, -0.82);
  sideTable.castShadow = true;
  group.add(sideTable);

  const legGeo = new THREE.BoxGeometry(0.1, 1.02, 0.1);
  const legPos = [
    [-1.2, 0.5, -1.7],
    [3.05, 0.5, -1.7],
    [-1.2, 0.5, -0.55],
    [3.05, 0.5, -0.55],
    [-1.85, 0.5, -1.43],
    [-1.85, 0.5, -0.18],
  ];
  legPos.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(legGeo, material(palette.metal, { roughness: 0.5 }));
    leg.position.set(x, y, z);
    group.add(leg);
  });

  const monitor = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.94, 0.07),
    material(palette.monitor, { roughness: 0.45, metalness: 0.35 })
  );
  monitor.position.set(1.35, 1.58, -1.25);
  monitor.castShadow = true;
  group.add(monitor);

  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(1.33, 0.78),
    new THREE.MeshBasicMaterial({ color: palette.screen, transparent: true, opacity: 0.74 })
  );
  screen.position.set(1.35, 1.58, -1.21);
  group.add(screen);
  dynamic.monitors.push(screen);

  const stand = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.4, 0.12), material(palette.metal));
  stand.position.set(1.35, 1.16, -1.22);
  group.add(stand);

  const keyboard = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.04, 0.32), material(0x202228, { roughness: 0.4 }));
  keyboard.position.set(1.28, 1.08, -0.72);
  keyboard.rotation.y = -0.05;
  group.add(keyboard);

  const mouse = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.2), material(0x282a31, { roughness: 0.38 }));
  mouse.position.set(1.88, 1.08, -0.65);
  group.add(mouse);

  const stack = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.42), material(palette.paper, { roughness: 0.94, metalness: 0.02 }));
  stack.position.set(0.23, 1.11, -0.7);
  group.add(stack);

  const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.11, 18), material(0x30414f, { roughness: 0.45 }));
  mug.position.set(2.15, 1.11, -0.95);
  group.add(mug);

  scene.add(group);
}

function buildProjectShelf(scene, dynamic) {
  const group = new THREE.Group();

  const shelf = new THREE.Mesh(
    new THREE.BoxGeometry(1.65, 2.15, 0.42),
    material(0x171717, { roughness: 0.7 })
  );
  shelf.position.set(2.75, 1.08, -0.95);
  group.add(shelf);

  const tiers = [0.45, 0.96, 1.48, 2.0];
  tiers.forEach((y) => {
    const plank = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.06, 0.4), material(0x2a2a2a, { roughness: 0.66 }));
    plank.position.set(2.75, y, -0.95);
    group.add(plank);
  });

  const colors = [0x8aa8bd, 0xc88c50, 0xad7070, 0x6d7d89, 0xd6be84];
  for (let i = 0; i < 18; i += 1) {
    const book = new THREE.Mesh(
      new THREE.BoxGeometry(0.09 + (i % 3) * 0.015, 0.24 + (i % 5) * 0.03, 0.22),
      material(colors[i % colors.length], { roughness: 0.7, metalness: 0.04 })
    );
    const row = Math.floor(i / 5);
    const col = i % 5;
    book.position.set(2.23 + col * 0.2, 0.6 + row * 0.54, -0.95 + ((i % 2) * 0.05 - 0.02));
    group.add(book);
  }

  const orb = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.17, 1),
    new THREE.MeshBasicMaterial({ color: palette.amber, wireframe: true, transparent: true, opacity: 0.6 })
  );
  orb.position.set(2.75, 2.3, -1);
  orb.baseY = orb.position.y;
  orb.amp = 0.08;
  orb.speed = 1.1;
  orb.spin = 0.012;
  dynamic.bobbing.push(orb);
  group.add(orb);

  scene.add(group);
}

function buildResearchWall(scene, dynamic) {
  const group = new THREE.Group();

  const board = new THREE.Mesh(
    new THREE.BoxGeometry(2.3, 1.4, 0.08),
    material(0x1f1f24, { roughness: 0.5 })
  );
  board.position.set(1.35, 1.85, -2.95);
  group.add(board);

  const rows = [-0.36, -0.06, 0.25];
  rows.forEach((y, rowIndex) => {
    const stroke = new THREE.Mesh(
      new THREE.PlaneGeometry(1.8, 0.03),
      new THREE.MeshBasicMaterial({ color: rowIndex % 2 ? palette.cyan : palette.amber, transparent: true, opacity: 0.4 })
    );
    stroke.position.set(1.35, 1.85 + y, -2.9);
    group.add(stroke);
  });

  const memoColors = [0xd1e0ea, 0xf1d7ad, 0xdcc6b0];
  for (let i = 0; i < 6; i += 1) {
    const note = new THREE.Mesh(
      new THREE.PlaneGeometry(0.22, 0.18),
      new THREE.MeshBasicMaterial({ color: memoColors[i % memoColors.length], transparent: true, opacity: 0.72 })
    );
    note.position.set(0.68 + (i % 3) * 0.42, 1.55 + Math.floor(i / 3) * 0.38, -2.89);
    note.rotation.z = (i % 2 ? -1 : 1) * 0.05;
    group.add(note);
  }

  const chip = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.2, 0),
    new THREE.MeshBasicMaterial({ color: palette.cyan, transparent: true, opacity: 0.55, wireframe: true })
  );
  chip.position.set(1.35, 1.2, -2.35);
  chip.baseY = chip.position.y;
  chip.amp = 0.07;
  chip.speed = 1.5;
  chip.spin = 0.01;
  dynamic.bobbing.push(chip);
  group.add(chip);

  scene.add(group);
}

function buildSkillRack(scene, dynamic) {
  const group = new THREE.Group();

  const rack = new THREE.Mesh(
    new THREE.BoxGeometry(1.7, 1.2, 0.4),
    material(0x202020, { roughness: 0.6 })
  );
  rack.position.set(-1.8, 1.32, -1.28);
  group.add(rack);

  const chips = ["PY", "CV", "ML", "AR", "SEC", "C++"];
  chips.forEach((_, index) => {
    const tile = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.2, 0.06),
      material(index % 2 ? 0x2f3942 : 0x3f2e24, { roughness: 0.45, metalness: 0.22 })
    );
    tile.position.set(-2.28 + (index % 3) * 0.48, 1.63 - Math.floor(index / 3) * 0.34, -1.04);
    group.add(tile);

    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(0.36, 0.1),
      new THREE.MeshBasicMaterial({ color: index % 2 ? palette.cyan : palette.amber, transparent: true, opacity: 0.28 })
    );
    glow.position.copy(tile.position);
    glow.position.z += 0.04;
    group.add(glow);
  });

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.26, 0.03, 8, 24),
    new THREE.MeshBasicMaterial({ color: palette.cyan, transparent: true, opacity: 0.45 })
  );
  ring.position.set(-1.8, 2.18, -1.15);
  ring.rotation.x = Math.PI / 2;
  ring.baseY = ring.position.y;
  ring.amp = 0.09;
  ring.speed = 1.2;
  ring.spin = 0.015;
  dynamic.bobbing.push(ring);
  group.add(ring);

  scene.add(group);
}

function buildContactDock(scene, dynamic) {
  const group = new THREE.Group();

  const plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.48, 0.86, 16),
    material(0x232323, { roughness: 0.55 })
  );
  plinth.position.set(-1.95, 0.43, -0.2);
  group.add(plinth);

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 18, 18),
    new THREE.MeshBasicMaterial({ color: palette.amber, transparent: true, opacity: 0.68 })
  );
  sphere.position.set(-1.95, 1.27, -0.2);
  sphere.baseY = sphere.position.y;
  sphere.amp = 0.07;
  sphere.speed = 1.35;
  sphere.spin = 0.009;
  dynamic.bobbing.push(sphere);
  group.add(sphere);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.34, 0.015, 12, 48),
    new THREE.MeshBasicMaterial({ color: palette.cyan, transparent: true, opacity: 0.4 })
  );
  ring.position.copy(sphere.position);
  ring.rotation.x = 0.55;
  ring.baseY = ring.position.y;
  ring.amp = 0.05;
  ring.speed = 1.8;
  ring.spin = -0.02;
  dynamic.bobbing.push(ring);
  group.add(ring);

  const lamp = new THREE.PointLight(0xf4c88f, 0.9, 3.8, 1.8);
  lamp.position.set(-1.95, 1.45, -0.2);
  lamp.base = 0.9;
  dynamic.lamps.push(lamp);
  group.add(lamp);

  scene.add(group);
}

function addParticles(scene) {
  const count = 140;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 7;
    positions[i * 3 + 1] = Math.random() * 3.4 + 0.2;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 6.4;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const points = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: 0xe0d4bc,
      size: 0.02,
      transparent: true,
      opacity: 0.4,
      sizeAttenuation: true,
    })
  );

  scene.add(points);
  return points;
}
