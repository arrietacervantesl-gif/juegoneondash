import stereoMadnessData from './levels/stereo_madness.json';
import backOnTrackData from './levels/back_on_track.json';
import dryOutData from './levels/dry_out.json';
import cyberDemonData from './levels/cyber_demon.json';

/**
 * Catálogo Oficial de Niveles de Neon Dash (Campaña / Modo Historia)
 * 4 Niveles completos y calibrados con diferentes dificultades, velocidades y paletas temáticas.
 */
export const levelStereoMadness = stereoMadnessData;
export const levelBackOnTrack = backOnTrackData;
export const levelDryOut = dryOutData;
export const levelCyberDemon = cyberDemonData;

export const OFFICIAL_LEVELS = [
  levelStereoMadness,
  levelBackOnTrack,
  levelDryOut,
  levelCyberDemon
];

/**
 * Paletas de color temáticas dinámicas por nivel (Estilo Geometry Dash)
 * Cada nivel tiñe suavemente el fondo, degradados, bordes y el Canvas del juego durante la partida.
 */
export const LEVEL_THEMES = {
  level_1_stereo_madness: {
    name: 'Stereo Madness Theme',
    bgColor: '#021838',
    bgGradient: 'radial-gradient(ellipse at 50% 25%, #073a6e 0%, #031c3d 50%, #010f21 100%)',
    primaryColor: '#00f3ff',
    secondaryColor: '#00a8ff',
    accentColor: '#39ff14',
    glowColor: 'rgba(0, 243, 255, 0.55)',
    cardBorder: 'rgba(0, 243, 255, 0.7)',
    difficultyBg: 'rgba(0, 168, 255, 0.25)',
    progressBarNormal: 'linear-gradient(90deg, #00d2ff, #00f3ff)',
    progressBarPractice: 'linear-gradient(90deg, #00b4d8, #48cae4)',
    canvasTop: [2, 16, 36],
    canvasMid: [7, 48, 96],
    canvasBottom: [10, 80, 160],
    gridColor: 'rgba(0, 243, 255, 0.12)'
  },
  level_2_back_on_track: {
    name: 'Back On Track Theme',
    bgColor: '#24043b',
    bgGradient: 'radial-gradient(ellipse at 50% 25%, #590f85 0%, #2e054a 50%, #150224 100%)',
    primaryColor: '#d946ef',
    secondaryColor: '#a855f7',
    accentColor: '#ffe600',
    glowColor: 'rgba(217, 70, 239, 0.55)',
    cardBorder: 'rgba(217, 70, 239, 0.7)',
    difficultyBg: 'rgba(168, 85, 247, 0.25)',
    progressBarNormal: 'linear-gradient(90deg, #c026d3, #e879f9)',
    progressBarPractice: 'linear-gradient(90deg, #9333ea, #c084fc)',
    canvasTop: [24, 3, 40],
    canvasMid: [72, 10, 110],
    canvasBottom: [120, 18, 175],
    gridColor: 'rgba(217, 70, 239, 0.12)'
  },
  level_3_dry_out: {
    name: 'Dry Out Theme',
    bgColor: '#381602',
    bgGradient: 'radial-gradient(ellipse at 50% 25%, #7a3206 0%, #471b03 50%, #1f0b01 100%)',
    primaryColor: '#ff9900',
    secondaryColor: '#ffaa00',
    accentColor: '#ffe600',
    glowColor: 'rgba(255, 153, 0, 0.55)',
    cardBorder: 'rgba(255, 153, 0, 0.7)',
    difficultyBg: 'rgba(255, 153, 0, 0.25)',
    progressBarNormal: 'linear-gradient(90deg, #ea580c, #f97316)',
    progressBarPractice: 'linear-gradient(90deg, #d97706, #fbbf24)',
    canvasTop: [38, 14, 2],
    canvasMid: [95, 38, 6],
    canvasBottom: [155, 65, 10],
    gridColor: 'rgba(255, 153, 0, 0.12)'
  },
  level_4_cyber_demon: {
    name: 'Cyber Demon Theme',
    bgColor: '#38020a',
    bgGradient: 'radial-gradient(ellipse at 50% 25%, #7a0618 0%, #45030e 50%, #210107 100%)',
    primaryColor: '#ff0055',
    secondaryColor: '#ff2a2a',
    accentColor: '#ffe600',
    glowColor: 'rgba(255, 0, 85, 0.65)',
    cardBorder: 'rgba(255, 0, 85, 0.8)',
    difficultyBg: 'rgba(255, 0, 85, 0.3)',
    progressBarNormal: 'linear-gradient(90deg, #dc2626, #ef4444)',
    progressBarPractice: 'linear-gradient(90deg, #be123c, #fb7185)',
    canvasTop: [38, 2, 8],
    canvasMid: [95, 6, 20],
    canvasBottom: [160, 12, 35],
    gridColor: 'rgba(255, 0, 85, 0.12)'
  }
};
