class CombatRenderer {
  draw(ctx, projectiles) {
    projectiles.forEach(pr => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(pr.x, pr.y, pr.radius, 0, Math.PI * 2);

      if (pr.type === 'plasma') {
        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 12;
      } else if (pr.type === 'rock') {
        ctx.fillStyle = '#ff6600';
        ctx.strokeStyle = '#993300';
        ctx.lineWidth = 3;
      } else if (pr.type === 'orb') {
        ctx.fillStyle = '#cc66ff';
        ctx.shadowColor = '#cc66ff';
        ctx.shadowBlur = 15;
      }

      ctx.fill();
      if (pr.type === 'rock') ctx.stroke();
      ctx.restore();
    });
  }
}
window.CombatRenderer = new CombatRenderer();
