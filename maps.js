/* MAPAS 1280x720. obs=obstáculos sólidos, haz=zonas de peligro/lentitud, cs=puntos de criaturas, caps=zonas de captura. */
(function(g){const A=g.AI=g.AI||{};const W=1280;
const R=(x,y,w,h,k)=>({x,y,w,h,k});
const mir=a=>a.flatMap(r=>{const m={...r,x:W-r.x-(r.w||0)};return m.x===r.x?[r]:[r,m]});
const ring=()=>Array.from({length:10},(_,i)=>{const t=i/10*Math.PI*2+.3;return{x:Math.round(640+Math.cos(t)*540),y:Math.round(360+Math.sin(t)*285)}});
const caps=[{x:640,y:360,r:75},{x:230,y:360,r:65},{x:1050,y:360,r:65}];
const M=(o)=>Object.assign({spawns:ring(),caps,haz:[]},o);
A.MAPS=[
M({id:'bosque',n:'Bosque Encantado',theme:'forest',amb:'firefly',obs:mir([R(300,160,90,90),R(420,430,120,60),R(580,290,120,140),R(220,540,70,70)]),
 haz:mir([R(470,120,110,60,'water')]),cs:mir([{x:250,y:360,t:'heal'},{x:420,y:130,t:'speed'},{x:420,y:610,t:'energy'},{x:540,y:240,t:'shield'}]).concat([{x:640,y:560,t:'rare'},{x:640,y:170,t:'power'}])}),
M({id:'volcan',n:'Volcán en Llamas',theme:'volcano',amb:'ember',obs:mir([R(260,200,100,60),R(560,330,160,60),R(300,480,120,80),R(520,150,80,60)]),
 haz:mir([R(420,300,80,160,'lava'),R(150,330,70,100,'lava')]),cs:mir([{x:300,y:360,t:'heal'},{x:500,y:600,t:'power'},{x:380,y:100,t:'speed'},{x:560,y:240,t:'energy'}]).concat([{x:640,y:480,t:'rare'},{x:640,y:130,t:'shield'}])}),
M({id:'hielo',n:'Reino Congelado',theme:'ice',amb:'snow',obs:mir([R(330,150,80,110),R(460,430,150,50),R(600,300,80,120),R(250,520,90,60)]),
 haz:mir([R(180,300,110,120,'snow')]),cs:mir([{x:260,y:300,t:'shield'},{x:450,y:620,t:'heal'},{x:430,y:310,t:'energy'},{x:540,y:140,t:'speed'}]).concat([{x:640,y:560,t:'rare'},{x:640,y:190,t:'power'}])}),
M({id:'desierto',n:'Desierto Antiguo',theme:'desert',amb:'sand',obs:mir([R(280,180,90,90),R(450,300,60,150),R(560,500,160,70),R(300,520,60,60)]),
 haz:mir([R(560,120,100,70,'sand'),R(100,330,100,110,'sand')]),cs:mir([{x:240,y:370,t:'power'},{x:420,y:130,t:'heal'},{x:400,y:610,t:'speed'},{x:540,y:380,t:'energy'}]).concat([{x:640,y:360,t:'rare'},{x:640,y:620,t:'shield'}])}),
M({id:'cristal',n:'Cuevas Cristalinas',theme:'crystal',amb:'spark',obs:mir([R(300,170,70,100),R(440,330,100,100),R(260,500,110,60),R(600,160,80,50)]),
 haz:mir([R(470,520,130,90,'water')]),cs:mir([{x:220,y:340,t:'energy'},{x:430,y:100,t:'shield'},{x:610,y:430,t:'heal'},{x:360,y:420,t:'speed'}]).concat([{x:640,y:310,t:'rare'},{x:640,y:620,t:'power'}])}),
M({id:'islas',n:'Islas Flotantes',theme:'sky',amb:'petal',obs:mir([R(300,200,110,40),R(500,320,100,40),R(250,470,120,40),R(600,520,80,40),R(560,150,80,40)]),
 haz:mir([R(180,260,40,200,'water')]),cs:mir([{x:240,y:340,t:'speed'},{x:420,y:120,t:'heal'},{x:440,y:600,t:'shield'},{x:520,y:410,t:'power'}]).concat([{x:640,y:250,t:'rare'},{x:640,y:600,t:'energy'}])})
];
A.HAZ={lava:{dps:14,slow:1},sand:{dps:0,slow:.55},water:{dps:0,slow:.7},snow:{dps:0,slow:.8}};
})(typeof window!=='undefined'?window:global);
