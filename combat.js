class CombatRenderer {
  drawProjectiles(ctx, projectiles) {
    projectiles.forEach(p => {
      ctx.save();
      ctx.beginPath();

      if (p.type === 'fireball') {
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ff4500';
        ctx.shadowColor = '#ff4500';
        ctx.shadowBlur = 12;
        ctx.fill();
      } else if (p.type === 'hammer') {
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#00aaff';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
      } else if (p.type === 'kunai') {
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#aa00ff';
        ctx.shadowColor = '#aa00ff';
        ctx.shadowBlur = 8;
        ctx.fill();
      } else if (p.type === 'sunorb') {
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffcc00';
        ctx.shadowColor = '#ffcc00';
        ctx.shadowBlur = 15;
        ctx.fill();
      }

      ctx.restore();
    });
  }
}

window.CombatRenderer = new CombatRenderer();
