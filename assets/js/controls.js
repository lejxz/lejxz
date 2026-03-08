/*  controls.js — First-person WASD + pointer-lock controls  */
import * as THREE from "three";

const SPEED = 4.5;
const PLAYER_HEIGHT = 1.8;
const COLLISION_RADIUS = 0.5;

export function createControls(camera, canvas, roomW, roomD) {
  const keys = { w: false, a: false, s: false, d: false };
  let yaw = 0, pitch = 0;
  let locked = false;

  const euler = new THREE.Euler(0, 0, 0, "YXZ");
  const direction = new THREE.Vector3();

  // Position the camera at a sensible start
  camera.position.set(0, PLAYER_HEIGHT, roomD / 2 - 3);
  camera.rotation.set(0, Math.PI, 0); // face the room
  yaw = Math.PI;

  // Pointer Lock
  canvas.addEventListener("click", () => {
    if (!locked) canvas.requestPointerLock?.();
  });

  document.addEventListener("pointerlockchange", () => {
    locked = document.pointerLockElement === canvas;
  });

  document.addEventListener("mousemove", (e) => {
    if (!locked) return;
    yaw -= e.movementX * 0.002;
    pitch -= e.movementY * 0.002;
    pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, pitch));
  });

  document.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    if (k in keys) keys[k] = true;
  });
  document.addEventListener("keyup", (e) => {
    const k = e.key.toLowerCase();
    if (k in keys) keys[k] = false;
  });

  function update(dt) {
    if (!locked) return;

    euler.set(pitch, yaw, 0);
    camera.quaternion.setFromEuler(euler);

    direction.set(0, 0, 0);
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forward.y = 0; forward.normalize();
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    right.y = 0; right.normalize();

    if (keys.w) direction.add(forward);
    if (keys.s) direction.sub(forward);
    if (keys.d) direction.add(right);
    if (keys.a) direction.sub(right);

    if (direction.length() > 0) direction.normalize();

    const newPos = camera.position.clone().addScaledVector(direction, SPEED * dt);

    // Room bounds collision
    const halfW = roomW / 2 - COLLISION_RADIUS;
    const halfD = roomD / 2 - COLLISION_RADIUS;
    newPos.x = Math.max(-halfW, Math.min(halfW, newPos.x));
    newPos.z = Math.max(-halfD, Math.min(halfD, newPos.z));
    newPos.y = PLAYER_HEIGHT;

    camera.position.copy(newPos);
  }

  function isLocked() { return locked; }

  return { update, isLocked };
}
