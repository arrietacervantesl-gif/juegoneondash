import { Router } from 'express';
import { queryAll, queryOne, runSql } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// POST /api/levels (Publicar nivel creado en la comunidad)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, difficulty = 'Normal', level_data } = req.body;

    if (!title || !title.trim() || !level_data) {
      return res.status(400).json({ success: false, error: 'Título y datos del nivel (JSON) son requeridos.' });
    }

    // Validar que level_data sea JSON válido
    try {
      if (typeof level_data === 'string') {
        JSON.parse(level_data);
      }
    } catch (e) {
      return res.status(400).json({ success: false, error: 'Los datos del nivel deben ser un JSON válido.' });
    }

    const dataString = typeof level_data === 'string' ? level_data : JSON.stringify(level_data);

    const result = await runSql(
      `INSERT INTO community_levels (title, creator_id, creator_name, difficulty, level_data)
       VALUES (?, ?, ?, ?, ?)`,
      [title.trim(), req.user.id, req.user.username, difficulty, dataString]
    );

    res.status(201).json({
      success: true,
      message: '¡Nivel publicado exitosamente en la comunidad!',
      levelId: result.lastID
    });
  } catch (error) {
    console.error('Error al publicar nivel:', error);
    res.status(500).json({ success: false, error: 'Error al publicar el nivel en la comunidad.' });
  }
});

// GET /api/levels (Explorador de Niveles Comunitarios)
router.get('/', async (req, res) => {
  try {
    const { sort = 'top', search = '' } = req.query;

    let orderBy = 'likes DESC';
    if (sort === 'recent') orderBy = 'created_at DESC';
    else if (sort === 'plays') orderBy = 'plays DESC';
    else if (sort === 'rating') orderBy = '(likes - dislikes) DESC, likes DESC';

    const cleanSearch = search ? search.trim() : '';
    const numericId = cleanSearch.replace('#', '');
    const isNum = /^\d+$/.test(numericId);

    let levels;
    if (cleanSearch) {
      if (isNum) {
        levels = await queryAll(
          `SELECT id, title, creator_name, difficulty, likes, dislikes, plays, created_at
           FROM community_levels
           WHERE id = ? OR title LIKE ? OR creator_name LIKE ?
           ORDER BY ${orderBy}
           LIMIT 40`,
          [parseInt(numericId, 10), `%${cleanSearch}%`, `%${cleanSearch}%`]
        );
      } else {
        levels = await queryAll(
          `SELECT id, title, creator_name, difficulty, likes, dislikes, plays, created_at
           FROM community_levels
           WHERE title LIKE ? OR creator_name LIKE ?
           ORDER BY ${orderBy}
           LIMIT 40`,
          [`%${cleanSearch}%`, `%${cleanSearch}%`]
        );
      }
    } else {
      levels = await queryAll(
        `SELECT id, title, creator_name, difficulty, likes, dislikes, plays, created_at
         FROM community_levels
         ORDER BY ${orderBy}
         LIMIT 40`
      );
    }

    res.json({ success: true, levels });
  } catch (error) {
    console.error('Error al consultar niveles comunitarios:', error);
    res.status(500).json({ success: false, error: 'Error al obtener niveles comunitarios.' });
  }
});

// GET /api/levels/:id (Obtener y jugar un nivel comunitario específico)
router.get('/:id', async (req, res) => {
  try {
    const levelId = req.params.id;
    const level = await queryOne('SELECT * FROM community_levels WHERE id = ?', [levelId]);

    if (!level) {
      return res.status(404).json({ success: false, error: 'Nivel comunitario no encontrado.' });
    }

    // Incrementar contador de jugadas
    await runSql('UPDATE community_levels SET plays = plays + 1 WHERE id = ?', [levelId]);

    res.json({
      success: true,
      level: {
        id: level.id,
        title: level.title,
        creator_name: level.creator_name,
        difficulty: level.difficulty,
        likes: level.likes,
        dislikes: level.dislikes,
        plays: level.plays + 1,
        level_data: JSON.parse(level.level_data),
        created_at: level.created_at
      }
    });
  } catch (error) {
    console.error('Error al cargar nivel:', error);
    res.status(500).json({ success: false, error: 'Error al cargar los datos del nivel.' });
  }
});

// POST /api/levels/:id/rate (Votar Like o Dislike)
router.post('/:id/rate', authenticateToken, async (req, res) => {
  try {
    const levelId = req.params.id;
    const { vote } = req.body; // 1 (Like) o -1 (Dislike)

    if (vote !== 1 && vote !== -1) {
      return res.status(400).json({ success: false, error: 'Voto inválido. Debe ser 1 o -1.' });
    }

    const existingVote = await queryOne(
      'SELECT vote FROM level_votes WHERE user_id = ? AND level_id = ?',
      [req.user.id, levelId]
    );

    if (existingVote) {
      if (existingVote.vote === vote) {
        return res.status(400).json({ success: false, error: 'Ya has emitido este voto para este nivel.' });
      }

      // Cambiar voto previo
      await runSql(
        'UPDATE level_votes SET vote = ? WHERE user_id = ? AND level_id = ?',
        [vote, req.user.id, levelId]
      );

      if (vote === 1) {
        await runSql('UPDATE community_levels SET likes = likes + 1, dislikes = MAX(0, dislikes - 1) WHERE id = ?', [levelId]);
      } else {
        await runSql('UPDATE community_levels SET dislikes = dislikes + 1, likes = MAX(0, likes - 1) WHERE id = ?', [levelId]);
      }
    } else {
      // Registrar voto nuevo
      await runSql(
        'INSERT INTO level_votes (user_id, level_id, vote) VALUES (?, ?, ?)',
        [req.user.id, levelId, vote]
      );

      if (vote === 1) {
        await runSql('UPDATE community_levels SET likes = likes + 1 WHERE id = ?', [levelId]);
      } else {
        await runSql('UPDATE community_levels SET dislikes = dislikes + 1 WHERE id = ?', [levelId]);
      }
    }

    const updated = await queryOne('SELECT likes, dislikes FROM community_levels WHERE id = ?', [levelId]);

    res.json({
      success: true,
      message: 'Voto registrado con éxito',
      likes: updated.likes,
      dislikes: updated.dislikes
    });
  } catch (error) {
    console.error('Error al calificar nivel:', error);
    res.status(500).json({ success: false, error: 'Error al registrar calificación.' });
  }
});

export default router;
