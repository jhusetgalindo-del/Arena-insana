class CharacterRenderer {
  draw(ctx, p, isLocal) {
    ctx.save();
    ctx.translate(p.x, p.y);

    if (isLocal) {
      ctx.beginPath();
      ctx.arc(0, 0, p.radius + 14, 0, Math.PI * 2);
      ctx.strokeStyle = '#00ffaa';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (p.invulnerable) {
      ctx.beginPath();
      ctx.arc(0, 0, p.radius + 18, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffaa00';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    ctx.rotate(p.angle);

    // Diseño detallado por rol (Evitando formas simples y planas)
    if (p.role === 'dps') {
      // Cazador de Plasma: Estética cibernética aerodinámica con cañón doble
      ctx.beginPath();
      ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#cc0044';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#ff6699';
      ctx.stroke();

      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(6, -10, 16, 5);
      ctx.fillRect(6, 5, 16, 5);
    } else if (p.role === 'tanque') {
      // Guardián de Hierro: Armadura pesada hexagonal con escudo frontal
      ctx.beginPath();
      ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#112244';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#3388ff';
      ctx.stroke();

      ctx.fillStyle = '#3388ff';
      ctx.fillRect(10, -18, 8, 36);
    } else if (p.role === 'soporte') {
      // Oráculo Solar: Núcleo de energía estelar con orbe flotante
      ctx.beginPath();
      ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#5511aa';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#cc66ff';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(16, 0, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#ffff00';
      ctx.shadowColor = '#ffff00';
      ctx.shadowBlur = 10;
      ctx.fill();
    }

    ctx.restore();

    this.drawUI(ctx, p);
  }

  drawUI(ctx, p) {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(p.name, p.x, p.y - p.radius - 18);

    const w = 46, h = 6;
    const x = p.x - w / 2, y = p.y - p.radius - 12;
    const pct = Math.max(0, p.hp / p.maxHp);

    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = pct > 0.5 ? '#00ffaa' : pct > 0.25 ? '#ffaa00' : '#ff3344';
    ctx.fillRect(x, y, w * pct, h);
    ctx.strokeStyle = '#000';
    ctx.strokeRect(x, y, w, h);
  }
}
window.CharacterRenderer = new CharacterRenderer();
