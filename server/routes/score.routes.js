import { Router } from 'express';
import { queryAll, queryOne, runSql } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// POST /api/scores (Registrar progreso o nuevo récord)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { level_id = 'genesis', best_percentage, completion_time, coins_collected = 0 } = req.body;

    if (best_percentage === undefined || completion_time === undefined) {
      return res.status(400).json({ success: false, error: 'Porcentaje y tiempo son obligatorios.' });
    }

    const pct = Math.min(100, Math.max(0, parseInt(best_percentage, 10)));
    const timeSec = parseFloat(completion_time);

    // Guardar nuevo puntaje
    const result = await runSql(
      `INSERT INTO scores (user_id, level_id, best_percentage, completion_time, coins_collected)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, level_id, pct, timeSec, coins_collected]
    );

    // Si completó al 100%, premiar con estrellas
    if (pct === 100) {
      await runSql(
        'UPDATE users SET total_stars = total_stars + 10, total_coins = MAX(total_coins, ?) WHERE id = ?',
        [coins_collected, req.user.id]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Progreso registrado exitosamente',
      scoreId: result.lastID
    });
  } catch (error) {
    console.error('Error al guardar score:', error);
    res.status(500).json({ success: false, error: 'Error interno al registrar récord.' });
  }
});

// GET /api/scores/leaderboard (Tabla de Clasificación Global)
router.get('/leaderboard', async (req, res) => {
  try {
    const levelId = req.query.level_id;

    // Obtener los mejores récords agrupados por usuario (su mejor intento)
    let sql = `SELECT 
         users.id as user_id,
         users.username,
         MAX(scores.best_percentage) as best_percentage,
         MIN(scores.completion_time) as completion_time,
         MAX(scores.coins_collected) as coins_collected,
         users.total_stars,
         MAX(scores.created_at) as achieved_at
       FROM scores
       JOIN users ON scores.user_id = users.id`;
    const params = [];

    if (levelId) {
      sql += ` WHERE scores.level_id = ?`;
      params.push(levelId);
    }

    sql += ` GROUP BY users.id
       ORDER BY best_percentage DESC, completion_time ASC
       LIMIT 30`;

    const leaderboard = await queryAll(sql, params);

    res.json({
      success: true,
      level_id: levelId || 'all',
      leaderboard
    });
  } catch (error) {
    console.error('Error al obtener leaderboard:', error);
    res.status(500).json({ success: false, error: 'Error al consultar la tabla de clasificación.' });
  }
});

export default router;
