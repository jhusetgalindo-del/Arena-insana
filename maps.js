class MapRenderer {
  constructor() {
    this.w = 2000;
    this.h = 1400;
  }

  draw(ctx) {
    // Fondo de arena detallado con texturas y gradientes
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, this.w, this.h);

    // Cuadrícula táctica estilizada
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
    ctx.lineWidth = 2;
    for (let x = 0; x < this.w; x += 100) {
      for (let y = 0; y < this.h; y += 100) {
        ctx.strokeRect(x, y, 100, 100);
      }
    }

    // Santuario central arcano
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.w / 2, this.h / 2, 220, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(this.w / 2, this.h / 2, 20, this.w / 2, this.h / 2, 220);
    grad.addColorStop(0, 'rgba(0, 240, 255, 0.35)');
    grad.addColorStop(0.7, 'rgba(0, 80, 180, 0.15)');
    grad.addColorStop(1, 'rgba(0, 240, 255, 0.5)');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#00f0ff';
    ctx.stroke();
    ctx.restore();

    // Estructuras de cobertura (Pilares y barricadas detalladas)
    this.drawObstacle(ctx, 500, 350, 50);
    this.drawObstacle(ctx, 1500, 350, 50);
    this.drawObstacle(ctx, 500, 1050, 50);
    this.drawObstacle(ctx, 1500, 1050, 50);
    this.drawObstacle(ctx, 1000, 700, 70);

    // Bordes exteriores de la arena
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, this.w - 20, this.h - 20);
  }

  drawObstacle(ctx, x, y, r) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(x + 6, y + 14, r, r * 0.6, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = '#17223b';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#00f0ff';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, r * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.restore();
  }
}
window.MapRenderer = new MapRenderer();
