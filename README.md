# ARENA INSANA

Juego de combate multijugador online en arenas, pixel art generado por código (sprites originales, sin recursos de terceros).
Stack: **Node.js + Socket.IO** (servidor autoritativo) · **Phaser 3** (cliente, vía CDN) · HTML5/CSS3/JS.

## Ejecutar
```bash
npm install
npm start          # http://localhost:3000   (usa process.env.PORT)
npm test           # prueba headless del motor (30 combinaciones mapa×modo)
```
Abre el juego en varias pestañas/dispositivos: uno crea sala y comparte el código de 5 letras, los demás se unen.
Los recursos se sirven desde el propio servidor (`/` → `client/`, `/shared` → `shared/`); no hay carpeta `public`.

## Subir a GitHub y desplegar en Render
```bash
git init && git add . && git commit -m "ARENA INSANA"
git branch -M main && git remote add origin <tu-repo> && git push -u origin main
```
En Render: **New → Web Service** → tu repo (detecta `render.yaml`). Build `npm install`, Start `npm start`, health check `/health`.
Nota: el plan gratuito duerme tras inactividad (la primera carga tarda). WebSocket funciona sin configuración extra.

## Estructura
| Carpeta | Contenido |
|---|---|
| `shared/` | Datos compartidos: `characters.js` (12 personajes, roles, habilidades, variaciones), `maps.js` (6 mapas), `creatures.js` (bichos), `modes.js` |
| `server/combat/engine.js` | Simulación autoritativa 30 Hz: movimiento, colisiones, daño, escudos, cooldowns, buffs, criaturas, modos, victoria |
| `server/multiplayer/rooms.js` | Salas, códigos, anfitrión, expulsar, reconexión (30 s), bucle y snapshots |
| `client/sprites/` | Sprites procedurales (personajes + criaturas, 4 frames) |
| `client/maps/` | Render pixel art de cada bioma |
| `client/sounds/` | Audio sintetizado (sonido por personaje, música por mapa) |
| `client/ui/` | Menús, CSS pixel art, perfil, ajustes |
| `client/game.js` | Red, escena Phaser, controles PC/móvil, HUD |

## Controles
PC: WASD mover · clic ataque · Q/E/R habilidades · Shift (o Espacio) esquiva. Móvil: joystick + botones (apuntado automático al enemigo más cercano). Teclas reconfigurables en Ajustes.
Los mapas son vista cenital: no hay salto; Espacio funciona como esquiva alternativa.

## Añadir contenido
Nuevo personaje → añadir objeto en `shared/characters.js` (kinds: `proj`, `melee`, `dash`, `tp`, `aoe`, `trap`, `util`).
Nuevo mapa → `shared/maps.js` + tema en `client/maps/render.js`. Nuevo bicho → `shared/creatures.js` + dibujo en `sprites.js`.

## Limitaciones conocidas
- Perfil, monedas, niveles y desbloqueos viven en `localStorage` del cliente (no hay base de datos/cuentas); el servidor no los valida.
- Sin predicción del lado del cliente: con ping alto el movimiento propio se siente con retraso (snapshots a 15 Hz + interpolación).
- Fases de calidad pendientes de afinar con pruebas reales: balance numérico, arte con más variedad de frames.
