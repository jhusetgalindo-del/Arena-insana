const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(__dirname));

const MAX_PLAYERS = 10;
const MAP_WIDTH = 1600;
const MAP_HEIGHT = 1000;

let gameState = {
  players: {},
  projectiles: [],
  particles: [],
  timer: 300, // 5 minutos
  mode: 'CAOS_ARCANO'
};

const HEROES = {
  pyro: { hp: 120, speed: 4.8, radius: 22, color: '#ff4500', name: 'IGNIS (Mago Fuego)' },
  guardian: { hp: 220, speed: 3.4, radius: 26, color: '#00aaff', name: 'TITÁN (Tanque Escudo)' },
  shadow: { hp: 100, speed: 5.6, radius: 18, color: '#aa00ff', name: 'KAGE (Asesino Sombra)' },
  sun: { hp: 140, speed: 4.2, radius: 20, color: '#ffcc00', name: 'HELIOS (Soporte Solar)' }
};

io.on('connection', (socket) => {
  console.log(`Jugador conectado: ${socket.id}`);

  socket.on('joinGame', (data) => {
    const activeCount = Object.keys(gameState.players).length;
    if (activeCount >= MAX_PLAYERS) {
      socket.emit('errorMsg', 'La sala está llena (Máximo 10 jugadores).');
      return;
    }

    const heroKey = data.hero || 'pyro';
    const heroStats = HEROES[heroKey] || HEROES.pyro;

    gameState.players[socket.id] = {
      id: socket.id,
      name: data.name || 'Héroe',
      hero: heroKey,
      hp: heroStats.hp,
      maxHp: heroStats.hp,
      speed: heroStats.speed,
      radius: heroStats.radius,
      color: heroStats.color,
      x: 300 + Math.random() * (MAP_WIDTH - 600),
      y: 200 + Math.random() * (MAP_HEIGHT - 400),
      angle: 0,
      kills: 0,
      deaths: 0,
      shield: 0,
      shieldMax: heroKey === 'guardian' ? 80 : 0,
      lastAttack: 0,
      lastSkill: 0,
      invulnerable: true
    };

    // 2 segundos de protección al reaparecer
    setTimeout(() => {
      if (gameState.players[socket.id]) {
        gameState.players[socket.id].invulnerable = false;
      }
    }, 2000);

    socket.emit('init', { id: socket.id, heroStats, mapWidth: MAP_WIDTH, mapHeight: MAP_HEIGHT });
    io.emit('playerCountUpdate', Object.keys(gameState.players).length);
  });

  socket.on('playerInput', (input) => {
    const player = gameState.players[socket.id];
    if (!player || player.hp <= 0) return;

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

    // Colisión con los límites del mapa
    player.x = Math.max(player.radius, Math.min(MAP_WIDTH - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(MAP_HEIGHT - player.radius, player.y));
  });

  socket.on('attack', (targetPos) => {
    const player = gameState.players[socket.id];
    if (!player || player.hp <= 0) return;

    const now = Date.now();
    const cooldown = player.hero === 'shadow' ? 250 : player.hero === 'pyro' ? 400 : 600;
    if (now - player.lastAttack < cooldown) return;
    player.lastAttack = now;

    const dx = targetPos.x - player.x;
    const dy = targetPos.y - player.y;
    const dist = Math.hypot(dx, dy) || 1;

    // Proyectil según Héroe
    let type = 'fireball';
    let speed = 11;
    let damage = 22;
    let radius = 8;
    let color = '#ff4500';

    if (player.hero === 'guardian') {
      type = 'hammer';
      speed = 8;
      damage = 35;
      radius = 12;
      color = '#00aaff';
    } else if (player.hero === 'shadow') {
      type = 'kunai';
      speed = 15;
      damage = 16;
      radius = 5;
      color = '#aa00ff';
    } else if (player.hero === 'sun') {
      type = 'sunorb';
      speed = 9;
      damage = 18;
      radius = 10;
      color = '#ffcc00';
    }

    gameState.projectiles.push({
      id: Math.random(),
      ownerId: socket.id,
      hero: player.hero,
      type: type,
      x: player.x,
      y: player.y,
      vx: (dx / dist) * speed,
      vy: (dy / dist) * speed,
      damage: damage,
      radius: radius,
      color: color,
      life: 65
    });
  });

  socket.on('useSkill', (targetPos) => {
    const player = gameState.players[socket.id];
    if (!player || player.hp <= 0) return;

    const now = Date.now();
    const skillCooldown = 5000; // 5 segundos
    if (now - player.lastSkill < skillCooldown) return;
    player.lastSkill = now;

    if (player.hero === 'guardian') {
      // Escudo protector inmediato
      player.shield = player.shieldMax;
    } else if (player.hero === 'shadow') {
      // Teletransporte hacia adelante (Dash)
      player.x += Math.cos(player.angle) * 140;
      player.y += Math.sin(player.angle) * 140;
    } else if (player.hero === 'sun') {
      // Área de sanación
      player.hp = Math.min(player.maxHp, player.hp + 40);
    } else if (player.hero === 'pyro') {
      // Explosión circular en ráfaga
      for (let i = 0; i < 8; i++) {
        const ang = (Math.PI * 2 / 8) * i;
        gameState.projectiles.push({
          id: Math.random(),
          ownerId: socket.id,
          hero: 'pyro',
          type: 'fireball',
          x: player.x,
          y: player.y,
          vx: Math.cos(ang) * 10,
          vy: Math.sin(ang) * 10,
          damage: 18,
          radius: 7,
          color: '#ff6600',
          life: 45
        });
      }
    }
  });

  socket.on('disconnect', () => {
    delete gameState.players[socket.id];
    io.emit('playerCountUpdate', Object.keys(gameState.players).length);
  });
});

// Loop principal del servidor (60 FPS)
setInterval(() => {
  for (let i = gameState.projectiles.length - 1; i >= 0; i--) {
    const p = gameState.projectiles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life--;

    for (let id in gameState.players) {
      const player = gameState.players[id];
      if (player.hp <= 0 || player.invulnerable) continue;

      const dist = Math.hypot(player.x - p.x, player.y - p.y);
      if (dist < player.radius + p.radius && p.ownerId !== id) {
        // Impacto de daño con absorción de escudo
        let finalDamage = p.damage;
        if (player.shield > 0) {
          if (player.shield >= finalDamage) {
            player.shield -= finalDamage;
            finalDamage = 0;
          } else {
            finalDamage -= player.shield;
            player.shield = 0;
          }
        }

        player.hp -= finalDamage;
        p.life = 0;

        if (player.hp <= 0) {
          player.hp = 0;
          player.deaths += 1;
          if (gameState.players[p.ownerId]) {
            gameState.players[p.ownerId].kills += 1;
          }

          // Respawn tras 3 segundos
          setTimeout(() => {
            if (gameState.players[id]) {
              const heroStats = HEROES[gameState.players[id].hero];
              gameState.players[id].hp = heroStats.hp;
              gameState.players[id].shield = gameState.players[id].shieldMax;
              gameState.players[id].x = 300 + Math.random() * (MAP_WIDTH - 600);
              gameState.players[id].y = 200 + Math.random() * (MAP_HEIGHT - 400);
              gameState.players[id].invulnerable = true;

              setTimeout(() => {
                if (gameState.players[id]) gameState.players[id].invulnerable = false;
              }, 2000);
            }
          }, 3000);
        }
      }
    }

    if (p.life <= 0 || p.x < 0 || p.x > MAP_WIDTH || p.y < 0 || p.y > MAP_HEIGHT) {
      gameState.projectiles.splice(i, 1);
    }
  }

  io.emit('stateUpdate', gameState);
}, 1000 / 60);

// Contador de partida
setInterval(() => {
  if (gameState.timer > 0) gameState.timer--;
  else gameState.timer = 300;
}, 1000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Arena Insana Pro lista en el puerto ${PORT}`));
