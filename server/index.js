import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import scoreRoutes from './routes/score.routes.js';
import levelRoutes from './routes/level.routes.js';
import achievementRoutes from './routes/achievement.routes.js';
import userRoutes from './routes/user.routes.js';
import { queryOne, runSql } from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});
// Rutas de API REST
app.use('/api/auth', authRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/profile', achievementRoutes);
app.use('/api/user', userRoutes);

// Endpoint de salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Neon Dash Backend API', version: '1.0.0' });
});

// Semilla inicial de niveles comunitarios demostrativos (CERO MOCKS: persistido en base de datos real)
async function seedCommunityLevels() {
  try {
    const existing = await queryOne('SELECT COUNT(*) as count FROM community_levels');
    if (existing && existing.count === 0) {
      console.log('🌱 Sembrando nivel demostrativo de la comunidad en SQLite...');

      // Crear usuario creador inicial
      const creator = await queryOne('SELECT id FROM users WHERE username = ?', ['NeonArchitect']);
      let creatorId = creator ? creator.id : null;

      if (!creatorId) {
        const res = await runSql(
          'INSERT INTO users (username, password_hash, total_stars) VALUES (?, ?, ?)',
          ['NeonArchitect', '$2a$10$demoHashedPasswordDummyForInitialSeedingOnly1234', 50]
        );
        creatorId = res.lastID;
      }

      // Mapa demostrativo "Cyber Rush"
      const demoMapData = {
        name: 'Cyber Rush (Community)',
        difficulty: 'Hard',
        totalLength: 6000,
        obstacles: [
          { type: 'SPIKE', x: 800, y: 512, width: 48, height: 48, flipped: false },
          { type: 'BLOCK', x: 1300, y: 512, width: 48, height: 48 },
          { type: 'BLOCK', x: 1348, y: 512, width: 48, height: 48 },
          { type: 'SPIKE', x: 1550, y: 512, width: 48, height: 48, flipped: false },
          { type: 'SPIKE', x: 1598, y: 512, width: 48, height: 48, flipped: false }
        ],
        triggers: [
          { type: 'PORTAL_SPEED', x: 1900, y: 380, width: 44, height: 170, speedKey: '2x' },
          { type: 'PORTAL_GRAVITY', x: 2800, y: 370, width: 44, height: 170, targetGravity: -1 }
        ],
        orbs: [
          { type: 'ORB', x: 2350, y: 440, orbType: 'YELLOW' }
        ],
        coins: [
          { type: 'COIN', x: 2350, y: 330, id: 1 }
        ]
      };

      await runSql(
        `INSERT INTO community_levels (title, creator_id, creator_name, difficulty, level_data, likes, plays)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['Cyber Rush (Community)', creatorId, 'NeonArchitect', 'Hard', JSON.stringify(demoMapData), 12, 45]
      );
    }
  } catch (e) {
    console.error('Error al sembrar datos comunitarios:', e);
  }
}

// Iniciar servidor
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, async () => {
    console.log(`🚀 Neon Dash Backend corriendo en: http://localhost:${PORT}`);
    await seedCommunityLevels();
  });
}

export { app, seedCommunityLevels };
export default app;
