/* RENDER DE MAPAS: fondo pixel art por bioma con profundidad, decoraciones, obstáculos con relieve y zonas peligrosas. Determinista por semilla. */
const MapArt=(()=>{
 const rng=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
 const TH={
  forest:{g:['#1d3b2a','#245a38','#2c6e42'],ob:['#5a4630','#7a6040','#3d7a3a'],hz:'#2a6aa8'},
  volcano:{g:['#2a1612','#3a1e18','#4a2a20'],ob:['#4a3a3a','#6a5050','#c0502a'],hz:'#ff5a1a'},
  ice:{g:['#bcdcf0','#d4ecfa','#eaf6ff'],ob:['#7ab8e0','#a8dcf8','#ffffff'],hz:'#f0f8ff'},
  desert:{g:['#d8b070','#e2c080','#ecd090'],ob:['#a07a40','#c09a58','#e8c878'],hz:'#a8803a'},
  crystal:{g:['#1a1530','#241c42','#2e2454'],ob:['#4a3a7a','#6a58a8','#c06aff'],hz:'#2a5ab8'},
  sky:{g:['#7ab8f0','#98ccf8','#b8e0ff'],ob:['#7a6a4a','#5aa84a','#8ae06a'],hz:'#4aa8e8'}};
 function build(map){const cv=document.createElement('canvas');cv.width=1280;cv.height=720;const x=cv.getContext('2d'),r=rng(map.id.length*977+map.id.charCodeAt(0)*31),T=TH[map.theme];
  const R=(a,b,w,h,c)=>{x.fillStyle=c;x.fillRect(Math.round(a),Math.round(b),w,h)};
  for(let ty=0;ty<45;ty++)for(let tx=0;tx<80;tx++){const k=r();R(tx*16,ty*16,16,16,T.g[k<.5?0:k<.85?1:2]);if(k>.93)R(tx*16+4,ty*16+4,8,4,T.g[(k*7|0)%3])}
  const th=map.theme,D=(n,f)=>{for(let i=0;i<n;i++)f(r()*1280,r()*720,r)};
  const nearHaz=(a,b)=>map.haz.some(h=>a>h.x-30&&a<h.x+h.w+30&&b>h.y-30&&b<h.y+h.h+30),nearObs=(a,b)=>map.obs.some(o=>a>o.x-30&&a<o.x+o.w+30&&b>o.y-30&&b<o.y+o.h+30);
  const sd=(a,b,w=1)=>R(a-14*w,b+10*w,28*w,6*w,'rgba(0,0,0,.25)');
  if(th==='forest'){D(40,(a,b)=>{if(nearHaz(a,b)||nearObs(a,b))return;R(a,b,3,3,['#3a8a4a','#4aa05a','#2a6a3a'][r()*3|0])});
   D(22,(a,b)=>{if(nearHaz(a,b)||nearObs(a,b))return;sd(a,b);R(a-4,b-6,8,14,'#4a3a28');for(let i=0;i<3;i++)R(a-18+i*4,b-30-i*8,36-i*8,12,i?'#2a7a3a':'#1f6030');R(a-12,b-40,8,4,'#4ac060')});
   D(26,(a,b)=>{if(nearHaz(a,b)||nearObs(a,b))return;const c=['#ff6ab0','#6ae0ff','#c0ff6a'][r()*3|0];R(a-1,b,3,8,'#e8e0d0');R(a-6,b-4,13,5,c);R(a-3,b-6,7,2,c);R(a-4,b-3,2,2,'#fff')});
   D(6,(a,b)=>{if(nearHaz(a,b)||nearObs(a,b))return;R(a-6,b-16,5,18,'#7a8a7a');R(a+4,b-10,5,12,'#6a7a6a');R(a-8,b-18,9,3,'#9aaa9a')})}
  if(th==='volcano'){D(50,(a,b)=>{R(a,b,2,r()*14+4,'#1a0a08');R(a+2,b+4,6,2,'#1a0a08')});D(30,(a,b)=>{if(nearHaz(a,b))return;R(a,b,3,3,'#ff7a2a')});
   D(14,(a,b)=>{if(nearHaz(a,b)||nearObs(a,b))return;sd(a,b);R(a-8,b-12,16,20,'#3a2a2a');R(a-5,b-20,10,10,'#4a3a3a');R(a-2,b-26,4,8,'#5a4646');R(a-1,b-8,2,8,'#ff6a1a')});
   D(10,(a,b)=>{if(nearHaz(a,b)||nearObs(a,b))return;R(a-6,b,12,6,'#6a6a7a');R(a-4,b-3,8,3,'#8a8a9a');R(a-2,b-2,2,2,'#7af')})}
  if(th==='ice'){D(60,(a,b)=>R(a,b,3,3,'#fff'));D(16,(a,b)=>{if(nearHaz(a,b)||nearObs(a,b))return;sd(a,b);R(a-3,b-26,6,30,'#8adaf8');R(a-8,b-14,5,18,'#6ac0ec');R(a+4,b-18,5,22,'#a8eaff');R(a-1,b-24,2,18,'#fff')});
   D(10,(a,b)=>{if(nearHaz(a,b)||nearObs(a,b))return;R(a-20,b,40,10,'#fff');R(a-14,b-6,28,8,'#f4fbff')});D(8,(a,b)=>{if(nearHaz(a,b)||nearObs(a,b))return;R(a-2,b-30,4,34,'#5a4a3a');R(a-14,b-26,28,6,'#fff');R(a-10,b-18,20,5,'#e8f4ff')})}
  if(th==='desert'){for(let i=0;i<8;i++){x.fillStyle='rgba(120,80,30,.12)';x.fillRect(0,i*92+r()*20,1280,10)}
   D(50,(a,b)=>R(a,b,r()*20+6,2,'#b8904a'));D(8,(a,b)=>{if(nearHaz(a,b)||nearObs(a,b))return;sd(a,b,1.5);R(a-12,b-50,8,54,'#c8a868');R(a+4,b-44,8,48,'#b89858');R(a-14,b-54,12,5,'#e0c888');R(a+2,b-48,12,5,'#d0b878');R(a-12,b-30,2,30,'#8a6a38')});
   D(10,(a,b)=>{if(nearHaz(a,b)||nearObs(a,b))return;R(a-2,b-8,4,16,'#3a8a4a');R(a-8,b-6,4,2,'#3a8a4a');R(a-8,b-10,2,6,'#3a8a4a');R(a+4,b-2,5,2,'#3a8a4a');R(a+7,b-8,2,8,'#3a8a4a')});
   D(6,(a,b)=>{if(nearHaz(a,b)||nearObs(a,b))return;R(a-10,b-10,20,3,'#e8c878');R(a-8,b-7,4,16,'#c8a858');R(a+4,b-7,4,16,'#c8a858');R(a-6,b-4,2,2,'#8a6a38')})}
  if(th==='crystal'){D(40,(a,b)=>R(a,b,2,2,'#6a58a8'));for(let i=0;i<22;i++){const a=r()*1280,h=20+r()*50;R(a-6,0,12,h,'#150f28');R(a-3,h,6,10,'#150f28');R(a-1,h+10,2,8,'#241c42')}
   D(26,(a,b)=>{if(nearHaz(a,b)||nearObs(a,b))return;const c=['#c06aff','#6ac8ff','#6affc8','#ff6ab0'][r()*4|0];sd(a,b);R(a-3,b-24,6,28,c);R(a-8,b-14,5,18,c);R(a+4,b-18,5,22,c);R(a-1,b-22,2,16,'#fff')});
   D(14,(a,b)=>{if(nearHaz(a,b)||nearObs(a,b))return;R(a-1,b,3,8,'#c8c0d8');R(a-6,b-4,13,5,'#6affc8');R(a-4,b-6,8,2,'#6affc8')})}
  if(th==='sky'){for(let i=0;i<10;i++){const a=r()*1200,b=r()*700,w=60+r()*80;x.fillStyle='rgba(255,255,255,.55)';x.fillRect(a,b,w,14);x.fillRect(a+12,b-10,w-30,14);x.fillRect(a+w*.3,b+10,w*.6,10)}
   D(18,(a,b)=>{if(nearHaz(a,b)||nearObs(a,b))return;sd(a,b);R(a-3,b-14,6,18,'#6a4a2a');R(a-14,b-34,28,22,'#3aa04a');R(a-10,b-40,20,8,'#5ac85a');R(a-5,b-30,3,3,'#ff6ab0')});
   D(26,(a,b)=>{if(nearHaz(a,b)||nearObs(a,b))return;R(a,b,2,6,'#3a8a3a');R(a-2,b-3,6,4,['#ff6ab0','#ffe24a','#fff'][r()*3|0])})}
  // obstáculos con relieve
  for(const o of map.obs){const[c0,c1,c2]=T.ob;R(o.x+6,o.y+8,o.w,o.h,'rgba(0,0,0,.3)');R(o.x,o.y,o.w,o.h,c0);R(o.x,o.y,o.w,6,c1);R(o.x,o.y,4,o.h,c1);R(o.x+o.w-4,o.y,4,o.h,'rgba(0,0,0,.25)');R(o.x,o.y+o.h-5,o.w,5,'rgba(0,0,0,.3)');
   for(let i=0;i<o.w*o.h/260;i++){const a=o.x+6+r()*(o.w-14),b=o.y+8+r()*(o.h-16);R(a,b,4,3,r()<.5?c1:'rgba(0,0,0,.2)')}
   if(th==='forest'||th==='sky')for(let a=o.x;a<o.x+o.w;a+=8)R(a,o.y-2,6,4+r()*5,c2);
   if(th==='volcano'||th==='crystal'||th==='ice'){R(o.x+o.w*.3,o.y+3,3,o.h-8,c2);R(o.x+o.w*.7,o.y+6,2,o.h*.5,c2)}
   if(th==='desert'){R(o.x+4,o.y+o.h*.4,o.w-8,3,c2);R(o.x+4,o.y+o.h*.7,o.w-8,3,c2)}}
  // peligros
  for(const h of map.haz){const k=h.k;const c=k==='lava'?'#ff5a1a':k==='sand'?'#a8803a':k==='snow'?'#f6fbff':'#2a6ac8';R(h.x-4,h.y-4,h.w+8,h.h+8,k==='lava'?'#2a0a05':'rgba(0,0,0,.25)');R(h.x,h.y,h.w,h.h,c);
   for(let i=0;i<h.w*h.h/200;i++)R(h.x+r()*h.w,h.y+r()*h.h,4,2,k==='lava'?'#ffc04a':k==='sand'?'#c8a058':k==='snow'?'#cfe8f8':'#5a9ae8')}
  // zonas de captura (marcas en el suelo)
  map.caps.forEach(z=>{x.strokeStyle='rgba(255,255,255,.18)';x.lineWidth=3;x.setLineDash([10,8]);x.beginPath();x.arc(z.x,z.y,z.r,0,6.3);x.stroke()});
  // iluminación (viñeta)
  const g=x.createRadialGradient(640,360,250,640,360,800);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,th==='crystal'||th==='volcano'?'rgba(0,0,0,.6)':'rgba(0,10,30,.35)');x.fillStyle=g;x.fillRect(0,0,1280,720);
  return cv}
 return{build,TH}})();
