const socket = io();

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let localPlayerId = null;
let gameState = { players: {}, projectiles: [] };
let selectedRole = 'tanque';

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

document.querySelectorAll('.role-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.role-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    selectedRole = card.getAttribute('data-role');
  });
});

document.getElementById('btn-play').addEventListener('click', () => {
  const name = document.getElementById('username').value.trim() || 'Guerrero';
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('game-ui').classList.remove('hidden');

  socket.emit('joinGame', { name: name, role: selectedRole });
});

const keys = { up: false, down: false, left: false, right: false };
let mousePos = { x: 0, y: 0 };

window.addEventListener('keydown', (e) => {
  if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') keys.up = true;
  if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') keys.down = true;
  if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.left = true;
  if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.right = true;
  sendInput();
});

window.addEventListener('keyup', (e) => {
  if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') keys.up = false;
  if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') keys.down = false;
  if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.left = false;
  if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.right = false;
  sendInput();
});

window.addEventListener('mousemove', (e) => {
  mousePos.x = e.clientX;
  mousePos.y = e.clientY;
  sendInput();
});

window.addEventListener('mousedown', () => {
  if (!localPlayerId || !gameState.players[localPlayerId]) return;
  const me = gameState.players[localPlayerId];
  
  const worldTarget = screenToWorld(mousePos.x, mousePos.y, me);
  socket.emit('attack', worldTarget);
});

const joystickZone = document.getElementById('joystick-zone');
const joystickKnob = document.getElementById('joystick-knob');
let joystickActive = false;

joystickZone.addEventListener('touchstart', (e) => { joystickActive = true; });
joystickZone.addEventListener('touchmove', (e) => {
  if (!joystickActive) return;
  const touch = e.touches[0];
  const rect = joystickZone.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  let dx = touch.clientX - centerX;
  let dy = touch.clientY - centerY;
  const dist = Math.hypot(dx, dy);
  const maxRadius = 35;

  if (dist > maxRadius) {
    dx = (dx / dist) * maxRadius;
    dy = (dy / dist) * maxRadius;
  }

  joystickKnob.style.transform = `translate(${dx}px, ${dy}px)`;

  keys.left = dx < -10;
  keys.right = dx > 10;
  keys.up = dy < -10;
  keys.down = dy > 10;
  sendInput();
});

joystickZone.addEventListener('touchend', () => {
  joystickActive = false;
  joystickKnob.style.transform = `translate(0px, 0px)`;
  keys.left = keys.right = keys.up = keys.down = false;
  sendInput();
});

document.getElementById('mobile-attack-btn').addEventListener('touchstart', (e) => {
  e.preventDefault();
  if (!localPlayerId || !gameState.players[localPlayerId]) return;
  const me = gameState.players[localPlayerId];
  const targetX = me.x + Math.cos(me.angle) * 100;
  const targetY = me.y + Math.sin(me.angle) * 100;
  socket.emit('attack', { x: targetX, y: targetY });
});

function sendInput() {
  if (!localPlayerId || !gameState.players[localPlayerId]) return;
  const me = gameState.players[localPlayerId];
  const worldMouse = screenToWorld(mousePos.x, mousePos.y, me);
  const angle = Math.atan2(worldMouse.y - me.y, worldMouse.x - me.x);

  socket.emit('playerInput', { ...keys, angle });
}

function screenToWorld(screenX, screenY, player) {
  const offsetX = canvas.width / 2 - player.x;
  const offsetY = canvas.height / 2 - player.y;
  return { x: screenX - offsetX, y: screenY - offsetY };
}

socket.on('init', (data) => {
  localPlayerId = data.id;
});

socket.on('stateUpdate', (state) => {
  gameState = state;
  updateLeaderboard();
});

function updateLeaderboard() {
  const list = document.getElementById('score-list');
  list.innerHTML = '';
  const sorted = Object.values(gameState.players).sort((a, b) => b.score - a.score);
  sorted.forEach(p => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${p.name}</span> <strong>${p.score} Kills</strong>`;
    list.appendChild(li);
  });
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (localPlayerId && gameState.players[localPlayerId]) {
    const me = gameState.players[localPlayerId];

    ctx.save();
    ctx.translate(canvas.width / 2 - me.x, canvas.height / 2 - me.y);

    window.MapRenderer.drawTempleMap(ctx);

    for (let id in gameState.players) {
      window.CharacterRenderer.drawPlayer(ctx, gameState.players[id], id === localPlayerId);
    }

    window.CombatRenderer.drawProjectiles(ctx, gameState.projectiles);

    ctx.restore();
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();
