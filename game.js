/* CLIENTE: red (Socket.IO), flujo de pantallas, escena Phaser, entrada PC/móvil y HUD. */
Prof.load();Cfg.load();Snd.vol(Cfg.d.vol);
const S=io();let me=null,room=null,roleF='all',inGame=false,game=null,snap=null,gm=null,sess=null;
const CI=id=>AI.CHARS.findIndex(c=>c.id===id);
try{sess=JSON.parse(sessionStorage.getItem('ai_sess'))}catch(e){}
const isTouch=()=>Cfg.d.touch==='on'||(Cfg.d.touch==='auto'&&('ontouchstart' in window||navigator.maxTouchPoints>0));
document.body.classList.toggle('touch',isTouch());
const myName=()=>($('#name').value.trim()||'Jugador').slice(0,14);
const payload=()=>({name:myName(),char:Prof.d.char,v:Prof.d.v,skin:Prof.d.skin,fx:Prof.d.fxSel});
/* ---------- red ---------- */
S.on('connect',()=>{if(sess)S.emit('rejoin',sess,r=>{if(!r||!r.ok){sess=null;sessionStorage.removeItem('ai_sess');return}me=r.me;UI.toast('Reconectado a '+r.code)})});
S.on('err',m=>UI.toast(m));
S.on('room',r=>{room=r;if(!r.players.some(p=>p.id===me))return;if(!inGame&&!$('#s-result').classList.contains('on')&&!$('#s-prof').classList.contains('on')&&!$('#s-set').classList.contains('on'))renderRoom(),UI.show('s-room');else if(!inGame)renderRoom()});
S.on('kicked',()=>UI.toast('Fuiste expulsado'));S.on('left',()=>{room=null;me=null;sess=null;sessionStorage.removeItem('ai_sess');inGame=false;endScene();UI.show('s-menu')});
S.on('gstart',d=>startGame(d));
S.on('snap',s=>{snap=s;if(gm)gm.onSnap(s)});
S.on('gend',r=>finish(r));
const enter=(ev,extra)=>{if(!$('#name').value.trim()&&!Prof.d.name)return UI.toast('Escribe tu nombre');Prof.d.name=myName();Prof.save();S.emit(ev,Object.assign(payload(),extra),r=>{if(!r.ok)return UI.toast(r.m||'Error');me=r.me;sess={code:r.code,tok:r.tok};sessionStorage.setItem('ai_sess',JSON.stringify(sess))})};
$('#b-create').onclick=()=>enter('create');$('#b-join').onclick=()=>enter('join',{code:$('#code').value});
$('#b-play').onclick=()=>{Snd.resume();UI.show('s-lobby')};$('#b-leave').onclick=()=>S.emit('leave');$('#b-start').onclick=()=>S.emit('start');
$('#b-copy').onclick=()=>{navigator.clipboard&&navigator.clipboard.writeText(room.code);UI.toast('Código copiado: '+room.code)};
$('#b-back').onclick=()=>{room?(renderRoom(),UI.show('s-room')):UI.show('s-menu')};
$('#quit').onclick=()=>{if(confirm('¿Salir de la partida?'))S.emit('leave')};
$$('[data-go]').forEach(b=>b.onclick=()=>UI.show(b.dataset.go));
$('#b-prof').onclick=()=>{renderProf();UI.show('s-prof')};$('#b-set').onclick=()=>{renderSet();UI.show('s-set')};
$('#name').value=Prof.d.name;
/* ---------- sala ---------- */
const opt=(sel,arr,fn)=>{sel.innerHTML=arr.map((a,i)=>`<option value="${i}">${fn(a,i)}</option>`).join('')};
opt($('#v-s'),AI.STYLES,a=>a);opt($('#v-e'),AI.ELEMS,a=>a);opt($('#v-m'),AI.STANCES,a=>a);
$('#r-map').innerHTML=AI.MAPS.map(m=>`<option value="${m.id}">${m.n}</option>`).join('');
$('#r-mode').innerHTML=Object.entries(AI.MODES).map(([k,m])=>`<option value="${k}">${m.n}</option>`).join('');
const sendSetup=()=>{S.emit('setup',{char:Prof.d.char,v:Prof.d.v,skin:Prof.d.skin,fx:Prof.d.fxSel});Prof.save()};
['s','e','m'].forEach(k=>$('#v-'+k).onchange=e=>{Prof.d.v[k]=+e.target.value;sendSetup()});
$('#v-skin').onchange=e=>{const i=+e.target.value,ci=CI(Prof.d.char);if(!Prof.owns(ci,i)){const c=AI.SKINS[i].cost;if(Prof.d.coins<c){UI.toast('Monedas insuficientes ('+c+')');e.target.value=Prof.d.skin;return}Prof.d.coins-=c;(Prof.d.skins[ci]=Prof.d.skins[ci]||[]).push(i);UI.toast('¡Apariencia desbloqueada!')}Prof.d.skin=i;sendSetup();renderRoom()};
$('#v-fx').onchange=e=>{const i=+e.target.value;if(!Prof.d.fx.includes(i)){const c=AI.FX[i].cost;if(Prof.d.coins<c){UI.toast('Monedas insuficientes ('+c+')');e.target.value=Prof.d.fxSel;return}Prof.d.coins-=c;Prof.d.fx.push(i);UI.toast('¡Efecto desbloqueado!')}Prof.d.fxSel=i;sendSetup();renderRoom()};
$('#r-map').onchange=$('#r-mode').onchange=()=>S.emit('config',{map:$('#r-map').value,mode:$('#r-mode').value});
function renderRoom(){if(!room)return;const host=room.host===me,lv=Prof.lvl(),ci=CI(Prof.d.char);
 if(AI.CHARS[ci].lv>lv)Prof.d.char='kael';
 $('#rcode').textContent=room.code;$('#pcount').textContent=room.players.length+'/'+room.max;
 $('#plist').innerHTML=room.players.map(p=>`<div class="pl ${p.on?'':'off'}"><canvas width="44" height="52" data-ci="${CI(p.char)}" data-sk="${p.skin}"></canvas><span>${p.name}${p.id===room.host?' 👑':''}${p.id===me?' (tú)':''}</span>${host&&p.id!==me?`<span class="k" data-k="${p.id}">✕</span>`:''}</div>`).join('');
 $$('#plist canvas').forEach(cv=>cv.getContext('2d').drawImage(Sprites.char(+cv.dataset.ci,+cv.dataset.sk,0),0,0));$$('#plist .k').forEach(k=>k.onclick=()=>S.emit('kick',k.dataset.k));
 $('#roles').innerHTML=['all',...Object.keys(AI.ROLES)].map(r=>`<button class="${roleF===r?'on':''}" data-r="${r}">${r==='all'?'TODOS':AI.ROLES[r].ic+' '+AI.ROLES[r].n}</button>`).join('');
 $$('#roles button').forEach(b=>b.onclick=()=>{roleF=b.dataset.r;renderRoom()});
 $('#cgrid').innerHTML=AI.CHARS.map((c,i)=>({c,i})).filter(o=>roleF==='all'||o.c.role===roleF).map(o=>UI.charCard(o.c,o.i,o.c.id===Prof.d.char,o.c.lv>lv)).join('');
 $$('#cgrid .card').forEach(cd=>cd.onclick=()=>{const c=AI.CHARS[+cd.dataset.i];if(c.lv>Prof.lvl())return UI.toast('Requiere nivel '+c.lv);Prof.d.char=c.id;Prof.d.skin=0;sendSetup();renderRoom();Snd.sfx(+cd.dataset.i,'q')});
 UI.paintCanvases($('#cgrid'),Prof.d.skin);
 const c=AI.CHARS[CI(Prof.d.char)];$('#cinfo').innerHTML=`<b>${c.n}</b><br><small>${AI.ROLES[c.role].n} · ❤${c.hp} · vel ${c.spd}</small>`+UI.skillHtml(c);
 $('#v-s').value=Prof.d.v.s;$('#v-e').value=Prof.d.v.e;$('#v-m').value=Prof.d.v.m;
 opt($('#v-skin'),AI.SKINS,(s,i)=>s.n+(Prof.owns(CI(Prof.d.char),i)?'':' 🪙'+s.cost));opt($('#v-fx'),AI.FX,(s,i)=>s.n+(Prof.d.fx.includes(i)?'':' 🪙'+s.cost));$('#v-skin').value=Prof.d.skin;$('#v-fx').value=Prof.d.fxSel;
 $('#r-map').value=room.map;$('#r-mode').value=room.mode;$('#r-map').disabled=$('#r-mode').disabled=!host;$('#mdesc').textContent=AI.MODES[room.mode].d;
 $('#b-start').style.display=host?'':'none';$('#hostnote').textContent=host?'(eres el anfitrión)':'(solo el anfitrión)';$('#wait').textContent=host?(room.players.length<2?'Puedes empezar solo para practicar, o esperar jugadores.':'Listo cuando quieras.'):'Esperando al anfitrión...'}
/* ---------- perfil / ajustes ---------- */
function renderProf(){const d=Prof.d,l=Prof.lvl(),nx=50*l*l;$('#pbody').innerHTML=`<p><b>${d.name||'Jugador'}</b> · Nivel ${l}</p><p>XP ${d.xp}/${nx} · 🪙 ${d.coins}</p><p>Partidas ${d.matches} · Victorias ${d.wins} · Derrotas ${d.losses}</p><p>Bajas ${d.kills} · Muertes ${d.deaths}</p><h3>HISTORIAL</h3>`+(d.hist.slice(-8).reverse().map(h=>`<p>${h.w?'🏆':'💀'} ${h.mode} · ${h.map} · ${h.k} bajas</p>`).join('')||'<p>Sin partidas</p>')}
function renderSet(){const c=Cfg.d;$('#sbody').innerHTML=`<label>Volumen<input type="range" min="0" max="1" step=".05" value="${c.vol}" id="c-vol"></label>`+['q','e','r','d'].map(k=>`<label>Tecla ${k==='d'?'Esquiva':k.toUpperCase()}<button class="btn sm" data-key="${k}">${c[k]}</button></label>`).join('')+`<label>Controles táctiles<select id="c-touch"><option value="auto">Automático</option><option value="on">Siempre</option><option value="off">Nunca</option></select></label><small>Mover: WASD · Atacar: clic · Mapas sin salto: Espacio = esquiva</small>`;
 $('#c-vol').oninput=e=>{c.vol=+e.target.value;Snd.vol(c.vol);Cfg.save()};$('#c-touch').value=c.touch;$('#c-touch').onchange=e=>{c.touch=e.target.value;Cfg.save();document.body.classList.toggle('touch',isTouch())};
 $$('[data-key]').forEach(b=>b.onclick=()=>{b.textContent='...';const f=e=>{e.preventDefault();c[b.dataset.key]=e.key.toUpperCase();Cfg.save();window.removeEventListener('keydown',f,true);renderSet()};window.addEventListener('keydown',f,true)})}
/* ---------- partida ---------- */
function startGame(d){inGame=true;gm_data=d;$$('.screen').forEach(s=>s.classList.remove('on'));$('#hud').classList.remove('hidden');document.body.classList.toggle('touch',isTouch());
 if(!game){game=new Phaser.Game({type:Phaser.AUTO,parent:'game',width:1280,height:720,pixelArt:true,backgroundColor:'#000',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[]});game.scene.add('Main',MainScene,true,d)}else{game.scene.stop('Main');game.scene.start('Main',d)}
 Snd.music(Math.max(0,AI.MAPS.findIndex(m=>m.id===d.map)))}
let gm_data=null;
function endScene(){inGame=false;$('#hud').classList.add('hidden');Snd.stop();if(game)game.scene.stop('Main');gm=null}
function finish(r){const was=Prof.lvl();const m=r.rank.find(x=>x.id===me);
 if(m){const d=Prof.d;d.xp+=m.xp;d.coins+=m.coins;d.matches++;m.win?d.wins++:d.losses++;d.kills+=m.kills;d.deaths+=m.deaths;d.hist.push({w:m.win,mode:AI.MODES[r.mode].n,map:AI.MAPS.find(x=>x.id===r.map).n,k:m.kills});if(d.hist.length>30)d.hist.shift();Prof.save()}
 setTimeout(()=>{endScene();$('#rtitle').textContent=m&&m.win?'🏆 ¡VICTORIA!':(r.win.length?'💀 DERROTA':'FIN DE PARTIDA');
  $('#rinfo').innerHTML=(r.reason?`<p>${r.reason}</p>`:'')+(m?`<p>+${m.xp} XP · +${m.coins} 🪙${Prof.lvl()>was?' · ¡NIVEL '+Prof.lvl()+'!':''}</p>`:'')+(r.mode==='teams'||r.mode==='capture'?`<p>Equipo A ${r.ts[0]} — Equipo B ${r.ts[1]}</p>`:'');
  $('#rtable').innerHTML='<table><tr><th></th><th>Jugador</th><th>Bajas</th><th>Muertes</th><th>Daño</th><th>Bichos</th></tr>'+r.rank.map((p,i)=>`<tr class="${p.win?'win':''}"><td>${i+1}</td><td>${p.name}${p.id===me?' ◀':''}</td><td>${p.kills}</td><td>${p.deaths}</td><td>${p.dmg}</td><td>${p.cr}</td></tr>`).join('')+'</table>';UI.show('s-result')},1500);
 if(gm)gm.victory(r.win)}
/* ---------- entrada ---------- */
const inp={mx:0,my:0,aim:0,atk:0,q:0,e:0,r:0,d:0},keys={};let mouse=false,lastDir=0,joyV={x:0,y:0};
window.addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;keys[e.key.toUpperCase()]=1;if(inGame&&[' ','TAB'].includes(e.key.toUpperCase()))e.preventDefault()});window.addEventListener('keyup',e=>{keys[e.key.toUpperCase()]=0});
window.addEventListener('mousedown',e=>{if(e.button===0&&inGame&&e.target.tagName==='CANVAS'){mouse=true;Snd.resume()}});window.addEventListener('mouseup',e=>{if(e.button===0)mouse=false});window.addEventListener('contextmenu',e=>{if(inGame)e.preventDefault()});
const tbs={a:0,q:0,e:0,r:0,d:0};
$('#tbtn').innerHTML=[['a','⚔','a'],['q','Q','right:100px;bottom:20px'],['e','E','right:80px;bottom:90px'],['r','R','right:10px;bottom:100px'],['d','»','right:140px;bottom:0px;width:46px;height:46px']].map(([k,t,s])=>`<button class="tb ${k==='a'?'a':''}" data-t="${k}" style="${k==='a'?'':s}">${t}</button>`).join('');
$$('.tb').forEach(b=>{const k=b.dataset.t;b.addEventListener('touchstart',e=>{e.preventDefault();tbs[k]=1;Snd.resume()},{passive:false});['touchend','touchcancel'].forEach(t=>b.addEventListener(t,e=>{e.preventDefault();tbs[k]=0},{passive:false}))});
let jid=null;const joy=$('#joy');const jset=t=>{const r=joy.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=(t.clientX-cx)/50,dy=(t.clientY-cy)/50;const l=Math.hypot(dx,dy);if(l>1){dx/=l;dy/=l}joyV={x:Math.abs(dx)<.15?0:dx,y:Math.abs(dy)<.15?0:dy};joy.firstElementChild.style.transform=`translate(${dx*30}px,${dy*30}px)`};
joy.addEventListener('touchstart',e=>{e.preventDefault();jid=e.changedTouches[0].identifier;jset(e.changedTouches[0])},{passive:false});
window.addEventListener('touchmove',e=>{for(const t of e.changedTouches)if(t.identifier===jid)jset(t)});
const jend=e=>{for(const t of e.changedTouches)if(t.identifier===jid){jid=null;joyV={x:0,y:0};joy.firstElementChild.style.transform=''}};window.addEventListener('touchend',jend);window.addEventListener('touchcancel',jend);
function readInput(sc){const c=Cfg.d,k=keys;let mx=(k.D||k.ARROWRIGHT?1:0)-(k.A||k.ARROWLEFT?1:0)+joyV.x,my=(k.S||k.ARROWDOWN?1:0)-(k.W||k.ARROWUP?1:0)+joyV.y;
 inp.mx=mx;inp.my=my;if(mx||my)lastDir=Math.atan2(my,mx);const m=gm.me();
 if(isTouch()&&m){let best=null,bd=520;for(const p of snap.ps)if(p.i!==me&&p.al&&!gm.ally(p.i)){const d=Math.hypot(p.x-m.x,p.y-m.y);if(d<bd){bd=d;best=p}}inp.aim=best?Math.atan2(best.y-m.y,best.x-m.x):lastDir}
 else if(m){const pt=sc.input.activePointer;inp.aim=Math.atan2(pt.y-m.y,pt.x-m.x)}
 inp.atk=+(mouse||!!tbs.a);inp.q=+(!!k[c.q]||!!tbs.q);inp.e=+(!!k[c.e]||!!tbs.e);inp.r=+(!!k[c.r]||!!tbs.r);inp.d=+(!!k[c.d]||!!k[' ']||!!tbs.d)}
/* ---------- escena Phaser ---------- */
class MainScene extends Phaser.Scene{
 constructor(){super('Main')}
 init(d){this.d=d;this.pl={};this.cr={};this.parts=[];this.t=0;this.ci={};this.tm={};d.players.forEach((p,i)=>{this.ci[p.id]=CI(p.char);this.tm[p.id]=(AI.MODES[d.mode].teams?i%2:i)});snap=null}
 tex(key,cv){if(!this.textures.exists(key))this.textures.addCanvas(key,cv);return key}
 create(){gm=this;const map=AI.MAPS.find(m=>m.id===this.d.map);this.map=map;
  this.add.image(0,0,this.tex('map_'+map.id,MapArt.build(map))).setOrigin(0).setDepth(0);
  map.haz.forEach(h=>{const c={lava:0xffc04a,sand:0xe8c878,snow:0xffffff,water:0x9ad0ff}[h.k];const r=this.add.rectangle(h.x+h.w/2,h.y+h.h/2,h.w-10,h.h-10,c,.3).setDepth(1);this.tweens.add({targets:r,alpha:.05,duration:900+Math.random()*600,yoyo:true,repeat:-1})});
  this.gfx=this.add.graphics().setDepth(4000);this.dec=[];
  const am=map.amb,col={firefly:0xdfff7a,ember:0xff8a2a,snow:0xffffff,sand:0xe8c878,spark:0xc08aff,petal:0xffb0d0}[am];
  for(let i=0;i<46;i++){const r=this.add.rectangle(Math.random()*1280,Math.random()*720,3,3,col).setDepth(4500);r.v={x:(Math.random()-.5)*24+({sand:50,snow:-10}[am]||0),y:({ember:-40,snow:35,petal:20,sand:6}[am]??-6)*(.5+Math.random()),p:Math.random()*6};this.dec.push(r)}
  this.txt=(x,y,s,c)=>{const t=this.add.text(x,y,s,{fontFamily:'monospace',fontSize:'16px',fontStyle:'bold',color:c,stroke:'#000',strokeThickness:4}).setOrigin(.5).setDepth(5000);this.tweens.add({targets:t,y:y-34,alpha:0,duration:900,onComplete:()=>t.destroy()})};
  this.puff=(x,y,c,n=10,sp=120)=>{for(let i=0;i<n;i++){const a=Math.random()*6.28,r=this.add.rectangle(x,y,4,4,Phaser.Display.Color.HexStringToColor(c).color).setDepth(4600);r.v={x:Math.cos(a)*sp*Math.random(),y:Math.sin(a)*sp*Math.random()};r.life=.5;this.parts.push(r)}};
  this.keyIn=setInterval(()=>{if(snap)S.emit('input',inp)},66);this.events.on('shutdown',()=>clearInterval(this.keyIn));
  const sk=$('#skills');sk.innerHTML=['b','q','e','r','d'].map((k,i)=>`<div class="sk" data-k="${i}"><b>${['⚔','Q','E','R','»'][i]}</b><span>${['Básico','','','','Esquiva'][i]}</span><i style="height:0"></i></div>`).join('');
  const my=AI.CHARS[CI(this.d.players.find(p=>p.id===me)?.char)];if(my){const ks=$$('.sk');['q','e','r'].forEach((k,i)=>{ks[i+1].children[0].textContent=Cfg.d[k].slice(0,5);ks[i+1].children[1].textContent=my[k].n.slice(0,8)})}
  $('#mode').textContent=AI.MODES[this.d.mode].n+' · '+map.n;$('#feed').innerHTML='';this.last=0}
 me(){return snap&&snap.ps.find(p=>p.i===me)}
 ally(id){return this.tm[id]===this.tm[me]}
 plr(p){let o=this.pl[p.i];if(o)return o;const ci=this.ci[p.i],pd=this.d.players.find(x=>x.id===p.i),sk=pd.skin|0;o={ci,sk,x:p.x,y:p.y,img:this.add.image(p.x,p.y,this.tex(`ch${ci}_${sk}_0`,Sprites.char(ci,sk,0))).setOrigin(.5,.8),
  nm:this.add.text(p.x,p.y-48,pd.name,{fontFamily:'monospace',fontSize:'11px',color:p.i===me?'#ffd84a':'#fff',stroke:'#000',strokeThickness:3}).setOrigin(.5).setDepth(4001),fx:pd.fx,hurt:0,hp:p.h,ph:0};return this.pl[p.i]=o}
 onSnap(s){for(const e of s.ev){
  if(e.e==='d'){this.txt(e.x,e.y,(e.c===1?'+':'')+e.v,['#fff','#7be05a','#4af','#ffd84a'][e.c]);if(e.c===0&&e.id===me){$('#hurt').style.opacity=.8;setTimeout(()=>$('#hurt').style.opacity=0,150)}if(e.c===0){const o=this.pl[e.id];if(o)o.hurt=.15;Snd.ev('hit')}}
  else if(e.e==='k'){const d=document.createElement('div');d.textContent=`${e.a} ☠ ${e.b}`;$('#feed').appendChild(d);setTimeout(()=>d.remove(),5000);this.puff(e.x,e.y,e.c,24,200);Snd.ev('kill')}
  else if(e.e==='cr'){const c=AI.CREATURES[e.t];this.puff(e.x,e.y,c.col,16,160);if(e.p===me){UI.toast('¡'+c.n+'! '+(c.rew.heal?'+'+c.rew.heal+' vida ':'')+(c.rew.sh?'+'+c.rew.sh+' escudo ':'')+Object.keys(c.rew.bf||{}).map(b=>AI.BUFFS[b].n+' '+c.rew.bf[b]+'s').join(' '),c.col);Snd.ev('cr')}}
  else if(e.e==='fx'){if(e.k==='boom'){this.puff(e.x,e.y,e.c||'#fff',14,e.r*1.4);Snd.ev('boom');const ring=this.add.circle(e.x,e.y,e.r,Phaser.Display.Color.HexStringToColor(e.c||'#fff').color,.25).setDepth(3);this.tweens.add({targets:ring,alpha:0,scale:1.2,duration:350,onComplete:()=>ring.destroy()})}
   else if(e.k==='tp')this.puff(e.x,e.y,e.c,8,90);else if(e.k==='slash'){const a=this.add.arc(e.x-Math.cos(e.a)*30,e.y-Math.sin(e.a)*30,e.r,Phaser.Math.RadToDeg(e.a)-70,Phaser.Math.RadToDeg(e.a)+70,false,Phaser.Display.Color.HexStringToColor(e.c).color,.5).setDepth(3999);this.tweens.add({targets:a,alpha:0,duration:180,onComplete:()=>a.destroy()})}}
  else if(e.e==='s')Snd.sfx(e.c,e.k);
  else if(e.e==='msg'){const m=$('#msg');m.textContent=e.t;m.style.opacity=1;setTimeout(()=>m.style.opacity=0,1400)}}}
 victory(win){this.won=win}
 update(_,dtm){if(!snap)return;const dt=Math.min(.1,dtm/1000),k=1-Math.exp(-dt*20);this.t+=dt;readInput(this);
  for(const d of this.dec){d.x+=d.v.x*dt;d.y+=d.v.y*dt+Math.sin(this.t*2+d.v.p)*.3;if(d.x<0)d.x=1280;if(d.x>1280)d.x=0;if(d.y<0)d.y=720;if(d.y>720)d.y=0;d.alpha=.4+.5*Math.abs(Math.sin(this.t*2+d.v.p))}
  for(let i=this.parts.length-1;i>=0;i--){const r=this.parts[i];r.x+=r.v.x*dt;r.y+=r.v.y*dt;r.life-=dt;r.alpha=r.life*2;if(r.life<=0){r.destroy();this.parts.splice(i,1)}}
  const g=this.gfx;g.clear();const hx=c=>Phaser.Display.Color.HexStringToColor(c||'#fff').color;
  this.map.caps.forEach((z,i)=>{if(snap.m!=='capture')return;const o=snap.cp[i];g.lineStyle(4,o<0?0xffffff:o===0?0x4a9aff:0xff5a4a,.8);g.strokeCircle(z.x,z.y,z.r);g.fillStyle(o<0?0xffffff:o===0?0x4a9aff:0xff5a4a,.12);g.fillCircle(z.x,z.y,z.r)});
  for(const z of snap.zn){const c=hx(z[3]);g.fillStyle(c,z[4]?.12:.28);g.fillCircle(z[0],z[1],z[2]);g.lineStyle(3,z[5]?0x7be05a:c,.9);g.strokeCircle(z[0],z[1],z[2]*(z[4]?.7+.3*Math.abs(Math.sin(this.t*10)):1))}
  for(const t of snap.tr){g.fillStyle(t[2]?0xffe94a:0x888888,1);g.fillTriangle(t[0]-9,t[1]+6,t[0]+9,t[1]+6,t[0],t[1]-8)}
  for(const b of snap.pj){const c=hx(b[3]);g.fillStyle(c,.3);g.fillCircle(b[0],b[1],b[2]*2);g.fillStyle(c,1);g.fillRect(b[0]-b[2],b[1]-b[2],b[2]*2,b[2]*2);g.fillStyle(0xffffff,1);g.fillRect(b[0]-2,b[1]-2,4,4);g.fillStyle(c,.5);g.fillRect(b[0]-Math.cos(b[4])*b[2]*3-2,b[1]-Math.sin(b[4])*b[2]*3-2,4,4)}
  const seen=new Set();
  for(const c of snap.cr){seen.add(c.i);let o=this.cr[c.i];if(!o){o={img:this.add.image(c.x,c.y,this.tex('cr_'+c.t+'0',Sprites.creature(c.t,0))).setOrigin(.5,.7),x:c.x,y:c.y};this.cr[c.i]=o}
   o.x+=(c.x-o.x)*k;o.y+=(c.y-o.y)*k;const f=Math.floor(this.t*4)%2;o.img.setTexture(this.tex('cr_'+c.t+f,Sprites.creature(c.t,f))).setPosition(o.x,o.y).setDepth(o.y).setVisible(true);
   if(c.t==='rare')o.img.setTint(Phaser.Display.Color.HSVToRGB((this.t*.5)%1,.3,1).color);
   g.fillStyle(0,.6);g.fillRect(o.x-14,o.y-30,28,5);g.fillStyle(hx(AI.CREATURES[c.t].col),1);g.fillRect(o.x-13,o.y-29,26*c.h/c.m,3)}
  for(const id in this.cr)if(!seen.has(id)){this.cr[id].img.destroy();delete this.cr[id]}
  for(const p of snap.ps){const o=this.plr(p);if(p.l){o.img.setVisible(false);o.nm.setVisible(false);continue}
   const jump=Math.hypot(p.x-o.x,p.y-o.y)>120;o.x=jump?p.x:o.x+(p.x-o.x)*k;o.y=jump?p.y:o.y+(p.y-o.y)*k;const mv=Math.hypot(p.x-o.x,p.y-o.y)>1.5;o.hurt=Math.max(0,o.hurt-dt);
   const f=o.hurt>0?3:p.at?2:(mv?1+0*0+(Math.floor(this.t*8)%2?0:0):0),fr=o.hurt>0?3:p.at?2:(mv&&Math.floor(this.t*8)%2?1:0);
   let by=0,sx=1;if(this.won&&this.won.includes(p.i))by=-Math.abs(Math.sin(this.t*8))*14;else if(mv)by=-Math.abs(Math.sin(this.t*12))*2;
   o.img.setTexture(this.tex(`ch${o.ci}_${o.sk}_${fr}`,Sprites.char(o.ci,o.sk,fr))).setPosition(o.x,o.y+by).setDepth(o.y).setFlipX(Math.cos(p.a)<0).setAlpha(p.al?(p.iv?.5+.3*Math.sin(this.t*30):1):0).setVisible(true);
   o.img.setTint(p.rt?0x99ccff:p.bn?0xff9966:p.sl?0xbbddff:0xffffff);o.nm.setPosition(o.x,o.y-50).setVisible(p.al);
   if(!p.al)continue;
   g.fillStyle(0,.7);g.fillRect(o.x-18,o.y-44,36,6);const al=this.ally(p.i),c=p.i===me?0x44ff66:al?0x44aaff:0xff4444;g.fillStyle(c,1);g.fillRect(o.x-17,o.y-43,34*p.h/p.m,4);if(p.s){g.fillStyle(0x66ccff,1);g.fillRect(o.x-17,o.y-41,34*Math.min(1,p.s/60),2)}
   const bc=[0xffe24a,0xff4a3a,0xb86bff];p.b.forEach((v,i)=>{if(v>0){g.lineStyle(2,bc[i],.8);g.strokeCircle(o.x,o.y,20+i*4+Math.sin(this.t*6)*1.5)}});
   if(o.fx&&mv&&Math.random()<.5)this.puff(o.x,o.y+10,o.fx===1?'#ffffaa':'#ff8833',1,30)}
  // HUD
  const m=this.me();const t=snap.tm;$('#tm').textContent=Math.floor(t/60)+':'+String(t%60).padStart(2,'0');
  $('#score').innerHTML=snap.m==='teams'||snap.m==='capture'?`<span style="border-color:#4a9aff">EQ A ${snap.ts[0]}</span><span style="border-color:#ff5a4a">EQ B ${snap.ts[1]}</span>`:this.d.players.map(p=>({n:p.name,s:snap.sc[p.id]})).sort((a,b)=>b.s-a.s).slice(0,6).map(x=>`<span style="border-color:#ffd84a">${x.n.slice(0,6)} ${x.s}</span>`).join('');
  if(m){$('#hpb').style.width=100*m.h/m.m+'%';$('#hpt').textContent=m.h+'/'+m.m;$('#shb').style.width=Math.min(100,m.s/60*100)+'%';
   $('#buffs').innerHTML=m.b.map((v,i)=>v>0?`<div style="color:${AI.BUFFS[['sp','pw','en'][i]].c};border-color:${AI.BUFFS[['sp','pw','en'][i]].c}">${AI.BUFFS[['sp','pw','en'][i]].n} ${v.toFixed(0)}s</div>`:'').join('');
   $$('.sk').forEach((e,i)=>e.lastElementChild.style.height=(m.mc[i]?Math.min(100,100*m.cd[i]/m.mc[i]):0)+'%');
   if(!m.al&&m.rs>0&&snap.m!=='survival'&&snap.m!=='rounds'){$('#msg').textContent='Reaparece en '+m.rs;$('#msg').style.opacity=1}else if(m.al&&$('#msg').textContent.startsWith('Reaparece'))$('#msg').style.opacity=0}}
}
UI.paintCanvases(document.body,0);
$('#mchars').innerHTML=AI.CHARS.map((c,i)=>`<canvas width="44" height="52" data-ci="${i}" style="animation-delay:${i*.1}s"></canvas>`).join('');UI.paintCanvases($('#mchars'),0);
