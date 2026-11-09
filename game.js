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

function drawMap(ctx, w, h) {
  ctx.fillStyle = '#060913';
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
  ctx.lineWidth = 1.5;
  for (let x = 0; x < w; x += 120) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += 120) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  ctx.save();
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, 280, 0, Math.PI * 2);
  const grad = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, 280);
  grad.addColorStop(0, 'rgba(0, 240, 255, 0.25)');
  grad.addColorStop(0.7, 'rgba(0, 80, 200, 0.08)');
  grad.addColorStop(1, 'rgba(0, 240, 255, 0)');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#00f0ff';
  ctx.setLineDash([15, 10]);
  ctx.stroke();
  ctx.restore();

  drawObstacleHex(ctx, 600, 450, 75);
  drawObstacleHex(ctx, 1800, 450, 75);
  drawObstacleHex(ctx, 600, 1350, 75);
  drawObstacleHex(ctx, 1800, 1350, 75);
  drawObstacleHex(ctx, 1200, 900, 100);

  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 6;
  ctx.strokeRect(15, 15, w - 30, h - 30);
}

function drawObstacleHex(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y);

  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const px = Math.cos(angle) * size;
    const py = Math.sin(angle) * size;
    if (i === 0) ctx.moveTo(px, py + 10);
    else ctx.lineTo(px, py + 10);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fill();

  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const px = Math.cos(angle) * size;
    const py = Math.sin(angle) * size;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = '#111b33';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#00f0ff';
  ctx.stroke();

  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const px = Math.cos(angle) * (size * 0.45);
    const py = Math.sin(angle) * (size * 0.45);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = '#00f0ff';
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 15;
  ctx.fill();
  ctx.restore();
}

function drawMech(ctx, p, isLocal) {
  ctx.save();
  ctx.translate(p.x, p.y);

  if (isLocal) {
    ctx.beginPath();
    ctx.arc(0, 0, p.radius + 16, 0, Math.PI * 2);
    ctx.strokeStyle = '#00ffaa';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.rotate(p.angle);

  if (p.role === 'dps') {
    ctx.beginPath();
    ctx.moveTo(24, 0);
    ctx.lineTo(-16, -18);
    ctx.lineTo(-8, 0);
    ctx.lineTo(-16, 18);
    ctx.closePath();
    ctx.fillStyle = '#cc0044';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ff6699';
    ctx.stroke();

    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(8, -12, 14, 4);
    ctx.fillRect(8, 8, 14, 4);
  } else if (p.role === 'tanque') {
    ctx.beginPath();
    ctx.moveTo(18, -14);
    ctx.lineTo(26, 0);
    ctx.lineTo(18, 14);
    ctx.lineTo(-18, 20);
    ctx.lineTo(-26, 0);
    ctx.lineTo(-18, -20);
    ctx.closePath();
    ctx.fillStyle = '#112244';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#3388ff';
    ctx.stroke();

    ctx.fillStyle = '#3388ff';
    ctx.fillRect(6, -6, 22, 12);
    ctx.strokeRect(6, -6, 22, 12);
  } else {
    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(0, -18);
    ctx.lineTo(-20, 0);
    ctx.lineTo(0, 18);
    ctx.closePath();
    ctx.fillStyle = '#441188';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#cc66ff';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(14, 0, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#ffff00';
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 15;
    ctx.fill();
  }

  ctx.restore();
  drawUI(ctx, p);
}

function drawUI(ctx, p) {
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(p.name, p.x, p.y - p.radius - 20);

  const w = 50, h = 6;
  const x = p.x - w / 2, y = p.y - p.radius - 14;
  const pct = Math.max(0, p.hp / p.maxHp);

  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = pct > 0.5 ? '#00ffaa' : pct > 0.25 ? '#ffaa00' : '#ff3344';
  ctx.fillRect(x, y, w * pct, h);
  ctx.strokeStyle = '#000';
  ctx.strokeRect(x, y, w, h);
}

function drawProjectiles(ctx, projectiles) {
  projectiles.forEach(pr => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(pr.x, pr.y, pr.radius, 0, Math.PI * 2);

    if (pr.type === 'plasma') {
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 15;
    } else if (pr.type === 'missile') {
      ctx.fillStyle = '#ff5500';
      ctx.strokeStyle = '#ffaa00';
      ctx.lineWidth = 3;
    } else if (pr.type === 'orb') {
      ctx.fillStyle = '#cc66ff';
      ctx.shadowColor = '#cc66ff';
      ctx.shadowBlur = 18;
    }

    ctx.fill();
    if (pr.type === 'missile') ctx.stroke();
    ctx.restore();
  });
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (myId && gameState.players[myId]) {
    const me = gameState.players[myId];
    ctx.save();
    ctx.translate(canvas.width / 2 - me.x, canvas.height / 2 - me.y);

    drawMap(ctx, 2400, 1800);

    for (let id in gameState.players) {
      drawMech(ctx, gameState.players[id], id === myId);
    }

    drawProjectiles(ctx, gameState.projectiles);

    ctx.restore();
  }
  requestAnimationFrame(loop);
}
loop();
