import { Router } from 'express';
import { queryOne, runSql } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Skins válidas en el juego
const VALID_SKINS = ['CLASSIC', 'NINJA', 'CYCLOPS', 'ROBOT', 'DIAMOND', 'GLITCH'];
const VALID_TRAILS = ['NEON', 'FIRE', 'STAR', 'RAINBOW', 'NONE'];

/**
 * GET /api/user/customization
 * Obtener la configuración visual del usuario logueado
 */
router.get('/customization', authenticateToken, async (req, res) => {
  try {
    const user = await queryOne(
      `SELECT id, username, selected_skin, primary_color, secondary_color, trail_effect, unlocked_skins,
              total_jumps, total_attempts, total_stars, total_coins
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    let unlocked = ['CLASSIC', 'NINJA'];
    if (user.unlocked_skins) {
      try {
        unlocked = typeof user.unlocked_skins === 'string' ? JSON.parse(user.unlocked_skins) : user.unlocked_skins;
      } catch (e) {
        unlocked = ['CLASSIC', 'NINJA'];
      }
    }

    res.json({
      success: true,
      customization: {
        selected_skin: user.selected_skin || 'CLASSIC',
        primary_color: user.primary_color || '#39ff14',
        secondary_color: user.secondary_color || '#ffe600',
        trail_effect: user.trail_effect || 'NEON',
        unlocked_skins: unlocked
      },
      stats: {
        total_jumps: user.total_jumps || 0,
        total_attempts: user.total_attempts || 0,
        total_stars: user.total_stars || 0,
        total_coins: user.total_coins || 0
      }
    });
  } catch (error) {
    console.error('Error al obtener personalización:', error);
    res.status(500).json({ success: false, error: 'Error del servidor al obtener personalización' });
  }
});

/**
 * PUT /api/user/customization
 * Guardar las preferencias y personalización del usuario en la base de datos
 */
router.put('/customization', authenticateToken, async (req, res) => {
  try {
    const { selected_skin, primary_color, secondary_color, trail_effect, unlocked_skins } = req.body;

    // Obtener configuración actual
    const current = await queryOne(
      'SELECT selected_skin, primary_color, secondary_color, trail_effect, unlocked_skins FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!current) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    const skinToSave = (selected_skin && VALID_SKINS.includes(selected_skin)) ? selected_skin : (current.selected_skin || 'CLASSIC');
    const primaryToSave = (typeof primary_color === 'string' && /^#[0-9a-fA-F]{6}$/.test(primary_color)) ? primary_color : (current.primary_color || '#39ff14');
    const secondaryToSave = (typeof secondary_color === 'string' && /^#[0-9a-fA-F]{6}$/.test(secondary_color)) ? secondary_color : (current.secondary_color || '#ffe600');
    const trailToSave = (trail_effect && VALID_TRAILS.includes(trail_effect)) ? trail_effect : (current.trail_effect || 'NEON');

    let unlockedToSave = current.unlocked_skins;
    if (Array.isArray(unlocked_skins)) {
      unlockedToSave = JSON.stringify(unlocked_skins);
    }

    await runSql(
      `UPDATE users 
       SET selected_skin = ?, primary_color = ?, secondary_color = ?, trail_effect = ?, unlocked_skins = ?
       WHERE id = ?`,
      [skinToSave, primaryToSave, secondaryToSave, trailToSave, unlockedToSave, req.user.id]
    );

    let parsedUnlocked = ['CLASSIC', 'NINJA'];
    try {
      parsedUnlocked = typeof unlockedToSave === 'string' ? JSON.parse(unlockedToSave) : unlockedToSave;
    } catch (e) {}

    res.json({
      success: true,
      message: 'Configuración visual guardada exitosamente.',
      customization: {
        selected_skin: skinToSave,
        primary_color: primaryToSave,
        secondary_color: secondaryToSave,
        trail_effect: trailToSave,
        unlocked_skins: parsedUnlocked
      }
    });
  } catch (error) {
    console.error('Error al actualizar personalización:', error);
    res.status(500).json({ success: false, error: 'Error del servidor al guardar personalización' });
  }
});

export default router;
