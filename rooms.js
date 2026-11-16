'use strict';
/* SALAS: creación, códigos, unión, reconexión (30s), anfitrión, expulsión, bucle de partida a 30Hz y snapshots a 15Hz. */
const crypto=require('crypto');const {Game}=require('./engine');const A=global.AI;
const MAX=10,GRACE=30000,AL='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
module.exports=function(io){
 const rooms=new Map();
 const mkCode=()=>{let c;do{c=Array.from({length:5},()=>AL[crypto.randomInt(AL.length)]).join('')}while(rooms.has(c));return c};
 const pub=r=>({code:r.code,host:r.host,map:r.map,mode:r.mode,state:r.state,max:MAX,players:[...r.players.values()].map(p=>({id:p.id,name:p.name,char:p.char,v:p.v,skin:p.skin,fx:p.fx,on:p.on}))});
 const bc=r=>io.to(r.code).emit('room',pub(r));
 const clean=n=>String(n||'Jugador').replace(/[<>&"']/g,'').slice(0,14)||'Jugador';
 const ival=(v,a,b)=>Math.max(a,Math.min(b,v|0));
 function setup(p,d){if(!d)return;if(A.CHARS.some(c=>c.id===d.char))p.char=d.char;const v=d.v||{};p.v={s:ival(v.s,0,2),e:ival(v.e,0,4),m:ival(v.m,0,1)};p.skin=ival(d.skin,0,3);p.fx=ival(d.fx,0,2)}
 function stop(r){if(r.loop)clearInterval(r.loop);r.loop=null;r.game=null;r.state='lobby'}
 function startLoop(r){let n=0;r.loop=setInterval(()=>{const g=r.game;if(!g)return;g.tick(1/30);if(++n%2===0)io.to(r.code).emit('snap',g.snap())},1000/30)}
 function dropPlayer(r,p){
  if(r.game)r.game.leave(p.id);r.players.delete(p.id);
  if(!r.players.size||![...r.players.values()].some(x=>x.on)){stop(r);rooms.delete(r.code);return}
  if(r.host===p.id)r.host=[...r.players.values()].find(x=>x.on).id;bc(r)}
 io.on('connection',s=>{
  let cur=null;
  const err=m=>s.emit('err',m);
  const attach=(r,p)=>{cur={r,p};p.sid=s.id;p.on=true;if(p.t){clearTimeout(p.t);p.t=null}s.join(r.code)};
  const gstart=(r)=>s.emit('gstart',{map:r.map,mode:r.mode,players:pub(r).players});
  s.on('create',(d,ack)=>{if(cur)return;const r={code:mkCode(),host:null,map:'bosque',mode:'ffa',state:'lobby',players:new Map(),game:null,loop:null};rooms.set(r.code,r);
   const p={id:crypto.randomBytes(4).toString('hex'),tok:crypto.randomBytes(12).toString('hex'),name:clean(d&&d.name),char:'kael',v:{s:0,e:0,m:0},skin:0,fx:0,on:true};setup(p,d);
   r.players.set(p.id,p);r.host=p.id;attach(r,p);ack&&ack({ok:1,code:r.code,me:p.id,tok:p.tok});bc(r)});
  s.on('join',(d,ack)=>{if(cur)return;const r=rooms.get(String(d&&d.code||'').toUpperCase().trim());if(!r)return ack&&ack({ok:0,m:'Sala no encontrada'});
   if(r.state!=='lobby')return ack&&ack({ok:0,m:'La partida ya empezó'});if(r.players.size>=MAX)return ack&&ack({ok:0,m:'Sala llena (10/10)'});
   const p={id:crypto.randomBytes(4).toString('hex'),tok:crypto.randomBytes(12).toString('hex'),name:clean(d.name),char:'kael',v:{s:0,e:0,m:0},skin:0,fx:0,on:true};setup(p,d);
   r.players.set(p.id,p);attach(r,p);ack&&ack({ok:1,code:r.code,me:p.id,tok:p.tok});bc(r)});
  s.on('rejoin',(d,ack)=>{if(cur)return;const r=rooms.get(String(d&&d.code||''));const p=r&&[...r.players.values()].find(x=>x.tok===d.tok);
   if(!p)return ack&&ack({ok:0});attach(r,p);ack&&ack({ok:1,code:r.code,me:p.id,tok:p.tok,playing:r.state==='play'});bc(r);if(r.state==='play')gstart(r)});
  s.on('setup',d=>{if(!cur||cur.r.state!=='lobby')return;setup(cur.p,d);bc(cur.r)});
  s.on('config',d=>{const r=cur&&cur.r;if(!r||r.host!==cur.p.id||r.state!=='lobby'||!d)return;if(A.MAPS.some(m=>m.id===d.map))r.map=d.map;if(A.MODES[d.mode])r.mode=d.mode;bc(r)});
  s.on('kick',id=>{const r=cur&&cur.r;if(!r||r.host!==cur.p.id||id===cur.p.id)return;const p=r.players.get(id);if(!p)return;io.to(p.sid).emit('kicked');const so=io.sockets.sockets.get(p.sid);if(so){so.leave(r.code);so.emit('left')}p.on=false;dropPlayer(r,p)});
  s.on('start',()=>{const r=cur&&cur.r;if(!r||r.host!==cur.p.id||r.state!=='lobby')return;
   r.state='play';r.game=new Game(r,res=>{io.to(r.code).emit('gend',res);const cr=r;setTimeout(()=>{stop(cr);bc(cr)},500)});io.to(r.code).emit('gstart',{map:r.map,mode:r.mode,players:pub(r).players});startLoop(r);bc(r)});
  s.on('input',d=>{if(cur&&cur.r.game)cur.r.game.setInput(cur.p.id,d)});
  s.on('endmatch',()=>{const r=cur&&cur.r;if(!r||r.host!==cur.p.id||!r.game)return;r.game.finish([],'El anfitrión terminó la partida')});
  s.on('leave',()=>{if(!cur)return;const{r,p}=cur;s.leave(r.code);cur=null;dropPlayer(r,p);s.emit('left')});
  s.on('disconnect',()=>{if(!cur)return;const{r,p}=cur;p.on=false;bc(r);p.t=setTimeout(()=>{if(!p.on&&r.players.has(p.id))dropPlayer(r,p)},GRACE)});
 });
 return rooms;
};
