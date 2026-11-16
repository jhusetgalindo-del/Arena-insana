// Prueba del flujo de salas con un Socket.IO simulado: crear, unir (10 máx), config, start, input, snapshots, reconexión.
const EE=require('events');require('./engine');
const rooms=new Map(),socks=new Map(),emitted=[];
const io=new EE();io.sockets={sockets:socks};
io.to=code=>({emit:(e,d)=>emitted.push([code,e,d])});
require('./rooms')(io);
function client(id){const s=new EE();s.id=id;s.join=c=>s.room=c;s.leave=()=>{};const log=[];s.emit=(e,...a)=>{if(e==='err')log.push(a);EE.prototype.emit.call(s,'out:'+e,...a)};
 const c={s,call:(ev,d)=>new Promise(r=>{s.listeners(ev)[0](d,r)}),fire:(ev,d)=>s.listeners(ev)[0](d)};socks.set(id,s);io.emit('connection',s);return c}
(async()=>{
 const host=client('h');const r=await host.call('create',{name:'Host',char:'ignis'});console.log('crear',r.ok,r.code);
 const others=[];for(let i=0;i<9;i++){const c=client('c'+i);const j=await c.call('join',{code:r.code,name:'J'+i,char:['vex','mira','gorund','lyra'][i%4]});others.push([c,j]);if(!j.ok)console.log('fallo join',i,j)}
 const extra=client('x');const j10=await extra.call('join',{code:r.code,name:'X'});console.log('sala llena rechaza el 11º:',!j10.ok,j10.m);
 host.fire('config',{map:'volcan',mode:'teams'});host.fire('start');
 await new Promise(r=>setTimeout(r,400));
 const snaps=emitted.filter(e=>e[1]==='snap').length;console.log('gstart emitido:',emitted.some(e=>e[1]==='gstart'),'| snaps recibidos:',snaps);
 host.fire('input',{mx:1,my:0,aim:0,atk:1});await new Promise(r=>setTimeout(r,300));
 const last=emitted.filter(e=>e[1]==='snap').pop()[2];console.log('jugadores en snapshot:',last.ps.length,'| proyectiles:',last.pj.length);
 const [c0,jr]=others[0];c0.s.emit=()=>{};c0.fire('disconnect');
 const c0b=client('c0b');const rj=await c0b.call('rejoin',{code:r.code,tok:jr.tok});console.log('reconexión ok:',rj.ok,'playing:',rj.playing);
 host.fire('endmatch');await new Promise(r=>setTimeout(r,700));console.log('gend emitido:',emitted.some(e=>e[1]==='gend'));process.exit(0)
})();
