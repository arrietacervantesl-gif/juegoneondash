/**
 * Sistema de Skins y Armario (Icon Kit / Shop) para Neon Dash
 * Gestiona el catálogo de 6 skins, colores primarios y secundarios, estelas
 * y validación de desbloqueos por logros/hitos.
 */
export class SkinSystem {
  constructor() {
    // 6 Estilos visuales para el Cubo
    this.SKINS = [
      { id: 'CLASSIC', name: 'Cubo Clásico', desc: 'El diseño legendario original con bordes biselados', unlockedByDefault: true, req: 'Desbloqueado' },
      { id: 'NINJA', name: 'Cubo Ninja', desc: 'Visor cibernético con cinta de combate y lazos traseros', unlockedByDefault: true, req: 'Desbloqueado' },
      { id: 'CYCLOPS', name: 'Cubo Cíclope', desc: 'Lente óptico de pulso láser central y blindaje con remaches', req: 'Alcanza 100 Saltos', reqType: 'jumps', reqValue: 100 },
      { id: 'ROBOT', name: 'Cubo Ciber Robot', desc: 'Blindaje con antena transmisora, procesador y rejilla LED', req: 'Completa el Nivel 1', reqType: 'level', reqValue: 'level_1_stereo_madness' },
      { id: 'DIAMOND', name: 'Cubo Neón Biselado', desc: 'Núcleo geométrico facetado de prisma reflectante pulido', req: 'Recolecta 5 Monedas', reqType: 'coins', reqValue: 5 },
      { id: 'GLITCH', name: 'Cubo Sombra Glitch', desc: 'Desfase holográfico con ojos de matriz y sombras fantasma', req: 'Acumula 50 Intentos', reqType: 'attempts', reqValue: 50 }
    ];

    this.ICONS = this.SKINS.map(s => s.id);

    // Paleta de Colores Primarios (Cuerpo)
    this.PRIMARY_COLORS = [
      { name: 'Lima Neón', hex: '#39ff14', unlockedByDefault: true, req: 'Desbloqueado' },
      { name: 'Cian Ciber', hex: '#00f3ff', unlockedByDefault: true, req: 'Desbloqueado' },
      { name: 'Magenta Láser', hex: '#ff0055', unlockedByDefault: true, req: 'Desbloqueado' },
      { name: 'Amarillo Flash', hex: '#ffe600', unlockedByDefault: true, req: 'Desbloqueado' },
      { name: 'Naranja Solar', hex: '#ff9900', req: 'Alcanza 50 Saltos', reqType: 'jumps', reqValue: 50 },
      { name: 'Púrpura Astral', hex: '#9d00ff', req: 'Alcanza 100 Saltos', reqType: 'jumps', reqValue: 100 },
      { name: 'Rojo Furia', hex: '#ff3300', req: 'Recolecta 3 Monedas', reqType: 'coins', reqValue: 3 },
      { name: 'Aqua Hiperión', hex: '#00ffea', req: 'Completa Nivel 1', reqType: 'level', reqValue: 'level_1_stereo_madness' },
      { name: 'Oro Imperial', hex: '#ffd700', req: 'Recolecta 5 Monedas', reqType: 'coins', reqValue: 5 }
    ];

    // Paleta de Colores Secundarios (Detalles, Ojos, Bordes)
    this.SECONDARY_COLORS = [
      { name: 'Amarillo Neón', hex: '#ffe600', unlockedByDefault: true, req: 'Desbloqueado' },
      { name: 'Cian Pulso', hex: '#00f3ff', unlockedByDefault: true, req: 'Desbloqueado' },
      { name: 'Blanco Puro', hex: '#ffffff', unlockedByDefault: true, req: 'Desbloqueado' },
      { name: 'Negro Obsidiana', hex: '#050814', unlockedByDefault: true, req: 'Desbloqueado' },
      { name: 'Rojo Carmesí', hex: '#ff0055', req: 'Alcanza 25 Intentos', reqType: 'attempts', reqValue: 25 },
      { name: 'Violeta Plasma', hex: '#a855f7', req: 'Recolecta 1 Moneda', reqType: 'coins', reqValue: 1 },
      { name: 'Esmeralda Matrix', hex: '#00ff88', req: 'Recolecta 5 Monedas', reqType: 'coins', reqValue: 5 }
    ];

    // Efectos de Estela y Partículas (Trails)
    this.TRAILS = [
      { id: 'NEON', name: 'Neón Clásico', desc: 'Rastro de partículas sólidas de alta luminosidad', icon: '⚡', unlockedByDefault: true, req: 'Desbloqueado' },
      { id: 'FIRE', name: 'Fuego Ardiente', desc: 'Chispas incandescentes de combustión rápida', icon: '🔥', req: 'Alcanza 25 Intentos', reqType: 'attempts', reqValue: 25 },
      { id: 'STAR', name: 'Estrellas Cósmicas', desc: 'Estela estelar destellante multidireccional', icon: '⭐', req: 'Recolecta 1 Moneda', reqType: 'coins', reqValue: 1 },
      { id: 'RAINBOW', name: 'Estela de Luz Arcoíris', desc: 'Espectro cromático continuo en movimiento', icon: '🌈', req: 'Completa Nivel 1', reqType: 'level', reqValue: 'level_1_stereo_madness' },
      { id: 'NONE', name: 'Sin Estela', desc: 'Cubo limpio sin emisión de estela', icon: '🚫', unlockedByDefault: true, req: 'Desbloqueado' }
    ];

    // Selección activa
    this.currentIcon = 'CLASSIC';
    this.currentPrimary = '#39ff14';
    this.currentSecondary = '#ffe600';
    this.currentTrail = 'NEON';

    // Lista de IDs de skins desbloqueadas
    this.unlockedSkins = new Set(['CLASSIC', 'NINJA']);
  }

  setSkin(icon, primary, secondary, trail) {
    if (icon && this.ICONS.includes(icon)) this.currentIcon = icon;
    if (primary) this.currentPrimary = primary;
    if (secondary) this.currentSecondary = secondary;
    if (trail) this.currentTrail = trail;
  }

  /**
   * Evalúa y actualiza los desbloqueos del jugador basados en sus estadísticas y logros
   */
  evaluateUnlocks(stats = {}, achievements = [], completedLevels = []) {
    const jumps = stats.total_jumps || 0;
    const attempts = stats.total_attempts || 0;
    const coins = stats.total_coins || 0;

    for (const skin of this.SKINS) {
      if (skin.unlockedByDefault) {
        this.unlockedSkins.add(skin.id);
        continue;
      }
      if (skin.reqType === 'jumps' && jumps >= skin.reqValue) {
        this.unlockedSkins.add(skin.id);
      } else if (skin.reqType === 'attempts' && attempts >= skin.reqValue) {
        this.unlockedSkins.add(skin.id);
      } else if (skin.reqType === 'coins' && coins >= skin.reqValue) {
        this.unlockedSkins.add(skin.id);
      } else if (skin.reqType === 'level' && completedLevels.includes(skin.reqValue)) {
        this.unlockedSkins.add(skin.id);
      }
    }

    return Array.from(this.unlockedSkins);
  }

  isSkinUnlocked(skinId) {
    return this.unlockedSkins.has(skinId);
  }

  isItemUnlocked(item, stats = {}, completedLevels = []) {
    if (!item) return true;
    if (item.unlockedByDefault) return true;
    const jumps = stats.total_jumps || 0;
    const attempts = stats.total_attempts || 0;
    const coins = stats.total_coins || 0;

    if (item.reqType === 'jumps') return jumps >= item.reqValue;
    if (item.reqType === 'attempts') return attempts >= item.reqValue;
    if (item.reqType === 'coins') return coins >= item.reqValue;
    if (item.reqType === 'level') return completedLevels.includes(item.reqValue);
    return false;
  }

  /**
   * Renderizado dinámico del icono seleccionado con su cara, colores y alta definición visual
   */
  drawCube(ctx, width, height, customIcon, customPrimary, customSecondary) {
    const icon = customIcon || this.currentIcon;
    const primary = customPrimary || this.currentPrimary;
    const secondary = customSecondary || this.currentSecondary;

    const halfW = width / 2;
    const halfH = height / 2;

    ctx.save();

    // 1. Resplandor exterior neón
    ctx.shadowColor = primary;
    ctx.shadowBlur = 14;

    // 2. Cuerpo exterior (Primary)
    ctx.fillStyle = primary;
    ctx.fillRect(-halfW, -halfH, width, height);

    // 3. Biselado / Marco exterior de alto contraste
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#021008';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(-halfW + 1.75, -halfH + 1.75, width - 3.5, height - 3.5);

    // Cara interior
    const inset = Math.round(width * 0.16);
    const innerW = width - (inset * 2);
    const innerH = height - (inset * 2);

    if (icon === 'NINJA') {
      // --- CUBO NINJA ---
      // Cara interior
      ctx.fillStyle = secondary;
      ctx.fillRect(-halfW + inset, -halfH + inset, innerW, innerH);

      // Franja frontal de la cinta ninja
      ctx.fillStyle = '#050a12';
      ctx.fillRect(-halfW + 3, -halfH + Math.round(height * 0.3), width - 6, Math.round(height * 0.3));

      // Visor ocular luminoso (hendidura afilada)
      ctx.fillStyle = primary;
      ctx.shadowColor = primary;
      ctx.shadowBlur = 8;
      ctx.fillRect(-halfW + Math.round(width * 0.22), -halfH + Math.round(height * 0.38), Math.round(width * 0.56), Math.round(height * 0.12));
      ctx.shadowBlur = 0;

      // Destello central
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-halfW + Math.round(width * 0.35), -halfH + Math.round(height * 0.4), Math.round(width * 0.1), Math.round(height * 0.08));

      // Lazos traseros de la cinta
      ctx.fillStyle = secondary;
      ctx.beginPath();
      ctx.moveTo(-halfW + 2, -halfH + Math.round(height * 0.32));
      ctx.lineTo(-halfW - 6, -halfH + Math.round(height * 0.2));
      ctx.lineTo(-halfW - 4, -halfH + Math.round(height * 0.45));
      ctx.closePath();
      ctx.fill();

    } else if (icon === 'CYCLOPS') {
      // --- CUBO CÍCLOPE ---
      ctx.fillStyle = secondary;
      ctx.fillRect(-halfW + inset, -halfH + inset, innerW, innerH);

      // Remaches en las 4 esquinas del chasis
      ctx.fillStyle = '#021008';
      const rivetOffset = Math.round(width * 0.08);
      const rivetSize = Math.max(3, Math.round(width * 0.06));
      ctx.fillRect(-halfW + rivetOffset, -halfH + rivetOffset, rivetSize, rivetSize);
      ctx.fillRect(halfW - rivetOffset - rivetSize, -halfH + rivetOffset, rivetSize, rivetSize);
      ctx.fillRect(-halfW + rivetOffset, halfH - rivetOffset - rivetSize, rivetSize, rivetSize);
      ctx.fillRect(halfW - rivetOffset - rivetSize, halfH - rivetOffset - rivetSize, rivetSize, rivetSize);

      // Aro exterior del lente
      const eyeRadius = Math.round(width * 0.26);
      ctx.fillStyle = '#030814';
      ctx.beginPath();
      ctx.arc(0, 0, eyeRadius, 0, Math.PI * 2);
      ctx.fill();

      // Anillo concéntrico de enfoque
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, eyeRadius - 2, 0, Math.PI * 2);
      ctx.stroke();

      // Pupila láser brillante
      ctx.fillStyle = primary;
      ctx.shadowColor = primary;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, Math.round(eyeRadius * 0.55), 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Destello óptico
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-Math.round(eyeRadius * 0.22), -Math.round(eyeRadius * 0.22), Math.max(2, Math.round(eyeRadius * 0.18)), 0, Math.PI * 2);
      ctx.fill();

    } else if (icon === 'ROBOT') {
      // --- CUBO CIBER ROBOT ---
      // Antena superior
      ctx.fillStyle = primary;
      ctx.fillRect(-Math.round(width * 0.04), -halfH - Math.round(height * 0.18), Math.round(width * 0.08), Math.round(height * 0.18));
      ctx.fillStyle = secondary;
      ctx.shadowColor = secondary;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(0, -halfH - Math.round(height * 0.2), Math.round(width * 0.08), 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Placa frontal
      ctx.fillStyle = secondary;
      ctx.fillRect(-halfW + inset, -halfH + inset, innerW, innerH);

      // Ojos LED rectangulares
      ctx.fillStyle = '#021008';
      const eyeW = Math.round(width * 0.18);
      const eyeH = Math.round(height * 0.13);
      ctx.fillRect(-halfW + Math.round(width * 0.22), -halfH + Math.round(height * 0.24), eyeW, eyeH);
      ctx.fillRect(halfW - Math.round(width * 0.22) - eyeW, -halfH + Math.round(height * 0.24), eyeW, eyeH);

      // Pupilas LED luminosas
      ctx.fillStyle = primary;
      ctx.shadowColor = primary;
      ctx.shadowBlur = 6;
      ctx.fillRect(-halfW + Math.round(width * 0.25), -halfH + Math.round(height * 0.26), Math.round(eyeW * 0.65), Math.round(eyeH * 0.65));
      ctx.fillRect(halfW - Math.round(width * 0.22) - eyeW + Math.round(eyeW * 0.15), -halfH + Math.round(height * 0.26), Math.round(eyeW * 0.65), Math.round(eyeH * 0.65));
      ctx.shadowBlur = 0;

      // Rejilla / Dientes cibernéticos
      ctx.fillStyle = '#021008';
      const teethCount = 4;
      const toothW = Math.max(3, Math.round(width * 0.08));
      const toothGap = Math.round(width * 0.04);
      const startX = -((teethCount * toothW + (teethCount - 1) * toothGap) / 2);
      for (let i = 0; i < teethCount; i++) {
        ctx.fillRect(startX + i * (toothW + toothGap), halfH - Math.round(height * 0.34), toothW, Math.round(height * 0.16));
      }

    } else if (icon === 'DIAMOND') {
      // --- CUBO NEÓN BISELADO ---
      // Fondo interno
      ctx.fillStyle = secondary;
      ctx.fillRect(-halfW + inset, -halfH + inset, innerW, innerH);

      // Facetas triangulares de prisma en las 4 esquinas interiores
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.moveTo(-halfW + inset, -halfH + inset);
      ctx.lineTo(0, 0);
      ctx.lineTo(-halfW + inset, halfH - inset);
      ctx.closePath();
      ctx.fill();

      // Diamante concéntrico central exterior
      const diamondRadius = Math.round(width * 0.32);
      ctx.fillStyle = '#021008';
      ctx.beginPath();
      ctx.moveTo(0, -diamondRadius);
      ctx.lineTo(diamondRadius, 0);
      ctx.lineTo(0, diamondRadius);
      ctx.lineTo(-diamondRadius, 0);
      ctx.closePath();
      ctx.fill();

      // Diamante núcleo luminoso
      const coreRadius = Math.round(diamondRadius * 0.55);
      ctx.fillStyle = primary;
      ctx.shadowColor = primary;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(0, -coreRadius);
      ctx.lineTo(coreRadius, 0);
      ctx.lineTo(0, coreRadius);
      ctx.lineTo(-coreRadius, 0);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Destello central
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(2, Math.round(coreRadius * 0.3)), 0, Math.PI * 2);
      ctx.fill();

    } else if (icon === 'GLITCH') {
      // --- CUBO SOMBRA GLITCH ---
      // Desfase holográfico / Sombra fantasma lateral
      ctx.fillStyle = 'rgba(255, 0, 85, 0.35)';
      ctx.fillRect(-halfW - 3, -halfH + 2, width, height);

      ctx.fillStyle = 'rgba(0, 243, 255, 0.35)';
      ctx.fillRect(-halfW + 3, -halfH - 2, width, height);

      // Placa central
      ctx.fillStyle = secondary;
      ctx.fillRect(-halfW + inset, -halfH + inset, innerW, innerH);

      // Franjas de desfase digital (scanlines)
      ctx.fillStyle = '#020612';
      ctx.fillRect(-halfW + 4, -halfH + Math.round(height * 0.22), width - 8, Math.round(height * 0.12));
      ctx.fillRect(-halfW + 8, -halfH + Math.round(height * 0.44), width - 14, Math.round(height * 0.09));
      ctx.fillRect(-halfW + 6, halfH - Math.round(height * 0.32), width - 12, Math.round(height * 0.1));

      // Ojos asimétricos estilo hacker
      ctx.fillStyle = primary;
      ctx.shadowColor = primary;
      ctx.shadowBlur = 8;
      ctx.fillRect(-halfW + Math.round(width * 0.2), -halfH + Math.round(height * 0.24), Math.round(width * 0.22), Math.round(height * 0.08));
      ctx.fillRect(halfW - Math.round(width * 0.38), -halfH + Math.round(height * 0.24), Math.round(width * 0.24), Math.round(height * 0.1));
      ctx.shadowBlur = 0;

      // Segmentos de matriz digital
      ctx.fillStyle = secondary;
      ctx.fillRect(-halfW + Math.round(width * 0.28), halfH - Math.round(height * 0.28), Math.round(width * 0.08), Math.round(height * 0.05));
      ctx.fillRect(-halfW + Math.round(width * 0.42), halfH - Math.round(height * 0.28), Math.round(width * 0.12), Math.round(height * 0.05));
      ctx.fillRect(halfW - Math.round(width * 0.32), halfH - Math.round(height * 0.28), Math.round(width * 0.09), Math.round(height * 0.05));

    } else {
      // --- CLASSIC (Diseño Legendario) ---
      ctx.fillStyle = secondary;
      ctx.fillRect(-halfW + inset, -halfH + inset, innerW, innerH);

      // Ojos cuadrados simétricos
      ctx.fillStyle = '#021008';
      const eyeSize = Math.max(5, Math.round(width * 0.16));
      const eyeY = -halfH + Math.round(height * 0.25);
      const eyeXOffset = Math.round(width * 0.24);

      ctx.fillRect(-halfW + eyeXOffset, eyeY, eyeSize, eyeSize);
      ctx.fillRect(halfW - eyeXOffset - eyeSize, eyeY, eyeSize, eyeSize);

      // Pupilas con destello luminoso
      ctx.fillStyle = primary;
      ctx.fillRect(-halfW + eyeXOffset + 1, eyeY + 1, Math.max(2, eyeSize - 2), Math.max(2, eyeSize - 2));
      ctx.fillRect(halfW - eyeXOffset - eyeSize + 1, eyeY + 1, Math.max(2, eyeSize - 2), Math.max(2, eyeSize - 2));

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-halfW + eyeXOffset + 1, eyeY + 1, Math.max(1, Math.round(eyeSize * 0.35)), Math.max(1, Math.round(eyeSize * 0.35)));
      ctx.fillRect(halfW - eyeXOffset - eyeSize + 1, eyeY + 1, Math.max(1, Math.round(eyeSize * 0.35)), Math.max(1, Math.round(eyeSize * 0.35)));

      // Boca rectangular característica de Geometry Dash
      ctx.fillStyle = '#021008';
      const mouthW = Math.round(width * 0.42);
      const mouthH = Math.max(3, Math.round(height * 0.09));
      ctx.fillRect(-mouthW / 2, halfH - Math.round(height * 0.32), mouthW, mouthH);
    }

    ctx.restore();
  }

  /**
   * Renderizado del Vehículo Nave / Avioncito (Ship Mode)
   * Diseñado con estética neón vectorial, chasis aerodinámico, alas en delta,
   * cabina de piloto con núcleo luminoso y llama de propulsión animada.
   */
  drawShip(ctx, width = 48, height = 48, isThrusting = false, customPrimary = null, customSecondary = null) {
    const primary = customPrimary || this.currentPrimary;
    const secondary = customSecondary || this.currentSecondary;

    const halfW = width / 2;
    const halfH = height / 2;

    ctx.save();

    // 1. Llama de propulsión / Reactor trasero cuando acelera (isThrusting)
    if (isThrusting) {
      const time = performance.now() * 0.03;
      const flameLen = 14 + Math.sin(time) * 5 + Math.random() * 4;
      const flameH = 9 + Math.cos(time * 1.5) * 2;

      ctx.save();
      ctx.shadowColor = secondary;
      ctx.shadowBlur = 16;

      // Llama exterior
      ctx.fillStyle = secondary;
      ctx.beginPath();
      ctx.moveTo(-halfW + 4, -flameH * 0.6);
      ctx.lineTo(-halfW - flameLen, 0);
      ctx.lineTo(-halfW + 4, flameH * 0.6);
      ctx.closePath();
      ctx.fill();

      // Núcleo blanco incandescente de plasma
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-halfW + 4, -flameH * 0.3);
      ctx.lineTo(-halfW - flameLen * 0.55, 0);
      ctx.lineTo(-halfW + 4, flameH * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 2. Resplandor exterior Neón del Chasis
    ctx.shadowColor = primary;
    ctx.shadowBlur = 14;

    // 3. Tobera de escape trasera (Cilíndrica)
    ctx.fillStyle = '#060a17';
    ctx.fillRect(-halfW + 1, -6, 7, 12);
    ctx.strokeStyle = primary;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-halfW + 1, -6, 7, 12);

    // 4. Ala inferior / Quilla
    ctx.fillStyle = secondary;
    ctx.beginPath();
    ctx.moveTo(-halfW + 12, 4);
    ctx.lineTo(-halfW + 4, halfH - 2);
    ctx.lineTo(2, 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#020814';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 5. Ala superior / Alerón delta
    ctx.fillStyle = secondary;
    ctx.beginPath();
    ctx.moveTo(-halfW + 12, -4);
    ctx.lineTo(-halfW + 4, -halfH + 2);
    ctx.lineTo(2, -6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#020814';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 6. Fuselaje principal de la nave (Cuerpo aerodinámico)
    ctx.fillStyle = primary;
    ctx.beginPath();
    // Vértice frontal (Morro afilado)
    ctx.moveTo(halfW, 0);
    // Curva superior del lomo
    ctx.lineTo(halfW * 0.2, -halfH * 0.6);
    ctx.lineTo(-halfW + 8, -halfH * 0.45);
    ctx.lineTo(-halfW + 6, -3);
    // Base trasera
    ctx.lineTo(-halfW + 6, 3);
    // Curva inferior del vientre
    ctx.lineTo(-halfW + 8, halfH * 0.45);
    ctx.lineTo(halfW * 0.2, halfH * 0.6);
    ctx.closePath();
    ctx.fill();

    // Borde de alto contraste
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#020814';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 7. Franjas aerodinámicas de carrocería (Secondary)
    ctx.fillStyle = secondary;
    ctx.beginPath();
    ctx.moveTo(halfW * 0.35, 0);
    ctx.lineTo(-halfW + 12, -halfH * 0.28);
    ctx.lineTo(-halfW + 18, 0);
    ctx.lineTo(-halfW + 12, halfH * 0.28);
    ctx.closePath();
    ctx.fill();

    // 8. Cúpula de la Cabina del Piloto (Cockpit)
    const cockpitX = -2;
    const cockpitY = -2;
    const cockpitW = 14;
    const cockpitH = 10;

    // Cristal oscuro de la cabina
    ctx.fillStyle = '#030814';
    ctx.beginPath();
    ctx.roundRect(cockpitX - cockpitW / 2, cockpitY - cockpitH / 2, cockpitW, cockpitH, 3);
    ctx.fill();
    ctx.strokeStyle = primary;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Piloto (Minicubo interior iluminado)
    ctx.fillStyle = secondary;
    ctx.fillRect(cockpitX - 3, cockpitY - 2.5, 6, 5);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cockpitX - 1, cockpitY - 1.5, 2, 2);

    // 9. Luz de posición en la punta del morro
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 6;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(halfW - 2, 0, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
