import { PHYSICS_CONFIG } from './Physics.js';
import { Player } from './Player.js';
import { InputHandler } from './InputHandler.js';
import { Level } from './Level.js';
import { CollisionSystem } from './Collision.js';
import { AudioSystem } from './AudioSystem.js';
import { ParticleSystem } from './Particles.js';
import { SkinSystem } from './SkinSystem.js';
import { LevelEditor } from './Editor.js';
import { CheckpointMarker } from './Obstacle.js';

/**
 * Motor Principal de Neon Dash (Fase 5: Pulido Visual, Parallax y Shaders)
 */
export class GameEngine {
  constructor(canvasElement, uiCallbacks = {}) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.uiCallbacks = uiCallbacks;

    // Modos: 'NORMAL' | 'PRACTICE' | 'EDITOR'
    this.gameMode = 'NORMAL';
    this.isPaused = true; // Inicia pausado mientras se navega por el menú principal

    this.skinSystem = new SkinSystem();
    this.particleSystem = new ParticleSystem();
    this.audioSystem = new AudioSystem();
    this.inputHandler = new InputHandler(this.canvas);
    this.level = new Level();
    this.player = new Player(this.skinSystem, this.particleSystem);
    this.editor = new LevelEditor(this.canvas, this.level);

    this.checkpoints = [];
    this.collectedCoins = new Set();

    // Beat Sync reactivo
    this.beatPulse = 0;
    this.audioSystem.onBeat((beatInfo) => {
      if (beatInfo.isKick) {
        this.beatPulse = 1.0;
      } else if (beatInfo.isSnare) {
        this.beatPulse = Math.max(this.beatPulse, 0.65);
      }
    });

    // Campo de Estrellas Parallax (Fase 5)
    this.stars = [];
    this.initParallaxStars();

    this.cameraX = 0;
    this.CAMERA_OFFSET_X = 220;

    this.accumulator = 0;
    this.lastTime = performance.now();
    this.isRunning = false;
    this.animationFrameId = null;

    this.frameCount = 0;
    this.lastFpsUpdate = performance.now();
    this.currentFps = 60;
    this.lastProgress = 0;
    this.isVictorious = false;

    this.deathFlashElement = document.getElementById('deathFlash');

    window.addEventListener('keydown', (e) => {
      const activeTag = document.activeElement ? document.activeElement.tagName : '';
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;

      if (this.gameMode === 'PRACTICE' && !this.isPaused) {
        if (e.code === 'KeyZ') {
          this.placePracticeCheckpoint();
        } else if (e.code === 'KeyX') {
          this.removePracticeCheckpoint();
        }
      }
    });

    this.loop = this.loop.bind(this);
  }

  initParallaxStars() {
    this.stars = [];
    for (let i = 0; i < 70; i++) {
      this.stars.push({
        x: Math.random() * 2500,
        y: Math.random() * PHYSICS_CONFIG.CANVAS_HEIGHT,
        size: 1 + Math.random() * 2.5,
        speed: 0.08 + Math.random() * 0.18,
        baseAlpha: 0.3 + Math.random() * 0.5
      });
    }
  }

  setMode(mode) {
    this.gameMode = mode;
    this.editor.active = (mode === 'EDITOR');

    if (mode === 'EDITOR') {
      this.isPaused = false;
      this.editor.setCameraX(this.cameraX);
    } else {
      this.isPaused = false;
      this.checkpoints = [];
      this.resetLevel(false);
    }
  }

  setPaused(paused) {
    this.isPaused = !!paused;
    if (this.isPaused && this.audioSystem) {
      this.audioSystem.stopBgm();
    }
  }

  setTheme(theme) {
    if (theme) {
      this.currentTheme = theme;
    }
  }

  placePracticeCheckpoint() {
    if (this.gameMode !== 'PRACTICE') return;

    const cp = {
      x: this.player.x,
      y: this.player.y,
      vy: this.player.vy,
      gravityDir: this.player.gravityDir,
      mode: this.player.mode || 'CUBE',
      speedKey: this.player.currentSpeedKey,
      rotation: this.player.rotation,
      cameraX: this.cameraX
    };

    this.checkpoints.push(cp);
    this.particleSystem.createCheckpointWave(this.player.x + 24, this.player.y + 24);
    this.audioSystem.playCheckpoint();

    if (this.uiCallbacks.onCheckpointChange) {
      this.uiCallbacks.onCheckpointChange(this.checkpoints.length);
    }
  }

  removePracticeCheckpoint() {
    if (this.gameMode !== 'PRACTICE' || this.checkpoints.length === 0) return;
    this.checkpoints.pop();

    if (this.uiCallbacks.onCheckpointChange) {
      this.uiCallbacks.onCheckpointChange(this.checkpoints.length);
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.audioSystem.stopBgm();
  }

  loop(currentTime) {
    if (!this.isRunning) return;

    let frameTime = (currentTime - this.lastTime) / 1000;
    if (frameTime > PHYSICS_CONFIG.MAX_FRAME_TIME) {
      frameTime = PHYSICS_CONFIG.MAX_FRAME_TIME;
    }
    this.lastTime = currentTime;
    this.accumulator += frameTime;

    while (this.accumulator >= PHYSICS_CONFIG.FIXED_TIMESTEP) {
      if (this.gameMode !== 'EDITOR' && !this.isVictorious && !this.isPaused) {
        this.fixedUpdate(PHYSICS_CONFIG.FIXED_TIMESTEP);
      }
      this.accumulator -= PHYSICS_CONFIG.FIXED_TIMESTEP;
    }

    this.beatPulse = Math.max(0, this.beatPulse - frameTime * 4.5);
    this.particleSystem.update(frameTime);

    this.render();
    this.updateFps(currentTime);

    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  fixedUpdate(dt) {
    this.updatePhysics(dt);
  }

  /**
   * Actualización Física Determinista con Sub-stepping Adaptativo (Anti-Tunneling)
   * Divide el avance de tiempo en sub-pasos según la velocidad horizontal o de caída
   * para evaluar colisiones de forma continua antes de traspasar la geometría.
   */
  updatePhysics(dt) {
    this.inputHandler.update(dt);
    this.level.update(dt);

    if (this.player.isDead || this.isVictorious) return;

    // 1. Prevención de Atravesamiento por Velocidad (Anti-Tunneling)
    // Calcula la velocidad máxima actual para garantizar que ningún sub-paso supere un desplazamiento seguro
    const maxVelocity = Math.max(Math.abs(this.player.vx), Math.abs(this.player.vy));
    const maxSafeDisplacement = PHYSICS_CONFIG?.MAX_SUBSTEP_DISPLACEMENT || 6;
    const calculatedSteps = Math.ceil((maxVelocity * dt) / maxSafeDisplacement);
    const SUB_STEPS = Math.max(4, Math.min(16, calculatedSteps));
    const subDt = dt / SUB_STEPS;

    for (let step = 0; step < SUB_STEPS; step++) {
      if (this.player.isDead || this.isVictorious) break;

      const wasGrounded = this.player.isGrounded;

      // Actualizar posición y física en este sub-paso
      this.player.update(subDt, this.inputHandler);

      // Reproducir sonido de salto únicamente en modo cubo cuando hay despegue intencional hacia arriba
      if (this.player.mode === 'CUBE' && wasGrounded && !this.player.isGrounded && (this.player.vy * this.player.gravityDir < 0)) {
        this.audioSystem.playJump();
        if (this.uiCallbacks.onJump) {
          this.uiCallbacks.onJump();
        }
      }

      // 2. Límites verticales de suelo y techo
      const boundaryRes = CollisionSystem.checkBoundaries(
        this.player, 
        PHYSICS_CONFIG.FLOOR_Y, 
        PHYSICS_CONFIG.CEILING_Y
      );

      // Si la nave choca contra el techo o suelo desprotegido, es impacto fatal
      if (boundaryRes.fatal) {
        this.triggerDeath();
        fatalHit = true;
        break;
      }

      let hasSupport = boundaryRes.landedOnTop;

      // 3. Triggers interactivos (Portales, Orbes, Monedas)
      for (const trigger of this.level.triggers) {
        if (Math.abs(trigger.x - this.player.x) > 120) continue;
        CollisionSystem.checkTriggers(this.player, trigger, this.inputHandler, this.audioSystem);
      }

      for (const orb of this.level.orbs) {
        if (Math.abs(orb.x - this.player.x) > 100) continue;
        CollisionSystem.checkTriggers(this.player, orb, this.inputHandler, this.audioSystem);
      }

      for (const coin of this.level.coins) {
        if (Math.abs(coin.x - this.player.x) > 80) continue;
        const res = CollisionSystem.checkTriggers(this.player, coin, this.inputHandler, this.audioSystem);
        if (res && res.coinCollected) {
          this.collectedCoins.add(res.coinCollected);
          this.particleSystem.createCoinSparkle(coin.x, coin.y);
          if (this.uiCallbacks.onCoinUpdate) {
            this.uiCallbacks.onCoinUpdate(this.collectedCoins.size, 3);
          }
        }
      }

      // 4. Obstáculos: Bloques sólidos (AABB landing/wall) y Pinchos (SAT)
      let fatalHit = false;
      for (const obstacle of this.level.obstacles) {
        if (Math.abs(obstacle.x - this.player.x) > 140) continue;

        const result = CollisionSystem.checkObstacle(this.player, obstacle);
        if (result.fatal) {
          this.triggerDeath();
          fatalHit = true;
          break;
        }
        if (result.landedOnTop) {
          hasSupport = true;
        }
      }

      if (fatalHit) break;

      // Si no hay apoyo ni en suelo/techo ni sobre bloque, el jugador está en el aire (caída libre)
      if (!hasSupport) {
        this.player.isGrounded = false;
      }
    }

    if (this.player.isDead) return;

    this.cameraX = this.player.x - this.CAMERA_OFFSET_X;

    const progress = Math.min(100, Math.max(0, Math.floor((this.player.x / this.level.totalLength) * 100)));
    if (progress !== this.lastProgress) {
      this.lastProgress = progress;
      if (this.uiCallbacks.onProgressUpdate) {
        this.uiCallbacks.onProgressUpdate(progress, this.player.currentSpeedKey, this.player.gravityDir, this.player.mode);
      }
    }

    if (this.player.x >= this.level.totalLength) {
      if (!this.isVictorious) {
        this.isVictorious = true;
        this.particleSystem.createConfetti(this.player.x + 24, this.player.y + 24);
        this.audioSystem.playVictory();
        if (this.uiCallbacks.onVictory) {
          this.uiCallbacks.onVictory({
            attempts: this.player.attempts,
            coins: this.collectedCoins.size,
            levelId: this.level.id,
            levelName: this.level.name
          });
        }
      }
    }
  }

  /**
   * Reinicio Limpio de Variables de Estado tras muerte o reinicio de intento (respawn / triggerDeath)
   * - Fuerza velocityY = 0
   * - Restablece la rotación del cubo a un ángulo alineado (rotation = 0)
   * - Limpia completamente la fuerza de salto y resetea la gravedad al estado normal
   */
  respawn() {
    this.audioSystem.playDeath();

    this.particleSystem.createExplosion(
      this.player.x + this.player.width / 2,
      this.player.y + this.player.height / 2,
      this.skinSystem.currentPrimary,
      this.skinSystem.currentSecondary
    );

    // Limpiar completamente la fuerza de salto y la memoria de pulsación
    if (this.inputHandler) {
      this.inputHandler.isJumpHeld = false;
      this.inputHandler.consumeJump();
    }

    if (this.gameMode === 'PRACTICE' && this.checkpoints.length > 0) {
      const lastCp = this.checkpoints[this.checkpoints.length - 1];
      this.player.x = lastCp.x;
      this.player.y = lastCp.y;
      this.player.prevX = lastCp.x;
      this.player.prevY = lastCp.y;
      this.player.vy = 0;
      this.player.velocityY = 0;
      this.player.gravityDir = lastCp.gravityDir || 1;
      this.player.mode = lastCp.mode || 'CUBE';
      this.player.isThrusting = false;
      this.player.currentSpeedKey = lastCp.speedKey || '1x';
      this.player.vx = PHYSICS_CONFIG.SPEEDS[this.player.currentSpeedKey];
      this.player.rotation = 0; // Restablece la rotación alineada a 0
      this.player.isGrounded = false;
      this.player.isDead = false;
      this.cameraX = lastCp.cameraX;
    } else {
      this.resetLevel(true);
    }

    if (this.deathFlashElement) {
      this.deathFlashElement.classList.add('active');
      setTimeout(() => {
        this.deathFlashElement.classList.remove('active');
      }, 70);
    }

    if (this.uiCallbacks.onDeath) {
      this.uiCallbacks.onDeath(this.player.attempts);
    }
  }

  triggerDeath() {
    this.respawn();
  }

  /**
   * Reinicio Completo del Nivel y Variables de Estado
   * Garantiza la limpieza total de velocidad vertical, rotación, gravedad y salto
   */
  resetLevel(countAttempt = true) {
    if (this.inputHandler) {
      this.inputHandler.isJumpHeld = false;
      this.inputHandler.consumeJump();
    }

    this.player.reset(countAttempt);
    this.player.vy = 0;
    this.player.velocityY = 0;
    this.player.rotation = 0;
    this.player.gravityDir = 1;
    this.player.mode = 'CUBE';
    this.player.isThrusting = false;
    this.player.isGrounded = true;

    this.level.reset();
    this.collectedCoins.clear();
    this.cameraX = this.player.x - this.CAMERA_OFFSET_X;
    this.lastProgress = 0;
    this.isVictorious = false;

    if (this.uiCallbacks.onCoinUpdate) {
      this.uiCallbacks.onCoinUpdate(0, 3);
    }
  }

  render() {
    const { ctx, canvas } = this;
    const width = canvas.width;
    const height = canvas.height;
    const floorY = PHYSICS_CONFIG.FLOOR_Y;
    const ceilingY = PHYSICS_CONFIG.CEILING_Y;

    ctx.clearRect(0, 0, width, height);

    // 1. Fondo dinámico con Beat Sync reactivo y Paleta Temática por Nivel
    const isInverted = this.player.gravityDir === -1;
    const pulseFactor = this.beatPulse * 0.22;

    const theme = this.currentTheme || {
      canvasTop: [19, 9, 36],
      canvasMid: [48, 12, 82],
      canvasBottom: [85, 20, 138],
      gridColor: 'rgba(217, 70, 239, 0.18)',
      primaryColor: '#00f3ff',
      secondaryColor: '#d946ef'
    };

    const t = theme.canvasTop || [19, 9, 36];
    const m = theme.canvasMid || [48, 12, 82];
    const b = theme.canvasBottom || [85, 20, 138];

    // Gradiente vertical atmosférico profundo en tonos morados/violetas oscuros del nivel
    const bgGrad = ctx.createLinearGradient(0, ceilingY, 0, floorY);
    if (isInverted) {
      bgGrad.addColorStop(0, `rgb(${Math.min(255, Math.round(b[0] + pulseFactor * 80))}, ${Math.min(255, Math.round(b[1] + pulseFactor * 50))}, ${Math.min(255, Math.round(b[2] + pulseFactor * 60))})`);
      bgGrad.addColorStop(0.5, `rgb(${m[0]}, ${m[1]}, ${m[2]})`);
      bgGrad.addColorStop(1, `rgb(${t[0]}, ${t[1]}, ${t[2]})`);
    } else {
      bgGrad.addColorStop(0, `rgb(${t[0]}, ${t[1]}, ${t[2]})`);
      bgGrad.addColorStop(0.5, `rgb(${Math.min(255, Math.round(m[0] + pulseFactor * 45))}, ${Math.min(255, Math.round(m[1] + pulseFactor * 40))}, ${Math.min(255, Math.round(m[2] + pulseFactor * 55))})`);
      bgGrad.addColorStop(1, `rgb(${Math.min(255, Math.round(b[0] + pulseFactor * 75))}, ${Math.min(255, Math.round(b[1] + pulseFactor * 65))}, ${Math.min(255, Math.round(b[2] + pulseFactor * 85))})`);
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    const activeCamX = (this.gameMode === 'EDITOR') ? this.editor.cameraX : this.cameraX;

    // 2. Fondo Parallax de Cuadrícula / Bloques (Geometry Dash Grid Texture)
    // Desplazamiento suave en segundo plano (efecto parallax ~0.18x)
    const bgGridSize = 72;
    const bgParallaxX = (activeCamX * 0.18) % bgGridSize;
    const gridRows = Math.ceil((floorY - ceilingY) / bgGridSize) + 1;
    const gridCols = Math.ceil(width / bgGridSize) + 2;

    ctx.save();
    const primaryHex = theme.primaryColor || '#00f3ff';
    const secondaryHex = theme.secondaryColor || '#d946ef';

    // Relleno ajedrezado sutil de bloques de fondo en tonos morados oscuros
    for (let c = -1; c < gridCols; c++) {
      const cellX = c * bgGridSize - bgParallaxX;
      for (let r = 0; r < gridRows; r++) {
        const cellY = ceilingY + r * bgGridSize;
        if (cellY + bgGridSize > floorY) continue;

        // Alternancia de cuadros de textura estilo Geometry Dash
        const isAlt = (c + r) % 2 === 0;
        const fillAlpha = isAlt 
          ? (0.035 + this.beatPulse * 0.03) 
          : (0.075 + this.beatPulse * 0.05);

        ctx.fillStyle = isAlt
          ? `rgba(168, 85, 247, ${fillAlpha})`
          : `rgba(192, 132, 252, ${fillAlpha})`;
        ctx.fillRect(cellX, cellY, bgGridSize, bgGridSize);

        // Decoración interna de bloques de fondo (marco interior suave)
        ctx.strokeStyle = `rgba(217, 70, 239, ${0.03 + this.beatPulse * 0.04})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(cellX + 12, cellY + 12, bgGridSize - 24, bgGridSize - 24);

        // Puntos/remaches sutiles en los centros de intersección
        if (isAlt) {
          ctx.fillStyle = `rgba(255, 255, 255, ${0.08 + this.beatPulse * 0.08})`;
          ctx.fillRect(cellX + bgGridSize / 2 - 1, cellY + bgGridSize / 2 - 1, 2, 2);
        }
      }
    }

    // Trazado de líneas de cuadrícula parallax con resplandor neón adaptado al tema
    ctx.strokeStyle = theme.gridColor || `rgba(217, 70, 239, ${0.12 + this.beatPulse * 0.14})`;
    ctx.lineWidth = 1;

    for (let x = -bgParallaxX; x < width + bgGridSize; x += bgGridSize) {
      ctx.beginPath();
      ctx.moveTo(x, ceilingY);
      ctx.lineTo(x, floorY);
      ctx.stroke();
    }
    for (let y = ceilingY; y <= floorY; y += bgGridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();

    // 3. Campo de Estrellas Parallax Dinámico
    ctx.save();
    for (const star of this.stars) {
      const starScreenX = ((star.x - activeCamX * star.speed) % width + width) % width;
      const alpha = Math.min(1, star.baseAlpha + this.beatPulse * 0.35);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.shadowColor = primaryHex;
      ctx.shadowBlur = this.beatPulse > 0.5 ? 6 : 2;
      ctx.fillRect(starScreenX, star.y, star.size, star.size);
    }
    ctx.restore();

    // 4. Techo con resplandor neón
    ctx.fillStyle = '#060312';
    ctx.fillRect(0, 0, width, ceilingY);

    ctx.save();
    const ceilingColor = isInverted ? primaryHex : 'rgba(217, 70, 239, 0.35)';
    ctx.shadowColor = ceilingColor;
    ctx.shadowBlur = isInverted ? (18 + this.beatPulse * 18) : 6;
    ctx.strokeStyle = ceilingColor;
    ctx.lineWidth = isInverted ? 4 : 2;
    ctx.beginPath();
    ctx.moveTo(0, ceilingY);
    ctx.lineTo(width, ceilingY);
    ctx.stroke();

    // Núcleo blanco del techo si está en gravedad invertida
    if (isInverted) {
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 6;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.75;
      ctx.beginPath();
      ctx.moveTo(0, ceilingY);
      ctx.lineTo(width, ceilingY);
      ctx.stroke();
    }
    ctx.restore();

    // 5. Suelo: Zona Inferior de Cuadrículas y Bloques Geométricos
    const floorHeight = height - floorY;
    ctx.fillStyle = '#070312';
    ctx.fillRect(0, floorY, width, floorHeight);

    // Cuadrícula y bloques geométricos en la zona del suelo (Geometry Dash Floor Grid)
    const floorTileSize = 44;
    const floorScrollX = (activeCamX) % floorTileSize;
    ctx.save();
    for (let fx = -floorScrollX; fx < width + floorTileSize; fx += floorTileSize) {
      for (let fy = floorY; fy < height; fy += floorTileSize) {
        const colIdx = Math.floor((fx + activeCamX) / floorTileSize);
        const rowIdx = Math.floor((fy - floorY) / floorTileSize);
        const isFloorAlt = (colIdx + rowIdx) % 2 === 0;

        // Relleno ajedrezado oscuro
        ctx.fillStyle = isFloorAlt ? 'rgba(168, 85, 247, 0.08)' : 'rgba(110, 35, 175, 0.16)';
        ctx.fillRect(fx, fy, floorTileSize, floorTileSize);

        // Decoración geométrica interna del suelo de Geometry Dash
        ctx.strokeStyle = 'rgba(192, 132, 252, 0.18)';
        ctx.lineWidth = 1;
        ctx.strokeRect(fx + 6, fy + 6, floorTileSize - 12, floorTileSize - 12);

        // Línea diagonal decorativa
        if (isFloorAlt) {
          ctx.beginPath();
          ctx.moveTo(fx + 6, fy + 6);
          ctx.lineTo(fx + floorTileSize - 6, fy + floorTileSize - 6);
          ctx.stroke();
        }
      }
    }

    // Sombra degradada superior del suelo para resaltar la línea neón
    const floorShade = ctx.createLinearGradient(0, floorY, 0, floorY + 40);
    floorShade.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
    floorShade.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = floorShade;
    ctx.fillRect(0, floorY, width, 40);
    ctx.restore();

    // 6. Línea de Suelo Neón (Floor Line) con Gradiente y Resplandor Brillante
    ctx.save();
    const floorLineGrad = ctx.createLinearGradient(0, 0, width, 0);
    floorLineGrad.addColorStop(0, primaryHex);
    floorLineGrad.addColorStop(0.5, secondaryHex);
    floorLineGrad.addColorStop(1, primaryHex);

    // Halo Neón amplio y brillante
    const floorGlowColor = !isInverted ? primaryHex : 'rgba(0, 243, 255, 0.4)';
    ctx.shadowColor = floorGlowColor;
    ctx.shadowBlur = !isInverted ? (20 + this.beatPulse * 22) : 6;
    ctx.strokeStyle = floorLineGrad;
    ctx.lineWidth = !isInverted ? (4 + this.beatPulse * 1.5) : 2;
    ctx.beginPath();
    ctx.moveTo(0, floorY);
    ctx.lineTo(width, floorY);
    ctx.stroke();

    // Núcleo Blanco Brillante (Razor-sharp Neon Beam)
    if (!isInverted) {
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 8;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.75;
      ctx.beginPath();
      ctx.moveTo(0, floorY);
      ctx.lineTo(width, floorY);
      ctx.stroke();
    }
    ctx.restore();

    // 6. Entidades del Nivel
    this.level.draw(ctx, activeCamX);

    // 7. Marcadores de Checkpoint (en Modo Práctica)
    if (this.gameMode === 'PRACTICE') {
      for (const cp of this.checkpoints) {
        new CheckpointMarker(cp.x, cp.y, cp.gravityDir).draw(ctx, activeCamX);
      }
    }

    // 8. Partículas activas
    this.particleSystem.draw(ctx, activeCamX);

    // 9. Cubo del Jugador
    if (this.gameMode !== 'EDITOR') {
      this.player.draw(ctx, activeCamX);
    }

    // 10. Superposición del Editor
    if (this.gameMode === 'EDITOR') {
      this.editor.drawOverlay(ctx);
    }
  }

  updateFps(currentTime) {
    this.frameCount++;
    if (currentTime - this.lastFpsUpdate >= 500) {
      this.currentFps = Math.round((this.frameCount * 1000) / (currentTime - this.lastFpsUpdate));
      this.frameCount = 0;
      this.lastFpsUpdate = currentTime;

      if (this.uiCallbacks.onFpsUpdate) {
        this.uiCallbacks.onFpsUpdate(this.currentFps);
      }
    }
  }

  destroy() {
    this.stop();
    this.inputHandler.destroy();
  }
}
