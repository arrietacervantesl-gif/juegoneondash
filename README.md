# 🎮 NEON DASH — 2D Precision Rhythm Platformer

![Neon Dash Banner](https://raw.githubusercontent.com/placeholder/neon-dash/main/banner.png)

> Clon profesional en 2D inspirado en **Geometry Dash**, desarrollado con físicas deterministas en **HTML5 Canvas puro**, arquitectura modular en **JavaScript ES6+**, diseño UI/UX Cyberpunk con **Glassmorphism**, motor de audio rítmico mediante **Web Audio API** y backend RESTful real con **Node.js, Express, SQLite/PostgreSQL y autenticación JWT**.

---

## ⚡ Características Principales

### 🎯 Físicas Core y Motor Determinista (60 Hz)
- **Bucle Desacoplado:** Simulación física de paso de tiempo fijo (`Fixed Timestep Accumulator` a 60 Hz) inmune a variaciones de monitores (60Hz, 120Hz, 144Hz, 240Hz).
- **Hitbox Quirúrgica:** Reducción de 5px (Hitbox Inset) en la caja del jugador y cálculo poligonal exacto con **SAT (*Separating Axis Theorem*)** para pinchos normales e invertidos.
- **Hold-to-Jump:** Salto continuo sosteniendo la barra espaciadora o clic del ratón, y buffer de salto con tolerancia de 120ms antes de aterrizar.

### 🌀 Portales y Mecánicas Avanzadas
- **Portales de Cambio de Gravedad:** Invierte la dirección gravitacional (`gravityDir = -1`), permitiendo correr por el techo boca abajo con obstáculos y bloques invertidos.
- **Portales de Velocidad:** Modificadores de velocidad en tiempo real: `0.5x` (280 px/s), `1x` (420 px/s), `2x` (560 px/s) y `3x` (720 px/s).
- **Orbes de Salto (Jump Rings):** Esferas flotantes interactivas que permiten impulsos aéreos con anillos de choque visuales.
- **Monedas Secretas (Secret Coins):** 3 monedas doradas coleccionables por nivel ubicadas en rutas de alta dificultad.

### 🎨 UI/UX Cyberpunk y Armario de Skins
- **Canvas Centrado y HUD Flotante:** Aspect-ratio 16:9 con resplandor neón (`box-shadow: 0 0 35px rgba(0, 255, 200, 0.4)`), barra superior HUD con progreso (%), intentos, monedas y velocidad.
- **Armario (Icon Kit):** 5 modelos de cubo (*Classic*, *Ninja Visor*, *Cyclops*, *Robot*, *Diamond Core*), 6 colores primarios, 5 secundarios y 5 tipos de estelas (*trails*).
- **Efectos de Partículas:** Explosiones geométricas al chocar (35 fragmentos con inercia y rotación), destellos de monedas y ondas de checkpoints.
- **Notificaciones Toast Flotantes:** Alertas emergentes en la esquina inferior derecha para logros y checkpoints.

### 🛠️ Editor de Niveles In-Game (Drag & Drop)
- Cuadrícula snappeada a 48x48 px para colocar bloques, pinchos (suelo/techo), portales, orbes y monedas.
- Paneo horizontal, borrado con clic derecho, exportación e importación de mapas en formato JSON estándar.
- Botón directo para probar el mapa creado al instante.

### 🌐 Backend Real y Comunidad (CERO MOCKS)
- **Base de Datos Persistente:** SQLite relacional en disco (`database.sqlite`) con esquemas ACID para usuarios, récords, niveles y logros.
- **Seguridad:** Autenticación con JSON Web Tokens (JWT) y contraseñas hasheadas mediante `bcryptjs` (salt 10).
- **Comunidad de Niveles:** Publica tus creaciones desde el editor, navega mapas creados por otros jugadores, vota Likes/Dislikes y juégalos con 1 clic.
- **Leaderboard Global:** Tabla de clasificación mundial con mejores porcentajes, tiempos récord y monedas.
- **Catálogo de Logros:** 8 logros desbloqueables en tiempo real vinculados a tu cuenta.

---

## 🚀 Requisitos e Instalación

### Requisitos Previos:
- **Node.js** v18 o superior (recomendado Node v20 o v24).
- **npm** v9 o superior.

### Instalación Rápida:
```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/neon-dash.git
cd neon-dash

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
```

---

## 🕹️ Ejecución del Proyecto

### 1. Iniciar Servidor Backend (API REST & Base de Datos)
```bash
npm run server
```
*El backend se ejecutará en: `http://localhost:3000`*.

### 2. Iniciar Servidor Frontend (Vite Dev Server)
En una terminal secundaria:
```bash
npm run dev
```
*La interfaz estará disponible en: `http://localhost:5173`*.

### 3. Compilación de Producción
```bash
npm run build
```
Genera la carpeta optimizada `/dist` lista para despliegue estático.

---

## ⌨️ Controles del Juego

| Acción | Teclado / Ratón / Táctil |
|---|---|
| **Saltar / Activar Orbe** | <kbd>ESPACIO</kbd> / <kbd>▲ Flecha Arriba</kbd> / <kbd>W</kbd> / Clic Izquierdo / Pantalla Táctil |
| **Salto Continuo (Hold)** | Mantener presionado cualquier botón de salto |
| **Colocar Checkpoint (Práctica)** | Tecla <kbd>Z</kbd> o botón `➕ Checkpoint` |
| **Borrar Checkpoint (Práctica)** | Tecla <kbd>X</kbd> o botón `✖ Borrar` |
| **Paneo en el Editor** | Arrastrar con botón central / derecho del ratón o botones `◀ Pan` `Pan ▶` |
| **Borrar Elemento en Editor** | Clic Derecho sobre el objeto o herramienta `❌ Borrar` |

---

## 📡 Referencia de la API RESTful

### Autenticación:
- `POST /api/auth/register` — Registro de nuevo usuario (`{ username, password }`).
- `POST /api/auth/login` — Inicio de sesión y entrega de JWT (`{ username, password }`).
- `GET /api/auth/me` — Consulta del perfil y estadísticas del usuario autenticado.

### Récords y Clasificación:
- `POST /api/scores` — Registro de progreso (`{ level_id, best_percentage, completion_time, coins_collected }`).
- `GET /api/scores/leaderboard` — Obtención del Top 30 mundial.

### Comunidad de Niveles:
- `POST /api/levels` — Publicar un nivel (`{ title, difficulty, level_data }`).
- `GET /api/levels` — Listar niveles comunitarios (`?sort=top|plays|recent&search=...`).
- `GET /api/levels/:id` — Descargar nivel para jugarlo.
- `POST /api/levels/:id/rate` — Votar (`{ vote: 1 | -1 }`).

### Logros y Estadísticas:
- `GET /api/achievements` — Catálogo de logros y estado de desbloqueo.
- `POST /api/achievements/unlock` — Desbloquear logro (`{ achievement_key }`).
- `POST /api/profile/stats` — Actualizar saltos e intentos acumulados.

---

## 📦 Despliegue en Producción (Docker)

Crea un archivo `Dockerfile` en la raíz para empaquetar tanto el backend como el frontend:

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["node", "server/index.js"]
```

---

## 📄 Licencia y Créditos
Desarrollado bajo licencia MIT. Inspirado en el concepto original de **Geometry Dash** de RobTop Games.
*Arquitectura diseñada por `arquitecto-software-pro` bajo estándares de Cero Mocks y código modular.*
