const socket = io();
const $ = id => document.getElementById(id);
const lobby = $("lobby"), game = $("game"), statusEl = $("status");
const canvas = $("arena"), ctx = canvas.getContext("2d");

let selfId = null;
let roomCode = null;
let players = new Map();
let keys = { up:false, down:false, left:false, right:false };
let lastInput = "";
let lastAttack = 0;
let attackEffects = [];

function status(message, error = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", error);
}
function playerName() {
  return $("playerName").value.trim().slice(0, 14) || "Jugador";
}
function enterRoom(result) {
  if (!result || !result.ok) return status(result?.error || "No se pudo entrar a la sala.", true);
  selfId = result.selfId;
  roomCode = result.code;
  lobby.classList.add("hidden");
  game.classList.remove("hidden");
  $("codeLabel").textContent = roomCode;
  updateRoom(result.room);
  status("Conectado");
}
function createRoom() {
  if (!socket.connected) return status("Conectando con el servidor…", true);
  socket.emit("room:create", { name: playerName() }, enterRoom);
}
function joinRoom() {
  if (!socket.connected) return status("Conectando con el servidor…", true);
  const code = $("roomCode").value.toUpperCase().trim();
  if (code.length !== 5) return status("Escribe un código de 5 caracteres.", true);
  socket.emit("room:join", { code, name: playerName() }, enterRoom);
}

$("createBtn").addEventListener("click", createRoom);
$("joinBtn").addEventListener("click", joinRoom);
$("roomCode").addEventListener("input", e => e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0,5));
$("copyBtn").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(roomCode);
    $("copyBtn").textContent = "¡Copiado!";
    setTimeout(() => $("copyBtn").textContent = "Copiar código", 1200);
  } catch {
    status("Tu código de sala es: " + roomCode);
  }
});
$("leaveBtn").addEventListener("click", leaveGame);
function leaveGame() {
  socket.disconnect();
  socket.connect();
  selfId = null; roomCode = null; players.clear();
  game.classList.add("hidden"); lobby.classList.remove("hidden");
  status("Has salido. Puedes crear otra sala o unirte a una.");
}
socket.on("connect", () => status("Conectado al servidor. ¡Puedes jugar!"));
socket.on("disconnect", () => {
  if (roomCode) status("Se perdió la conexión. Vuelve a entrar a la sala.", true);
});
socket.on("room:state", updateRoom);
socket.on("player:left", id => players.delete(id));
socket.on("player:attacked", data => attackEffects.push({id:data.id, until:Date.now()+180}));

function updateRoom(room) {
  if (!room || room.code !== roomCode) return;
  players = new Map(room.players.map(p => [p.id, p]));
  $("countLabel").textContent = `${players.size}/10`;
  $("playerList").textContent = room.players.map(p => p.name + (p.id === selfId ? " (tú)" : "")).join(" · ");
}

function setKey(key, down) {
  if (!(key in keys)) return;
  keys[key] = down;
  sendInput();
}
function sendInput() {
  const serialized = JSON.stringify(keys);
  if (serialized !== lastInput && roomCode) {
    lastInput = serialized;
    socket.emit("player:input", keys);
  }
}
function attack() {
  const now = Date.now();
  if (now - lastAttack < 400 || !roomCode) return;
  lastAttack = now;
  socket.emit("player:attack");
  attackEffects.push({id:selfId, until:now+180});
}
window.addEventListener("keydown", e => {
  const k = e.key.toLowerCase();
  const map = {w:"up", arrowup:"up", s:"down", arrowdown:"down",
    a:"left", arrowleft:"left", d:"right", arrowright:"right"};
  if (map[k]) { e.preventDefault(); setKey(map[k], true); }
  if (k === " " || k === "enter") { e.preventDefault(); attack(); }
});
window.addEventListener("keyup", e => {
  const k = e.key.toLowerCase();
  const map = {w:"up", arrowup:"up", s:"down", arrowdown:"down",
    a:"left", arrowleft:"left", d:"right", arrowright:"right"};
  if (map[k]) { e.preventDefault(); setKey(map[k], false); }
});
window.addEventListener("blur", () => {
  Object.keys(keys).forEach(k => keys[k] = false);
  sendInput();
});
document.querySelectorAll("[data-key]").forEach(button => {
  const key = button.dataset.key;
  button.addEventListener("pointerdown", e => { e.preventDefault(); button.setPointerCapture(e.pointerId); setKey(key, true); });
  for (const event of ["pointerup", "pointercancel", "lostpointercapture"]) {
    button.addEventListener(event, () => setKey(key, false));
  }
});
$("mobileAttack").addEventListener("pointerdown", e => { e.preventDefault(); attack(); });

function drawArena() {
  ctx.fillStyle = "#294b3d";
  ctx.fillRect(0, 0, 800, 500);
  // Suelo pixelado con pequeñas variaciones y piedras decorativas.
  for (let y=0; y<500; y+=32) {
    for (let x=0; x<800; x+=32) {
      const n = (x*7 + y*13) % 5;
      ctx.fillStyle = n === 0 ? "#315744" : n === 1 ? "#2d513f" : "#2b4e3d";
      ctx.fillRect(x, y, 30, 30);
      if (n === 2) { ctx.fillStyle="#496b50"; ctx.fillRect(x+8,y+9,3,3); }
    }
  }
  ctx.fillStyle = "#8b7651";
  ctx.fillRect(0,0,800,8); ctx.fillRect(0,492,800,8);
  ctx.fillRect(0,0,8,500); ctx.fillRect(792,0,8,500);
  // Ruinas y arbustos decorativos.
  for (const [x,y] of [[100,100],[680,100],[100,390],[680,390]]) {
    ctx.fillStyle="#59665a"; ctx.fillRect(x-12,y-12,24,24);
    ctx.fillStyle="#78836c"; ctx.fillRect(x-8,y-8,16,16);
  }
}
function drawPlayer(p, now) {
  const dead = p.hp <= 0;
  const x = p.x, y = p.y;
  ctx.save();
  ctx.globalAlpha = dead ? 0.35 : 1;
  // Sombra
  ctx.fillStyle = "#15251e"; ctx.fillRect(x-12,y+10,24,6);
  // Cuerpo pixel art
  ctx.fillStyle = "#241e35"; ctx.fillRect(x-9,y-13,18,25);
  ctx.fillStyle = p.color; ctx.fillRect(x-8,y-12,16,17);
  ctx.fillStyle = "#f2c9a0"; ctx.fillRect(x-7,y-22,14,12);
  ctx.fillStyle = "#49334a"; ctx.fillRect(x-8,y-24,16,5);
  ctx.fillStyle = "#202038"; ctx.fillRect(x-5,y-5,3,3); ctx.fillRect(x+3,y-5,3,3);
  ctx.fillStyle = "#49334a"; ctx.fillRect(x-8,y+10,6,6); ctx.fillRect(x+2,y+10,6,6);
  // Barra de vida
  ctx.fillStyle="#271d2b"; ctx.fillRect(x-17,y-33,34,6);
  ctx.fillStyle=p.hp>50?"#63e58c":p.hp>25?"#f5c65b":"#fb7185";
  ctx.fillRect(x-16,y-32,32*Math.max(0,p.hp)/100,4);
  ctx.font="11px monospace"; ctx.textAlign="center"; ctx.fillStyle="#fff";
  ctx.fillText(p.name + (p.id===selfId?" (tú)":""), x, y-39);
  if (attackEffects.some(a => a.id===p.id && a.until>now)) {
    ctx.strokeStyle="#ffe27a"; ctx.lineWidth=4;
    ctx.beginPath(); ctx.arc(x,y,35,0,Math.PI*2); ctx.stroke();
  }
  if (dead) { ctx.fillStyle="#fff"; ctx.fillText("VOLVIENDO...",x,y+32); }
  ctx.restore();
}
function render() {
  const now = Date.now();
  drawArena();
  for (const p of players.values()) drawPlayer(p, now);
  attackEffects = attackEffects.filter(a => a.until > now);
  requestAnimationFrame(render);
}
render();
