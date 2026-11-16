'use strict';
/* Servidor HTTP + Socket.IO. Sirve los archivos del cliente desde la raíz (proyecto sin carpetas). Render define PORT. */
const http=require('http'),fs=require('fs'),path=require('path');
const {Server}=require('socket.io');
require('./characters');require('./creatures');require('./modes');require('./maps');
const ROOT=__dirname;
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css'};
// Solo se sirven estos archivos (el código del servidor NO es accesible desde el navegador).
const PUBLIC=new Set(['index.html','style.css','game.js','ui.js','sprites.js','audio.js','maparte.js','characters.js','creatures.js','modes.js','maps.js']);
const server=http.createServer((req,res)=>{
 let u=decodeURIComponent((req.url||'/').split('?')[0]).replace(/^\/+/,'');
 if(u==='health'){res.end('ok');return}
 if(u==='')u='index.html';
 if(!PUBLIC.has(u)){res.writeHead(404);res.end('404');return}
 fs.readFile(path.join(ROOT,u),(e,d)=>{if(e){res.writeHead(404);res.end('404');return}res.writeHead(200,{'Content-Type':MIME[path.extname(u)],'Cache-Control':'no-cache'});res.end(d)});
});
const io=new Server(server,{cors:{origin:'*'},pingInterval:8000,pingTimeout:10000});
require('./rooms')(io);
const PORT=process.env.PORT||3000;
server.listen(PORT,()=>console.log('ARENA INSANA en http://localhost:'+PORT));
