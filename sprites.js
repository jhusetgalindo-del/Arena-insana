/* SPRITES PIXEL ART PROCEDURALES: cada personaje se dibuja pixel a pixel con silueta de rol + paleta + accesorio + rasgo propio.
   Frames: 0 reposo, 1 caminar, 2 ataque/habilidad, 3 daño. */
const Sprites=(()=>{
 const cache={};const SKIN=['#f1c27d','#c68642','#8d5524','#a8d5ba','#d9b3ff','#e8b890','#b5d6f0','#f2d6a2','#9a6b4a','#c9e3a0','#e0a0a0','#d0d0e8'];
 const sh=(h,f)=>{const n=parseInt(h.slice(1),16);const c=v=>Math.max(0,Math.min(255,Math.round(v*f)));return'#'+[(n>>16)&255,(n>>8)&255,n&255].map(v=>c(v).toString(16).padStart(2,'0')).join('')};
 const pal=(c,s)=>{const[a,b,d]=c.col;return s===1?[b,a,d]:s===2?[sh(a,.55),'#5ff',sh(d,.6)]:s===3?[a,'#ffcc33',sh(d,1.2)]:[a,b,d]};
 function char(ci,skin,f){const k=ci+'_'+skin+'_'+f;if(cache[k])return cache[k];const c=AI.CHARS[ci],[P,T,D]=pal(c,skin);
  const cv=document.createElement('canvas');cv.width=44;cv.height=52;const x=cv.getContext('2d');const S=2;
  const px=(a,b,w,h,col)=>{x.fillStyle=col;x.fillRect(a*S+6,b*S+4,w*S,h*S)};
  const hurt=f===3,atk=f===2,wk=f===1,sk=hurt?'#fff':SKIN[ci%SKIN.length],K='#1a1018';
  px(4,20,8,1,'rgba(0,0,0,.35)');                       // sombra
  const L=wk?1:0;px(5,16+L,3,4-L,D);px(9,16+(1-L)*(wk?1:0),3,4-(wk?1-L:0),D);px(5,19,3,1,K);px(9,19,3,1,K);  // piernas+botas
  const role=c.role;                                    // torso y silueta por rol
  if(role==='tanque'){px(2,8,12,8,P);px(2,8,12,2,T);px(1,8,2,4,T);px(13,8,2,4,T)}
  else if(role==='mago'||role==='soporte'){px(3,8,10,10,P);px(3,16,10,2,T);px(7,8,2,10,T)}
  else if(role==='asesino'){px(4,8,8,8,P);px(4,13,8,1,T)}
  else{px(4,8,8,8,P);px(4,14,8,1,T);if(role==='guerrero'){px(3,8,2,3,T);px(11,8,2,3,T)}}
  px(4,15,8,1,D);
  px(5,3,6,5,sk);                                       // cabeza
  const ey=hurt?'#c00':K;px(6,5,1,1,ey);px(9,5,1,1,ey);px(7,7,2,1,hurt?'#c00':'#a05050');
  if(role==='guerrero'){px(4,2,8,3,P);px(7,0,2,3,T);px(4,5,1,2,P);px(11,5,1,2,P)}
  if(role==='mago'){px(3,3,10,1,T);px(4,1,8,2,T);px(6,-1,4,2,T);px(7,-2,2,1,P)}
  if(role==='asesino'){px(4,2,8,4,P);px(4,5,8,2,K);px(5,5,1,1,'#fff');px(10,5,1,1,'#fff')}
  if(role==='tanque'){px(4,1,8,6,P);px(4,5,8,1,K);px(3,1,10,1,T);px(7,0,2,1,T)}
  if(role==='arquero'){px(4,2,8,2,T);px(3,3,10,1,T);px(11,-1,1,4,'#fff');px(12,0,1,2,'#fff')}
  if(role==='soporte'){px(5,0,6,1,'#ffe066');px(4,1,1,1,'#ffe066');px(11,1,1,1,'#ffe066');px(4,2,8,1,T)}
  const X=c.x;                                          // rasgo propio
  if(X==='cape'){px(3,9,1,8,T);px(12,9,1,8,T);px(3,16,2,2,T)}
  if(X==='horns'){px(3,0,1,3,'#eee');px(12,0,1,3,'#eee');px(2,-1,1,1,'#eee');px(13,-1,1,1,'#eee')}
  if(X==='scarf'){px(4,8,8,2,T);px(12,9,3,2,T);px(14,11,2,1,T)}
  if(X==='eyepatch'){px(8,5,3,2,K)}
  if(X==='beard'){px(5,7,6,3,'#d8d0c0');px(6,10,4,1,'#d8d0c0')}
  if(X==='feather'){px(11,-2,2,1,T)}
  if(X==='hood'){px(3,2,1,6,P);px(12,2,1,6,P)}
  if(X==='mask'){px(5,6,6,2,T)}
  if(X==='halo'){px(3,-1,10,1,'rgba(255,230,120,.8)')}
  if(X==='helm'){px(7,-1,2,2,'#fff')}
  const A=c.acc,e=atk?-3:0;                             // arma (derecha) / escudo (izquierda)
  const arm=(dx)=>px(12+dx,9,2,4,P);arm(atk?1:0);px(12,12,2,2,sk);
  if(A==='sword'){px(14,2+e,1,10,'#dfe6f0');px(13,11+e,3,1,'#ffcc33');px(14,12+e,1,2,'#6b3a1a')}
  if(A==='hammer'){px(14,6+e,1,9,'#6b3a1a');px(12,3+e,5,4,'#8a8a9a');px(12,3+e,5,1,'#ccd')}
  if(A==='staff'){px(14,0+e,1,15,'#6b3a1a');px(13,-2+e,3,3,'#ff6a2a');px(14,-1+e,1,1,'#ffe')}
  if(A==='orb'){px(13,7+e,4,4,'#9cf');px(14,8+e,2,2,'#fff');px(12,11,2,1,'#fff')}
  if(A==='dagger'){px(14,8+e,1,5,'#dfe6f0');px(13,13+e,3,1,'#555');px(2,11,1,4,'#dfe6f0')}
  if(A==='claws'){px(14,9+e,1,4,'#cfc');px(15,9+e,1,3,'#cfc');px(1,10,1,3,'#cfc');px(2,10,1,3,'#cfc')}
  if(A==='greatshield'){px(0,6,5,10,T);px(1,7,3,8,P);px(2,9,1,4,T);px(14,9+e,1,6,'#999')}
  if(A==='shield'){px(1,8,4,7,T);px(2,9,2,5,P);px(14,5+e,1,8,'#ddd');px(13,12+e,3,1,'#fc3')}
  if(A==='bow'){px(14,3+e,1,12,'#a0642a');px(15,4+e,1,1,'#a0642a');px(15,13+e,1,1,'#a0642a');px(13,4+e,1,10,'#eee');px(3,9,2,6,'#5a3a1a')}
  if(A==='crossbow'){px(12,9+e,5,1,'#5a3a1a');px(14,7+e,1,5,'#5a3a1a');px(12,9+e,1,1,'#eee')}
  if(A==='wand'){px(14,5+e,1,8,'#fff');px(13,3+e,3,3,'#ffd84a');px(14,4+e,1,1,'#fff')}
  if(A==='lantern'){px(14,5+e,1,3,'#888');px(13,8+e,3,4,'#4fe0c0');px(14,9+e,1,2,'#fff');px(3,8,1,4,'#c6f')}
  if(f>=2&&!hurt)px(13,7+e,1,1,'#fff');
  x.globalCompositeOperation='destination-over';        // contorno oscuro
  const id=x.getImageData(0,0,44,52),o=document.createElement('canvas');o.width=44;o.height=52;const oc=o.getContext('2d');
  oc.fillStyle='#120a14';for(let yy=0;yy<52;yy++)for(let xx=0;xx<44;xx++)if(id.data[(yy*44+xx)*4+3]>10)for(const[dx,dy]of[[-2,0],[2,0],[0,-2],[0,2]])oc.fillRect(xx+dx,yy+dy,1,1);
  oc.drawImage(cv,0,0);return cache[k]=o}
 function creature(t,f){const k='c'+t+f;if(cache[k])return cache[k];const col=AI.CREATURES[t].col;const cv=document.createElement('canvas');cv.width=36;cv.height=36;const x=cv.getContext('2d');
  const px=(a,b,w,h,c)=>{x.fillStyle=c;x.fillRect(a*2+2,b*2+2,w*2,h*2)};const b=f?1:0,K='#1a1018',d=sh(col,.6),l=sh(col,1.4);
  if(t==='heal'){px(3,7+b,10,7-b,col);px(4,6+b,8,1,col);px(5,7+b,3,1,l);px(5,10,2,2,K);px(10,10,2,2,K);px(7,3,2,5,'#fff');px(6,5,4,1,'#fff');px(3,14,10,1,d)}
  if(t==='shield'){px(2,6+b,12,8,col);px(3,5+b,10,1,l);px(5,7+b,2,2,l);px(9,9+b,2,2,l);px(1,12,3,3,d);px(12,12,3,3,d);px(2,11,3,3,'#9fd');px(11,8,3,3,'#9fd');px(6,10,1,1,K);px(10,10,1,1,K)}
  if(t==='speed'){px(5,6+b,6,7,col);px(6,4+b,4,2,d);px(3,3,3,4-b,'rgba(255,255,255,.7)');px(10,3,3,4-b,'rgba(255,255,255,.7)');px(6,7,1,1,K);px(9,7,1,1,K);px(4,13,1,2,d);px(11,13,1,2,d);px(6,9,4,1,d)}
  if(t==='energy'){px(3,3+b,10,6,col);px(2,5+b,12,3,col);px(5,5+b,2,1,l);for(let i=0;i<4;i++)px(4+i*3,9+b,1,5-(i%2)*2,d);px(5,6+b,2,2,K);px(9,6+b,2,2,K);px(7,0,2,3,'#ff6');px(6,2,2,1,'#ff6')}
  if(t==='power'){px(3,5+b,10,8,col);px(2,3+b,2,3,d);px(12,3+b,2,3,d);px(1,2+b,1,2,'#fff');px(14,2+b,1,2,'#fff');px(5,7+b,2,2,'#ff0');px(9,7+b,2,2,'#ff0');px(6,11+b,4,1,K);px(3,13,3,2,d);px(10,13,3,2,d)}
  if(t==='rare'){const rc=['#ff5a5a','#ffd84a','#6aff8a','#6ac8ff','#c06aff'];px(5,4+b,6,8,'#ffd700');px(6,3+b,4,1,'#fff6a0');px(1,6+b,4,3,rc[0]);px(11,6+b,4,3,rc[3]);px(0,9+b,3,2,rc[2]);px(13,9+b,3,2,rc[4]);px(6,6+b,1,2,K);px(9,6+b,1,2,K);px(6,12,4,3,rc[1]);px(7,0,2,3,'#fff')}
  const o=document.createElement('canvas');o.width=36;o.height=36;const oc=o.getContext('2d');const id=x.getImageData(0,0,36,36);oc.fillStyle='#120a14';
  for(let yy=0;yy<36;yy++)for(let xx=0;xx<36;xx++)if(id.data[(yy*36+xx)*4+3]>10)for(const[dx,dy]of[[-2,0],[2,0],[0,-2],[0,2]])oc.fillRect(xx+dx,yy+dy,1,1);
  oc.drawImage(cv,0,0);return cache[k]=o}
 return{char,creature,SKIN}})();
