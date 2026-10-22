import { PHYSICS_CONFIG } from './Physics.js';

/**
 * Entidad del Jugador (Cubo de Neon Dash)
 * Integra renderizado con el sistema de Skins/Armario (Icon Kit),
 * emisión de partículas de estela (trail) y físicas de gravedad invertida.
 */
export class Player {
  /**
   * @param {import('./SkinSystem.js').SkinSystem} skinSystem 
   * @param {import('./Particles.js').ParticleSystem} particleSystem 
   */
  constructor(skinSystem, particleSystem) {
    this.width = PHYSICS_CONFIG.CUBE_SIZE;
    this.height = PHYSICS_CONFIG.CUBE_SIZE;
    this.attempts = 1;
    this.skinSystem = skinSystem;
    this.particleSystem = particleSystem;

    this.trailTimer = 0;
    this.thrusterTimer = 0;
    this.mode = 'CUBE'; // 'CUBE' | 'SHIP'
    this.isThrusting = false;

    this.reset(false);
  }

  get velocityY() {
    return this.vy;
  }

  set velocityY(val) {
    this.vy = val;
  }

  get velocityX() {
    return this.vx;
  }

  set velocityX(val) {
    this.vx = val;
  }

  getHitbox() {
    const inset = PHYSICS_CONFIG.PLAYER_HITBOX_INSET;
    return {
      x: this.x + inset,
      y: this.y + inset,
      width: this.width - (inset * 2),
      height: this.height - (inset * 2)
    };
  }

  reset(countAttempt = true) {
    if (countAttempt) {
      this.attempts += 1;
    }

    this.x = 100;
    this.gravityDir = 1;
    this.mode = 'CUBE';
    this.isThrusting = false;
    this.currentSpeedKey = PHYSICS_CONFIG.DEFAULT_SPEED_KEY;

    this.y = PHYSICS_CONFIG.FLOOR_Y - this.height;
    this.prevX = this.x;
    this.prevY = this.y;

    this.vx = PHYSICS_CONFIG.SPEEDS[this.currentSpeedKey];
    this.vy = 0;

    this.rotation = 0;
    this.isGrounded = true;
    this.isDead = false;
  }

  setSpeed(speedKey) {
    if (PHYSICS_CONFIG.SPEEDS[speedKey]) {
      this.currentSpeedKey = speedKey;
      this.vx = PHYSICS_CONFIG.SPEEDS[speedKey];
    }
  }

  setGravity(newGravityDir) {
    if (this.gravityDir !== newGravityDir) {
      this.gravityDir = newGravityDir;
      this.isGrounded = false;
      this.vy = this.gravityDir * 350;
    }
  }

  setMode(newMode) {
    if (this.mode !== newMode) {
      this.mode = newMode;
      this.rotation = 0;
      this.isGrounded = false;
      if (newMode === 'SHIP') {
        // Al entrar en modo nave, suavizar la velocidad vertical para un vuelo estable
        this.vy = Math.max(-220, Math.min(220, this.vy * 0.4));
      }
    }
  }

  jump(inputHandler) {
    this.vy = PHYSICS_CONFIG.JUMP_FORCE * this.gravityDir;
    this.isGrounded = false;
    if (inputHandler) {
      inputHandler.consumeJump();
    }
  }

  boostFromOrb() {
    this.vy = PHYSICS_CONFIG.ORB_JUMP_FORCE * this.gravityDir;
    this.isGrounded = false;
  }

  update(dt, inputHandler) {
    this.prevX = this.x;
    this.prevY = this.y;

    // Movimiento horizontal continuo
    this.x += this.vx * dt;

    if (this.mode === 'SHIP') {
      // --- FÍSICAS DE NAVE / AVIONCITO (SHIP MODE) ---
      const isHolding = !!(inputHandler && inputHandler.isJumpHeld);
      this.isThrusting = isHolding;

      if (isHolding) {
        // Control Mantenido (Hold to Fly): Impulso de aceleración vertical hacia arriba
        this.vy += PHYSICS_CONFIG.SHIP_THRUST * this.gravityDir * dt;
      } else {
        // Al soltar el botón/pantalla: Caída suave debido a la gravedad de nave
        this.vy += PHYSICS_CONFIG.SHIP_GRAVITY * this.gravityDir * dt;
      }

      // Limitar a la velocidad terminal vertical de la nave
      const termVel = PHYSICS_CONFIG.SHIP_TERMINAL_VELOCITY;
      if (this.vy > termVel) this.vy = termVel;
      if (this.vy < -termVel) this.vy = -termVel;

      this.y += this.vy * dt;

      // Inclinación Dinámica (Pitch/Rotation):
      // Se inclina hacia arriba al ascender y hacia abajo al descender (hasta ±45°)
      const normVy = (this.vy / termVel) * this.gravityDir;
      const targetPitch = normVy * PHYSICS_CONFIG.SHIP_MAX_PITCH;
      this.rotation += (targetPitch - this.rotation) * Math.min(1, dt * PHYSICS_CONFIG.SHIP_ROTATION_LERP);

      // Emisión de partículas de propulsión de reactor cuando acelera hacia arriba
      if (this.particleSystem && this.skinSystem && this.isThrusting) {
        this.thrusterTimer += dt;
        if (this.thrusterTimer >= 0.025) {
          this.thrusterTimer = 0;
          const nozzleOffset = -this.width * 0.45;
          const cosR = Math.cos(this.rotation);
          const sinR = Math.sin(this.rotation);
          const exhaustX = this.x + this.width / 2 + (nozzleOffset * cosR);
          const exhaustY = this.y + this.height / 2 + (nozzleOffset * sinR);
          this.particleSystem.createShipThruster(
            exhaustX,
            exhaustY,
            this.skinSystem.currentPrimary,
            this.skinSystem.currentSecondary
          );
        }
      }
    } else {
      // --- FÍSICAS DE CUBO ESTÁNDAR ---
      this.isThrusting = false;

      // Procesar salto si el jugador está en el suelo o sobre una plataforma
      if (this.isGrounded && inputHandler && inputHandler.shouldJump()) {
        this.jump(inputHandler);
      }

      if (!this.isGrounded) {
        // Aplicar aceleración gravitacional de cubo
        this.vy += PHYSICS_CONFIG.GRAVITY * this.gravityDir * dt;

        if (this.gravityDir === 1 && this.vy > PHYSICS_CONFIG.TERMINAL_VELOCITY) {
          this.vy = PHYSICS_CONFIG.TERMINAL_VELOCITY;
        } else if (this.gravityDir === -1 && this.vy < -PHYSICS_CONFIG.TERMINAL_VELOCITY) {
          this.vy = -PHYSICS_CONFIG.TERMINAL_VELOCITY;
        }

        this.y += this.vy * dt;
        this.rotation += PHYSICS_CONFIG.ROTATION_SPEED * this.gravityDir * dt;
      } else {
        this.vy = 0;
        const quarterTurn = Math.PI / 2;
        this.rotation = Math.round(this.rotation / quarterTurn) * quarterTurn;
      }
    }

    // Emisión continua de partículas de estela (trail)
    if (this.particleSystem && this.skinSystem) {
      this.trailTimer += dt;
      if (this.trailTimer >= 0.04) {
        this.trailTimer = 0;
        this.particleSystem.createTrail(
          this.x + this.width * 0.2,
          this.y + this.height * 0.5,
          this.skinSystem.currentTrail,
          this.skinSystem.currentPrimary
        );
      }
    }
  }

  draw(ctx, cameraX) {
    const screenX = this.x - cameraX;
    const screenY = this.y;

    ctx.save();
    ctx.translate(screenX + this.width / 2, screenY + this.height / 2);

    if (this.gravityDir === -1) {
      ctx.scale(1, -1);
    }

    ctx.rotate(this.rotation);

    if (this.skinSystem) {
      if (this.mode === 'SHIP') {
        this.skinSystem.drawShip(ctx, this.width, this.height, this.isThrusting);
      } else {
        this.skinSystem.drawCube(ctx, this.width, this.height);
      }
    } else {
      // Fallback
      ctx.fillStyle = '#39ff14';
      ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    }

    ctx.restore();
  }
}
