/*  main.js — Entry point for 3D spatial portfolio  */
import * as THREE from "three";
import { buildRoom, animateRoom, ROOM_W, ROOM_D } from "./room.js";
import { createControls } from "./controls.js";
import { getPortfolioData } from "./data-loader.js";
import {
  showPanel, hidePanel, isPanelOpen,
  setupPanelListeners, showPrompt, hidePrompt, updateMinimap
} from "./ui.js";

let scene, camera, renderer, controls;
let interactables = [];
let portfolioData = {};
const raycaster = new THREE.Raycaster();
const center = new THREE.Vector2(0, 0);
const clock = new THREE.Clock();

/* ── Bootstrap ───────────────────────────────────────── */
async function init() {
  const loaderFill = document.getElementById("loaderFill");
  progress(loaderFill, 10);

  // Load portfolio data
  try {
    portfolioData = await getPortfolioData();
  } catch {
    console.warn("Could not load portfolio data, using defaults.");
    portfolioData = {};
  }
  progress(loaderFill, 40);

  // Three.js setup
  const canvas = document.getElementById("roomCanvas");
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0a1a, 0.025);

  camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 100);
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  progress(loaderFill, 55);

  // Lighting
  const ambient = new THREE.AmbientLight(0x1a1440, 0.6);
  scene.add(ambient);

  const mainLight = new THREE.PointLight(0xb660eb, 1.4, 30);
  mainLight.position.set(0, 6, 0);
  mainLight.castShadow = true;
  scene.add(mainLight);

  const cyanLight = new THREE.PointLight(0x00e5ff, 0.8, 18);
  cyanLight.position.set(-5, 4, 5);
  scene.add(cyanLight);

  const pinkLight = new THREE.PointLight(0xff2d95, 0.6, 18);
  pinkLight.position.set(5, 3, -6);
  scene.add(pinkLight);

  const deskLight = new THREE.SpotLight(0x00e5ff, 0.5, 8, Math.PI / 5, 0.6);
  deskLight.position.set(0, 5, -7);
  deskLight.target.position.set(0, 1, -8);
  scene.add(deskLight);
  scene.add(deskLight.target);

  progress(loaderFill, 70);

  // Build the room
  interactables = buildRoom(scene);
  progress(loaderFill, 90);

  // Controls
  controls = createControls(camera, canvas, ROOM_W, ROOM_D);

  // UI
  setupPanelListeners();
  setupEntryGate(canvas);

  // Interaction click
  canvas.addEventListener("click", onInteract);

  // Resize
  window.addEventListener("resize", onResize);

  progress(loaderFill, 100);

  // Hide loader after a beat
  setTimeout(() => {
    document.getElementById("loadingScreen")?.classList.add("fade-out");
  }, 600);

  // Start render loop
  animate();
}

/* ── Entry Gate ──────────────────────────────────────── */
function setupEntryGate(canvas) {
  const gate = document.getElementById("entryGate");
  const hud = document.getElementById("hud");
  document.getElementById("btnEnter")?.addEventListener("click", () => {
    gate?.classList.add("hidden");
    hud?.classList.add("visible");
    canvas.requestPointerLock?.();
  });
}

/* ── Progress helper ─────────────────────────────────── */
function progress(el, pct) {
  if (el) el.style.width = pct + "%";
}

/* ── Interaction raycast ─────────────────────────────── */
function onInteract() {
  if (isPanelOpen()) return;
  raycaster.setFromCamera(center, camera);
  const hits = raycaster.intersectObjects(interactables, false);
  if (hits.length > 0) {
    const obj = hits[0].object;
    if (obj.userData?.type) {
      showPanel(obj.userData.type, portfolioData);
    }
  }
}

/* ── Hover detection ─────────────────────────────────── */
function checkHover() {
  if (isPanelOpen()) { hidePrompt(); return; }
  raycaster.setFromCamera(center, camera);
  const hits = raycaster.intersectObjects(interactables, false);
  if (hits.length > 0 && hits[0].distance < 8) {
    const label = hits[0].object.userData?.label;
    if (label) { showPrompt(label); return; }
  }
  hidePrompt();
}

/* ── Render loop ─────────────────────────────────────── */
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.1);
  const elapsed = clock.elapsedTime;

  controls.update(dt);
  animateRoom(scene, elapsed);
  checkHover();

  // Minimap
  updateMinimap(camera.position.x, camera.position.z, ROOM_W, ROOM_D);

  renderer.render(scene, camera);
}

/* ── Resize ──────────────────────────────────────────── */
function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

init();
