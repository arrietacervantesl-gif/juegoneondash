import { Block, Spike, GravityPortal, SpeedPortal, GamemodePortal, ShipPortal, CubePortal, JumpOrb, SecretCoin } from './Obstacle.js';
import { OFFICIAL_LEVELS } from '../data/officialLevels.js';

/**
 * Gestor del Nivel de Neon Dash
 * Soporta carga dinámica de Niveles Oficiales (Campaña),
 * niveles importados desde el Editor de Niveles y niveles comunitarios.
 */
export class Level {
  constructor(initialLevelData = null) {
    this.currentLevelIndex = 0;
    if (initialLevelData) {
      this.loadLevelData(initialLevelData);
    } else {
      this.loadOfficialLevelByIndex(0);
    }
  }

  reset() {
    for (const orb of this.orbs) {
      orb.reset();
    }
    for (const coin of this.coins) {
      coin.reset();
    }
  }

  update(dt) {
    for (const orb of this.orbs) {
      orb.update(dt);
    }
  }

  loadOfficialLevelByIndex(index = 0) {
    const safeIndex = (index >= 0 && index < OFFICIAL_LEVELS.length) ? index : 0;
    this.currentLevelIndex = safeIndex;
    const levelData = OFFICIAL_LEVELS[safeIndex];
    this.loadLevelData(levelData);
  }

  loadLevelData(data) {
    this.id = data.id || 'custom_level_' + Date.now();
    this.name = data.name || 'Nivel Personalizado';
    this.subtitle = data.subtitle || 'Nivel de la Comunidad';
    this.difficulty = data.difficulty || 'Normal';
    this.speedKey = data.speedKey || '1x';
    this.stars = data.stars || 1;
    this.totalLength = data.totalLength || 6000;

    this.obstacles = [];
    this.triggers = [];
    this.orbs = [];
    this.coins = [];

    // Cargar obstáculos
    if (Array.isArray(data.obstacles)) {
      for (const item of data.obstacles) {
        if (item.type === 'BLOCK') {
          this.obstacles.push(new Block(item.x, item.y, item.width, item.height));
        } else if (item.type === 'SPIKE') {
          this.obstacles.push(new Spike(item.x, item.y, item.width, item.height, !!item.flipped));
        }
      }
    }

    // Cargar portales (Triggers)
    if (Array.isArray(data.triggers)) {
      for (const item of data.triggers) {
        if (item.type === 'PORTAL_GRAVITY') {
          this.triggers.push(new GravityPortal(item.x, item.y, item.targetGravity));
        } else if (item.type === 'PORTAL_SPEED') {
          this.triggers.push(new SpeedPortal(item.x, item.y, item.speedKey));
        } else if (item.type === 'PORTAL_GAMEMODE') {
          this.triggers.push(new GamemodePortal(item.x, item.y, item.targetMode || 'SHIP'));
        } else if (item.type === 'PORTAL_SHIP') {
          this.triggers.push(new ShipPortal(item.x, item.y));
        } else if (item.type === 'PORTAL_CUBE') {
          this.triggers.push(new CubePortal(item.x, item.y));
        }
      }
    }

    // Cargar orbes de salto
    if (Array.isArray(data.orbs)) {
      for (const item of data.orbs) {
        this.orbs.push(new JumpOrb(item.x, item.y, item.orbType));
      }
    }

    // Cargar monedas secretas
    if (Array.isArray(data.coins)) {
      for (const item of data.coins) {
        this.coins.push(new SecretCoin(item.x, item.y, item.id));
      }
    }
  }

  exportToJSON() {
    const data = {
      id: this.id,
      name: this.name,
      subtitle: this.subtitle,
      difficulty: this.difficulty,
      speedKey: this.speedKey,
      stars: this.stars,
      totalLength: this.totalLength,
      obstacles: this.obstacles.map(o => ({
        type: o.type,
        x: o.x,
        y: o.y,
        width: o.width,
        height: o.height,
        flipped: !!o.flipped
      })),
      triggers: this.triggers.map(t => ({
        type: t.type,
        x: t.x,
        y: t.y,
        width: t.width,
        height: t.height,
        targetGravity: t.targetGravity,
        speedKey: t.speedKey,
        targetMode: t.targetMode
      })),
      orbs: this.orbs.map(orb => ({
        type: orb.type,
        x: orb.x,
        y: orb.y,
        orbType: orb.orbType
      })),
      coins: this.coins.map(c => ({
        type: c.type,
        x: c.x,
        y: c.y,
        id: c.id
      }))
    };
    return JSON.stringify(data, null, 2);
  }

  loadFromJSON(jsonInput) {
    const data = typeof jsonInput === 'string' ? JSON.parse(jsonInput) : jsonInput;
    this.loadLevelData(data);
  }

  draw(ctx, cameraX) {
    for (const trigger of this.triggers) {
      trigger.draw(ctx, cameraX);
    }
    for (const orb of this.orbs) {
      orb.draw(ctx, cameraX);
    }
    for (const coin of this.coins) {
      coin.draw(ctx, cameraX);
    }
    for (const obstacle of this.obstacles) {
      obstacle.draw(ctx, cameraX);
    }
  }
}
