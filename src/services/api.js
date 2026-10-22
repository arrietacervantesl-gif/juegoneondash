/**
 * Cliente de Conexión a la API RESTful de Neon Dash (Fase 4)
 * Gestiona autenticación JWT, récords, niveles comunitarios y logros.
 */

const API_BASE_URL = 'http://localhost:3000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('neon_dash_token') || null;
    this.currentUser = JSON.parse(localStorage.getItem('neon_dash_user') || 'null');
  }

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  saveSession(token, user) {
    this.token = token;
    this.currentUser = user;
    localStorage.setItem('neon_dash_token', token);
    localStorage.setItem('neon_dash_user', JSON.stringify(user));
  }

  logout() {
    this.token = null;
    this.currentUser = null;
    localStorage.removeItem('neon_dash_token');
    localStorage.removeItem('neon_dash_user');
  }

  // --- AUTENTICACIÓN ---

  async register(username, password) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success && data.token) {
      this.saveSession(data.token, data.user);
    }
    return data;
  }

  async login(username, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success && data.token) {
      this.saveSession(data.token, data.user);
    }
    return data;
  }

  async getMe() {
    if (!this.token) return null;
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: this.getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        this.currentUser = data.user;
        localStorage.setItem('neon_dash_user', JSON.stringify(data.user));
        return data;
      }
    } catch (e) {
      console.warn('Error al verificar sesión:', e);
    }
    return null;
  }

  // --- RÉCORDS Y CLASIFICACIÓN ---

  async submitScore({ level_id = 'genesis', best_percentage, completion_time, coins_collected = 0 }) {
    if (!this.token) return { success: false, error: 'Debes iniciar sesión para registrar tu récord global.' };
    const res = await fetch(`${API_BASE_URL}/scores`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ level_id, best_percentage, completion_time, coins_collected })
    });
    return await res.json();
  }

  async getLeaderboard(level_id = 'genesis') {
    const res = await fetch(`${API_BASE_URL}/scores/leaderboard?level_id=${level_id}`);
    return await res.json();
  }

  // --- COMUNIDAD DE NIVELES ---

  async uploadCommunityLevel({ title, difficulty, level_data }) {
    if (!this.token) return { success: false, error: 'Inicia sesión para compartir niveles.' };
    const res = await fetch(`${API_BASE_URL}/levels`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ title, difficulty, level_data })
    });
    return await res.json();
  }

  async getCommunityLevels({ sort = 'top', search = '' } = {}) {
    const url = new URL(`${API_BASE_URL}/levels`);
    if (sort) url.searchParams.set('sort', sort);
    if (search) url.searchParams.set('search', search);

    const res = await fetch(url.toString());
    return await res.json();
  }

  async getCommunityLevel(id) {
    const res = await fetch(`${API_BASE_URL}/levels/${id}`);
    return await res.json();
  }

  async rateCommunityLevel(id, vote) {
    if (!this.token) return { success: false, error: 'Inicia sesión para votar por este nivel.' };
    const res = await fetch(`${API_BASE_URL}/levels/${id}/rate`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ vote })
    });
    return await res.json();
  }

  // --- LOGROS Y ESTADÍSTICAS ---

  async getAchievements() {
    const res = await fetch(`${API_BASE_URL}/achievements`, {
      headers: this.getHeaders()
    });
    return await res.json();
  }

  async unlockAchievement(achievement_key) {
    if (!this.token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/achievements/unlock`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ achievement_key })
      });
      return await res.json();
    } catch (e) {}
  }

  async updateStats({ jumps = 0, attempts = 0, coins = 0 }) {
    if (!this.token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/profile/stats`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ jumps, attempts, coins })
      });
      return await res.json();
    } catch (e) {}
  }

  // --- PERSONALIZACIÓN Y ARMARIO (ICON KIT) ---

  async getCustomization() {
    if (!this.token) return null;
    try {
      const res = await fetch(`${API_BASE_URL}/user/customization`, {
        headers: this.getHeaders()
      });
      return await res.json();
    } catch (e) {
      console.warn('Error al obtener personalización:', e);
      return null;
    }
  }

  async updateCustomization({ selected_skin, primary_color, secondary_color, trail_effect, unlocked_skins }) {
    if (!this.token) return { success: false, error: 'Inicia sesión para guardar tu personalización en la nube.' };
    try {
      const res = await fetch(`${API_BASE_URL}/user/customization`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ selected_skin, primary_color, secondary_color, trail_effect, unlocked_skins })
      });
      return await res.json();
    } catch (e) {
      console.error('Error al actualizar personalización:', e);
      return { success: false, error: 'Error al contactar con el servidor' };
    }
  }
}

export const api = new ApiService();
