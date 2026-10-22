import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { queryOne, runSql, queryAll } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'neon_dash_super_secret_jwt_key_2026';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password || username.trim().length < 3 || password.length < 4) {
      return res.status(400).json({
        success: false,
        error: 'El nombre de usuario debe tener al menos 3 caracteres y la contraseña al menos 4.'
      });
    }

    const cleanUsername = username.trim();

    // Comprobar si ya existe
    const existing = await queryOne('SELECT id FROM users WHERE username = ?', [cleanUsername]);
    if (existing) {
      return res.status(409).json({ success: false, error: 'El nombre de usuario ya está registrado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await runSql(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)',
      [cleanUsername, passwordHash]
    );

    const user = {
      id: result.lastID,
      username: cleanUsername,
      total_jumps: 0,
      total_attempts: 0,
      total_stars: 0,
      total_coins: 0,
      selected_skin: 'CLASSIC',
      primary_color: '#39ff14',
      secondary_color: '#ffe600',
      trail_effect: 'NEON',
      unlocked_skins: ['CLASSIC', 'NINJA']
    };

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      token,
      user
    });
  } catch (error) {
    console.error('Error en /register:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor al registrar usuario.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Usuario y contraseña requeridos.' });
    }

    const user = await queryOne('SELECT * FROM users WHERE username = ?', [username.trim()]);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas.' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas.' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    let unlocked = ['CLASSIC', 'NINJA'];
    if (user.unlocked_skins) {
      try {
        unlocked = typeof user.unlocked_skins === 'string' ? JSON.parse(user.unlocked_skins) : user.unlocked_skins;
      } catch (e) {}
    }

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        total_jumps: user.total_jumps,
        total_attempts: user.total_attempts,
        total_stars: user.total_stars,
        total_coins: user.total_coins,
        selected_skin: user.selected_skin || 'CLASSIC',
        primary_color: user.primary_color || '#39ff14',
        secondary_color: user.secondary_color || '#ffe600',
        trail_effect: user.trail_effect || 'NEON',
        unlocked_skins: unlocked
      }
    });
  } catch (error) {
    console.error('Error en /login:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor al iniciar sesión.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await queryOne(
      'SELECT id, username, total_jumps, total_attempts, total_stars, total_coins, selected_skin, primary_color, secondary_color, trail_effect, unlocked_skins, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado.' });
    }

    let unlocked = ['CLASSIC', 'NINJA'];
    if (user.unlocked_skins) {
      try {
        unlocked = typeof user.unlocked_skins === 'string' ? JSON.parse(user.unlocked_skins) : user.unlocked_skins;
      } catch (e) {}
    }

    user.unlocked_skins = unlocked;

    const achievements = await queryAll(
      'SELECT achievement_key, unlocked_at FROM achievements WHERE user_id = ?',
      [user.id]
    );

    res.json({
      success: true,
      user,
      achievements: achievements.map(a => a.achievement_key)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al obtener perfil del usuario.' });
  }
});

export default router;
