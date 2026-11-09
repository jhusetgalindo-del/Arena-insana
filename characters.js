class CharacterRenderer {
  drawPlayer(ctx, player, isCurrentPlayer) {
    ctx.save();
    ctx.translate(player.x, player.y);

    // Indicador especial para el jugador local
    if (isCurrentPlayer) {
      ctx.beginPath();
      ctx.arc(0, 0, player.radius + 12, 0, Math.PI * 2);
      ctx.strokeStyle = '#00ffaa';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Efecto de protección al reaparecer (Invulnerabilidad)
    if (player.invulnerable) {
      ctx.beginPath();
      ctx.arc(0, 0, player.radius + 16, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Escudo activo (Tanque)
    if (player.shield > 0) {
      ctx.beginPath();
      ctx.arc(0, 0, player.radius + 8, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 170, 255, 0.8)';
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    // Rotación hacia el objetivo
    ctx.rotate(player.angle);

    // Renderizado según Héroe
    if (player.hero === 'pyro') {
      // IGNIS (Mago Fuego): Túnica roja, aura de llamas y cetro
      ctx.beginPath();
      ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#e63946';
      ctx.fill();
      ctx.strokeStyle = '#ff6b6b';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Cetro de Fuego
      ctx.fillStyle = '#ff4500';
      ctx.fillRect(8, -4, 20, 8);
      ctx.beginPath();
      ctx.arc(28, 0, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#ffff00';
      ctx.fill();

    } else if (player.hero === 'guardian') {
      // TITÁN (Tanque): Armadura pesada hexagonal y escudo
      ctx.beginPath();
      ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#1d3557';
      ctx.fill();
      ctx.strokeStyle = '#457b9d';
      ctx.lineWidth = 5;
      ctx.stroke();

      // Escudo metálico frontal
      ctx.fillStyle = '#457b9d';
      ctx.fillRect(10, -16, 8, 32);

    } else if (player.hero === 'shadow') {
      // KAGE (Asesino Sombra): Traje sigiloso con estela violácea
      ctx.beginPath();
      ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#2b1e3a';
      ctx.fill();
      ctx.strokeStyle = '#aa00ff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Dagas de Sombra
      ctx.fillStyle = '#d8b4fe';
      ctx.fillRect(10, -10, 16, 4);
      ctx.fillRect(10, 6, 16, 4);

    } else if (player.hero === 'sun') {
      // HELIOS (Soporte Solar): Núcleo de luz dorada
      ctx.beginPath();
      ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#d4af37';
      ctx.fill();
      ctx.strokeStyle = '#fff3bf';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Orbe místico flotante
      ctx.beginPath();
      ctx.arc(16, 0, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
    }

    ctx.restore();

    // Dibujar Nombre y Barras HUD del Jugador
    this.drawPlayerBars(ctx, player);
  }

  drawPlayerBars(ctx, player) {
    // Nombre del héroe
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(player.name, player.x, player.y - player.radius - 18);

    // Barra de Vida
    const barW = 44;
    const barH = 6;
    const x = player.x - barW / 2;
    const y = player.y - player.radius - 12;
    const hpPct = Math.max(0, player.hp / player.maxHp);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x, y, barW, barH);

    ctx.fillStyle = hpPct > 0.5 ? '#00ffaa' : hpPct > 0.25 ? '#ffcc00' : '#ff3344';
    ctx.fillRect(x, y, barW * hpPct, barH);

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, barW, barH);
  }
}

window.CharacterRenderer = new CharacterRenderer();
