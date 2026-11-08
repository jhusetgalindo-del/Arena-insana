const socket=io(),$=id=>document.getElementById(id);
const chars=[["guerrero","⚔️","Guerrero"],["mago","🧙","Mago"],["arquera","🏹","Arquera"],["guardian","🛡️","Guardián"],["sombra","🥷","Sombra"],["druida","🌿","Druida"]];
const maps=[["bosque","🌲","Bosque"],["volcan","🌋","Volcán"],["hielo","❄️","Hielo"],["ruinas","🏛️","Ruinas"],["desierto","🏜️","Desierto"],["castillo","🏰","Castillo"]];
let character="guerrero",map="bosque",players=[],me="",room="",keys={},touch="",lastMove=0;
$("chars").innerHTML=chars.map(c=>`<button class="card ${c[0]===character?"selected":""}" data-char="${c[0]}"><span>${c[1]}</span>${c[2]}</button>`).join("");
$("maps").innerHTML=maps.map(m=>`<button class="card ${m[0]===map?"selected":""}" data-map="${m[0]}"><span>${m[1]}</span>${m[2]}</button>`).join("");
document.querySelectorAll("[data-char]").forEach(b=>b.onclick=()=>{character=b.dataset.char;document.querySelectorAll("[data-char]").forEach(x=>x.classList.toggle("selected",x===b));if(room)socket.emit("changeCharacter",character)});
document.querySelectorAll("[data-map]").forEach(b=>b.onclick=()=>{map=b.dataset.map;document.querySelectorAll("[data-map]").forEach(x=>x.classList.toggle("selected",x===b))});
const enter=r=>{if(!r.ok){$("msg").textContent=r.error;return}room=r.code;me=r.self;players=r.state.players;map=r.state.map;$("lobby").classList.add("hidden");$("game").classList.remove("hidden");$("room").textContent=room;draw()};
$("create").onclick=()=>socket.emit("createRoom",{name:$("name").value,character,map},enter);
$("join").onclick=()=>socket.emit("joinRoom",{name:$("name").value,character,code:$("code").value},enter);
socket.on("state",s=>{players=s.players;map=s.map;$("count").textContent=players.length+"/10";$("mapPick").value=map;$("roster").textContent="Puntuaciones: "+players.map(p=>p.name+" "+p.score).join(" · ");draw()});
$("mapPick").onchange=e=>socket.emit("changeMap",e.target.value);
$("copy").onclick=()=>navigator.clipboard?.writeText(room).then(()=>$("copy").textContent="COPIADO").catch(()=>alert("Código de sala: "+room));
$("exit").onclick=()=>location.reload();
function attack(){socket.emit("attack")}function ability(){socket.emit("ability")}
$("hit").onclick=attack;$("skill").onclick=ability;
document.onkeydown=e=>{keys[e.key.toLowerCase()]=true;if(e.code==="Space"){e.preventDefault();attack()}if(e.key.toLowerCase()==="e")ability()};
document.onkeyup=e=>keys[e.key.toLowerCase()]=false;
document.querySelectorAll("[data-dir]").forEach(b=>{b.onpointerdown=e=>{e.preventDefault();touch=b.dataset.dir};b.onpointerup=b.onpointerleave=()=>touch=""});
setInterval(()=>{const p=players.find(x=>x.id===me);if(!p)return;let x=0,y=0;if(keys.a||keys.arrowleft||touch==="left")x=-1;if(keys.d||keys.arrowright||touch==="right")x=1;if(keys.w||keys.arrowup||touch==="up")y=-1;if(keys.s||keys.arrowdown||touch==="down")y=1;if(x||y){let n=Math.hypot(x,y);socket.emit("move",{x:p.x+x/n*5,y:p.y+y/n*5,facing:x||p.facing})}},55);
const cv=$("field"),c=cv.getContext("2d"),pal={bosque:["#173e31","#286346","#44824d","#9dc66b"],volcan:["#351b2b","#712b32","#b44932","#f2a34a"],hielo:["#18384e","#28647b","#5da6bd","#d9f5ef"],ruinas:["#29213c","#53446e","#8d78a0","#d7b96f"],desierto:["#68452b","#a96d35","#d49a4c","#f1d18a"],castillo:["#171a2e","#34364f","#5e5374","#bc7890"]};
function draw(){if(!c)return;let p=pal[map]||pal.bosque;c.fillStyle=p[0];c.fillRect(0,0,800,500);for(let y=0;y<500;y+=30)for(let x=0;x<800;x+=30){c.fillStyle=((x+y)/30)%3===0?p[1]:p[2];c.fillRect(x+((x*y)%7),y+((x+y)%8),5,4)}for(let i=0;i<17;i++){let x=(i*97+23)%780,y=(i*139+31)%480;c.fillStyle=p[3];if(map==="bosque"){c.fillRect(x,y,7,25);c.fillRect(x-9,y-8,25,16)}else if(map==="volcan"){c.fillRect(x,y,18,5);c.fillRect(x+6,y-8,6,20)}else if(map==="hielo"){c.fillRect(x,y,5,27);c.fillRect(x-5,y+8,15,4)}else{c.fillRect(x,y,24,7);c.fillRect(x+5,y-14,6,30)}}c.strokeStyle=p[3];c.lineWidth=5;c.strokeRect(8,8,784,484);
players.forEach(q=>{let ch=chars.find(v=>v[0]===q.character)||chars[0];c.fillStyle="#12101d";c.fillRect(q.x-11,q.y-3,22,22);c.fillStyle=q.id===me?"#f1c05b":"#b99be5";c.fillRect(q.x-9,q.y-19,18,17);c.fillStyle="#24192c";c.fillRect(q.x-5,q.y-14,3,3);c.fillRect(q.x+3,q.y-14,3,3);c.font="20px sans-serif";c.textAlign="center";c.fillText(ch[1],q.x,q.y-23);c.font="bold 13px Arial";c.fillStyle="#fff";c.fillText(q.name,q.x,q.y-35);c.fillStyle="#351d2a";c.fillRect(q.x-17,q.y-43,34,5);c.fillStyle="#70e08b";c.fillRect(q.x-17,q.y-43,34*q.hp/100,5);if(q.attackUntil>Date.now()){c.strokeStyle="#ffe47b";c.lineWidth=5;c.beginPath();c.arc(q.x+q.facing*20,q.y,25,-1,1);c.stroke()}})}
setInterval(draw,100);
