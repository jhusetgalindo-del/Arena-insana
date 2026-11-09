const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let myId = null;
let gameState = { players: {}, projectiles: [], timer: 300 };
let chosenRole = 'tanque';

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

document.querySelectorAll('.role-box').forEach(box => {
  box.addEventListener('click', () => {
    document.querySelectorAll('.role-box').forEach(b => b.classList.remove('active'));
    box.classList.add('active');
    chosenRole = box.getAttribute('data-role');
  });
});

document.getElementById('btn-enter').addEventListener('click', () => {
  const name = document.getElementById('player-name').value.trim() || 'Guerrero';
  document.getElementById('menu-screen').classList.add('hidden');
  document.getElementById('hud-screen').classList.remove('hidden');
  socket.emit('joinGame', { name, role: chosenRole });
});

const keys = { up: false, down: false, left: false, right: false };
let mouse = { x: 0, y: 0 };

window.addEventListener('keydown', e => {
  if (['w','W','ArrowUp'].includes(e.key)) keys.up = true;
  if (['s','S','ArrowDown'].includes(e.key)) keys.down = true;
  if (['a','A','ArrowLeft'].includes(e.key)) keys.left = true;
  if (['d','D','ArrowRight'].includes(e.key)) keys.right = true;
  sendInput();
});

window.addEventListener('keyup', e => {
  if (['w','W','ArrowUp'].includes(e.key)) keys.up = false;
  if (['s','S','ArrowDown'].includes(e.key)) keys.down = false;
  if (['a','A','ArrowLeft'].includes(e.key)) keys.left = false;
  if (['d','D','ArrowRight'].includes(e.key)) keys.right = false;
  sendInput();
});

window.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  sendInput();
});

window.addEventListener('mousedown', () => fire());

function fire() {
  if (!myId || !gameState.players[myId]) return;
  const me = gameState.players[myId];
  socket.emit('attack', screenToWorld(mouse.x, mouse.y, me));
}

// Joystick Táctil
const joy = document.getElementById('virtual-joystick');
const handle = document.getElementById('joystick-handle');
let joyActive = false;

joy.addEventListener('touchstart', () => joyActive = true);
joy.addEventListener('touchmove', e => {
  if (!joyActive) return;
  const t = e.touches[0];
  const rect = joy.getBoundingClientRect();
  let dx = t.clientX - (rect.left + rect.width / 2);
  let dy = t.clientY - (rect.top + rect.height / 2);
  const dist = Math.hypot(dx, dy);
  const maxR = 35;

  if (dist > maxR) { dx = (dx/dist)*maxR; dy = (dy/dist)*maxR; }
  handle.style.transform = `translate(${dx}px, ${dy}px)`;

  keys.left = dx < -10;
  keys.right = dx > 10;
  keys.up = dy < -10;
  keys.down = dy > 10;
  sendInput();
});

joy.addEventListener('touchend', () => {
  joyActive = false;
  handle.style.transform = 'translate(0px, 0px)';
  keys.left = keys.right = keys.up = keys.down = false;
  sendInput();
});

document.getElementById('touch-attack').addEventListener('touchstart', e => {
  e.preventDefault();
  fire();
});

function sendInput() {
  if (!myId || !gameState.players[myId]) return;
  const me = gameState.players[myId];
  const wm = screenToWorld(mouse.x, mouse.y, me);
  const angle = Math.atan2(wm.y - me.y, wm.x - me.x);
  socket.emit('playerInput', { ...keys, angle });
}

function screenToWorld(sx, sy, me) {
  return {
    x: sx - (canvas.width / 2 - me.x),
    y: sy - (canvas.height / 2 - me.y)
  };
}

socket.on('init', data => myId = data.id);
socket.on('playerCount', count => document.getElementById('online-count').innerText = count);
socket.on('stateUpdate', state => {
  gameState = state;
  const m = Math.floor(gameState.timer / 60).toString().padStart(2, '0');
  const s = (gameState.timer % 60).toString().padStart(2, '0');
  document.getElementById('match-timer').innerText = `${m}:${s}`;
  updateLB();
});

function updateLB() {
  const list = document.getElementById('leaderboard-list');
  list.innerHTML = '';
  Object.values(gameState.players)
    .sort((a,b) => b.score - a.score)
    .slice(0, 5)
    .forEach(p => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${p.name}</span> <strong>${p.score} Kills</strong>`;
      list.appendChild(li);
    });
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (myId && gameState.players[myId]) {
    const me = gameState.players[myId];
    ctx.save();
    ctx.translate(canvas.width / 2 - me.x, canvas.height / 2 - me.y);

    window.MapRenderer.draw(ctx);

    for (let id in gameState.players) {
      window.CharacterRenderer.draw(ctx, gameState.players[id], id === myId);
    }

    window.CombatRenderer.draw(ctx, gameState.projectiles);

    ctx.restore();
  }
  requestAnimationFrame(loop);
}
loop();
