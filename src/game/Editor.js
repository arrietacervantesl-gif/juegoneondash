import { Block, Spike, GravityPortal, SpeedPortal, GamemodePortal, ShipPortal, CubePortal, JumpOrb, SecretCoin } from './Obstacle.js';
import { PHYSICS_CONFIG } from './Physics.js';

/**
 * Editor de Niveles In-Game (Drag & Drop / Tile Placement) para Neon Dash
 * Permite colocar y borrar bloques, pinchos, portales, orbes y monedas sobre
 * una cuadrícula de 48x48, con navegación y exportación/importación JSON.
 */
export class LevelEditor {
  /**
   * @param {HTMLCanvasElement} canvas 
   * @param {import('./Level.js').Level} level 
   */
  constructor(canvas, level) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.level = level;

    this.active = false;
    this.selectedTool = 'BLOCK';
    this.cameraX = 0;
    this.tileSize = PHYSICS_CONFIG.TILE_SIZE;

    // Estado del cursor del ratón
    this.hoverX = 0;
    this.hoverY = 0;
    this.isMouseDown = false;
    this.isPanning = false;
    this.panStartX = 0;
    this.camStartPanX = 0;

    // Vincular eventos
    this._onPointerMove = this.handlePointerMove.bind(this);
    this._onPointerDown = this.handlePointerDown.bind(this);
    this._onPointerUp = this.handlePointerUp.bind(this);
    this._onContextMenu = (e) => { if (this.active) e.preventDefault(); };

    this.attachEvents();
  }

  attachEvents() {
    this.canvas.addEventListener('pointermove', this._onPointerMove);
    this.canvas.addEventListener('pointerdown', this._onPointerDown);
    window.addEventListener('pointerup', this._onPointerUp);
    this.canvas.addEventListener('contextmenu', this._onContextMenu);
  }

  setTool(tool) {
    this.selectedTool = tool;
  }

  setCameraX(x) {
    this.cameraX = Math.max(0, x);
  }

  handlePointerMove(e) {
    if (!this.active) return;
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    if (this.isPanning) {
      const deltaX = (e.clientX - this.panStartX) * scaleX;
      this.cameraX = Math.max(0, this.camStartPanX - deltaX);
      return;
    }

    // Alinear a la cuadrícula (Snap to Grid 48px)
    this.hoverX = Math.floor((mouseX + this.cameraX) / this.tileSize) * this.tileSize;
    this.hoverY = Math.floor(mouseY / this.tileSize) * this.tileSize;

    // Si arrastra el botón izquierdo, colocar continuamente
    if (this.isMouseDown && e.button === 0) {
      this.applyToolAtHover();
    }
  }

  handlePointerDown(e) {
    if (!this.active) return;

    // Paneo con botón central o botón derecho
    if (e.button === 1 || (e.button === 2 && this.selectedTool !== 'ERASE')) {
      e.preventDefault();
      this.isPanning = true;
      this.panStartX = e.clientX;
      this.camStartPanX = this.cameraX;
      return;
    }

    if (e.button === 0) {
      this.isMouseDown = true;
      this.applyToolAtHover();
    }
  }

  handlePointerUp() {
    this.isMouseDown = false;
    this.isPanning = false;
  }

  applyToolAtHover() {
    const x = this.hoverX;
    const y = this.hoverY;
    const tile = this.tileSize;

    if (this.selectedTool === 'ERASE') {
      this.removeEntityAt(x, y);
      return;
    }

    // Evitar duplicados exactos en la misma celda
    this.removeEntityAt(x, y);

    switch (this.selectedTool) {
      case 'BLOCK':
        this.level.obstacles.push(new Block(x, y, tile, tile));
        break;
      case 'SPIKE':
        this.level.obstacles.push(new Spike(x, y, tile, tile, false));
        break;
      case 'SPIKE_FLIPPED':
        this.level.obstacles.push(new Spike(x, y, tile, tile, true));
        break;
      case 'PORTAL_GRAV_INV':
        this.level.triggers.push(new GravityPortal(x, y, -1));
        break;
      case 'PORTAL_GRAV_NORM':
        this.level.triggers.push(new GravityPortal(x, y, 1));
        break;
      case 'PORTAL_SPEED_05':
        this.level.triggers.push(new SpeedPortal(x, y, '0.5x'));
        break;
      case 'PORTAL_SPEED_1':
        this.level.triggers.push(new SpeedPortal(x, y, '1x'));
        break;
      case 'PORTAL_SPEED_2':
        this.level.triggers.push(new SpeedPortal(x, y, '2x'));
        break;
      case 'PORTAL_SPEED_3':
        this.level.triggers.push(new SpeedPortal(x, y, '3x'));
        break;
      case 'PORTAL_SHIP':
        this.level.triggers.push(new ShipPortal(x, y));
        break;
      case 'PORTAL_CUBE':
        this.level.triggers.push(new CubePortal(x, y));
        break;
      case 'ORB_YELLOW':
        this.level.orbs.push(new JumpOrb(x + tile / 2, y + tile / 2, 'YELLOW'));
        break;
      case 'SECRET_COIN':
        const nextId = (this.level.coins.length % 3) + 1;
        this.level.coins.push(new SecretCoin(x + tile / 2, y + tile / 2, nextId));
        break;
    }

    // Ajustar longitud total del mapa si se añaden entidades más allá
    if (x + 800 > this.level.totalLength) {
      this.level.totalLength = x + 800;
    }
  }

  removeEntityAt(x, y) {
    const tile = this.tileSize;

    // 1. Obstáculos
    this.level.obstacles = this.level.obstacles.filter(
      o => !(o.x === x && o.y === y)
    );

    // 2. Triggers
    this.level.triggers = this.level.triggers.filter(
      t => !(t.x === x && t.y === y)
    );

    // 3. Orbes (comprobar dentro del rango de la celda)
    this.level.orbs = this.level.orbs.filter(
      orb => !(Math.abs(orb.x - (x + tile / 2)) < 15 && Math.abs(orb.y - (y + tile / 2)) < 15)
    );

    // 4. Monedas
    this.level.coins = this.level.coins.filter(
      c => !(Math.abs(c.x - (x + tile / 2)) < 15 && Math.abs(c.y - (y + tile / 2)) < 15)
    );
  }

  clearAll() {
    this.level.obstacles = [];
    this.level.triggers = [];
    this.level.orbs = [];
    this.level.coins = [];
    this.level.totalLength = 5000;
  }

  /**
   * Dibuja la cuadrícula y el indicador de hover en modo edición
   */
  drawOverlay(ctx) {
    if (!this.active) return;

    const width = this.canvas.width;
    const height = this.canvas.height;
    const tile = this.tileSize;

    ctx.save();

    // 1. Cuadrícula Cyberpunk (Grid Snap)
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.12)';
    ctx.lineWidth = 1;
    const startX = -(this.cameraX % tile);

    for (let x = startX; x < width; x += tile) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += tile) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 2. Cursor de previsualización (Ghost Placement)
    const ghostScreenX = this.hoverX - this.cameraX;
    const ghostScreenY = this.hoverY;

    if (this.selectedTool === 'ERASE') {
      ctx.strokeStyle = '#ff0055';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(ghostScreenX + 2, ghostScreenY + 2, tile - 4, tile - 4);
      ctx.beginPath();
      ctx.moveTo(ghostScreenX + 6, ghostScreenY + 6);
      ctx.lineTo(ghostScreenX + tile - 6, ghostScreenY + tile - 6);
      ctx.moveTo(ghostScreenX + tile - 6, ghostScreenY + 6);
      ctx.lineTo(ghostScreenX + 6, ghostScreenY + tile - 6);
      ctx.stroke();
    } else {
      ctx.fillStyle = 'rgba(0, 243, 255, 0.25)';
      ctx.fillRect(ghostScreenX, ghostScreenY, tile, tile);
      ctx.strokeStyle = '#00f3ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(ghostScreenX, ghostScreenY, tile, tile);
    }

    // 3. HUD de Edición superior
    ctx.fillStyle = 'rgba(5, 8, 20, 0.85)';
    ctx.fillRect(10, 10, 320, 40);
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.4)';
    ctx.strokeRect(10, 10, 320, 40);

    ctx.fillStyle = '#00f3ff';
    ctx.font = 'bold 12px Orbitron, sans-serif';
    ctx.fillText(`HERRAMIENTA: ${this.selectedTool}`, 22, 28);
    ctx.fillStyle = '#7f8ea3';
    ctx.font = '11px Rajdhani, sans-serif';
    ctx.fillText(`X: ${this.hoverX}px | Cámara: ${Math.round(this.cameraX)}px`, 22, 42);

    ctx.restore();
  }
}
