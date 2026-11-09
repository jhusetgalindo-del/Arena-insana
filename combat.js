class CombatRenderer {
  drawProjectiles(ctx, projectiles) {
    projectiles.forEach(p => {
      ctx.save();
      ctx.beginPath();

      if (p.type === 'plasma') {
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#00eaff';
        ctx.shadowColor = '#00eaff';
        ctx.shadowBlur = 10;
        ctx.fill();

      } else if (p.type === 'heavy_rock') {
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#dd6b20';
        ctx.strokeStyle = '#7b341e';
        ctx.lineWidth = 3;
        ctx.fill();
        ctx.stroke();

      } else if (p.type === 'solar_orb') {
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ecc94b';
        ctx.shadowColor = '#ecc94b';
        ctx.shadowBlur = 12;
        ctx.fill();
      }

      ctx.restore();
    });
  }
}

window.CombatRenderer = new CombatRenderer();
