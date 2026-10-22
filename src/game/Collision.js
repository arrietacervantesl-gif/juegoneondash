/**
 * Sistema de Colisiones de Neon Dash
 * Incluye resolución AABB precisa para bloques, SAT (Separating Axis Theorem)
 * para pinchos, y detección de triggers interactivos (Portales, Orbes y Monedas).
 */

import { PHYSICS_CONFIG } from './Physics.js';

export class CollisionSystem {
  static checkBoundaries(player, floorY, ceilingY) {
    // En Modo Nave, chocar contra el suelo o techo desprotegido es fatal
    if (player.mode === 'SHIP') {
      if (player.y + player.height >= floorY || player.y <= ceilingY) {
        return { fatal: true, landedOnTop: false };
      }
      return { fatal: false, landedOnTop: false };
    }

    // Modo Cubo estándar
    if (player.gravityDir === 1) {
      if (player.y + player.height >= floorY) {
        if (player.vy >= 0) {
          player.y = floorY - player.height;
          player.vy = 0;
          player.velocityY = 0;
          player.isGrounded = true;
          const quarterTurn = Math.PI / 2;
          player.rotation = Math.round(player.rotation / quarterTurn) * quarterTurn;
          return { fatal: false, landedOnTop: true };
        }
      }
    } else {
      if (player.y <= ceilingY) {
        if (player.vy <= 0) {
          player.y = ceilingY;
          player.vy = 0;
          player.velocityY = 0;
          player.isGrounded = true;
          const quarterTurn = Math.PI / 2;
          player.rotation = Math.round(player.rotation / quarterTurn) * quarterTurn;
          return { fatal: false, landedOnTop: true };
        }
      }
    }
    return { fatal: false, landedOnTop: false };
  }

  static checkObstacle(player, obstacle) {
    if (obstacle.type === 'BLOCK') {
      return this.checkBlock(player, obstacle);
    } else if (obstacle.type === 'SPIKE') {
      return this.checkSpike(player, obstacle);
    }
    return { fatal: false, landedOnTop: false };
  }

  /**
   * Resolución de Colisiones AABB precisa para bloques sólidos
   * - Distingue matemáticamente entre aterrizaje en la parte superior e impacto lateral frontal fatal.
   * - Resuelve el reposicionamiento sobre la plataforma sin atascos en bordes/esquinas.
   */
  static checkBlock(player, block) {
    const pLeft = player.x;
    const pRight = player.x + player.width;
    const pTop = player.y;
    const pBottom = player.y + player.height;

    const bLeft = block.x;
    const bRight = block.x + block.width;
    const bTop = block.y;
    const bBottom = block.y + block.height;

    // 1. Cálculo de Superposición AABB (Overlap)
    const overlapX = Math.min(pRight, bRight) - Math.max(pLeft, bLeft);
    const overlapY = Math.min(pBottom, bBottom) - Math.max(pTop, bTop);

    // Si no hay superposición horizontal, no hay contacto con este bloque
    if (overlapX <= 0) {
      return { fatal: false, landedOnTop: false };
    }

    const CONTACT_EPSILON = 1.0;
    const landingTolerance = PHYSICS_CONFIG?.LANDING_TOLERANCE || 14;

    // Verificar si el cubo está apoyado en reposo sobre la cara superior/inferior del bloque
    const isRestingNormal = (player.gravityDir === 1) && 
      (Math.abs(pBottom - bTop) <= CONTACT_EPSILON) && 
      (player.vy >= 0);

    const isRestingInverted = (player.gravityDir === -1) && 
      (Math.abs(pTop - bBottom) <= CONTACT_EPSILON) && 
      (player.vy <= 0);

    // Si no hay superposición vertical ni está en reposo sobre la superficie, no hay colisión
    if (overlapY <= 0 && !isRestingNormal && !isRestingInverted) {
      return { fatal: false, landedOnTop: false };
    }

    // 2. Gravedad Normal (+1: caída hacia el suelo)
    if (player.gravityDir === 1) {
      const prevBottom = player.prevY + player.height;
      const isFallingOrGrounded = player.vy >= 0;

      // Invasión Superior (Aterrizaje y reposición sobre la plataforma):
      // Si el cubo colisiona con la parte superior de un bloque (cubo.y + cubo.height >= bloque.y)
      // mientras desciende o está apoyado, y su posición previa o actual estaba en la tolerancia de aterrizaje:
      if (isFallingOrGrounded && (prevBottom <= bTop + landingTolerance || pBottom <= bTop + landingTolerance)) {
        player.y = bTop - player.height;
        player.vy = 0;
        player.velocityY = 0;
        player.isGrounded = true;
        const quarterTurn = Math.PI / 2;
        player.rotation = Math.round(player.rotation / quarterTurn) * quarterTurn;
        return { fatal: false, landedOnTop: true };
      }

      // Si el cubo saltaba hacia arriba y su cabeza impacta la parte inferior del bloque:
      if (player.vy < 0 && pTop < bBottom && prevBottom > bTop + landingTolerance) {
        return { fatal: true, landedOnTop: false };
      }

      // Invasión Lateral:
      // Si el cubo impacta de frente contra la pared lateral de un bloque (cubo.x + cubo.width > bloque.x mientras está a menor altura)
      if (pRight > bLeft && (pBottom > bTop + landingTolerance || prevBottom > bTop + landingTolerance)) {
        return { fatal: true, landedOnTop: false };
      }
    } 
    // 3. Gravedad Invertida (-1: caída hacia el techo)
    else {
      const prevTop = player.prevY;
      const isRisingOrGrounded = player.vy <= 0;

      // Invasión Superior/Techo del bloque invertido (superficie inferior del bloque):
      if (isRisingOrGrounded && (prevTop >= bBottom - landingTolerance || pTop >= bBottom - landingTolerance)) {
        player.y = bBottom;
        player.vy = 0;
        player.velocityY = 0;
        player.isGrounded = true;
        const quarterTurn = Math.PI / 2;
        player.rotation = Math.round(player.rotation / quarterTurn) * quarterTurn;
        return { fatal: false, landedOnTop: true };
      }

      // Si caía hacia abajo y golpea la superficie opuesta con la cabeza:
      if (player.vy > 0 && pBottom > bTop && prevTop < bBottom - landingTolerance) {
        return { fatal: true, landedOnTop: false };
      }

      // Invasión Lateral en gravedad invertida:
      if (pRight > bLeft && (pTop < bBottom - landingTolerance || prevTop < bBottom - landingTolerance)) {
        return { fatal: true, landedOnTop: false };
      }
    }

    // Cualquier otra intrusión no resuelta se considera impacto fatal
    return { fatal: true, landedOnTop: false };
  }

  /**
   * Detección de colisión SAT (Separating Axis Theorem) para pinchos triangulares
   */
  static checkSpike(player, spike) {
    const spikeVertices = spike.getHitboxVertices();
    const hb = player.getHitbox();

    const boxVertices = [
      { x: hb.x, y: hb.y },
      { x: hb.x + hb.width, y: hb.y },
      { x: hb.x + hb.width, y: hb.y + hb.height },
      { x: hb.x, y: hb.y + hb.height }
    ];

    // Bounding box rápido preliminar
    const spikeMinX = Math.min(spikeVertices[0].x, spikeVertices[1].x, spikeVertices[2].x);
    const spikeMaxX = Math.max(spikeVertices[0].x, spikeVertices[1].x, spikeVertices[2].x);
    const spikeMinY = Math.min(spikeVertices[0].y, spikeVertices[1].y, spikeVertices[2].y);
    const spikeMaxY = Math.max(spikeVertices[0].y, spikeVertices[1].y, spikeVertices[2].y);

    if (
      hb.x + hb.width < spikeMinX ||
      hb.x > spikeMaxX ||
      hb.y + hb.height < spikeMinY ||
      hb.y > spikeMaxY
    ) {
      return { fatal: false, landedOnTop: false };
    }

    // Ejes normales del rectángulo y del triángulo
    const axes = [
      { x: 1, y: 0 },
      { x: 0, y: 1 }
    ];

    for (let i = 0; i < 3; i++) {
      const p1 = spikeVertices[i];
      const p2 = spikeVertices[(i + 1) % 3];
      const edge = { x: p2.x - p1.x, y: p2.y - p1.y };
      const normal = { x: -edge.y, y: edge.x };
      const len = Math.hypot(normal.x, normal.y);
      if (len > 0) {
        axes.push({ x: normal.x / len, y: normal.y / len });
      }
    }

    for (const axis of axes) {
      const projBox = this.projectVertices(boxVertices, axis);
      const projSpike = this.projectVertices(spikeVertices, axis);

      if (projBox.max < projSpike.min || projSpike.max < projBox.min) {
        return { fatal: false, landedOnTop: false };
      }
    }

    return { fatal: true, landedOnTop: false };
  }

  /**
   * Evalúa disparadores de interacción: Portales, Orbes y Monedas Secretas
   */
  static checkTriggers(player, entity, inputHandler, audioSystem) {
    const hb = player.getHitbox();

    if (entity.type === 'PORTAL_GRAVITY') {
      const overlaps = (
        hb.x < entity.x + entity.width &&
        hb.x + hb.width > entity.x &&
        hb.y < entity.y + entity.height &&
        hb.y + hb.height > entity.y
      );

      if (overlaps && player.gravityDir !== entity.targetGravity) {
        player.setGravity(entity.targetGravity);
        if (audioSystem) audioSystem.playPortal();
      }
    } else if (entity.type === 'PORTAL_SPEED') {
      const overlaps = (
        hb.x < entity.x + entity.width &&
        hb.x + hb.width > entity.x &&
        hb.y < entity.y + entity.height &&
        hb.y + hb.height > entity.y
      );

      if (overlaps && player.currentSpeedKey !== entity.speedKey) {
        player.setSpeed(entity.speedKey);
        if (audioSystem) audioSystem.playPortal();
      }
    } else if (entity.type === 'PORTAL_GAMEMODE' || entity.type === 'PORTAL_SHIP' || entity.type === 'PORTAL_CUBE') {
      const targetMode = entity.targetMode || (entity.type === 'PORTAL_SHIP' ? 'SHIP' : 'CUBE');
      const overlaps = (
        hb.x < entity.x + entity.width &&
        hb.x + hb.width > entity.x &&
        hb.y < entity.y + entity.height &&
        hb.y + hb.height > entity.y
      );

      if (overlaps && player.mode !== targetMode) {
        player.setMode(targetMode);
        if (audioSystem) audioSystem.playPortal();
      }
    } else if (entity.type === 'ORB') {
      const playerCenterX = player.x + player.width / 2;
      const playerCenterY = player.y + player.height / 2;
      const dist = Math.hypot(playerCenterX - entity.x, playerCenterY - entity.y);

      const triggerRadius = entity.radius + (player.width * 0.45);

      if (dist <= triggerRadius && !entity.activated) {
        if (inputHandler && inputHandler.shouldJump()) {
          entity.activated = true;
          entity.burstProgress = 0.01;
          player.boostFromOrb();
          inputHandler.consumeJump();
          if (audioSystem) audioSystem.playOrb();
        }
      }
    } else if (entity.type === 'COIN') {
      if (!entity.collected) {
        const playerCenterX = player.x + player.width / 2;
        const playerCenterY = player.y + player.height / 2;
        const dist = Math.hypot(playerCenterX - entity.x, playerCenterY - entity.y);

        if (dist <= entity.radius + (player.width * 0.45)) {
          entity.collected = true;
          if (audioSystem) audioSystem.playCoin();
          return { coinCollected: entity.id };
        }
      }
    }

    return null;
  }

  static projectVertices(vertices, axis) {
    let min = (vertices[0].x * axis.x) + (vertices[0].y * axis.y);
    let max = min;
    for (let i = 1; i < vertices.length; i++) {
      const p = (vertices[i].x * axis.x) + (vertices[i].y * axis.y);
      if (p < min) min = p;
      if (p > max) max = p;
    }
    return { min, max };
  }
}
