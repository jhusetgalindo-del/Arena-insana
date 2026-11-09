const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(__dirname));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const MAP_WIDTH = 2400;
const MAP_HEIGHT = 1800;

let gameState = {
  players: {},
  projectiles: [],
  timer: 300
};

const ROLES = {
  tanque: { hp: 350, speed: 3.2, radius: 32, name: 'TITÁN BLINDADO' },
  dps: { hp: 130, speed: 6.0, radius: 20, name: 'CAZADOR LÁSER' },
  soporte: { hp: 180, speed: 4.8, radius: 24, name: 'ORÁCULO ESTELAR' }
};

io.on('connection', (socket) => {
  socket.on('joinGame', (data) => {
    const role = data.role || 'dps';
    const stats = ROLES[role] || ROLES.dps;

    gameState.players[socket.id] = {
      id: socket.id,
      name: data.name || 'Combatiente',
      role: role,
      hp: stats.hp,
      maxHp: stats.hp,
      speed: stats.speed,
      radius: stats.radius,
      x: 400 + Math.random() * (MAP_WIDTH - 800),
      y: 300 + Math.random() * (MAP_HEIGHT - 600),
      angle: 0,
      score: 0,
      deaths: 0,
      lastAttack: 0
    };

    socket.emit('init', { id: socket.id, mapW: MAP_WIDTH, mapH: MAP_HEIGHT });
    io.emit('playerCount', Object.keys(gameState.players).length);
  });

  socket.on('playerInput', (input) => {
    const p = gameState.players[socket.id];
    if (!p || p.hp <= 0) return;

    let mx = 0, my = 0;
    if (input.left) mx -= 1;
    if (input.right) mx += 1;
    if (input.up) my -= 1;
    if (input.down) my += 1;

    if (mx !== 0 && my !== 0) { mx *= 0.7071; my *= 0.7071; }

    p.x += mx * p.speed;
    p.y += my * p.speed;
    p.angle = input.angle || 0;

    p.x = Math.max(p.radius, Math.min(MAP_WIDTH - p.radius, p.x));
    p.y = Math.max(p.radius, Math.min(MAP_HEIGHT - p.radius, p.y));
  });

  socket.on('attack', (target) => {
    const p = gameState.players[socket.id];
    if (!p || p.hp <= 0) return;

    const now = Date.now();
    const cd = p.role === 'dps' ? 200 : p.role === 'tanque' ? 700 : 400;
    if (now - p.lastAttack < cd) return;
    p.lastAttack = now;

    const dx = target.x - p.x;
    const dy = target.y - p.y;
    const dist = Math.hypot(dx, dy) || 1;

    let speed = 16, damage = 20, radius = 7, type = 'plasma';
    if (p.role === 'tanque') { speed = 10; damage = 45; radius = 14; type = 'missile'; }
    if (p.role === 'soporte') { speed = 13; damage = 25; radius = 10; type = 'orb'; }

    gameState.projectiles.push({
      ownerId: socket.id,
      type: type,
      x: p.x,
      y: p.y,
      vx: (dx / dist) * speed,
      vy: (dy / dist) * speed,
      damage: damage,
      radius: radius,
      life: 90
    });
  });

  socket.on('disconnect', () => {
    delete gameState.players[socket.id];
    io.emit('playerCount', Object.keys(gameState.players).length);
  });
});

setInterval(() => {
  for (let i = gameState.projectiles.length - 1; i >= 0; i--) {
    let pr = gameState.projectiles[i];
    pr.x += pr.vx;
    pr.y += pr.vy;
    pr.life--;

    for (let id in gameState.players) {
      let pl = gameState.players[id];
      if (pl.hp <= 0) continue;

      if (Math.hypot(pl.x - pr.x, pl.y - pr.y) < pl.radius + pr.radius && pr.ownerId !== id) {
        pl.hp -= pr.damage;
        pr.life = 0;
        if (pl.hp <= 0) {
          pl.deaths++;
          if (gameState.players[pr.ownerId]) gameState.players[pr.ownerId].score++;
          pl.hp = ROLES[pl.role].hp;
          pl.x = 400 + Math.random() * (MAP_WIDTH - 800);
          pl.y = 300 + Math.random() * (MAP_HEIGHT - 600);
        }
      }
    }

    if (pr.life <= 0 || pr.x < 0 || pr.x > MAP_WIDTH || pr.y < 0 || pr.y > MAP_HEIGHT) {
      gameState.projectiles.splice(i, 1);
    }
  }
  io.emit('stateUpdate', gameState);
}, 1000 / 60);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
