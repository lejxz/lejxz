/*  room.js — Builds the 3D workspace room with interactive furniture  */
import * as THREE from "three";

const ROOM_W = 20, ROOM_H = 7, ROOM_D = 20;
const NEON = 0xb660eb, CYAN = 0x00e5ff, PINK = 0xff2d95;

/* ── Helpers ─────────────────────────────────────────────── */
function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color, ...opts });
}

function glowMat(color) {
  return new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85 });
}

function neonEdge(geo, color, parent) {
  const edges = new THREE.EdgesGeometry(geo);
  const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.6 }));
  parent.add(line);
  return line;
}

function label3D(text, color = CYAN) {
  const canvas = document.createElement("canvas");
  canvas.width = 512; canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "transparent"; ctx.fillRect(0, 0, 512, 128);
  ctx.font = "bold 36px 'Space Grotesk', sans-serif";
  ctx.fillStyle = `#${color.toString(16).padStart(6, "0")}`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(text, 256, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(3, 0.75, 1);
  return sprite;
}

/* ── Build the Room ─────────────────────────────────────── */
export function buildRoom(scene) {
  const interactables = [];  // objects the player can click

  // Floor
  const floorGeo = new THREE.PlaneGeometry(ROOM_W, ROOM_D);
  const floorMat = mat(0x0d0b24, { roughness: 0.8 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Floor grid overlay
  const gridHelper = new THREE.GridHelper(ROOM_W, 30, 0x1a1550, 0x120e35);
  gridHelper.position.y = 0.01;
  scene.add(gridHelper);

  // Walls
  const wallMat1 = mat(0x110e30, { roughness: 0.9 });
  const wallGeo = new THREE.PlaneGeometry(ROOM_W, ROOM_H);

  // Back wall (z = -ROOM_D/2)
  const backWall = new THREE.Mesh(wallGeo, wallMat1);
  backWall.position.set(0, ROOM_H / 2, -ROOM_D / 2);
  scene.add(backWall);

  // Front wall (z = ROOM_D/2) — behind player start
  const frontWall = new THREE.Mesh(wallGeo, wallMat1);
  frontWall.position.set(0, ROOM_H / 2, ROOM_D / 2);
  frontWall.rotation.y = Math.PI;
  scene.add(frontWall);

  // Side walls
  const sideGeo = new THREE.PlaneGeometry(ROOM_D, ROOM_H);
  const leftWall = new THREE.Mesh(sideGeo, wallMat1);
  leftWall.position.set(-ROOM_W / 2, ROOM_H / 2, 0);
  leftWall.rotation.y = Math.PI / 2;
  scene.add(leftWall);

  const rightWall = new THREE.Mesh(sideGeo, wallMat1);
  rightWall.position.set(ROOM_W / 2, ROOM_H / 2, 0);
  rightWall.rotation.y = -Math.PI / 2;
  scene.add(rightWall);

  // Ceiling
  const ceil = new THREE.Mesh(floorGeo, mat(0x0a0820));
  ceil.rotation.x = Math.PI / 2;
  ceil.position.y = ROOM_H;
  scene.add(ceil);

  // Neon strips on ceiling
  addCeilingStrips(scene);

  /* ── DESK + MONITOR (About / Profile) ────────────────── */
  const deskGroup = new THREE.Group();
  deskGroup.position.set(0, 0, -ROOM_D / 2 + 1.8);

  // Desk surface
  const deskGeo = new THREE.BoxGeometry(4, 0.12, 1.6);
  const deskMesh = new THREE.Mesh(deskGeo, mat(0x1c1845));
  deskMesh.position.y = 1.0;
  deskMesh.castShadow = true;
  neonEdge(deskGeo, NEON, deskMesh);
  deskGroup.add(deskMesh);

  // Desk legs
  const legGeo = new THREE.BoxGeometry(0.08, 1, 0.08);
  const legMat = mat(0x2a2460);
  [[-1.9, 0.5, -0.7], [1.9, 0.5, -0.7], [-1.9, 0.5, 0.7], [1.9, 0.5, 0.7]].forEach(p => {
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(...p);
    deskGroup.add(leg);
  });

  // Monitor
  const monGeo = new THREE.BoxGeometry(2.2, 1.3, 0.06);
  const monMesh = new THREE.Mesh(monGeo, mat(0x0e0c28));
  monMesh.position.set(0, 2.0, -0.4);
  neonEdge(monGeo, CYAN, monMesh);
  deskGroup.add(monMesh);

  // Screen glow
  const screenGeo = new THREE.PlaneGeometry(2.0, 1.1);
  const screenMesh = new THREE.Mesh(screenGeo, new THREE.MeshBasicMaterial({
    color: 0x0a1a3a, transparent: true, opacity: 0.9
  }));
  screenMesh.position.set(0, 2.0, -0.36);
  deskGroup.add(screenMesh);

  // Monitor stand
  const standGeo = new THREE.BoxGeometry(0.15, 0.65, 0.15);
  const stand = new THREE.Mesh(standGeo, legMat);
  stand.position.set(0, 1.38, -0.4);
  deskGroup.add(stand);

  // Keyboard
  const kbGeo = new THREE.BoxGeometry(1.2, 0.04, 0.4);
  const kb = new THREE.Mesh(kbGeo, mat(0x1a1640));
  kb.position.set(0, 1.1, 0.2);
  neonEdge(kbGeo, NEON, kb);
  deskGroup.add(kb);

  // Chair
  const chairGroup = buildChair();
  chairGroup.position.set(0, 0, 1.2);
  deskGroup.add(chairGroup);

  // Floating label
  const deskLabel = label3D("ABOUT ME", CYAN);
  deskLabel.position.set(0, 3.6, -0.4);
  deskGroup.add(deskLabel);

  scene.add(deskGroup);

  // Make monitor interactive
  monMesh.userData = { type: "about", label: "Click to view profile & about" };
  interactables.push(monMesh);

  /* ── BOOKSHELF (Projects) ────────────────────────────── */
  const shelfGroup = buildBookshelf();
  shelfGroup.position.set(-ROOM_W / 2 + 1.3, 0, 0);
  shelfGroup.rotation.y = Math.PI / 2;
  scene.add(shelfGroup);

  const shelfLabel = label3D("PROJECTS", NEON);
  shelfLabel.position.set(-ROOM_W / 2 + 1.3, 4.5, 0);
  scene.add(shelfLabel);

  const shelfHitbox = new THREE.Mesh(
    new THREE.BoxGeometry(1, 4, 5),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  shelfHitbox.position.set(-ROOM_W / 2 + 1.3, 2, 0);
  shelfHitbox.userData = { type: "projects", label: "Click to browse projects" };
  scene.add(shelfHitbox);
  interactables.push(shelfHitbox);

  /* ── WHITEBOARD (Research) ───────────────────────────── */
  const wbGroup = buildWhiteboard();
  wbGroup.position.set(ROOM_W / 2 - 0.3, 2.2, 0);
  wbGroup.rotation.y = -Math.PI / 2;
  scene.add(wbGroup);

  const wbLabel = label3D("RESEARCH", PINK);
  wbLabel.position.set(ROOM_W / 2 - 0.3, 4.5, 0);
  scene.add(wbLabel);

  const wbHitbox = new THREE.Mesh(
    new THREE.BoxGeometry(1, 3, 4),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  wbHitbox.position.set(ROOM_W / 2 - 0.8, 2.5, 0);
  wbHitbox.userData = { type: "research", label: "Click to read research papers" };
  scene.add(wbHitbox);
  interactables.push(wbHitbox);

  /* ── HOLOGRAM TABLE (Skills) ─────────────────────────── */
  const holoGroup = buildHologramTable();
  holoGroup.position.set(5, 0, 5);
  scene.add(holoGroup);

  const holoLabel = label3D("SKILLS", CYAN);
  holoLabel.position.set(5, 3.8, 5);
  scene.add(holoLabel);

  const holoHitbox = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 3, 2.5),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  holoHitbox.position.set(5, 1.5, 5);
  holoHitbox.userData = { type: "skills", label: "Click to view tech stack" };
  scene.add(holoHitbox);
  interactables.push(holoHitbox);

  /* ── FLOATING ORB (Contact) ──────────────────────────── */
  const orbGroup = buildContactOrb();
  orbGroup.position.set(-5, 2.5, 5);
  scene.add(orbGroup);

  const contactLabel = label3D("CONTACT", PINK);
  contactLabel.position.set(-5, 4.5, 5);
  scene.add(contactLabel);

  const orbHitbox = new THREE.Mesh(
    new THREE.SphereGeometry(1.2, 8, 8),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  orbHitbox.position.set(-5, 2.5, 5);
  orbHitbox.userData = { type: "contact", label: "Click to get in touch" };
  scene.add(orbHitbox);
  interactables.push(orbHitbox);

  /* ── FOCUS AREA PEDESTAL ─────────────────────────────── */
  const focusGroup = buildFocusPedestal();
  focusGroup.position.set(0, 0, 5);
  scene.add(focusGroup);

  const focusLabel = label3D("FOCUS", CYAN);
  focusLabel.position.set(0, 3.8, 5);
  scene.add(focusLabel);

  const focusHitbox = new THREE.Mesh(
    new THREE.BoxGeometry(2, 3, 2),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  focusHitbox.position.set(0, 1.5, 5);
  focusHitbox.userData = { type: "focus", label: "Click to see current focus" };
  scene.add(focusHitbox);
  interactables.push(focusHitbox);

  /* ── AMBIENT DECORATIONS ─────────────────────────────── */
  addFloatingParticles(scene);

  return interactables;
}

/* ── Sub-builders ────────────────────────────────────────── */
function buildChair() {
  const g = new THREE.Group();
  const seatGeo = new THREE.BoxGeometry(0.8, 0.08, 0.8);
  const seat = new THREE.Mesh(seatGeo, mat(0x1e1a45));
  seat.position.y = 0.7;
  g.add(seat);
  const backGeo = new THREE.BoxGeometry(0.8, 0.9, 0.08);
  const back = new THREE.Mesh(backGeo, mat(0x1e1a45));
  back.position.set(0, 1.15, -0.36);
  g.add(back);
  const legGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.7, 6);
  const legMt = mat(0x2a2460);
  [[-0.3, 0.35, -0.3], [0.3, 0.35, -0.3], [-0.3, 0.35, 0.3], [0.3, 0.35, 0.3]].forEach(p => {
    const l = new THREE.Mesh(legGeo, legMt);
    l.position.set(...p);
    g.add(l);
  });
  return g;
}

function buildBookshelf() {
  const g = new THREE.Group();
  const shelfMt = mat(0x1a1640);
  // Frame
  const sideGeo = new THREE.BoxGeometry(0.08, 4, 0.6);
  const side1 = new THREE.Mesh(sideGeo, shelfMt); side1.position.set(-2, 2, 0); g.add(side1);
  const side2 = new THREE.Mesh(sideGeo, shelfMt); side2.position.set(2, 2, 0); g.add(side2);

  // Shelves
  const shGeo = new THREE.BoxGeometry(4, 0.08, 0.6);
  [0.5, 1.4, 2.3, 3.2, 4.0].forEach(y => {
    const sh = new THREE.Mesh(shGeo, shelfMt);
    sh.position.set(0, y, 0);
    neonEdge(shGeo, NEON, sh);
    g.add(sh);
  });

  // Books (colored boxes)
  const bookColors = [0xb660eb, 0x00e5ff, 0xff2d95, 0x6c3beb, 0x4a90d9];
  [0.5, 1.4, 2.3, 3.2].forEach((shelfY, si) => {
    const count = 4 + Math.floor(Math.random() * 3);
    let x = -1.6;
    for (let i = 0; i < count; i++) {
      const w = 0.12 + Math.random() * 0.15;
      const h = 0.5 + Math.random() * 0.3;
      const bookGeo = new THREE.BoxGeometry(w, h, 0.35);
      const book = new THREE.Mesh(bookGeo, mat(bookColors[(si + i) % bookColors.length]));
      book.position.set(x + w / 2, shelfY + 0.08 + h / 2, 0);
      g.add(book);
      x += w + 0.04;
    }
  });

  return g;
}

function buildWhiteboard() {
  const g = new THREE.Group();
  // Board
  const boardGeo = new THREE.BoxGeometry(4, 2.5, 0.08);
  const board = new THREE.Mesh(boardGeo, mat(0x161240));
  neonEdge(boardGeo, PINK, board);
  g.add(board);

  // Screen surface
  const surfGeo = new THREE.PlaneGeometry(3.6, 2.2);
  const surf = new THREE.Mesh(surfGeo, new THREE.MeshBasicMaterial({ color: 0x0d0a25, transparent: true, opacity: 0.9 }));
  surf.position.z = 0.05;
  g.add(surf);

  // Some "post-it" rectangles
  const postItColors = [NEON, CYAN, PINK];
  [[-1, 0.5], [0.3, -0.3], [1.2, 0.6]].forEach(([x, y], i) => {
    const piGeo = new THREE.PlaneGeometry(0.6, 0.4);
    const pi = new THREE.Mesh(piGeo, glowMat(postItColors[i]));
    pi.position.set(x, y, 0.06);
    g.add(pi);
  });

  return g;
}

function buildHologramTable() {
  const g = new THREE.Group();
  // Round table base
  const baseGeo = new THREE.CylinderGeometry(0.8, 0.9, 0.1, 24);
  const base = new THREE.Mesh(baseGeo, mat(0x1a1640));
  base.position.y = 0.85;
  neonEdge(baseGeo, CYAN, base);
  g.add(base);

  // Pedestal
  const pedGeo = new THREE.CylinderGeometry(0.2, 0.3, 0.85, 12);
  const ped = new THREE.Mesh(pedGeo, mat(0x151240));
  ped.position.y = 0.43;
  g.add(ped);

  // Hologram cone (upside-down cone with transparency)
  const holoGeo = new THREE.ConeGeometry(0.6, 2, 24, 1, true);
  const holoMat = new THREE.MeshBasicMaterial({
    color: CYAN, transparent: true, opacity: 0.08,
    side: THREE.DoubleSide, wireframe: true
  });
  const holo = new THREE.Mesh(holoGeo, holoMat);
  holo.position.y = 1.9;
  holo.name = "holoCone";
  g.add(holo);

  // Floating icosahedron
  const icoGeo = new THREE.IcosahedronGeometry(0.35, 0);
  const icoMat = new THREE.MeshBasicMaterial({ color: CYAN, wireframe: true, transparent: true, opacity: 0.7 });
  const ico = new THREE.Mesh(icoGeo, icoMat);
  ico.position.y = 2.2;
  ico.name = "holoIco";
  g.add(ico);

  // Ring
  const ringGeo = new THREE.TorusGeometry(0.55, 0.015, 8, 48);
  const ring = new THREE.Mesh(ringGeo, glowMat(CYAN));
  ring.position.y = 1.0;
  ring.rotation.x = Math.PI / 2;
  ring.name = "holoRing";
  g.add(ring);

  return g;
}

function buildContactOrb() {
  const g = new THREE.Group();
  // Outer wireframe sphere
  const outerGeo = new THREE.SphereGeometry(0.7, 16, 16);
  const outer = new THREE.Mesh(outerGeo, new THREE.MeshBasicMaterial({
    color: PINK, wireframe: true, transparent: true, opacity: 0.25
  }));
  outer.name = "contactOuter";
  g.add(outer);

  // Inner core
  const coreGeo = new THREE.SphereGeometry(0.25, 16, 16);
  const core = new THREE.Mesh(coreGeo, new THREE.MeshBasicMaterial({
    color: PINK, transparent: true, opacity: 0.6
  }));
  core.name = "contactCore";
  g.add(core);

  // Orbiting ring
  const ringGeo = new THREE.TorusGeometry(0.55, 0.012, 8, 48);
  const ring = new THREE.Mesh(ringGeo, glowMat(PINK));
  ring.name = "contactRing";
  g.add(ring);

  return g;
}

function buildFocusPedestal() {
  const g = new THREE.Group();
  // Pillar
  const pilGeo = new THREE.CylinderGeometry(0.5, 0.6, 1.4, 6);
  const pillar = new THREE.Mesh(pilGeo, mat(0x1a1640));
  pillar.position.y = 0.7;
  neonEdge(pilGeo, CYAN, pillar);
  g.add(pillar);

  // Floating diamond
  const diamGeo = new THREE.OctahedronGeometry(0.4, 0);
  const diam = new THREE.Mesh(diamGeo, new THREE.MeshBasicMaterial({
    color: CYAN, wireframe: true, transparent: true, opacity: 0.6
  }));
  diam.position.y = 2.2;
  diam.name = "focusDiamond";
  g.add(diam);

  return g;
}

/* ── Ceiling Neon Strips ─────────────────────────────────── */
function addCeilingStrips(scene) {
  const stripGeo = new THREE.BoxGeometry(ROOM_W - 2, 0.04, 0.06);
  const colors = [NEON, CYAN];
  [-3, 0, 3].forEach((z, i) => {
    const strip = new THREE.Mesh(stripGeo, glowMat(colors[i % 2]));
    strip.position.set(0, ROOM_H - 0.05, z);
    scene.add(strip);
  });
  // Cross strips
  const crossGeo = new THREE.BoxGeometry(0.06, 0.04, ROOM_D - 2);
  [-4, 4].forEach((x, i) => {
    const strip = new THREE.Mesh(crossGeo, glowMat(colors[(i + 1) % 2]));
    strip.position.set(x, ROOM_H - 0.05, 0);
    scene.add(strip);
  });
}

/* ── Floating Particles ──────────────────────────────────── */
function addFloatingParticles(scene) {
  const count = 200;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * ROOM_W;
    positions[i * 3 + 1] = Math.random() * ROOM_H;
    positions[i * 3 + 2] = (Math.random() - 0.5) * ROOM_D;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const particleMat = new THREE.PointsMaterial({
    color: NEON, size: 0.04, transparent: true, opacity: 0.5,
    sizeAttenuation: true
  });
  const particles = new THREE.Points(geo, particleMat);
  particles.name = "particles";
  scene.add(particles);
}

/* ── Animate Objects ─────────────────────────────────────── */
export function animateRoom(scene, time) {
  // Hologram rotation
  const ico = scene.getObjectByName("holoIco");
  if (ico) {
    ico.rotation.y = time * 0.5;
    ico.rotation.x = Math.sin(time * 0.3) * 0.3;
    ico.position.y = 2.2 + Math.sin(time * 0.8) * 0.15;
  }
  const ring = scene.getObjectByName("holoRing");
  if (ring) ring.rotation.z = time * 0.3;

  const cone = scene.getObjectByName("holoCone");
  if (cone) cone.rotation.y = time * 0.2;

  // Contact orb
  const outer = scene.getObjectByName("contactOuter");
  if (outer) { outer.rotation.y = time * 0.4; outer.rotation.x = time * 0.2; }
  const core = scene.getObjectByName("contactCore");
  if (core) core.scale.setScalar(1 + Math.sin(time * 2) * 0.1);
  const cRing = scene.getObjectByName("contactRing");
  if (cRing) { cRing.rotation.x = time * 0.6; cRing.rotation.y = time * 0.3; }

  // Focus diamond
  const diam = scene.getObjectByName("focusDiamond");
  if (diam) {
    diam.rotation.y = time * 0.7;
    diam.position.y = 2.2 + Math.sin(time * 1.2) * 0.12;
  }

  // Particles drift
  const particles = scene.getObjectByName("particles");
  if (particles) {
    const posArr = particles.geometry.attributes.position.array;
    for (let i = 0; i < posArr.length; i += 3) {
      posArr[i + 1] += Math.sin(time + i) * 0.0008;
      if (posArr[i + 1] > ROOM_H) posArr[i + 1] = 0;
    }
    particles.geometry.attributes.position.needsUpdate = true;
  }
}

export { ROOM_W, ROOM_D };
