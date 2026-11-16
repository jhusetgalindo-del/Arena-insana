/* INTERFAZ: pantallas, perfil/progresión (localStorage), ajustes y controles configurables. */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const Prof={d:null,load(){try{this.d=JSON.parse(localStorage.getItem('ai_prof'))}catch(e){}
  this.d=Object.assign({name:'',xp:0,coins:0,wins:0,losses:0,kills:0,deaths:0,matches:0,hist:[],skins:{},fx:[0],char:'kael',v:{s:0,e:0,m:0},skin:0,fxSel:0},this.d||{});return this.d},
 save(){localStorage.setItem('ai_prof',JSON.stringify(this.d))},lvl(){return Math.floor(Math.sqrt(this.d.xp/50))+1},
 owns(ci,s){return s===0||(this.d.skins[ci]||[]).includes(s)}};
const Cfg={d:{q:'Q',e:'E',r:'R',d:'SHIFT',vol:.5,touch:'auto',sens:1},load(){try{Object.assign(this.d,JSON.parse(localStorage.getItem('ai_cfg')))}catch(e){}return this.d},save(){localStorage.setItem('ai_cfg',JSON.stringify(this.d))}};
const UI={
 show(id){$$('.screen').forEach(s=>s.classList.toggle('on',s.id===id));Snd.ui&&Snd.ev('ui')},
 toast(t,c){const d=document.createElement('div');d.className='toast';d.textContent=t;if(c)d.style.borderColor=c;$('#toasts').appendChild(d);setTimeout(()=>d.remove(),3500)},
 charCard(c,i,sel,locked){return`<div class="card ${sel?'sel':''} ${locked?'lock':''}" data-i="${i}"><canvas width="44" height="52" data-ci="${i}"></canvas><b>${c.n}</b><small>${AI.ROLES[c.role].ic} ${AI.ROLES[c.role].n}</small>${locked?`<em>Nivel ${c.lv}</em>`:`<small>❤${c.hp} ⚡${c.spd}</small>`}</div>`},
 paintCanvases(root,skin){root.querySelectorAll('canvas[data-ci]').forEach(cv=>{const ci=+cv.dataset.ci,x=cv.getContext('2d');x.clearRect(0,0,44,52);x.drawImage(Sprites.char(ci,skin||0,0),0,0)})},
 skillHtml(c){const s=(k,n)=>`<li><b>${k}</b> ${n}</li>`;return`<ul>${s('Clic','Ataque básico ('+c.b.k+')')}${s('Q',c.q.n)}${s('E',c.e.n)}${s('R',c.r.n)}${s('Shift','Esquiva')}</ul>`}
};
