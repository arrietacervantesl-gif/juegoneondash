/**
 * Entidades y Obstáculos del Mundo Neon Dash
 * Incluye Bloques, Pinchos (normales e invertidos), Portales de Gravedad,
 * Portales de Velocidad, Orbes de Salto (Jump Rings) y Monedas Secretas (Secret Coins).
 */

export class Block {
  constructor(x, y, width = 48, height = 48) {
    this.type = 'BLOCK';
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  draw(ctx, cameraX) {
    const drawX = this.x - cameraX;
    const drawY = this.y;

    if (drawX + this.width < -50 || drawX > 1330) return;

    ctx.save();

    // 1. Fondo del cuerpo interno: tono morado/obsidiana profundo
    const bodyGrad = ctx.createLinearGradient(drawX, drawY, drawX, drawY + this.height);
    bodyGrad.addColorStop(0, '#110a26');
    bodyGrad.addColorStop(0.5, '#0b061c');
    bodyGrad.addColorStop(1, '#070312');
    ctx.fillStyle = bodyGrad;
    ctx.fillRect(drawX, drawY, this.width, this.height);

    // 2. Patrón de rejilla/cuadrícula morada semitransparente (estilo Geometry Dash)
    const midX = drawX + this.width / 2;
    const midY = drawY + this.height / 2;

    // Cuadrantes internos sutiles
    ctx.fillStyle = 'rgba(168, 85, 247, 0.08)';
    ctx.fillRect(drawX + 3, drawY + 3, this.width / 2 - 4, this.height / 2 - 4);
    ctx.fillRect(midX + 1, midY + 1, this.width / 2 - 4, this.height / 2 - 4);

    // Líneas de cuadrícula interna (cruz central)
    ctx.strokeStyle = 'rgba(192, 132, 252, 0.28)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(drawX + 4, midY);
    ctx.lineTo(drawX + this.width - 4, midY);
    ctx.moveTo(midX, drawY + 4);
    ctx.lineTo(midX, drawY + this.height - 4);
    ctx.stroke();

    // Recuadro interior biselado
    const inset = 7;
    ctx.strokeStyle = 'rgba(217, 70, 239, 0.35)';
    ctx.lineWidth = 1.25;
    ctx.strokeRect(drawX + inset, drawY + inset, this.width - (inset * 2), this.height - (inset * 2));

    // Remaches luminosos en las 4 esquinas interiores
    ctx.fillStyle = 'rgba(0, 243, 255, 0.6)';
    const dotOff = 9;
    ctx.fillRect(drawX + dotOff, drawY + dotOff, 2, 2);
    ctx.fillRect(drawX + this.width - dotOff - 2, drawY + dotOff, 2, 2);
    ctx.fillRect(drawX + dotOff, drawY + this.height - dotOff - 2, 2, 2);
    ctx.fillRect(drawX + this.width - dotOff - 2, drawY + this.height - dotOff - 2, 2, 2);

    // 3. Contorno perimetral oscuro de alta definición
    ctx.strokeStyle = '#030511';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(drawX + 1, drawY + 1, this.width - 2, this.height - 2);

    // 4. Borde Neón Brillante Inferior
    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00f3ff';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(drawX, drawY + this.height);
    ctx.lineTo(drawX + this.width, drawY + this.height);
    ctx.stroke();

    // 5. Borde Superior Brillante de Aterrizaje (Glow Blanco/Cyan Milimétricamente Alineado)
    // El trazado se realiza exactamente en drawY para coincidir al 100% con player.y + player.height
    ctx.shadowColor = '#00f3ff';
    ctx.shadowBlur = 14;
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.85)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(drawX, drawY);
    ctx.lineTo(drawX + this.width, drawY);
    ctx.stroke();

    // Núcleo blanco brillante en la superficie superior
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 6;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.75;
    ctx.beginPath();
    ctx.moveTo(drawX, drawY);
    ctx.lineTo(drawX + this.width, drawY);
    ctx.stroke();

    ctx.restore();
  }
}

export class Spike {
  constructor(x, y, width = 48, height = 48, flipped = false) {
    this.type = 'SPIKE';
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.flipped = flipped;
  }

  getHitboxVertices() {
    if (this.flipped) {
      return [
        { x: this.x + this.width * 0.18, y: this.y + this.height * 0.04 },
        { x: this.x + this.width * 0.82, y: this.y + this.height * 0.04 },
        { x: this.x + this.width * 0.5, y: this.y + this.height * 0.78 }
      ];
    }

    return [
      { x: this.x + this.width * 0.5, y: this.y + this.height * 0.22 },
      { x: this.x + this.width * 0.18, y: this.y + this.height * 0.96 },
      { x: this.x + this.width * 0.82, y: this.y + this.height * 0.96 }
    ];
  }

  draw(ctx, cameraX) {
    const drawX = this.x - cameraX;
    const drawY = this.y;

    if (drawX + this.width < -50 || drawX > 1330) return;

    ctx.save();

    const tipX = drawX + this.width / 2;
    const tipY = this.flipped ? (drawY + this.height) : drawY;
    const baseY = this.flipped ? drawY : (drawY + this.height);
    const leftX = drawX;
    const rightX = drawX + this.width;

    // 1. Cuerpo del triángulo oscuro con gradiente
    const grad = ctx.createLinearGradient(drawX, baseY, drawX, tipY);
    grad.addColorStop(0, '#0a030c');
    grad.addColorStop(0.5, '#260416');
    grad.addColorStop(1, '#420622');

    ctx.beginPath();
    ctx.moveTo(leftX, baseY);
    ctx.lineTo(tipX, tipY);
    ctx.lineTo(rightX, baseY);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // 2. Faceta biselada 3D interna (línea central desde la cúspide a la base)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.moveTo(leftX, baseY);
    ctx.lineTo(tipX, tipY);
    ctx.lineTo(tipX, baseY);
    ctx.closePath();
    ctx.fill();

    // Arista central luminosa
    ctx.strokeStyle = 'rgba(255, 0, 85, 0.4)';
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(tipX, baseY);
    ctx.stroke();

    // Triángulo decorativo interior
    const innerTipY = this.flipped ? (drawY + this.height * 0.75) : (drawY + this.height * 0.25);
    const innerBaseY = this.flipped ? (drawY + this.height * 0.12) : (drawY + this.height * 0.88);
    ctx.strokeStyle = 'rgba(255, 0, 85, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(drawX + this.width * 0.25, innerBaseY);
    ctx.lineTo(tipX, innerTipY);
    ctx.lineTo(drawX + this.width * 0.75, innerBaseY);
    ctx.closePath();
    ctx.stroke();

    // 3. Borde Neón Brillante Deslumbrante (Stroke exterior con Glow)
    ctx.shadowColor = '#ff0055';
    ctx.shadowBlur = 14;
    ctx.strokeStyle = '#ff0055';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(leftX, baseY);
    ctx.lineTo(tipX, tipY);
    ctx.lineTo(rightX, baseY);
    ctx.closePath();
    ctx.stroke();

    // 4. Destello luminoso en la cúspide (punta afilada)
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(tipX, tipY + (this.flipped ? -2 : 2), 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

export class GravityPortal {
  constructor(x, y, targetGravity = -1) {
    this.type = 'PORTAL_GRAVITY';
    this.x = x;
    this.y = y;
    this.width = 44;
    this.height = 170;
    this.targetGravity = targetGravity;
  }

  draw(ctx, cameraX) {
    const drawX = this.x - cameraX;
    const drawY = this.y;

    if (drawX + this.width < -60 || drawX > 1340) return;

    const isInverted = this.targetGravity === -1;
    const mainColor = isInverted ? '#ff9900' : '#00f3ff';
    const darkColor = isInverted ? '#3a1f00' : '#00293d';

    ctx.save();

    const radius = this.width / 2;
    ctx.beginPath();
    ctx.roundRect(drawX, drawY, this.width, this.height, radius);

    ctx.shadowColor = mainColor;
    ctx.shadowBlur = 18;
    ctx.fillStyle = darkColor;
    ctx.fill();

    ctx.strokeStyle = mainColor;
    ctx.lineWidth = 3.5;
    ctx.stroke();
    ctx.shadowBlur = 0;

    const time = performance.now() * 0.003;
    const pulseH = Math.sin(time) * 12;
    ctx.fillStyle = mainColor;
    ctx.beginPath();
    ctx.ellipse(
      drawX + radius,
      drawY + this.height / 2,
      radius * 0.5,
      (this.height * 0.35) + pulseH,
      0, 0, Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    const centerX = drawX + radius;
    const centerY = drawY + this.height / 2;
    if (isInverted) {
      ctx.moveTo(centerX, centerY - 14);
      ctx.lineTo(centerX - 8, centerY - 2);
      ctx.lineTo(centerX + 8, centerY - 2);
    } else {
      ctx.moveTo(centerX, centerY + 14);
      ctx.lineTo(centerX - 8, centerY + 2);
      ctx.lineTo(centerX + 8, centerY + 2);
    }
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

export class SpeedPortal {
  constructor(x, y, speedKey = '2x') {
    this.type = 'PORTAL_SPEED';
    this.x = x;
    this.y = y;
    this.width = 44;
    this.height = 170;
    this.speedKey = speedKey;
  }

  getColor() {
    switch (this.speedKey) {
      case '0.5x': return { main: '#ffaa00', dark: '#3a2000' };
      case '1x':   return { main: '#00d0ff', dark: '#002538' };
      case '2x':   return { main: '#39ff14', dark: '#083303' };
      case '3x':   return { main: '#ff00aa', dark: '#3b0024' };
      default:     return { main: '#00f3ff', dark: '#002030' };
    }
  }

  draw(ctx, cameraX) {
    const drawX = this.x - cameraX;
    const drawY = this.y;

    if (drawX + this.width < -60 || drawX > 1340) return;

    const { main, dark } = this.getColor();
    const radius = this.width / 2;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(drawX, drawY, this.width, this.height, radius);

    ctx.shadowColor = main;
    ctx.shadowBlur = 18;
    ctx.fillStyle = dark;
    ctx.fill();

    ctx.strokeStyle = main;
    ctx.lineWidth = 3.5;
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = main;
    const centerX = drawX + radius;
    const centerY = drawY + this.height / 2;
    const arrowCount = this.speedKey === '3x' ? 3 : this.speedKey === '2x' ? 2 : 1;
    const spacing = 7;
    const startX = centerX - ((arrowCount - 1) * spacing) / 2;

    for (let i = 0; i < arrowCount; i++) {
      const ax = startX + (i * spacing);
      ctx.beginPath();
      ctx.moveTo(ax - 4, centerY - 10);
      ctx.lineTo(ax + 4, centerY);
      ctx.lineTo(ax - 4, centerY + 10);
      ctx.lineTo(ax - 1, centerY);
      ctx.closePath();
      ctx.fill();
    }

    ctx.font = 'bold 11px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(this.speedKey, centerX, drawY + this.height - 14);

    ctx.restore();
  }
}

export class GamemodePortal {
  constructor(x, y, targetMode = 'SHIP') {
    this.type = 'PORTAL_GAMEMODE';
    this.x = x;
    this.y = y;
    this.width = 44;
    this.height = 170;
    this.targetMode = targetMode; // 'SHIP' | 'CUBE'
  }

  getColor() {
    if (this.targetMode === 'SHIP') {
      return { main: '#ff00aa', dark: '#3b0024', glow: 'rgba(255, 0, 170, 0.6)' };
    }
    // CUBE mode
    return { main: '#00ff66', dark: '#003314', glow: 'rgba(0, 255, 102, 0.6)' };
  }

  draw(ctx, cameraX) {
    const drawX = this.x - cameraX;
    const drawY = this.y;

    if (drawX + this.width < -60 || drawX > 1340) return;

    const { main, dark } = this.getColor();
    const radius = this.width / 2;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(drawX, drawY, this.width, this.height, radius);

    ctx.shadowColor = main;
    ctx.shadowBlur = 18;
    ctx.fillStyle = dark;
    ctx.fill();

    ctx.strokeStyle = main;
    ctx.lineWidth = 3.5;
    ctx.stroke();
    ctx.shadowBlur = 0;

    const time = performance.now() * 0.003;
    const pulseH = Math.sin(time) * 12;
    ctx.fillStyle = main;
    ctx.beginPath();
    ctx.ellipse(
      drawX + radius,
      drawY + this.height / 2,
      radius * 0.5,
      (this.height * 0.35) + pulseH,
      0, 0, Math.PI * 2
    );
    ctx.fill();

    // Icono central representativo del vehículo
    const centerX = drawX + radius;
    const centerY = drawY + this.height / 2;

    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = main;
    ctx.shadowBlur = 8;

    if (this.targetMode === 'SHIP') {
      // Silueta estilizada de Nave / Avioncito
      ctx.beginPath();
      ctx.moveTo(centerX + 11, centerY);
      ctx.lineTo(centerX - 8, centerY - 10);
      ctx.lineTo(centerX - 4, centerY - 2);
      ctx.lineTo(centerX - 10, centerY);
      ctx.lineTo(centerX - 4, centerY + 2);
      ctx.lineTo(centerX - 8, centerY + 10);
      ctx.closePath();
      ctx.fill();
    } else {
      // Silueta estilizada de Cubo
      ctx.fillRect(centerX - 7, centerY - 7, 14, 14);
      ctx.fillStyle = main;
      ctx.fillRect(centerX - 4, centerY - 4, 8, 8);
    }

    ctx.font = 'bold 10px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(this.targetMode, centerX, drawY + this.height - 14);

    ctx.restore();
  }
}

export class ShipPortal extends GamemodePortal {
  constructor(x, y) {
    super(x, y, 'SHIP');
  }
}

export class CubePortal extends GamemodePortal {
  constructor(x, y) {
    super(x, y, 'CUBE');
  }
}

export class JumpOrb {
  constructor(x, y, orbType = 'YELLOW') {
    this.type = 'ORB';
    this.x = x;
    this.y = y;
    this.radius = 24;
    this.orbType = orbType;
    this.activated = false;
    this.burstProgress = 0;
  }

  reset() {
    this.activated = false;
    this.burstProgress = 0;
  }

  update(dt) {
    if (this.burstProgress > 0) {
      this.burstProgress += dt * 4;
      if (this.burstProgress > 1) {
        this.burstProgress = 0;
      }
    }
  }

  draw(ctx, cameraX) {
    const drawX = this.x - cameraX;
    const drawY = this.y;

    if (drawX + this.radius < -50 || drawX - this.radius > 1330) return;

    ctx.save();
    const time = performance.now() * 0.005;
    const pulse = Math.sin(time) * 3;

    if (this.burstProgress > 0) {
      const burstRadius = this.radius + (this.burstProgress * 45);
      const alpha = 1 - this.burstProgress;
      ctx.strokeStyle = `rgba(255, 230, 0, ${alpha})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(drawX, drawY, burstRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.shadowColor = '#ffe600';
    ctx.shadowBlur = 15;
    ctx.strokeStyle = '#ffe600';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(drawX, drawY, this.radius + pulse, 0, Math.PI * 2);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = this.activated ? '#665700' : '#ffe600';
    ctx.beginPath();
    ctx.arc(drawX, drawY, this.radius * 0.55, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(drawX, drawY, this.radius * 0.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

/**
 * Moneda Secreta (Secret Coin)
 * 3 monedas de oro ocultas en rutas de alta dificultad en cada nivel.
 */
export class SecretCoin {
  constructor(x, y, id = 1) {
    this.type = 'COIN';
    this.x = x;
    this.y = y;
    this.id = id;
    this.radius = 20;
    this.collected = false;
  }

  reset() {
    this.collected = false;
  }

  draw(ctx, cameraX) {
    if (this.collected) return;

    const drawX = this.x - cameraX;
    const drawY = this.y;

    if (drawX + this.radius < -50 || drawX - this.radius > 1330) return;

    ctx.save();
    const time = performance.now() * 0.004;
    // Efecto de giro tridimensional simulado con escala X
    const scaleX = Math.cos(time);

    ctx.translate(drawX, drawY);
    ctx.scale(Math.abs(scaleX) < 0.1 ? 0.1 : scaleX, 1);

    // Resplandor dorado
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 16;

    // Borde exterior de moneda dorada
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Borde interior oscuro
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#735100';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Estrella grabada en el centro de la moneda
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * 0.45, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#735100';
    ctx.font = 'bold 12px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', 0, 1);

    ctx.restore();
  }
}

/**
 * Marcador visual de Checkpoint del Modo Práctica
 */
export class CheckpointMarker {
  constructor(x, y, gravityDir = 1) {
    this.x = x;
    this.y = y;
    this.gravityDir = gravityDir;
  }

  draw(ctx, cameraX) {
    const drawX = this.x - cameraX;
    const drawY = this.y;

    if (drawX < -50 || drawX > 1330) return;

    ctx.save();
    ctx.translate(drawX, drawY);

    // Diamante verde fluorescente
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#00ff88';

    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.lineTo(10, 0);
    ctx.lineTo(0, 14);
    ctx.lineTo(-10, 0);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }
}
