class CharacterRenderer {
  drawPlayer(ctx, player, isCurrentPlayer) {
    ctx.save();
    ctx.translate(player.x, player.y);

    if (isCurrentPlayer) {
      ctx.beginPath();
      ctx.arc(0, 0, player.radius + 8, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffaa00';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.rotate(player.angle);

    if (player.role === 'tanque') {
      ctx.beginPath();
      ctx.fillStyle = '#3182ce';
      ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#63b3ed';
      ctx.stroke();

      ctx.fillStyle = '#1a365d';
      ctx.fillRect(-player.radius - 2, -15, 8, 30);
      
      ctx.fillStyle = '#4a5568';
      ctx.fillRect(5, -6, 22, 12);

    } else if (player.role === 'dps') {
      ctx.beginPath();
      ctx.fillStyle = '#e53e3e';
      ctx.moveTo(player.radius + 4, 0);
      ctx.lineTo(-player.radius, -player.radius + 4);
      ctx.lineTo(-player.radius + 6, 0);
      ctx.lineTo(-player.radius, player.radius - 4);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#feb2b2';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#00eaff';
      ctx.fillRect(8, -10, 14, 4);
      ctx.fillRect(8, 6, 14, 4);

    } else if (player.role === 'soporte') {
      ctx.beginPath();
      ctx.fillStyle = '#38a169';
      ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#9ae6b4';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#faf089';
      ctx.beginPath();
      ctx.arc(12, 0, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    this.drawUI(ctx, player);
  }

  drawUI(ctx, player) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(player.name, player.x, player.y - player.radius - 14);

    const barWidth = 40;
    const barHeight = 6;
    const x = player.x - barWidth / 2;
    const y = player.y - player.radius - 10;
    const hpPct = Math.max(0, player.hp / player.maxHp);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(x, y, barWidth, barHeight);

    ctx.fillStyle = hpPct > 0.5 ? '#48bb78' : hpPct > 0.25 ? '#ecc94b' : '#f56565';
    ctx.fillRect(x, y, barWidth * hpPct, barHeight);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, barWidth, barHeight);
  }
}

window.CharacterRenderer = new CharacterRenderer();
