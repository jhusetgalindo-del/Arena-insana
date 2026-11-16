/* AUDIO sintetizado con WebAudio: sonido característico por personaje y música ambiental propia por mapa. */
const Snd=(()=>{let ac,vol=.5,tm=null,step=0,map=0;
 const ctx=()=>ac||(ac=new(window.AudioContext||window.webkitAudioContext)());
 function tone(f,d,type='square',v=.1,sl=0,t0=0){try{const c=ctx(),o=c.createOscillator(),g=c.createGain(),t=c.currentTime+t0;o.type=type;o.frequency.setValueAtTime(f,t);if(sl)o.frequency.exponentialRampToValueAtTime(Math.max(30,f*sl),t+d);g.gain.setValueAtTime(v*vol,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g).connect(c.destination);o.start(t);o.stop(t+d)}catch(e){}}
 const T=['square','sawtooth','triangle','sine'];
 function sfx(ci,k){const f=180+ci*37,ty=T[ci%4];({b:()=>tone(f*1.6,.1,ty,.09,.6),q:()=>tone(f*2,.18,ty,.12,1.6),e:()=>tone(f,.22,ty,.12,2.2),r:()=>{tone(f*.7,.5,'sawtooth',.14,2.5);tone(f*1.4,.5,ty,.1,1.5,.05)},d:()=>tone(300,.12,'sine',.1,2)})[k]?.()}
 const ev={hit:()=>tone(120,.08,'square',.1,.5),kill:()=>{tone(400,.1,'square',.12,.5);tone(200,.25,'sawtooth',.12,.4,.08)},cr:()=>{tone(660,.08,'triangle',.12);tone(880,.12,'triangle',.12,1,.07)},boom:()=>tone(90,.3,'sawtooth',.12,.4),ui:()=>tone(500,.05,'square',.06)};
 const SC=[[0,3,5,7,10],[0,1,5,7,8],[0,2,4,7,9],[0,2,3,7,8],[0,4,7,11,12],[0,2,4,7,9]],BASE=[196,131,262,175,220,247];
 function music(m){stop();map=m;step=0;tm=setInterval(()=>{if(vol<=0)return;const s=SC[map],b=BASE[map];const n=s[(step*3+(step>>2))%s.length];tone(b*Math.pow(2,n/12)*(step%8<4?1:2),.35,'triangle',.05);if(step%4===0)tone(b/2,.8,'sine',.07);step++},[320,260,380,300,420,350][m])}
 function stop(){if(tm)clearInterval(tm);tm=null}
 return{sfx,ev:n=>ev[n]&&ev[n](),music,stop,vol:v=>vol=v,resume:()=>{try{ctx().resume()}catch(e){}}}})();
