class MapRenderer {
  constructor() {
    this.width = 1600;
    this.height = 1000;
  }

  drawArena(ctx) {
    // 1. Suelo Texturizado estilo Templo Arcana
    ctx.fillStyle = '#0f1424';
    ctx.fillRect(0, 0, this.width, this.height);

    // Baldosas rúnicas con cuadrícula limpia
    ctx.strokeStyle = 'rgba(0, 234, 255, 0.05)';
    ctx.lineWidth = 2;
    for (let x = 0; x < this.width; x += 100) {
      for (let y = 0; y < this.height; y += 100) {
        ctx.strokeRect(x, y, 100, 100);
      }
    }

    // 2. Zona central de energía arcana (Santuario)
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.width / 2, this.height / 2, 160, 0, Math.PI * 2);
    const poolGrad = ctx.createRadialGradient(
      this.width / 2, this.height / 2, 10,
      this.width / 2, this.height / 2, 160
    );
    poolGrad.addColorStop(0, 'rgba(0, 234, 255, 0.35)');
    poolGrad.addColorStop(0.7, 'rgba(0, 80, 160, 0.15)');
    poolGrad.addColorStop(1, 'rgba(0, 234, 255, 0.6)');
    ctx.fillStyle = poolGrad;
    ctx.fill();
    ctx.strokeStyle = '#00eaff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Símbolo rúnico en el centro
    ctx.beginPath();
    ctx.arc(this.width / 2, this.height / 2, 80, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.stroke();
    ctx.restore();

    // 3. Obstáculos ambientales con relieve (Columnas)
    this.drawPillar(ctx, 350, 250);
    this.drawPillar(ctx, 1250, 250);
    this.drawPillar(ctx, 350, 750);
    this.drawPillar(ctx, 1250, 750);

    // Muros decorativos
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.fillRect(0, 0, this.width, 20);
    ctx.fillRect(0, this.height - 20, this.width, 20);
    ctx.fillRect(0, 0, 20, this.height);
    ctx.fillRect(this.width - 20, 0, 20, this.height);
  }

  drawPillar(ctx, x, y) {
    ctx.save();
    // Sombra del obstáculo
    ctx.beginPath();
    ctx.ellipse(x + 8, y + 18, 40, 24, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fill();

    // Base de la columna
    ctx.beginPath();
    ctx.arc(x, y, 32, 0, Math.PI * 2);
    ctx.fillStyle = '#1c253b';
    ctx.fill();
    ctx.strokeStyle = '#00eaff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Detalle de cristal de poder en el centro
    ctx.beginPath();
    ctx.arc(x, y - 4, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#00eaff';
    ctx.shadowColor = '#00eaff';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.restore();
  }
}

window.MapRenderer = new MapRenderer();
