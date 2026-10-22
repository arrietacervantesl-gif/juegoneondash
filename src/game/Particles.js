/**
 * Sistema de Partículas para Neon Dash
 * Gestiona explosiones geométricas al morir, estelas del cubo (trails),
 * destellos de monedas secretas y ondas de checkpoints del Modo Práctica.
 */
export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  reset() {
    this.particles = [];
  }

  /**
   * Genera explosión de fragmentos geométricos luminiscentes al impactar un obstáculo
   */
  createExplosion(x, y, primaryColor = '#39ff14', secondaryColor = '#ffe600') {
    const shardCount = 35;
    for (let i = 0; i < shardCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 150 + Math.random() * 450;
      const size = 4 + Math.random() * 8;
      const shape = Math.random() > 0.5 ? 'SQUARE' : 'TRIANGLE';
      const color = Math.random() > 0.35 ? primaryColor : secondaryColor;

      this.particles.push({
        type: 'SHARD',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size,
        initialSize: size,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 14,
        color,
        shape,
        life: 0.65 + Math.random() * 0.45,
        maxLife: 1.1
      });
    }
  }

  /**
   * Genera partículas de estela detrás del cubo
   */
  createTrail(x, y, trailType = 'NEON', primaryColor = '#00f3ff') {
    if (trailType === 'NONE') return;

    if (trailType === 'FIRE') {
      this.particles.push({
        type: 'TRAIL',
        x: x + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 12,
        vx: -60 - Math.random() * 80,
        vy: -40 - Math.random() * 60,
        size: 7 + Math.random() * 6,
        color: Math.random() > 0.4 ? '#ff5500' : '#ffe600',
        shape: 'CIRCLE',
        life: 0.35,
        maxLife: 0.35
      });
    } else if (trailType === 'RAINBOW') {
      const hue = (performance.now() * 0.3) % 360;
      this.particles.push({
        type: 'TRAIL',
        x,
        y,
        vx: -50,
        vy: 0,
        size: 9,
        color: `hsl(${hue}, 100%, 60%)`,
        shape: 'SQUARE',
        rotation: 0,
        vRot: 0,
        life: 0.28,
        maxLife: 0.28
      });
    } else if (trailType === 'STAR') {
      this.particles.push({
        type: 'TRAIL',
        x: x + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 16,
        vx: -40,
        vy: (Math.random() - 0.5) * 30,
        size: 8,
        color: '#ffffff',
        shape: 'STAR',
        rotation: Math.random() * Math.PI,
        vRot: 5,
        life: 0.3,
        maxLife: 0.3
      });
    } else {
      // Default: NEON trail
      this.particles.push({
        type: 'TRAIL',
        x,
        y,
        vx: -40,
        vy: 0,
        size: 8,
        color: primaryColor,
        shape: 'SQUARE',
        rotation: 0,
        vRot: 0,
        life: 0.25,
        maxLife: 0.25
      });
    }
  }

  /**
   * Genera partículas de propulsión de fuego neón / plasma para el Modo Nave
   */
  createShipThruster(x, y, primaryColor = '#00f3ff', secondaryColor = '#ffe600') {
    const count = 3;
    for (let i = 0; i < count; i++) {
      const speedX = -180 - Math.random() * 200;
      const speedY = (Math.random() - 0.5) * 80;
      const isCore = Math.random() > 0.45;
      const color = isCore ? (secondaryColor || '#ffe600') : (primaryColor || '#00f3ff');
      const size = 5 + Math.random() * 5;

      this.particles.push({
        type: 'THRUSTER',
        x: x + (Math.random() - 0.5) * 4,
        y: y + (Math.random() - 0.5) * 6,
        vx: speedX,
        vy: speedY,
        size,
        initialSize: size,
        color,
        shape: Math.random() > 0.35 ? 'CIRCLE' : 'SQUARE',
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 8,
        life: 0.2 + Math.random() * 0.12,
        maxLife: 0.32
      });
    }
  }

  /**
   * Destello de recolección de moneda secreta
   */
  createCoinSparkle(x, y) {
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const speed = 100 + Math.random() * 200;
      this.particles.push({
        type: 'SPARKLE',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 5,
        color: '#ffd700',
        shape: 'STAR',
        rotation: Math.random() * Math.PI,
        vRot: 8,
        life: 0.6,
        maxLife: 0.6
      });
    }
  }

  /**
   * Onda visual al colocar un Checkpoint en Modo Práctica
   */
  createCheckpointWave(x, y) {
    this.particles.push({
      type: 'CHECKPOINT_WAVE',
      x,
      y,
      radius: 8,
      maxRadius: 65,
      color: '#00ff88',
      life: 0.5,
      maxLife: 0.5
    });
  }

  /**
   * Genera confeti festivo para la pantalla de NIVEL COMPLETADO (Victoria)
   */
  createConfetti(x, y) {
    const colors = ['#00f3ff', '#ff007f', '#ffe600', '#39ff14', '#b026ff', '#00ffcc', '#ff9900', '#ffffff'];
    const count = 90;

    for (let i = 0; i < count; i++) {
      const angle = (Math.random() * Math.PI) - Math.PI; // Upwards spread
      const speed = 250 + Math.random() * 450;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const w = 6 + Math.random() * 8;
      const h = 4 + Math.random() * 6;

      this.particles.push({
        type: 'CONFETTI',
        x: x + (Math.random() - 0.5) * 80,
        y: y + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 100,
        vy: Math.sin(angle) * speed - 150,
        gravity: 420,
        w,
        h,
        size: Math.max(w, h),
        color,
        shape: Math.random() > 0.3 ? 'CONFETTI_RIBBON' : 'STAR',
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 16,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 6 + Math.random() * 8,
        life: 2.2 + Math.random() * 1.5,
        maxLife: 3.7
      });
    }
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      if (p.type === 'CHECKPOINT_WAVE') {
        const progress = 1 - (p.life / p.maxLife);
        p.radius = 8 + (progress * (p.maxRadius - 8));
        continue;
      }

      if (p.type === 'CONFETTI') {
        p.vy += p.gravity * dt;
        p.vx *= 0.985;
        p.wobble += p.wobbleSpeed * dt;
        p.x += (p.vx + Math.sin(p.wobble) * 40) * dt;
        p.y += p.vy * dt;
        p.rotation += p.vRot * dt;
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.vRot) {
        p.rotation += p.vRot * dt;
      }

      // Fricción ligera para fragmentos
      if (p.type === 'SHARD') {
        p.vx *= 0.96;
        p.vy *= 0.96;
      }
    }
  }

  draw(ctx, cameraX) {
    for (const p of this.particles) {
      const screenX = p.x - cameraX;
      const screenY = p.y;
      const alpha = Math.max(0, p.life / p.maxLife);

      ctx.save();
      ctx.globalAlpha = alpha;

      if (p.type === 'CHECKPOINT_WAVE') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(screenX, screenY, p.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        continue;
      }

      ctx.translate(screenX, screenY);
      if (p.rotation) {
        ctx.rotate(p.rotation);
      }

      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;

      const currentSize = p.size * ((p.type === 'TRAIL' || p.type === 'THRUSTER') ? alpha : 1);

      if (p.shape === 'CIRCLE') {
        ctx.beginPath();
        ctx.arc(0, 0, currentSize / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'TRIANGLE') {
        ctx.beginPath();
        ctx.moveTo(0, -currentSize);
        ctx.lineTo(-currentSize * 0.7, currentSize * 0.7);
        ctx.lineTo(currentSize * 0.7, currentSize * 0.7);
        ctx.closePath();
        ctx.fill();
      } else if (p.shape === 'STAR') {
        this.drawStar(ctx, 0, 0, currentSize * 0.5, currentSize, 4);
      } else if (p.shape === 'CONFETTI_RIBBON') {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      } else {
        // SQUARE
        ctx.fillRect(-currentSize / 2, -currentSize / 2, currentSize, currentSize);
      }

      ctx.restore();
    }
  }

  drawStar(ctx, cx, cy, innerRadius, outerRadius, points) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / points;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < points; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }
}
