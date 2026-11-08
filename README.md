# Arena Pixel — prototipo multijugador

Juego web 2D de estilo pixel art con salas privadas de hasta **10 jugadores**. Incluye creación/unión por código, movimiento sincronizado, controles de teclado y táctiles, ataque cercano, vida y reaparición.

## Requisitos
- Node.js 18 o superior
- Cuenta de GitHub
- Cuenta de Render

## Probar en tu computadora
1. Descomprime el ZIP.
2. Abre una terminal dentro de la carpeta del proyecto.
3. Ejecuta `npm install`.
4. Ejecuta `npm start`.
5. Abre `http://localhost:3000`.

Para probar multijugador local, abre esa dirección en dos navegadores o ventanas.

## Publicar en Render
1. Sube **todos los archivos y carpetas** de este proyecto a un repositorio nuevo de GitHub.
2. En Render, pulsa **New + → Web Service**.
3. Conecta el repositorio.
4. Configura:
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance type:** el plan disponible que quieras usar para pruebas.
5. Pulsa **Create Web Service** y espera a que termine el despliegue.
6. Abre la URL `https://tu-servicio.onrender.com`.

No necesitas crear un Static Site separado: Express sirve los archivos de `public/` desde el mismo Web Service, y Socket.IO comparte ese mismo dominio.

## Cómo jugar
- Un jugador pulsa **Crear una sala** y comparte el código de cinco caracteres.
- Los demás escriben ese código y pulsan **Unirse**.
- Máximo 10 personas por sala.
- PC: WASD o flechas para moverse; espacio o Enter para atacar.
- Móvil: usa la cruceta y el botón ATACAR.

## Importante
Este es un prototipo funcional para aprender y probar partidas pequeñas. Antes de convertirlo en un juego público competitivo, conviene añadir autenticación, protección contra abuso, límites de frecuencia, validación de colisiones y reglas de combate más completas. El servidor controla el movimiento y el daño básico, pero todavía no hay selección de héroes, matchmaking, persistencia de estadísticas ni sistema antitrampas completo.
