'use strict';
/* MOTOR DE COMBATE AUTORITATIVO: vida, daño, cooldowns, buffs, criaturas, modos y victoria se calculan SOLO aquí. */
['characters','creatures','modes','maps'].forEach(f=>require('./'+f));
const A=global.AI,W=1280,H=720,PR=15;
const rnd=(a,b)=>a+Math.random()*(b-a), cl=(v,a,b)=>Math.max(a,Math.min(b,v)), r1=v=>Math.round(v*10)/10;
const num=(v,d=0)=>Number.isFinite(v)?v:d;

class Game{
 constructor(room,onEnd){
  this.map=A.MAPS.find(m=>m.id===room.map)||A.MAPS[0]; this.mode=A.MODES[room.mode]?room.mode:'ffa'; this.md=A.MODES[this.mode];
  this.onEnd=onEnd; this.ps=new Map(); this.pj=[];this.zn=[];this.tr=[];this.cr=[];this.ev=[];this.over=false;this.pause=0;
  this.round=1;this.rsc={};this.ts=[0,0];this.cp=this.map.caps.map(()=>-1);this.timeLeft=this.md.time;this.t=0;
  const pls=[...room.players.values()];this.solo=pls.length<2;
  pls.forEach((pl,i)=>this.addPlayer(pl,i));
  this.map.cs.forEach((s,i)=>this.cr.push(this.mkCr(s,i)));
  this.ev.push({e:'msg',t:this.mode==='rounds'?'RONDA 1':'¡A LUCHAR!'});
 }
 addPlayer(pl,i){
  const c=A.charById(pl.char),v=pl.v||{s:0,e:0,m:0};
  const p={id:pl.id,name:pl.name,c,ci:A.CHARS.indexOf(c),v,skin:pl.skin|0,fx:pl.fx|0,team:this.md.teams?i%2:i,idx:i,
   x:0,y:0,hp:c.hp,sh:0,aim:0,alive:true,resp:0,inv:1.5,cd:{b:0,q:0,e:0,r:0,d:0},mcd:{b:1,q:1,e:1,r:1,d:1},
   st:{slow:[1,0],vuln:[1,0],root:0,burn:[0,0]},bf:{sp:0,pw:0,en:0},dash:null,bt:0,burnSrc:null,atkT:0,hz:0,
   inp:{mx:0,my:0,aim:0,atk:0,q:0,e:0,r:0,d:0},kills:0,deaths:0,dmg:0,cr:0,left:false};
  this.ps.set(p.id,p);this.place(p,i);this.rsc[p.id]=0;
 }
 place(p,i){const s=this.map.spawns[(i??Math.floor(Math.random()*10))%10];const f=this.free(s.x,s.y);p.x=f.x;p.y=f.y}
 free(x,y){for(let k=0;k<40;k++){const a=k*2.4,d=k*6,nx=cl(x+Math.cos(a)*d,PR+2,W-PR-2),ny=cl(y+Math.sin(a)*d,PR+2,H-PR-2);if(!this.blk(nx,ny,20))return{x:nx,y:ny}}return{x:640,y:60}}
 blk(x,y,r){for(const o of this.map.obs){const cx=cl(x,o.x,o.x+o.w),cy=cl(y,o.y,o.y+o.h);if((x-cx)**2+(y-cy)**2<r*r)return true}return false}
 move(e,dx,dy,r=PR){const nx=e.x+dx;if(nx>r&&nx<W-r&&!this.blk(nx,e.y,r))e.x=nx;const ny=e.y+dy;if(ny>r&&ny<H-r&&!this.blk(e.x,ny,r))e.y=ny}
 mkCr(s,i){const d=A.CREATURES[s.t];const f=this.free(s.x,s.y);return{id:'c'+i,i,t:s.t,hx:f.x,hy:f.y,x:f.x,y:f.y,hp:d.hp,mh:d.hp,r:d.r,alive:true,resp:0,isCr:true,wt:0,vx:0,vy:0}}
 /* variaciones: estilo del básico, elemento y postura (con ventajas y desventajas) */
 mod(p,slot){const b=slot==='d'?A.DASH:(slot==='b'?p.c.b:p.c[slot]);const s={...b},v=p.v;
  if(slot==='b'){const m=[[1,1,1],[.6,.6,.9],[1.7,1.6,1.1]][v.s|0]||[1,1,1];s.dmg*=m[0];s.cd*=m[1];if(s.range)s.range*=m[2];if(s.life)s.life*=m[2]}
  else if(slot!=='d'&&s.dmg){s.dmg*=v.m?.8:1.15}
  if(s.dmg&&v.e){s.dmg*=.92;s.el=v.e;if(v.e===3&&s.k==='proj'){s.speed*=1.2;s.pierce=(s.pierce||0)+1}}
  s.stance=slot!=='d'&&v.m;return s}
 cast(p,slot){if(p.cd[slot]>0||!p.alive||p.dash)return;const s=this.mod(p,slot);const a=p.aim;
  p.cd[slot]=s.cd;p.mcd[slot]=s.cd;p.atkT=.25;this.ev.push({e:'s',c:p.ci,k:slot,x:r1(p.x),y:r1(p.y)});
  const cs=Math.cos(a),sn=Math.sin(a),ex={slow:s.slow,vuln:s.vuln,root:s.root,el:s.el};
  switch(s.k){
   case 'proj':{const n=s.n||1;for(let i=0;i<n;i++){const an=a+(i-(n-1)/2)*(s.spread||0);this.pj.push({x:p.x+cs*18,y:p.y+sn*18,vx:Math.cos(an)*s.speed,vy:Math.sin(an)*s.speed,life:s.life,r:s.r,dmg:s.dmg,own:p,team:p.team,col:s.col,pierce:s.pierce||0,expl:s.expl,hit:new Set(),ex})}break}
   case 'melee':this.targets(p,t=>{const d=Math.hypot(t.x-p.x,t.y-p.y);if(d>s.range+(t.r||PR))return;const ang=Math.atan2(t.y-p.y,t.x-p.x);const df=Math.abs(Math.atan2(Math.sin(ang-a),Math.cos(ang-a)));if(d<30||df<s.arc/2)this.hit(p,t,s.dmg,ex)});this.ev.push({e:'fx',k:'slash',x:r1(p.x+cs*30),y:r1(p.y+sn*30),a:r1(a),r:s.range,c:A.ELCOL[s.el||0]});break;
   case 'dash':this.startDash(p,a,s.dist,s.t,s.dmg,ex);break;
   case 'tp':{let x=p.x,y=p.y;for(let d=8;d<=s.dist;d+=8){const nx=p.x+cs*d,ny=p.y+sn*d;if(nx<PR||nx>W-PR||ny<PR||ny>H-PR||this.blk(nx,ny,PR))break;x=nx;y=ny}this.ev.push({e:'fx',k:'tp',x:r1(p.x),y:r1(p.y),c:p.c.col[1]});p.x=x;p.y=y;this.ev.push({e:'fx',k:'tp',x:r1(x),y:r1(y),c:p.c.col[1]});break}
   case 'aoe':{let x=p.x,y=p.y;if(!s.self){const d=Math.min(s.reach||250,330);x=cl(p.x+cs*d,20,W-20);y=cl(p.y+sn*d,20,H-20)}
    this.zn.push({x,y,r:s.rad,delay:s.delay||0,dur:s.dur||0,tk:0,dmg:s.dmg||0,heal:s.heal,shz:s.shz,own:p,team:p.team,ex,pull:s.pull,fo:s.follow?p:null,col:s.el?A.ELCOL[s.el]:p.c.col[1],pul:false});break}
   case 'trap':this.tr.push({x:p.x+cs*50,y:p.y+sn*50,arm:.6,life:25,dmg:s.dmg,own:p,team:p.team,ex,col:p.c.col[1]});break;
  }
  if(s.sh)this.addSh(p,s.sh);if(s.hl)this.heal(p,s.hl);if(s.bf)this.buff(p,s.bf);
  if(s.shAll||s.bfAll)for(const q of this.ps.values())if(q.alive&&q.team===p.team&&q!==p&&Math.hypot(q.x-p.x,q.y-p.y)<=(s.rad||150)){if(s.shAll)this.addSh(q,s.shAll);if(s.bfAll)this.buff(q,s.bfAll)}
  if(s.stance&&slot!=='b')this.addSh(p,20)}
 startDash(p,a,dist,t,dmg,ex){p.dash={vx:Math.cos(a)*dist/t,vy:Math.sin(a)*dist/t,t,dmg:dmg||0,hit:new Set(),ex};this.ev.push({e:'fx',k:'tp',x:r1(p.x),y:r1(p.y),c:p.c.col[1]})}
 targets(src,fn){for(const q of this.ps.values())if(q.alive&&q.team!==src.team&&!q.left)fn(q);for(const c of this.cr)if(c.alive)fn(c)}
 addSh(p,n){p.sh=Math.min(A.SHCAP,p.sh+n)}
 heal(p,n){const o=p.hp;p.hp=Math.min(p.c.hp,p.hp+n);if(p.hp>o)this.ev.push({e:'d',x:r1(p.x),y:r1(p.y-20),v:Math.round(p.hp-o),c:1})}
 buff(p,b){for(const k in b)p.bf[k]=Math.min(A.BUFFCAP,Math.max(p.bf[k],b[k]))} // refresca, nunca acumula
 hit(src,t,dmg,ex={}){
  if(t.isCr){this.hurtCr(src,t,dmg);return}
  const real=this.hurt(src,t,dmg);if(real<=0&&dmg>0)return;
  if(ex.slow&&t.st.slow[1]<ex.slow[1])t.st.slow=ex.slow.slice();
  if(ex.vuln)t.st.vuln=ex.vuln.slice();if(ex.root)t.st.root=Math.max(t.st.root,ex.root);
  if(ex.el===1){t.st.burn=[5,3];t.burnSrc=src}if(ex.el===2)t.st.slow=[.65,1.5];if(ex.el===4&&src)this.heal(src,real*.12)}
 hurt(src,t,amt){if(!t.alive||t.inv>0||t.left)return 0;
  let a=amt*(src&&src.bf&&src.bf.pw>0?1.3:1)*(t.st.vuln[1]>0?t.st.vuln[0]:1);a=Math.round(a);if(a<=0)return 0;
  const ab=Math.min(t.sh,a);t.sh-=ab;t.hp-=a-ab;if(src)src.dmg+=a;
  this.ev.push({e:'d',x:r1(t.x),y:r1(t.y-20),v:a,c:0,id:t.id});
  if(t.hp<=0){t.hp=0;this.kill(src,t)}return a}
 hurtCr(src,c,a){a=Math.round(a*(src&&src.bf&&src.bf.pw>0?1.3:1));c.hp-=a;this.ev.push({e:'d',x:r1(c.x),y:r1(c.y-18),v:a,c:3});if(c.hp>0||!src)return;
  c.alive=false;c.resp=A.CREATURES[c.t].respawn;const rw=A.CREATURES[c.t].rew;src.cr++;
  if(rw.heal)this.heal(src,rw.heal);if(rw.sh)this.addSh(src,rw.sh);if(rw.bf)this.buff(src,rw.bf);
  this.ev.push({e:'cr',p:src.id,t:c.t,x:r1(c.x),y:r1(c.y)})}
 kill(src,t){t.alive=false;t.deaths++;t.dash=null;t.resp=this.md.resp||-1;this.ev.push({e:'k',a:src?src.name:'☠',b:t.name,x:r1(t.x),y:r1(t.y),c:t.c.col[0]});
  if(src&&src!==t){src.kills++;if(this.mode==='teams')this.ts[src.team]++}}
 respawn(p){p.alive=true;p.hp=p.c.hp;p.sh=0;p.inv=2;p.st={slow:[1,0],vuln:[1,0],root:0,burn:[0,0]};this.place(p)}
 tick(dt){if(this.over)return;
  if(this.pause>0){this.pause-=dt;if(this.pause<=0)this.newRound();return}
  this.t+=dt;this.timeLeft-=dt;
  for(const p of this.ps.values())this.upP(p,dt);
  this.upPj(dt);this.upZn(dt);this.upTr(dt);this.upCr(dt);this.upCap(dt);this.check()}
 upP(p,dt){if(p.left)return;
  for(const k in p.cd)p.cd[k]=Math.max(0,p.cd[k]-dt*(p.bf.en>0?1.6:1));
  for(const k in p.bf)p.bf[k]=Math.max(0,p.bf[k]-dt);p.inv=Math.max(0,p.inv-dt);p.atkT=Math.max(0,p.atkT-dt);
  for(const k of['slow','vuln','burn'])if(p.st[k][1]>0)p.st[k][1]-=dt;p.st.root=Math.max(0,p.st.root-dt);
  if(p.st.burn[1]>0){p.bt+=dt;if(p.bt>=.5){p.bt=0;this.hurt(p.burnSrc,p,p.st.burn[0]*.5)}}
  if(!p.alive){if(p.resp>0){p.resp-=dt;if(p.resp<=0)this.respawn(p)}return}
  const i=p.inp;p.aim=i.aim;
  if(i.atk)this.cast(p,'b');if(i.q)this.cast(p,'q');if(i.e)this.cast(p,'e');if(i.r)this.cast(p,'r');
  if(i.d&&p.cd.d<=0&&!p.dash){const s=this.mod(p,'d');p.cd.d=s.cd;p.mcd.d=s.cd;this.startDash(p,(i.mx||i.my)?Math.atan2(i.my,i.mx):p.aim,s.dist,s.t,0,{})}
  if(p.dash){const d=p.dash;const st=Math.ceil(dt*Math.hypot(d.vx,d.vy)/10);for(let k=0;k<st;k++)this.move(p,d.vx*dt/st,d.vy*dt/st);
   if(d.dmg)this.targets(p,t=>{if(!d.hit.has(t)&&Math.hypot(t.x-p.x,t.y-p.y)<PR+(t.r||PR)+8){d.hit.add(t);this.hit(p,t,d.dmg,d.ex)}});
   d.t-=dt;if(d.t<=0)p.dash=null;return}
  let mx=num(i.mx),my=num(i.my);const l=Math.hypot(mx,my);if(l>1){mx/=l;my/=l}
  let hz=1;for(const h of this.map.haz)if(p.x>h.x&&p.x<h.x+h.w&&p.y>h.y&&p.y<h.y+h.h){const d=A.HAZ[h.k];hz=Math.min(hz,d.slow);if(d.dps){p.hz+=dt;if(p.hz>=.5){p.hz=0;this.hurt(null,p,d.dps*.5)}}}
  const sp=p.c.spd*(p.bf.sp>0?1.35:1)*(p.st.slow[1]>0?p.st.slow[0]:1)*hz*(p.st.root>0?0:1);this.move(p,mx*sp*dt,my*sp*dt)}
 upPj(dt){this.pj=this.pj.filter(b=>{b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;let dead=b.life<=0||b.x<0||b.x>W||b.y<0||b.y>H||this.blk(b.x,b.y,b.r*.6);
  if(!dead)this.targets(b.own,t=>{if(dead)return;if(b.hit.has(t))return;if(Math.hypot(t.x-b.x,t.y-b.y)<(t.r||PR)+b.r){b.hit.add(t);if(!b.expl)this.hit(b.own,t,b.dmg,b.ex);if(b.pierce>0)b.pierce--;else dead=true}});
  if(dead&&b.expl)this.zn.push({x:b.x,y:b.y,r:b.expl,delay:0,dur:0,tk:0,dmg:b.dmg,own:b.own,team:b.team,ex:b.ex,col:b.col});
  return!dead})}
 pulse(z){this.ev.push({e:'fx',k:'boom',x:r1(z.x),y:r1(z.y),r:z.r,c:z.col});
  for(const q of this.ps.values()){if(!q.alive||q.left)continue;const d=Math.hypot(q.x-z.x,q.y-z.y);if(d>z.r+PR)continue;
   if(q.team!==z.team){if(z.dmg||z.ex.slow||z.ex.root||z.ex.vuln)this.hit(z.own,q,z.dmg,z.ex);if(z.pull&&d>20){const a=Math.atan2(z.y-q.y,z.x-q.x);this.move(q,Math.cos(a)*70,Math.sin(a)*70)}}
   else{if(z.heal)this.heal(q,z.heal);if(z.shz)this.addSh(q,z.shz)}}
  if(z.dmg)for(const c of this.cr)if(c.alive&&Math.hypot(c.x-z.x,c.y-z.y)<z.r+c.r)this.hurtCr(z.own,c,z.dmg)}
 upZn(dt){this.zn=this.zn.filter(z=>{if(z.fo){z.x=z.fo.x;z.y=z.fo.y}
  if(z.delay>0){z.delay-=dt;if(z.delay>0)return true}
  if(!z.pul){z.pul=true;z.tk=.5;this.pulse(z);return z.dur>0}
  z.dur-=dt;z.tk-=dt;if(z.tk<=0){z.tk=.5;this.pulse(z)}return z.dur>0})}
 upTr(dt){this.tr=this.tr.filter(t=>{t.arm-=dt;t.life-=dt;if(t.arm>0)return true;let go=false;
  for(const q of this.ps.values())if(q.alive&&q.team!==t.team&&Math.hypot(q.x-t.x,q.y-t.y)<28){go=true;this.hit(t.own,q,t.dmg,t.ex)}
  if(go)this.ev.push({e:'fx',k:'boom',x:r1(t.x),y:r1(t.y),r:30,c:t.col});return!go&&t.life>0})}
 upCr(dt){for(const c of this.cr){if(!c.alive){c.resp-=dt;if(c.resp<=0){Object.assign(c,this.mkCr({x:c.hx,y:c.hy,t:c.t},c.i))}continue}
  c.wt-=dt;if(c.wt<=0){c.wt=rnd(.8,2);const a=rnd(0,6.28);c.vx=Math.cos(a)*28;c.vy=Math.sin(a)*28}
  const nx=c.x+c.vx*dt,ny=c.y+c.vy*dt;if(Math.hypot(nx-c.hx,ny-c.hy)<35&&!this.blk(nx,ny,c.r)){c.x=nx;c.y=ny}}}
 upCap(dt){if(this.mode!=='capture')return;this.map.caps.forEach((z,i)=>{const tm=new Set();for(const p of this.ps.values())if(p.alive&&Math.hypot(p.x-z.x,p.y-z.y)<z.r)tm.add(p.team);
  if(tm.size===1)this.cp[i]=[...tm][0];if(this.cp[i]>=0)this.ts[this.cp[i]]+=dt*.7})}
 alive(){return[...this.ps.values()].filter(p=>p.alive&&!p.left)}
 check(){const m=this.mode,al=this.alive();
  if(!this.solo&&[...this.ps.values()].filter(p=>!p.left).length<2)return this.finish(al.map(p=>p.id),'Rivales desconectados');
  if(m==='ffa'){for(const p of this.ps.values())if(p.kills>=this.md.goal)return this.finish([p.id])}
  else if(m==='teams'||m==='capture'){for(let t=0;t<2;t++)if(this.ts[t]>=this.md.goal)return this.finish(this.team(t))}
  else if(m==='survival'){if(!this.solo&&al.length<=1)return this.finish(al.map(p=>p.id))}
  else if(m==='rounds'){if((!this.solo&&al.length<=1)||this.timeLeft<=0)return this.endRound(al)}
  if(this.timeLeft<=0&&m!=='rounds')this.timeUp()}
 team(t){return[...this.ps.values()].filter(p=>p.team===t&&!p.left).map(p=>p.id)}
 timeUp(){const m=this.mode,P=[...this.ps.values()];
  if(m==='teams'||m==='capture')return this.finish(this.team(this.ts[0]>=this.ts[1]?0:1));
  if(m==='survival'){const b=this.alive().sort((a,b)=>b.hp-a.hp)[0];return this.finish(b?[b.id]:[])}
  const b=P.sort((a,b)=>b.kills-a.kills)[0];this.finish(b?[b.id]:[])}
 endRound(al){const w=al.sort((a,b)=>b.hp-a.hp)[0];if(w){this.rsc[w.id]++;this.ev.push({e:'msg',t:'RONDA PARA '+w.name.toUpperCase()});if(this.rsc[w.id]>=this.md.goal)return this.finish([w.id])}
  this.pause=3;this.timeLeft=this.md.time}
 newRound(){this.round++;this.pj=[];this.zn=[];this.tr=[];let i=0;for(const p of this.ps.values()){if(p.left)continue;p.alive=true;p.hp=p.c.hp;p.sh=0;p.inv=1.5;p.st={slow:[1,0],vuln:[1,0],root:0,burn:[0,0]};p.bf={sp:0,pw:0,en:0};for(const k in p.cd)p.cd[k]=0;this.place(p,i++)}
  this.ev.push({e:'msg',t:'RONDA '+this.round})}
 finish(win,reason){if(this.over)return;this.over=true;const P=[...this.ps.values()];
  const rank=P.map(p=>{const w=win.includes(p.id);return{id:p.id,name:p.name,ci:p.ci,kills:p.kills,deaths:p.deaths,dmg:Math.round(p.dmg),cr:p.cr,win:w,team:p.team,xp:15+p.kills*6+p.cr*2+(w?40:0),coins:10+p.kills*3+(w?25:0)}}).sort((a,b)=>b.win-a.win||b.kills-a.kills);
  this.onEnd({rank,win,reason,mode:this.mode,ts:this.ts.map(Math.floor),map:this.map.id})}
 setInput(id,i){const p=this.ps.get(id);if(!p||!i)return;p.inp={mx:cl(num(i.mx),-1,1),my:cl(num(i.my),-1,1),aim:num(i.aim),atk:!!i.atk,q:!!i.q,e:!!i.e,r:!!i.r,d:!!i.d}}
 leave(id){const p=this.ps.get(id);if(p){p.left=true;p.alive=false;p.inp={mx:0,my:0,aim:0}}}
 snap(){const ev=this.ev;this.ev=[];const sc={};for(const p of this.ps.values())sc[p.id]=this.mode==='rounds'?this.rsc[p.id]:p.kills;
  return{tm:Math.max(0,Math.ceil(this.timeLeft)),rd:this.round,m:this.mode,ts:this.ts.map(Math.floor),cp:this.cp,sc,pz:this.pause>0,
   ps:[...this.ps.values()].map(p=>({i:p.id,x:r1(p.x),y:r1(p.y),h:Math.ceil(p.hp),m:p.c.hp,s:Math.ceil(p.sh),a:r1(p.aim),al:p.alive,l:p.left,iv:p.inv>0,rs:Math.ceil(p.resp),
    b:[r1(p.bf.sp),r1(p.bf.pw),r1(p.bf.en)],cd:['b','q','e','r','d'].map(k=>r1(p.cd[k])),mc:['b','q','e','r','d'].map(k=>r1(p.mcd[k])),at:p.atkT>0,sl:p.st.slow[1]>0,rt:p.st.root>0,bn:p.st.burn[1]>0})),
   pj:this.pj.map(b=>[Math.round(b.x),Math.round(b.y),b.r,b.col,r1(Math.atan2(b.vy,b.vx))]),
   zn:this.zn.map(z=>[Math.round(z.x),Math.round(z.y),z.r,z.col,z.delay>0?1:0,z.heal||z.shz?1:0]),
   tr:this.tr.map(t=>[Math.round(t.x),Math.round(t.y),t.arm>0?0:1]),
   cr:this.cr.filter(c=>c.alive).map(c=>({i:c.id,t:c.t,x:r1(c.x),y:r1(c.y),h:c.hp,m:c.mh})),ev}}
}
module.exports={Game};
