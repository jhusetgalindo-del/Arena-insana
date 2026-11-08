const express=require("express"),http=require("http"),{Server}=require("socket.io");
const app=express(),server=http.createServer(app),io=new Server(server);
const path=require("path"); app.use(express.static(path.join(__dirname,"public")));
const rooms=new Map(),MAX=10;
const MAPS=["bosque","volcan","hielo","ruinas","desierto","castillo"];
const CHARS=["guerrero","mago","arquera","guardian","sombra","druida"];
const ABILITIES={guerrero:24,mago:35,arquera:26,guardian:18,sombra:30,druida:28};
function code(){let s;do{s=Math.random().toString(36).slice(2,6).toUpperCase()}while(rooms.has(s));return s}
function pub(r){return {code:r.code,map:r.map,players:[...r.players.values()].map(p=>({...p}))}}
function send(r){io.to(r.code).emit("state",pub(r))}
io.on("connection",s=>{
 s.on("createRoom",(d,cb)=>{const r={code:code(),map:MAPS.includes(d.map)?d.map:"bosque",players:new Map()};rooms.set(r.code,r);join(r,d,cb)});
 s.on("joinRoom",(d,cb)=>{const r=rooms.get(String(d.code||"").toUpperCase());if(!r)return cb?.({ok:false,error:"No existe esa sala."});if(r.players.size>=MAX)return cb?.({ok:false,error:"La sala está llena."});join(r,d,cb)});
 function join(r,d,cb){const c=CHARS.includes(d.character)?d.character:"guerrero";const p={id:s.id,name:String(d.name||"Jugador").slice(0,16),character:c,x:100+Math.random()*600,y:100+Math.random()*300,hp:100,maxHp:100,facing:1,score:0,lastAbility:0,attackUntil:0};r.players.set(s.id,p);s.join(r.code);s.data.room=r.code;cb?.({ok:true,code:r.code,self:s.id,state:pub(r)});send(r)}
 s.on("move",d=>{const r=rooms.get(s.data.room),p=r?.players.get(s.id);if(!p)return;p.x=Math.max(35,Math.min(765,Number(d.x)||p.x));p.y=Math.max(55,Math.min(465,Number(d.y)||p.y));if(d.facing)p.facing=d.facing<0?-1:1;send(r)});
 s.on("attack",()=>{const r=rooms.get(s.data.room),p=r?.players.get(s.id);if(!p)return;p.attackUntil=Date.now()+220;for(const q of r.players.values()){if(q.id!==p.id&&Math.hypot(q.x-p.x,q.y-p.y)<72){q.hp=Math.max(0,q.hp-12);if(q.hp===0){p.score++;q.hp=q.maxHp;q.x=80+Math.random()*640;q.y=80+Math.random()*340}}}send(r)});
 s.on("ability",()=>{const r=rooms.get(s.data.room),p=r?.players.get(s.id);if(!p)return;const now=Date.now(),cd=ABILITIES[p.character]*1000;if(now-p.lastAbility<cd)return;p.lastAbility=now;p.attackUntil=now+500;const range=p.character==="arquera"?230:135,damage=p.character==="mago"?32:p.character==="sombra"?28:24;for(const q of r.players.values()){if(q.id!==p.id&&Math.hypot(q.x-p.x,q.y-p.y)<range){q.hp=Math.max(0,q.hp-damage);if(q.hp===0){p.score++;q.hp=100;q.x=80+Math.random()*640;q.y=80+Math.random()*340}}}send(r)});
 s.on("changeMap",m=>{const r=rooms.get(s.data.room);if(r&&MAPS.includes(m)){r.map=m;send(r)}});
 s.on("changeCharacter",c=>{const r=rooms.get(s.data.room),p=r?.players.get(s.id);if(p&&CHARS.includes(c)){p.character=c;send(r)}});
 s.on("disconnect",()=>{const r=rooms.get(s.data.room);if(!r)return;r.players.delete(s.id);if(!r.players.size)rooms.delete(r.code);else send(r)});
});
const PORT=process.env.PORT||10000;server.listen(PORT,"0.0.0.0",()=>console.log("Arena Insana listo en puerto "+PORT));
