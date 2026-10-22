import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'neon_dash_super_secret_jwt_key_2026';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Token de autenticación requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Token inválido o expirado' });
    }
    req.user = user;
    next();
  });
}
