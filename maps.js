class MapRenderer {
  constructor() {
    this.width = 1200;
    this.height = 800;
  }

  drawTempleMap(ctx) {
    const grad = ctx.createLinearGradient(0, 0, this.width, this.height);
    grad.addColorStop(0, '#1e3820');
    grad.addColorStop(1, '#112413');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 2;
    for (let x = 0; x < this.width; x += 80) {
      for (let y = 0; y < this.height; y += 80) {
        ctx.strokeRect(x, y, 80, 80);
      }
    }

    ctx.beginPath();
    ctx.arc(600, 400, 110, 0, Math.PI * 2);
    const poolGrad = ctx.createRadialGradient(600, 400, 10, 600, 400, 110);
    poolGrad.addColorStop(0, 'rgba(0, 234, 255, 0.6)');
    poolGrad.addColorStop(0.8, 'rgba(0, 100, 200, 0.3)');
    poolGrad.addColorStop(1, 'rgba(0, 234, 255, 0.8)');
    ctx.fillStyle = poolGrad;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#00eaff';
    ctx.stroke();

    this.drawPillar(ctx, 250, 200);
    this.drawPillar(ctx, 950, 200);
    this.drawPillar(ctx, 250, 600);
    this.drawPillar(ctx, 950, 600);
  }

  drawPillar(ctx, x, y) {
    ctx.beginPath();
    ctx.ellipse(x + 5, y + 15, 35, 20, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fillStyle = '#4a5568';
    ctx.fill();
    ctx.strokeStyle = '#718096';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x - 5, y - 5, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#cbd5e0';
    ctx.fill();
  }
}

window.MapRenderer = new MapRenderer();
