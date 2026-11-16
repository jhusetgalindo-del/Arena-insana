/* BICHOS DE ARENA: criaturas neutrales con recompensas TEMPORALES y SIN acumulación (los buffs se refrescan, nunca se suman). */
(function(g){const A=g.AI=g.AI||{};
A.CREATURES={
 heal:{n:'Gelatina Curativa',hp:20,r:13,respawn:12,col:'#ff7aa8',rew:{heal:40}},
 shield:{n:'Tortuga Cristal',hp:35,r:14,respawn:16,col:'#5ab4ff',rew:{sh:35}},
 speed:{n:'Escarabajo Veloz',hp:15,r:11,respawn:14,col:'#ffe24a',rew:{bf:{sp:6}}},
 energy:{n:'Medusa Energética',hp:25,r:13,respawn:16,col:'#b86bff',rew:{bf:{en:7}}},
 power:{n:'Diablillo Furioso',hp:45,r:14,respawn:18,col:'#ff4a3a',rew:{bf:{pw:7}}},
 rare:{n:'Fénix Prisma',hp:80,r:16,respawn:40,col:'#ffd700',rew:{heal:25,sh:20,bf:{sp:5,pw:5,en:5}}}
};
A.BUFFCAP=10;A.SHCAP=60;
A.BUFFS={sp:{n:'Velocidad',c:'#ffe24a'},pw:{n:'Poder',c:'#ff4a3a'},en:{n:'Energía',c:'#b86bff'}};
})(typeof window!=='undefined'?window:global);
