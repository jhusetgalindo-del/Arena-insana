# ARENA INSANA

Juego de combate multijugador online en arenas, pixel art generado por código.
Node.js + Socket.IO (servidor autoritativo) · Phaser 3 (CDN) · HTML5/CSS3/JS.
**Proyecto plano: todos los archivos están en la raíz, sin carpetas.**

## Ejecutar
```bash
npm install
npm start      # http://localhost:3000  (usa process.env.PORT)
npm test       # pruebas del motor y de las salas
```
Abre varias pestañas: una crea sala y comparte el código de 5 letras; las demás se unen.

## Subir a GitHub y desplegar en Render
```bash
git init && git add . && git commit -m "ARENA INSANA"
git branch -M main && git remote add origin <tu-repo> && git push -u origin main
```
Render: New → Web Service → tu repo (usa `render.yaml`). Build `npm install`, Start `npm start`, health `/health`.

## Archivos
| Archivo | Función |
|---|---|
| `server.js` | HTTP + Socket.IO; sirve solo los archivos del cliente (lista blanca) |
| `rooms.js` | Salas, códigos, anfitrión, expulsión, reconexión 30 s, bucle de partida |
| `engine.js` | Motor de combate autoritativo (daño, cooldowns, buffs, criaturas, modos, victoria) |
| `characters.js` `maps.js` `creatures.js` `modes.js` | Datos compartidos cliente/servidor |
| `index.html` `style.css` | Pantalla y estilo pixel art |
| `game.js` | Red, escena Phaser, controles PC/móvil, HUD |
| `ui.js` | Perfil, ajustes, helpers de menús |
| `sprites.js` `maparte.js` `audio.js` | Sprites, mapas y sonido procedurales |
| `test-engine.js` `test-rooms.js` | Pruebas |

## Controles
PC: WASD · clic ataque · Q/E/R habilidades · Shift o Espacio esquiva. Móvil: joystick + botones. Reconfigurables en Ajustes.

## Limitaciones
Perfil/monedas/niveles en `localStorage` (sin validar en servidor) · sin predicción en cliente · balance por afinar.
