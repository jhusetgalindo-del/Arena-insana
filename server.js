const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(__dirname));

const MAX_PLAYERS = 10;
let gameState = {
  players: {},
  projectiles: [],
  mapId: 'temple'
};

const CHARACTER_ROLES = {
  tanque: { hp: 200, speed: 3.5, radius: 24, cooldown: 1200 },
  dps: { hp: 100, speed: 5.0, radius: 18, cooldown: 400 },
  soporte: { hp: 130, speed: 4.2, radius: 20, cooldown: 800 }
};

io.on('connection', (socket) => {
  console.log(`Jugador conectado: ${socket.id}`);

  socket.on('joinGame', (data) => {
    if (Object.keys(gameState.players).length >= MAX_PLAYERS) {
      socket.emit('errorMsg', 'La sala está llena (Máximo 10 jugadores).');
      return;
    }

    const role = data.role || 'dps';
    const stats = CHARACTER_ROLES[role] || CHARACTER_ROLES.dps;

    gameState.players[socket.id] = {
      id: socket.id,
      name: data.name || 'Guerrero',
      role: role,
      x: 200 + Math.random() * 800,
      y: 200 + Math.random() * 500,
      hp: stats.hp,
      maxHp: stats.hp,
      speed: stats.speed,
      radius: stats.radius,
      score: 0,
      angle: 0,
      lastAttack: 0,
      lastSkill: 0,
      cooldown: stats.cooldown
    };

    socket.emit('init', { id: socket.id, mapId: gameState.mapId });
  });

  socket.on('playerInput', (input) => {
    const player = gameState.players[socket.id];
    if (!player || player.hp <= 0) return;

    // Movimiento
    let moveX = 0;
    let moveY = 0;
    if (input.left) moveX -= 1;
    if (input.right) moveX += 1;
    if (input.up) moveY -= 1;
    if (input.down) moveY += 1;

    if (moveX !== 0 && moveY !== 0) {
      moveX *= 0.7071;
      moveY *= 0.7071;
    }

    player.x += moveX * player.speed;
    player.y += moveY * player.speed;
    player.angle = input.angle || 0;

    // Límites de la arena
    player.x = Math.max(player.radius, Math.min(1200 - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(800 - player.radius, player.y));
  });

  socket.on('attack', (targetPos) => {
    const player = gameState.players[socket.id];
    if (!player || player.hp <= 0) return;

    const now = Date.now();
    if (now - player.lastAttack < player.cooldown) return;
    player.lastAttack = now;

    const dx = targetPos.x - player.x;
    const dy = targetPos.y - player.y;
    const dist = Math.hypot(dx, dy) || 1;

    // Tipos de proyectiles por rol
    if (player.role === 'dps') {
      gameState.projectiles.push({
        id: Math.random(),
        ownerId: socket.id,
        type: 'plasma',
        x: player.x,
        y: player.y,
        vx: (dx / dist) * 12,
        vy: (dy / dist) * 12,
        damage: 25,
        radius: 6,
        life: 60
      });
    } else if (player.role === 'tanque') {
      gameState.projectiles.push({
        id: Math.random(),
        ownerId: socket.id,
        type: 'heavy_rock',
        x: player.x,
        y: player.y,
        vx: (dx / dist) * 7,
        vy: (dy / dist) * 7,
        damage: 40,
        radius: 14,
        life: 50
      });
    } else if (player.role === 'soporte') {
      gameState.projectiles.push({
        id: Math.random(),
        ownerId: socket.id,
        type: 'solar_orb',
        x: player.x,
        y: player.y,
        vx: (dx / dist) * 9,
        vy: (dy / dist) * 9,
        damage: 15,
        heal: 20,
        radius: 10,
        life: 70
      });
    }
  });

  socket.on('disconnect', () => {
    delete gameState.players[socket.id];
  });
});

// Loop principal del servidor (60 FPS)
setInterval(() => {
  // Actualizar proyectiles
  for (let i = gameState.projectiles.length - 1; i >= 0; i--) {
    const p = gameState.projectiles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life--;

    // Colisión con jugadores
    for (let id in gameState.players) {
      const player = gameState.players[id];
      if (player.hp <= 0) continue;

      const dist = Math.hypot(player.x - p.x, player.y - p.y);
      if (dist < player.radius + p.radius) {
        if (p.type === 'solar_orb' && p.ownerId === id) {
          player.hp = Math.min(player.maxHp, player.hp + p.heal);
          p.life = 0;
        } else if (p.ownerId !== id) {
          player.hp -= p.damage;
          if (player.hp <= 0) {
            player.hp = 0;
            if (gameState.players[p.ownerId]) {
              gameState.players[p.ownerId].score += 1;
            }
            setTimeout(() => {
              if (gameState.players[id]) {
                gameState.players[id].hp = gameState.players[id].maxHp;
                gameState.players[id].x = 200 + Math.random() * 800;
                gameState.players[id].y = 200 + Math.random() * 500;
              }
            }, 3000);
          }
          p.life = 0;
        }
      }
    }

    if (p.life <= 0 || p.x < 0 || p.x > 1200 || p.y < 0 || p.y > 800) {
      gameState.projectiles.splice(i, 1);
    }
  }

  io.emit('stateUpdate', gameState);
}, 1000 / 60);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor de Arena Insana listo en puerto ${PORT}`));
