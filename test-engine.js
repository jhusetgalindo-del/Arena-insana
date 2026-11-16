// Prueba headless del motor: simula 10 jugadores en cada mapa/modo con inputs aleatorios.
const {Game}=require('./engine');const A=global.AI;let ok=0;
for(const map of A.MAPS)for(const mode of Object.keys(A.MODES)){
 const players=new Map();for(let i=0;i<10;i++)players.set('p'+i,{id:'p'+i,name:'P'+i,char:A.CHARS[i%12].id,v:{s:i%3,e:i%5,m:i%2},skin:0,fx:0});
 let res=null;const g=new Game({map:map.id,mode,players},r=>res=r);let kills=0,crs=0;
 for(let t=0;t<30*300&&!g.over;t++){
  if(t%10===0)for(const id of players.keys())g.setInput(id,{mx:Math.random()*2-1,my:Math.random()*2-1,aim:Math.random()*6.28,atk:Math.random()<.7,q:Math.random()<.2,e:Math.random()<.2,r:Math.random()<.1,d:Math.random()<.1});
  g.tick(1/30);const s=g.snap();for(const e of s.ev){if(e.e==='k')kills++;if(e.e==='cr')crs++}JSON.stringify(s);
 }
 ok++;console.log(map.id.padEnd(9),mode.padEnd(9),g.over?'fin '+(g.t|0)+'s':'sigue','bajas:'+kills,'criaturas:'+crs,res?'ganador(es):'+res.win.length:'');
}
console.log('OK',ok,'combinaciones');
