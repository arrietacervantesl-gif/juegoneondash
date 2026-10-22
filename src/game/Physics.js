/**
 * Neon Dash Physics Constants & Tuning
 * Configuración física optimizada para sensación idéntica al juego original,
 * incluyendo soporte para gravedad invertida, multiplicadores de velocidad y orbes.
 */
export const PHYSICS_CONFIG = {
  // Dimensiones lógicas del Canvas
  CANVAS_WIDTH: 1280,
  CANVAS_HEIGHT: 720,

  // Límites verticales de suelo y techo
  FLOOR_Y: 560,     // Suelo base (gravedad normal)
  CEILING_Y: 120,   // Techo base (gravedad invertida)

  // Tamaño estándar de bloque y cubo (Tile size)
  TILE_SIZE: 48,
  CUBE_SIZE: 48,

  // Hitbox ajustable del jugador: Inset en píxeles para evitar muertes injustas
  // Tamaño visual = 48x48, Tamaño de colisión = 38x38 (48 - 5*2)
  PLAYER_HITBOX_INSET: 5,

  // Simulación determinista a 60 ticks por segundo
  FIXED_TIMESTEP: 1 / 60,
  MAX_FRAME_TIME: 0.1,

  // Velocidades del mapa (Portales de Velocidad)
  SPEEDS: {
    '0.5x': 280,
    '1x': 420,
    '2x': 560,
    '3x': 720
  },
  DEFAULT_SPEED_KEY: '1x',

  // Físicas verticales
  GRAVITY: 2850,
  JUMP_FORCE: -790,
  ORB_JUMP_FORCE: -830,          // Compatibilidad estándar
  YELLOW_ORB_FORCE: -830,        // Orbe Amarillo: Empuje estándar potente en el aire
  PINK_ORB_FORCE: -640,          // Orbe Rosa: Micro-impulso rápido para pasajes estrechos
  YELLOW_PAD_FORCE: -930,        // Almohadilla Amarilla: Impulso automático alto de suelo
  PINK_PAD_FORCE: -710,          // Almohadilla Rosa: Impulso automático controlado
  TERMINAL_VELOCITY: 1150,

  // Rotación del cubo
  ROTATION_SPEED: Math.PI * 4.6,

  // Prevención de atravesamiento (Anti-Tunneling) y tolerancia de esquinas
  MAX_SUBSTEP_DISPLACEMENT: 6,
  LANDING_TOLERANCE: 14,

  // Físicas del Modo Nave (Ship Mode / Avioncito)
  SHIP_GRAVITY: 1650,           // Gravedad descendente suave al soltar el control
  SHIP_THRUST: -2750,           // Aceleración vertical de elevación constante (Hold to Fly)
  SHIP_TERMINAL_VELOCITY: 560,  // Velocidad terminal vertical máxima en nave
  SHIP_ROTATION_LERP: 12,       // Velocidad de suavizado de inclinación angular (Pitch)
  SHIP_MAX_PITCH: Math.PI / 4   // Inclinación máxima de +45° / -45°
};
