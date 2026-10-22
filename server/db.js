import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar con SQLite:', err.message);
  } else {
    console.log('✅ Base de datos real SQLite conectada en:', dbPath);
  }
});

/**
 * Helper para ejecutar consultas SELECT que retornan múltiples filas
 */
export function queryAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

/**
 * Helper para ejecutar consultas SELECT que retornan una sola fila
 */
export function queryOne(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

/**
 * Helper para INSERT, UPDATE, DELETE
 */
export function runSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

let initPromise = null;

/**
 * Inicialización completa y síncrona de esquemas y migraciones (CERO MOCKS)
 * Usa un patrón Singleton Promise para evitar condiciones de carrera concurrentes.
 */
export function initDb() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // 1. Usuarios
    await runSql(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        total_jumps INTEGER DEFAULT 0,
        total_attempts INTEGER DEFAULT 0,
        total_stars INTEGER DEFAULT 0,
        total_coins INTEGER DEFAULT 0,
        selected_skin TEXT DEFAULT 'CLASSIC',
        primary_color TEXT DEFAULT '#39ff14',
        secondary_color TEXT DEFAULT '#ffe600',
        trail_effect TEXT DEFAULT 'NEON',
        unlocked_skins TEXT DEFAULT '["CLASSIC","NINJA"]',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migraciones garantizadas de columnas para tablas existentes
    const columns = await queryAll('PRAGMA table_info(users)');
    if (columns && columns.length > 0) {
      const colNames = columns.map(c => c.name);
      if (!colNames.includes('selected_skin')) {
        await runSql("ALTER TABLE users ADD COLUMN selected_skin TEXT DEFAULT 'CLASSIC'");
      }
      if (!colNames.includes('primary_color')) {
        await runSql("ALTER TABLE users ADD COLUMN primary_color TEXT DEFAULT '#39ff14'");
      }
      if (!colNames.includes('secondary_color')) {
        await runSql("ALTER TABLE users ADD COLUMN secondary_color TEXT DEFAULT '#ffe600'");
      }
      if (!colNames.includes('trail_effect')) {
        await runSql("ALTER TABLE users ADD COLUMN trail_effect TEXT DEFAULT 'NEON'");
      }
      if (!colNames.includes('unlocked_skins')) {
        await runSql("ALTER TABLE users ADD COLUMN unlocked_skins TEXT DEFAULT '[\"CLASSIC\",\"NINJA\"]'");
      }
    }

    // 2. Récords y Puntajes
    await runSql(`
      CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        level_id TEXT DEFAULT 'genesis',
        best_percentage INTEGER NOT NULL,
        completion_time REAL NOT NULL,
        coins_collected INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // 3. Niveles de la Comunidad
    await runSql(`
      CREATE TABLE IF NOT EXISTS community_levels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        creator_id INTEGER NOT NULL,
        creator_name TEXT NOT NULL,
        difficulty TEXT DEFAULT 'Normal',
        level_data TEXT NOT NULL,
        likes INTEGER DEFAULT 0,
        dislikes INTEGER DEFAULT 0,
        plays INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (creator_id) REFERENCES users(id)
      )
    `);

    // 4. Votos de Niveles (Likes / Dislikes)
    await runSql(`
      CREATE TABLE IF NOT EXISTS level_votes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        level_id INTEGER NOT NULL,
        vote INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, level_id)
      )
    `);

    // 5. Logros de Usuario
    await runSql(`
      CREATE TABLE IF NOT EXISTS achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        achievement_key TEXT NOT NULL,
        unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, achievement_key),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    console.log('✅ Esquemas y migraciones de SQLite inicializados correctamente.');
  })();

  return initPromise;
}

// Iniciar migración de inmediato
initDb().catch(err => console.error('Error al inicializar BD:', err));

export default db;
