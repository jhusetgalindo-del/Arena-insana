const socket = io();

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let localPlayerId = null;
let gameState = { players: {}, projectiles: [], timer: 300 };
let selectedHero = 'pyro';

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Selección de Héroe en Menú
document.querySelectorAll('.hero-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.hero-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    selectedHero = card.getAttribute('data-hero');
  });
});

// Botón de Inicio de Batalla
document.getElementById('btn-start').addEventListener('click', () => {
  const name = document.getElementById('username').value.trim() || 'Héroe';
  document.getElementById('main-menu').classList.add('hidden');
  document.getElementById('game-ui').classList.remove('hidden');

  socket.emit('joinGame', { name: name, hero: selectedHero });
});

// Controles Teclado (WASD + J para ataque básico, K para habilidad)
const keys = { up: false, down: false, left: false, right: false };
let mousePos = { x: 0, y: 0 };

window.addEventListener('keydown', (e) => {
  if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') keys.up = true;
  if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') keys.down = true;
  if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.left = true;
  if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.right = true;

  if (e.key === 'j' || e.key === 'J') triggerAttack();
  if (e.key === 'k' || e.key === 'K') triggerSkill();
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
  triggerAttack();
});

function triggerAttack() {
  if (!localPlayerId || !gameState.players[localPlayerId]) return;
  const me = gameState.players[localPlayerId];
  const target = screenToWorld(mousePos.x, mousePos.y, me);
  socket.emit('attack', target);
}

function triggerSkill() {
  if (!localPlayerId || !gameState.players[localPlayerId]) return;
  const me = gameState.players[localPlayerId];
  const target = screenToWorld(mousePos.x, mousePos.y, me);
  socket.emit('useSkill', target);
}

// Controles Táctiles Móvil (Joystick + Botones)
const joystickZone = document.getElementById('joystick-left');
const joystickThumb = document.getElementById('joystick-thumb');
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

  joystickThumb.style.transform = `translate(${dx}px, ${dy}px)`;

  keys.left = dx < -10;
  keys.right = dx > 10;
  keys.up = dy < -10;
  keys.down = dy > 10;
  sendInput();
});

joystickZone.addEventListener('touchend', () => {
  joystickActive = false;
  joystickThumb.style.transform = `translate(0px, 0px)`;
  keys.left = keys.right = keys.up = keys.down = false;
  sendInput();
});

document.getElementById('btn-mobile-attack').addEventListener('touchstart', (e) => {
  e.preventDefault();
  triggerAttack();
});

document.getElementById('btn-mobile-skill').addEventListener('touchstart', (e) => {
  e.preventDefault();
  triggerSkill();
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

// Eventos WebSocket
socket.on('init', (data) => {
  localPlayerId = data.id;
});

socket.on('playerCountUpdate', (count) => {
  document.getElementById('player-count').innerText = count;
});

socket.on('stateUpdate', (state) => {
  gameState = state;

  // Actualizar Timer
  const min = Math.floor(gameState.timer / 60).toString().padStart(2, '0');
  const sec = (gameState.timer % 60).toString().padStart(2, '0');
  document.getElementById('timer-display').innerText = `${min}:${sec}`;

  updateLeaderboard();
});

function updateLeaderboard() {
  const board = document.getElementById('score-board');
  board.innerHTML = '';
  const sorted = Object.values(gameState.players).sort((a, b) => b.kills - a.kills);
  sorted.slice(0, 5).forEach(p => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${p.name}</span> <strong>${p.kills} Kills</strong>`;
    board.appendChild(li);
  });
}

// Loop Principal de Renderizado Gráfico
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (localPlayerId && gameState.players[localPlayerId]) {
    const me = gameState.players[localPlayerId];

    ctx.save();
    // Cámara Suave siguiendo al Héroe
    ctx.translate(canvas.width / 2 - me.x, canvas.height / 2 - me.y);

    // 1. Dibujar Mapa con Santuario y Columnas
    window.MapRenderer.drawArena(ctx);

    // 2. Dibujar Jugadores
    for (let id in gameState.players) {
      window.CharacterRenderer.drawPlayer(ctx, gameState.players[id], id === localPlayerId);
    }

    // 3. Dibujar Proyectiles y Poderes
    window.CombatRenderer.drawProjectiles(ctx, gameState.projectiles);

    ctx.restore();
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();
