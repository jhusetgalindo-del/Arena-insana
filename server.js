const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(__dirname));

const MAX_PLAYERS = 10;
const MAP_WIDTH = 2000;
const MAP_HEIGHT = 1400;

let gameState = {
  players: {},
  projectiles: [],
  timer: 300
};

const ROLES = {
  tanque: { hp: 250, speed: 3.2, radius: 30, name: 'GUARDIÁN DE HIERRO' },
  dps: { hp: 110, speed: 5.5, radius: 20, name: 'CAZADOR DE PLASMA' },
  soporte: { hp: 150, speed: 4.2, radius: 24, name: 'ORÁCULO SOLAR' }
};

io.on('connection', (socket) => {
  console.log(`Jugador conectado: ${socket.id}`);

  socket.on('joinGame', (data) => {
    if (Object.keys(gameState.players).length >= MAX_PLAYERS) {
      socket.emit('errorMsg', 'Sala llena (Máximo 10 jugadores).');
      return;
    }

    const role = data.role || 'dps';
    const stats = ROLES[role] || ROLES.dps;

    gameState.players[socket.id] = {
      id: socket.id,
      name: data.name || 'Guerrero',
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
      lastAttack: 0,
      invulnerable: true
    };

    setTimeout(() => {
      if (gameState.players[socket.id]) gameState.players[socket.id].invulnerable = false;
    }, 2500);

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
    const cd = p.role === 'dps' ? 300 : p.role === 'tanque' ? 900 : 500;
    if (now - p.lastAttack < cd) return;
    p.lastAttack = now;

    const dx = target.x - p.x;
    const dy = target.y - p.y;
    const dist = Math.hypot(dx, dy) || 1;

    let projType = 'plasma';
    let speed = 14;
    let damage = 20;
    let radius = 7;

    if (p.role === 'tanque') {
      projType = 'rock';
      speed = 8;
      damage = 45;
      radius = 16;
    } else if (p.role === 'soporte') {
      projType = 'orb';
      speed = 10;
      damage = 25;
      radius = 11;
    }

    gameState.projectiles.push({
      id: Math.random(),
      ownerId: socket.id,
      type: projType,
      x: p.x,
      y: p.y,
      vx: (dx / dist) * speed,
      vy: (dy / dist) * speed,
      damage: damage,
      radius: radius,
      life: 70
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
      if (pl.hp <= 0 || pl.invulnerable) continue;

      if (Math.hypot(pl.x - pr.x, pl.y - pr.y) < pl.radius + pr.radius && pr.ownerId !== id) {
        pl.hp -= pr.damage;
        pr.life = 0;

        if (pl.hp <= 0) {
          pl.hp = 0;
          pl.deaths++;
          if (gameState.players[pr.ownerId]) gameState.players[pr.ownerId].score++;

          setTimeout(() => {
            if (gameState.players[id]) {
              gameState.players[id].hp = ROLES[gameState.players[id].role].hp;
              gameState.players[id].x = 400 + Math.random() * (MAP_WIDTH - 800);
              gameState.players[id].y = 300 + Math.random() * (MAP_HEIGHT - 600);
              gameState.players[id].invulnerable = true;
              setTimeout(() => { if (gameState.players[id]) gameState.players[id].invulnerable = false; }, 2500);
            }
          }, 3000);
        }
      }
    }

    if (pr.life <= 0 || pr.x < 0 || pr.x > MAP_WIDTH || pr.y < 0 || pr.y > MAP_HEIGHT) {
      gameState.projectiles.splice(i, 1);
    }
  }

  io.emit('stateUpdate', gameState);
}, 1000 / 60);

setInterval(() => {
  if (gameState.timer > 0) gameState.timer--;
  else gameState.timer = 300;
}, 1000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor activo en puerto ${PORT}`));
