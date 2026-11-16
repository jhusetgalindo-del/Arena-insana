/* PERSONAJES, ROLES Y HABILIDADES (compartido cliente/servidor).
   Skill kinds: proj, melee, dash, tp, aoe, util. Extras: sh (escudo propio), shAll+rad, hl (cura propia), bf (buff propio), bfAll. */
(function(g){const A=g.AI=g.AI||{};
A.ROLES={guerrero:{n:'Guerrero',ic:'⚔'},mago:{n:'Mago',ic:'✦'},asesino:{n:'Asesino',ic:'†'},tanque:{n:'Tanque',ic:'⛨'},arquero:{n:'Arquero',ic:'➶'},soporte:{n:'Soporte',ic:'✚'}};
A.STYLES=['Equilibrado','Rápido (menos daño, más cadencia)','Pesado (más daño y alcance, lento)'];
A.ELEMS=['Neutro','Fuego (quemadura)','Hielo (ralentiza)','Rayo (proyectil veloz+perfora)','Naturaleza (roba vida)'];
A.ELCOL=['#fff','#ff8a3d','#8ee8ff','#ffe94a','#7be05a'];
A.STANCES=['Ofensiva (+15% daño)','Defensiva (-20% daño, +20 escudo al lanzar)'];
A.SKINS=[{n:'Original',cost:0},{n:'Invertido',cost:100},{n:'Neón',cost:200},{n:'Dorado',cost:300}];
A.FX=[{n:'Ninguno',cost:0},{n:'Chispas',cost:150},{n:'Brasas',cost:250}];
const C=A.CHARS=[
{id:'kael',n:'Kael el Cruzado',role:'guerrero',hp:130,spd:170,lv:1,col:['#aab3c2','#c23b3b','#6b4423'],acc:'sword',x:'cape',
 b:{k:'melee',cd:.45,dmg:16,range:58,arc:1.6},q:{n:'Embestida',k:'dash',cd:5,dist:170,dmg:20,t:.2},e:{n:'Rompeguardia',k:'melee',cd:7,dmg:26,range:72,arc:2.4,vuln:[1.3,4]},r:{n:'Tajo Furioso',k:'aoe',self:1,cd:18,dmg:55,rad:115,delay:.15}},
{id:'brunhild',n:'Brunhild Martillo',role:'guerrero',hp:150,spd:150,lv:2,col:['#8a5a2b','#e0a030','#3b2a1a'],acc:'hammer',x:'horns',
 b:{k:'melee',cd:.8,dmg:28,range:62,arc:1.3},q:{n:'Golpe Sísmico',k:'aoe',cd:6,dmg:30,rad:85,delay:.4,reach:150,slow:[.5,2]},e:{n:'Salto Brutal',k:'dash',cd:7,dist:210,dmg:18,t:.25},r:{n:'Cataclismo',k:'aoe',cd:20,dmg:70,rad:140,delay:.8,reach:200,root:1.3}},
{id:'ignis',n:'Ignis Piromante',role:'mago',hp:90,spd:160,lv:1,col:['#d6431f','#ffcf40','#4a1a12'],acc:'staff',x:'hat',
 b:{k:'proj',cd:.5,dmg:14,speed:430,life:1,r:7,col:'#ff8a3d'},q:{n:'Bola de Fuego',k:'aoe',cd:5,dmg:35,rad:75,delay:.45,reach:280},e:{n:'Muro de Fuego',k:'aoe',cd:9,dmg:8,rad:60,delay:.3,reach:220,dur:3},r:{n:'Meteoro',k:'aoe',cd:20,dmg:80,rad:135,delay:1,reach:330}},
{id:'nyx',n:'Nyx Escarcha',role:'mago',hp:95,spd:160,lv:3,col:['#4aa8d8','#e8fbff','#23405a'],acc:'orb',x:'hat',
 b:{k:'proj',cd:.45,dmg:11,speed:450,life:1,r:6,col:'#aef',slow:[.7,1]},q:{n:'Lanzas de Hielo',k:'proj',cd:5,n:3,spread:.25,dmg:14,speed:480,life:.9,r:6,col:'#cff',slow:[.6,1.5]},e:{n:'Zona Helada',k:'aoe',cd:9,dmg:5,rad:95,delay:.3,reach:240,dur:4,slow:[.45,1]},r:{n:'Ventisca',k:'aoe',self:1,cd:19,dmg:40,rad:165,delay:.3,root:1.2}},
{id:'vex',n:'Vex Sombra',role:'asesino',hp:95,spd:200,lv:1,col:['#3b2f55','#b04bff','#111'],acc:'dagger',x:'scarf',
 b:{k:'melee',cd:.3,dmg:9,range:42,arc:1.8},q:{n:'Parpadeo',k:'tp',cd:5,dist:230},e:{n:'Ráfaga',k:'dash',cd:6,dist:165,dmg:25,t:.14},r:{n:'Danza de Cuchillas',k:'aoe',self:1,follow:1,cd:16,dmg:13,rad:75,delay:0,dur:1.4}},
{id:'zora',n:'Zora Veneno',role:'asesino',hp:90,spd:195,lv:4,col:['#2e8a5a','#d4ff4a','#12301f'],acc:'claws',x:'eyepatch',
 b:{k:'proj',cd:.35,dmg:10,speed:540,life:.5,r:5,col:'#9f4'},q:{n:'Paso Venenoso',k:'tp',cd:6,dist:170,sh:15},e:{n:'Daga Marcadora',k:'proj',cd:6,dmg:14,speed:600,life:.8,r:6,col:'#f6f',vuln:[1.3,4],slow:[.7,2]},r:{n:'Ejecución',k:'dash',cd:17,dist:270,dmg:60,t:.18}},
{id:'gorund',n:'Gorund Roca',role:'tanque',hp:220,spd:135,lv:1,col:['#6b6b7a','#d4a017','#2b2b33'],acc:'greatshield',x:'beard',
 b:{k:'melee',cd:.6,dmg:12,range:52,arc:1.5},q:{n:'Grito Provocador',k:'aoe',self:1,cd:10,dmg:5,rad:160,delay:0,pull:1,slow:[.6,2],sh:30},e:{n:'Embestida',k:'dash',cd:8,dist:155,dmg:18,t:.22},r:{n:'Muro Vivo',k:'aoe',self:1,cd:20,dmg:30,rad:105,delay:.2,sh:60}},
{id:'aegis',n:'Aegis Centinela',role:'tanque',hp:200,spd:140,lv:5,col:['#3d7fd1','#f2f2f2','#17315a'],acc:'shield',x:'helm',
 b:{k:'melee',cd:.5,dmg:10,range:48,arc:1.4,slow:[.7,.8]},q:{n:'Bastión',k:'util',cd:9,sh:50,bf:{sp:3}},e:{n:'Desafío',k:'aoe',self:1,cd:11,dmg:8,rad:140,delay:0,pull:1,slow:[.6,2]},r:{n:'Fortaleza',k:'aoe',self:1,follow:1,cd:22,dmg:0,rad:115,delay:0,dur:4,shz:8}},
{id:'lyra',n:'Lyra Cazaestrellas',role:'arquero',hp:100,spd:175,lv:1,col:['#2f9e5e','#f5e6a8','#5a3a1a'],acc:'bow',x:'feather',
 b:{k:'proj',cd:.4,dmg:12,speed:620,life:.9,r:5,col:'#f5e6a8'},q:{n:'Disparo Cargado',k:'proj',cd:4.5,dmg:45,speed:850,life:1.1,r:6,pierce:2,col:'#fff'},e:{n:'Abanico de Flechas',k:'proj',cd:7,n:5,spread:.18,dmg:10,speed:600,life:.8,r:5,col:'#f5e6a8'},r:{n:'Lluvia de Flechas',k:'aoe',cd:19,dmg:14,rad:105,delay:.5,reach:310,dur:3}},
{id:'fenn',n:'Fenn Trampero',role:'arquero',hp:105,spd:170,lv:6,col:['#8a6a3a','#e07b39','#33261a'],acc:'crossbow',x:'hood',
 b:{k:'proj',cd:.6,dmg:18,speed:580,life:.8,r:6,col:'#ddd'},q:{n:'Trampa de Cepo',k:'trap',cd:7,dmg:25,root:1.4},e:{n:'Trampa Pegajosa',k:'trap',cd:9,dmg:12,slow:[.4,3],vuln:[1.25,4]},r:{n:'Virote Explosivo',k:'proj',cd:16,dmg:40,speed:460,life:1,r:8,expl:95,col:'#f84'}},
{id:'mira',n:'Mira Lumínica',role:'soporte',hp:105,spd:165,lv:1,col:['#f4f0e0','#ffd84a','#c9a24a'],acc:'wand',x:'halo',
 b:{k:'proj',cd:.5,dmg:10,speed:400,life:.9,r:6,col:'#fff59a'},q:{n:'Sanar',k:'aoe',self:1,cd:8,dmg:0,rad:125,delay:0,heal:35},e:{n:'Égida',k:'util',cd:10,shAll:30,rad:150,sh:30,bfAll:{sp:3}},r:{n:'Santuario',k:'aoe',self:1,follow:1,cd:22,dmg:0,rad:135,delay:0,dur:5,heal:12}},
{id:'oro',n:'Oro Hechicero',role:'soporte',hp:100,spd:165,lv:7,col:['#7a3f9e','#4fe0c0','#2a1540'],acc:'lantern',x:'mask',
 b:{k:'proj',cd:.5,dmg:11,speed:410,life:.9,r:6,col:'#c6f',vuln:[1.1,2]},q:{n:'Maldición',k:'aoe',cd:9,dmg:4,rad:105,delay:.4,reach:240,dur:4,vuln:[1.3,1],slow:[.7,1]},e:{n:'Bendición',k:'util',cd:11,bf:{pw:5},bfAll:{pw:5},rad:150},r:{n:'Silencio Glacial',k:'aoe',cd:19,dmg:25,rad:135,delay:.4,reach:200,root:1.5,vuln:[1.25,4]}}
];
A.DASH={cd:3.5,dist:140,t:.14};
A.charById=id=>C.find(c=>c.id===id)||C[0];
})(typeof window!=='undefined'?window:global);
