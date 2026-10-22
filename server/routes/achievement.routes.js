import { Router } from 'express';
import { queryAll, queryOne, runSql } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

const ACHIEVEMENTS_CATALOG = [
  { key: 'FIRST_JUMP', title: 'Primer Impulso', desc: 'Realiza tu primer salto en Neon Dash', icon: '🚀' },
  { key: 'JUMP_100', title: 'Saltador Experto', desc: 'Acumula más de 100 saltos', icon: '⚡' },
  { key: 'JUMP_500', title: 'Dominio Aéreo', desc: 'Acumula más de 500 saltos', icon: '🌪️' },
  { key: 'ATTEMPTS_50', title: 'Pura Determinación', desc: 'Intenta superar el reto más de 50 veces', icon: '🔥' },
  { key: 'SECRET_FINDER', title: 'Cazador de Secretos', desc: 'Recolecta tu primera Moneda Secreta', icon: '🪙' },
  { key: 'COIN_COLLECTOR', title: 'Coleccionista Maestro', desc: 'Consigue las 3 Monedas Secretas en un nivel', icon: '👑' },
  { key: 'LEVEL_MASTER', title: 'Victoria Neón', desc: 'Alcanza el 100% de compleción de un nivel', icon: '🏆' },
  { key: 'CREATOR', title: 'Arquitecto Neón', desc: 'Publica tu primer nivel en la comunidad', icon: '🛠️' }
];

// GET /api/achievements
router.get('/', async (req, res) => {
  const authHeader = req.headers['authorization'];
  let userId = null;

  if (authHeader) {
    try {
      const token = authHeader.split(' ')[1];
      const jwt = (await import('jsonwebtoken')).default;
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'neon_dash_super_secret_jwt_key_2026');
      userId = decoded.id;
    } catch (e) {}
  }

  let unlockedKeys = [];
  if (userId) {
    const unlocked = await queryAll('SELECT achievement_key FROM achievements WHERE user_id = ?', [userId]);
    unlockedKeys = unlocked.map(u => u.achievement_key);
  }

  const result = ACHIEVEMENTS_CATALOG.map(ach => ({
    ...ach,
    unlocked: unlockedKeys.includes(ach.key)
  }));

  res.json({ success: true, achievements: result });
});

// POST /api/achievements/unlock
router.post('/unlock', authenticateToken, async (req, res) => {
  try {
    const { achievement_key } = req.body;
    if (!achievement_key) {
      return res.status(400).json({ success: false, error: 'Clave de logro requerida' });
    }

    const exists = ACHIEVEMENTS_CATALOG.find(a => a.key === achievement_key);
    if (!exists) {
      return res.status(400).json({ success: false, error: 'Logro no reconocido' });
    }

    await runSql(
      'INSERT OR IGNORE INTO achievements (user_id, achievement_key) VALUES (?, ?)',
      [req.user.id, achievement_key]
    );

    res.json({ success: true, message: `¡Logro ${exists.title} desbloqueado!`, achievement: exists });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al registrar logro' });
  }
});

// POST /api/profile/stats (Actualizar estadísticas acumuladas)
router.post('/stats', authenticateToken, async (req, res) => {
  try {
    const { jumps = 0, attempts = 0, coins = 0 } = req.body;

    await runSql(
      `UPDATE users 
       SET total_jumps = total_jumps + ?,
           total_attempts = total_attempts + ?,
           total_coins = MAX(total_coins, ?)
       WHERE id = ?`,
      [jumps, attempts, coins, req.user.id]
    );

    const user = await queryOne(
      'SELECT id, username, total_jumps, total_attempts, total_stars, total_coins FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al actualizar estadísticas' });
  }
});

export default router;
