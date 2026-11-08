const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

const MAX_PLAYERS = 10;
const WORLD = { width: 800, height: 500 };
const SPEED = 190;
const rooms = new Map();
const COLORS = ["#f472b6", "#38bdf8", "#fbbf24", "#4ade80", "#fb7185",
  "#a78bfa", "#f97316", "#2dd4bf", "#c4b5fd", "#facc15"];

app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));
app.get("/style.css", (req, res) => res.sendFile(__dirname + "/style.css"));
app.get("/game.js", (req, res) => res.sendFile(__dirname + "/game.js"));
app.get("/health", (_req, res) => res.json({ ok: true, rooms: rooms.size }));

function makeCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code;
  do {
    code = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  } while (rooms.has(code));
  return code;
}

function safeName(value) {
  const result = String(value || "Jugador").trim().replace(/[<>]/g, "").slice(0, 14);
  return result || "Jugador";
}

function roomSnapshot(room) {
  return {
    code: room.code,
    players: [...room.players.values()].map(p => ({
      id: p.id, name: p.name, x: Math.round(p.x), y: Math.round(p.y),
      color: p.color, hp: p.hp
    }))
  };
}

function sendRoom(room) {
  io.to(room.code).emit("room:state", roomSnapshot(room));
}

function leaveRoom(socket) {
  const code = socket.data.roomCode;
  if (!code) return;
  const room = rooms.get(code);
  if (room) {
    room.players.delete(socket.id);
    socket.to(code).emit("player:left", socket.id);
    if (room.players.size === 0) rooms.delete(code);
    else sendRoom(room);
  }
  socket.leave(code);
  socket.data.roomCode = null;
}

function joinRoom(socket, room, rawName, callback) {
  const index = room.players.size % COLORS.length;
  const player = {
    id: socket.id,
    name: safeName(rawName),
    x: 350 + Math.random() * 100,
    y: 200 + Math.random() * 100,
    color: COLORS[index],
    hp: 100,
    input: { up: false, down: false, left: false, right: false },
    lastAttack: 0,
    attackUntil: 0,
    respawnAt: 0
  };
  room.players.set(socket.id, player);
  socket.join(room.code);
  socket.data.roomCode = room.code;
  callback({ ok: true, code: room.code, selfId: socket.id, room: roomSnapshot(room) });
  sendRoom(room);
}

io.on("connection", socket => {
  socket.on("room:create", (data = {}, callback = () => {}) => {
    leaveRoom(socket);
    const code = makeCode();
    const room = { code, players: new Map() };
    rooms.set(code, room);
    joinRoom(socket, room, data.name, callback);
  });

  socket.on("room:join", (data = {}, callback = () => {}) => {
    const code = String(data.code || "").toUpperCase().trim();
    const room = rooms.get(code);
    if (!room) return callback({ ok: false, error: "No existe esa sala. Revisa el código." });
    if (room.players.size >= MAX_PLAYERS) return callback({ ok: false, error: "La sala está llena (10/10)." });
    leaveRoom(socket);
    joinRoom(socket, room, data.name, callback);
  });

  socket.on("player:input", input => {
    const room = rooms.get(socket.data.roomCode);
    const player = room?.players.get(socket.id);
    if (!player || !input || typeof input !== "object") return;
    for (const key of ["up", "down", "left", "right"]) {
      player.input[key] = input[key] === true;
    }
  });

  socket.on("player:attack", () => {
    const room = rooms.get(socket.data.roomCode);
    const attacker = room?.players.get(socket.id);
    if (!room || !attacker || attacker.hp <= 0) return;
    const now = Date.now();
    if (now - attacker.lastAttack < 650) return;
    attacker.lastAttack = now;
    attacker.attackUntil = now + 180;

    // El servidor calcula el alcance y aplica el daño: el cliente no decide los impactos.
    for (const target of room.players.values()) {
      if (target.id === attacker.id || target.hp <= 0) continue;
      const distance = Math.hypot(target.x - attacker.x, target.y - attacker.y);
      if (distance <= 62) {
        target.hp = Math.max(0, target.hp - 25);
        if (target.hp === 0) target.respawnAt = now + 2500;
      }
    }
    sendRoom(room);
  });

  socket.on("disconnect", () => leaveRoom(socket));
});

let previous = Date.now();
setInterval(() => {
  const now = Date.now();
  const dt = Math.min((now - previous) / 1000, 0.05);
  previous = now;

  for (const room of rooms.values()) {
    for (const player of room.players.values()) {
      if (player.hp <= 0) {
        if (player.respawnAt && now >= player.respawnAt) {
          player.hp = 100;
          player.x = 350 + Math.random() * 100;
          player.y = 200 + Math.random() * 100;
          player.respawnAt = 0;
        }
        continue;
      }
      let dx = Number(player.input.right) - Number(player.input.left);
      let dy = Number(player.input.down) - Number(player.input.up);
      const length = Math.hypot(dx, dy) || 1;
      if (dx || dy) {
        player.x = Math.max(22, Math.min(WORLD.width - 22, player.x + dx / length * SPEED * dt));
        player.y = Math.max(22, Math.min(WORLD.height - 22, player.y + dy / length * SPEED * dt));
      }
    }
    sendRoom(room);
  }
}, 50);

server.listen(PORT, () => console.log(`Arena Pixel funcionando en el puerto ${PORT}`));
