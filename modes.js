(function(g){const A=g.AI=g.AI||{};
A.MODES={
 ffa:{n:'Todos contra todos',d:'Primero en 15 bajas gana. Reaparición 3s.',time:180,resp:3,teams:false,goal:15},
 teams:{n:'Equipos 5 vs 5',d:'Primer equipo en 25 bajas gana.',time:240,resp:3,teams:true,goal:25},
 capture:{n:'Captura de objetivos',d:'Controla zonas para sumar puntos (100 gana).',time:240,resp:3,teams:true,goal:100},
 survival:{n:'Supervivencia',d:'Sin reaparición. Último en pie gana.',time:150,resp:0,teams:false,goal:0},
 rounds:{n:'Combate por rondas',d:'Mejor de 5: gana quien consiga 3 rondas.',time:60,resp:0,teams:false,goal:3}
};
})(typeof window!=='undefined'?window:global);
