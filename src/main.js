import { GameEngine } from './game/Engine.js';
import { api } from './services/api.js';
import { OFFICIAL_LEVELS, LEVEL_THEMES } from './data/officialLevels.js';

// Inicialización de Neon Dash (Sistemas de Niveles, Comunidad, Armario & Persistencia)
window.addEventListener('DOMContentLoaded', async () => {
  const canvas = document.getElementById('gameCanvas');
  const attemptDisplay = document.getElementById('attemptDisplay');
  const progressDisplay = document.getElementById('progressDisplay');
  const progressBarFill = document.getElementById('progressBarFill');
  const speedDisplay = document.getElementById('speedDisplay');
  const gravityDisplay = document.getElementById('gravityDisplay');
  const coinsDisplay = document.getElementById('coinsDisplay');
  const engineStatus = document.getElementById('engineStatus');
  const audioToggleBtn = document.getElementById('audioToggleBtn');
  const audioIcon = document.getElementById('audioIcon');

  // Banner Flotante de Audio
  const audioUnlockBanner = document.getElementById('audioUnlockBanner');
  const activateAudioBtn = document.getElementById('activateAudioBtn');

  // Menú Principal & Carrusel de Niveles (Geometry Dash Style)
  const mainMenuOverlay = document.getElementById('mainMenuOverlay');
  const gdLevelSubtitle = document.getElementById('gdLevelSubtitle');
  const menuBtn = document.getElementById('menuBtn');
  const prevLevelBtn = document.getElementById('prevLevelBtn');
  const nextLevelBtn = document.getElementById('nextLevelBtn');
  const levelCardMain = document.getElementById('levelCardMain');
  const cardLevelNumber = document.getElementById('cardLevelNumber');
  const cardLevelTitle = document.getElementById('cardLevelTitle');
  const cardDiffBadge = document.getElementById('cardDiffBadge');
  const cardDiffIcon = document.getElementById('cardDiffIcon');
  const cardDiffText = document.getElementById('cardDiffText');
  const cardSpeedText = document.getElementById('cardSpeedText');
  const cardStarsBadge = document.getElementById('cardStarsBadge');
  const cardStarsText = document.getElementById('cardStarsText');
  const cardNormalPct = document.getElementById('cardNormalPct');
  const cardNormalBarFill = document.getElementById('cardNormalBarFill');
  const cardPracticePct = document.getElementById('cardPracticePct');
  const cardPracticeBarFill = document.getElementById('cardPracticeBarFill');
  const normalBarModule = document.getElementById('normalBarModule');
  const practiceBarModule = document.getElementById('practiceBarModule');
  const cardCoin1 = document.getElementById('cardCoin1');
  const cardCoin2 = document.getElementById('cardCoin2');
  const cardCoin3 = document.getElementById('cardCoin3');
  const cardPlayBtn = document.getElementById('cardPlayBtn');
  const cardPracticeBtn = document.getElementById('cardPracticeBtn');
  const carouselDots = document.getElementById('carouselDots');

  const openEditorBtn = document.getElementById('openEditorBtn');
  const openWardrobeBtn = document.getElementById('openWardrobeBtn');
  const openLeaderboardBtn = document.getElementById('openLeaderboardBtn');
  const openCommunityBtn = document.getElementById('openCommunityBtn');
  const openAchievementsBtn = document.getElementById('openAchievementsBtn');

  // Autenticación & Perfil
  const userAuthBtn = document.getElementById('userAuthBtn');
  const userBadgeText = document.getElementById('userBadgeText');
  const authModal = document.getElementById('authModal');
  const closeAuthBtn = document.getElementById('closeAuthBtn');
  const tabLoginBtn = document.getElementById('tabLoginBtn');
  const tabRegisterBtn = document.getElementById('tabRegisterBtn');
  const authForm = document.getElementById('authForm');
  const authUsername = document.getElementById('authUsername');
  const authPassword = document.getElementById('authPassword');
  const authErrorMsg = document.getElementById('authErrorMsg');
  const authSubmitBtn = document.getElementById('authSubmitBtn');
  let authMode = 'LOGIN';

  const profileModal = document.getElementById('profileModal');
  const closeProfileBtn = document.getElementById('closeProfileBtn');
  const profileUsername = document.getElementById('profileUsername');
  const profileJumps = document.getElementById('profileJumps');
  const profileAttempts = document.getElementById('profileAttempts');
  const profileStars = document.getElementById('profileStars');
  const profileCoins = document.getElementById('profileCoins');
  const logoutBtn = document.getElementById('logoutBtn');

  // Clasificación (Leaderboard)
  const leaderboardModal = document.getElementById('leaderboardModal');
  const closeLeaderboardBtn = document.getElementById('closeLeaderboardBtn');
  const leaderboardTbody = document.getElementById('leaderboardTbody');

  // Comunidad de Niveles
  const communityModal = document.getElementById('communityModal');
  const closeCommunityBtn = document.getElementById('closeCommunityBtn');
  const communitySearchInput = document.getElementById('communitySearchInput');
  const communityLevelsList = document.getElementById('communityLevelsList');
  const filterButtons = document.querySelectorAll('.filter-chip');
  const publishCommunityBtn = document.getElementById('publishCommunityBtn');
  let activeCommunitySort = 'top';

  // Logros y Toast Flotante
  const achievementsModal = document.getElementById('achievementsModal');
  const closeAchievementsBtn = document.getElementById('closeAchievementsBtn');
  const achievementsGrid = document.getElementById('achievementsGrid');
  const achievementToast = document.getElementById('achievementToast');
  const toastIcon = document.getElementById('toastIcon');
  const toastDesc = document.getElementById('toastDesc');
  let toastTimeout = null;

  function triggerToast(icon, category, title) {
    if (toastIcon) toastIcon.textContent = icon;
    const catElem = achievementToast.querySelector('.toast-category');
    if (catElem) catElem.textContent = category;
    if (toastDesc) toastDesc.textContent = title;

    if (achievementToast) {
      achievementToast.classList.remove('hidden');
      if (toastTimeout) clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        achievementToast.classList.add('hidden');
      }, 3500);
    }
  }

  // Modo Práctica
  const practiceBar = document.getElementById('practiceBar');
  const addCheckpointBtn = document.getElementById('addCheckpointBtn');
  const delCheckpointBtn = document.getElementById('delCheckpointBtn');
  const checkpointCount = document.getElementById('checkpointCount');

  // Editor de Niveles
  const editorBar = document.getElementById('editorBar');
  const panLeftBtn = document.getElementById('panLeftBtn');
  const panRightBtn = document.getElementById('panRightBtn');
  const exportJsonBtn = document.getElementById('exportJsonBtn');
  const importJsonBtn = document.getElementById('importJsonBtn');
  const clearLevelBtn = document.getElementById('clearLevelBtn');
  const playLevelBtn = document.getElementById('playLevelBtn');
  const jsonModal = document.getElementById('jsonModal');
  const jsonTextArea = document.getElementById('jsonTextArea');
  const closeJsonModalBtn = document.getElementById('closeJsonModalBtn');
  const jsonApplyBtn = document.getElementById('jsonApplyBtn');
  const jsonDownloadBtn = document.getElementById('jsonDownloadBtn');

  // Armario / Wardrobe (Icon Kit)
  const wardrobeModal = document.getElementById('wardrobeModal');
  const closeWardrobeBtn = document.getElementById('closeWardrobeBtn');
  const saveWardrobeBtn = document.getElementById('saveWardrobeBtn');
  const skinPreviewCanvas = document.getElementById('skinPreviewCanvas');
  const previewSkinName = document.getElementById('previewSkinName');
  const primaryColorPalette = document.getElementById('primaryColorPalette');
  const secondaryColorPalette = document.getElementById('secondaryColorPalette');
  const trailSelectorRow = document.getElementById('trailSelectorRow');
  const primaryColorPicker = document.getElementById('primaryColorPicker');
  const secondaryColorPicker = document.getElementById('secondaryColorPicker');
  const wardrobeItemInfo = document.getElementById('wardrobeItemInfo');
  const wardrobeInfoIcon = document.getElementById('wardrobeInfoIcon');
  const wardrobeInfoText = document.getElementById('wardrobeInfoText');

  // Dificultad Badge en Header
  const difficultyBadge = document.getElementById('difficultyBadge');
  const diffLabel = document.getElementById('diffLabel');

  // Pantalla de Victoria
  const victoryOverlay = document.getElementById('victoryOverlay');
  const victoryLevelName = document.getElementById('victoryLevelName');
  const victoryAttempts = document.getElementById('victoryAttempts');
  const victoryTime = document.getElementById('victoryTime');
  const victoryCoins = document.getElementById('victoryCoins');
  const victorySyncStatus = document.getElementById('victorySyncStatus');
  const victoryNextBtn = document.getElementById('victoryNextBtn');
  const victoryReplayBtn = document.getElementById('victoryReplayBtn');
  const victoryMenuBtn = document.getElementById('victoryMenuBtn');

  // Estado del Jugador y Progreso
  let currentCarouselIndex = 0;
  let currentRunMaxPct = 0;
  let currentRunPracticeMaxPct = 0;
  let levelStartTime = Date.now();
  let sessionJumps = 0;

  // Cargar progreso guardado por nivel desde localStorage (Normal & Practice Mode)
  function getLevelRecord(levelId) {
    const raw = localStorage.getItem(`neon_dash_rec_${levelId}`);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        return {
          bestPct: typeof parsed.bestPct === 'number' ? parsed.bestPct : 0,
          practiceBestPct: typeof parsed.practiceBestPct === 'number' ? parsed.practiceBestPct : 0,
          coins: Array.isArray(parsed.coins) ? parsed.coins : [false, false, false]
        };
      } catch (e) {}
    }
    return { bestPct: 0, practiceBestPct: 0, coins: [false, false, false] };
  }

  function saveLevelRecord(levelId, record) {
    localStorage.setItem(`neon_dash_rec_${levelId}`, JSON.stringify(record));
  }

  // Recuento de monedas secretas recolectadas a nivel local
  function getTotalCoinsCollected() {
    let count = 0;
    for (const lvl of OFFICIAL_LEVELS) {
      const rec = getLevelRecord(lvl.id);
      if (rec && rec.coins && Array.isArray(rec.coins)) {
        count += rec.coins.filter(Boolean).length;
      }
    }
    return count;
  }

  // Lista de niveles completados al 100%
  function getCompletedLevelIds() {
    const completed = [];
    for (const lvl of OFFICIAL_LEVELS) {
      const rec = getLevelRecord(lvl.id);
      if (rec.bestPct >= 100) {
        completed.push(lvl.id);
      }
    }
    return completed;
  }

  // --- MOTOR DE JUEGO & UI CALLBACKS ---
  const uiCallbacks = {
    onDeath: async (attempts) => {
      if (attemptDisplay) attemptDisplay.textContent = attempts;
      if (progressDisplay) progressDisplay.textContent = '0%';
      if (progressBarFill) progressBarFill.style.width = '0%';

      // Actualizar récord de porcentaje alcanzado en este intento
      const currentLvl = engine.level;
      if (currentLvl && currentLvl.id) {
        const rec = getLevelRecord(currentLvl.id);
        let updated = false;

        if (engine.gameMode === 'PRACTICE') {
          if (currentRunPracticeMaxPct > (rec.practiceBestPct || 0)) {
            rec.practiceBestPct = currentRunPracticeMaxPct;
            updated = true;
          }
        } else {
          if (currentRunMaxPct > (rec.bestPct || 0)) {
            rec.bestPct = currentRunMaxPct;
            updated = true;
          }
        }

        if (updated) {
          saveLevelRecord(currentLvl.id, rec);
          renderLevelCard();
        }
      }
      currentRunMaxPct = 0;
      currentRunPracticeMaxPct = 0;
      levelStartTime = Date.now();

      if (api.token) {
        api.updateStats({ jumps: 0, attempts: 1, coins: 0 });
        if (attempts >= 50) {
          api.unlockAchievement('ATTEMPTS_50').then(res => {
            if (res && res.success) triggerToast('🔥', '¡LOGRO DESBLOQUEADO!', 'Pura Determinación (50 intentos)');
          });
        }
      }
    },
    onProgressUpdate: (pct, speedKey, gravityDir, playerMode) => {
      if (engine.gameMode === 'PRACTICE') {
        currentRunPracticeMaxPct = Math.max(currentRunPracticeMaxPct, pct);
      } else {
        currentRunMaxPct = Math.max(currentRunMaxPct, pct);
      }

      if (progressDisplay) progressDisplay.textContent = `${pct}%`;
      if (progressBarFill) progressBarFill.style.width = `${pct}%`;

      if (speedDisplay) {
        speedDisplay.textContent = speedKey;
      }

      if (gravityDisplay) {
        if (playerMode === 'SHIP') {
          gravityDisplay.textContent = gravityDir === -1 ? 'NAVE (INV)' : 'NAVE 🚀';
          gravityDisplay.className = 'hud-value glow-speed';
        } else if (gravityDir === -1) {
          gravityDisplay.textContent = 'INVERTIDA';
          gravityDisplay.className = 'hud-value glow-yellow';
        } else {
          gravityDisplay.textContent = 'NORMAL';
          gravityDisplay.className = 'hud-value glow-cyan';
        }
      }
    },
    onCoinUpdate: (count, total) => {
      if (coinsDisplay) coinsDisplay.textContent = `${count}/${total}`;

      // Guardar monedas conseguidas localmente en el nivel activo
      const currentLvl = engine.level;
      if (currentLvl && currentLvl.id && count > 0) {
        const rec = getLevelRecord(currentLvl.id);
        for (let i = 0; i < count; i++) {
          rec.coins[i] = true;
        }
        saveLevelRecord(currentLvl.id, rec);
        renderLevelCard();
      }

      if (count > 0 && api.token) {
        api.unlockAchievement('SECRET_FINDER').then(r => {
          if (r && r.success) triggerToast('🪙', '¡LOGRO DESBLOQUEADO!', 'Cazador de Secretos');
        });
        if (count >= 3) {
          api.unlockAchievement('COIN_COLLECTOR').then(r => {
            if (r && r.success) triggerToast('👑', '¡LOGRO DESBLOQUEADO!', 'Coleccionista Maestro (3 Monedas)');
          });
        }
      }
    },
    onCheckpointChange: (count) => {
      if (checkpointCount) checkpointCount.textContent = count;
    },
    onJump: () => {
      sessionJumps++;
      if (sessionJumps === 1 && api.token) {
        api.unlockAchievement('FIRST_JUMP').then(r => {
          if (r && r.success) triggerToast('🚀', '¡LOGRO DESBLOQUEADO!', 'Primer Impulso');
        });
      } else if (sessionJumps === 100 && api.token) {
        api.unlockAchievement('JUMP_100').then(r => {
          if (r && r.success) triggerToast('⚡', '¡LOGRO DESBLOQUEADO!', 'Saltador Experto (100 saltos)');
        });
      }
    },
    onVictory: async ({ attempts, coins, levelId, levelName }) => {
      const elapsedSec = (Date.now() - levelStartTime) / 1000;
      const targetLevelId = levelId || engine.level.id;

      // 1. Efectos visuales de confeti
      engine.particleSystem.createConfetti(engine.player.x + 24, engine.player.y + 24);

      // 2. Actualizar récord local al 100% y monedas
      const rec = getLevelRecord(targetLevelId);
      if (engine.gameMode === 'PRACTICE') {
        rec.practiceBestPct = 100;
      } else {
        rec.bestPct = 100;
        for (let i = 0; i < coins; i++) {
          rec.coins[i] = true;
        }
      }
      saveLevelRecord(targetLevelId, rec);
      renderLevelCard();

      // 3. Desplegar pantalla modal de NIVEL COMPLETADO
      if (victoryOverlay) {
        if (victoryLevelName) victoryLevelName.textContent = levelName || engine.level.name;
        if (victoryAttempts) victoryAttempts.textContent = attempts;
        if (victoryTime) victoryTime.textContent = `${elapsedSec.toFixed(2)}s`;
        if (victoryCoins) victoryCoins.textContent = `🪙 ${coins}/3`;
        if (victorySyncStatus) {
          victorySyncStatus.textContent = api.token ? 'Guardando en la nube...' : 'Récord guardado localmente';
        }
        victoryOverlay.classList.remove('hidden');
      }

      // 4. Registrar automáticamente en el backend (CERO MOCKS)
      if (api.token) {
        try {
          const scoreRes = await api.submitScore({
            level_id: targetLevelId,
            best_percentage: 100,
            completion_time: elapsedSec,
            coins_collected: coins
          });

          if (scoreRes && scoreRes.success) {
            if (victorySyncStatus) victorySyncStatus.textContent = '✅ Récord guardado en la nube';
          }
        } catch (err) {
          console.warn('Error al guardar score en la nube:', err);
        }

        api.unlockAchievement('LEVEL_MASTER').then(r => {
          if (r && r.success) triggerToast('🏆', '¡LOGRO DESBLOQUEADO!', 'Victoria Neón (100% Completado)');
        });
      }
    }
  };

  const engine = new GameEngine(canvas, uiCallbacks);

  // Cargar personalización guardada del usuario
  function applyCustomizationToEngine(customization) {
    if (!customization) return;
    const { selected_skin, primary_color, secondary_color, trail_effect } = customization;
    engine.skinSystem.setSkin(selected_skin, primary_color, secondary_color, trail_effect);
    if (customization.unlocked_skins && Array.isArray(customization.unlocked_skins)) {
      customization.unlocked_skins.forEach(s => engine.skinSystem.unlockedSkins.add(s));
    }
    renderSkinPreview();
  }

  // Cargar de almacenamiento local al inicio
  const localSkin = localStorage.getItem('neon_dash_skin');
  const localPrimary = localStorage.getItem('neon_dash_primary');
  const localSecondary = localStorage.getItem('neon_dash_secondary');
  const localTrail = localStorage.getItem('neon_dash_trail');
  if (localSkin || localPrimary || localSecondary || localTrail) {
    applyCustomizationToEngine({
      selected_skin: localSkin || 'CLASSIC',
      primary_color: localPrimary || '#39ff14',
      secondary_color: localSecondary || '#ffe600',
      trail_effect: localTrail || 'NEON'
    });
  }

  engine.start();

  // =========================================================================
  // 1. SELECTOR Y CARRUSEL DE NIVELES OFICIALES (GEOMETRY DASH STYLE)
  // =========================================================================
  const diffClasses = {
    'Easy': 'diff-easy',
    'Normal': 'diff-normal',
    'Hard': 'diff-hard',
    'Demon': 'diff-demon'
  };
  const diffLabels = {
    'Easy': 'FÁCIL',
    'Normal': 'NORMAL',
    'Hard': 'DIFÍCIL',
    'Demon': 'DEMON'
  };
  const diffIcons = {
    'Easy': '🔵',
    'Normal': '🟢',
    'Hard': '🟠',
    'Demon': '👿'
  };

  function renderLevelCard(animationDir = null) {
    const level = OFFICIAL_LEVELS[currentCarouselIndex];
    if (!level) return;

    const record = getLevelRecord(level.id);

    // 1. Cambio de Color Dinámico por Nivel (Dynamic Theme)
    const theme = LEVEL_THEMES[level.id] || LEVEL_THEMES['level_1_stereo_madness'];
    if (theme && mainMenuOverlay) {
      mainMenuOverlay.style.setProperty('--gd-bg-gradient', theme.bgGradient);
      mainMenuOverlay.style.setProperty('--gd-primary', theme.primaryColor);
      mainMenuOverlay.style.setProperty('--gd-secondary', theme.secondaryColor);
      mainMenuOverlay.style.setProperty('--gd-glow', theme.glowColor);
      mainMenuOverlay.style.setProperty('--gd-border', theme.cardBorder);
      mainMenuOverlay.style.setProperty('--gd-bar-normal', theme.progressBarNormal);
      mainMenuOverlay.style.setProperty('--gd-bar-practice', theme.progressBarPractice);
      mainMenuOverlay.style.backgroundColor = theme.bgColor;
    }
    // Sincronizar tema con el Canvas del juego
    if (theme && engine && engine.setTheme) {
      engine.setTheme(theme);
    }

    // 2. Animación de transición suave entre tarjetas
    if (animationDir && levelCardMain) {
      levelCardMain.classList.remove('slide-enter-right', 'slide-enter-left');
      void levelCardMain.offsetWidth; // Forzar reflow para reiniciar animación
      levelCardMain.classList.add(animationDir === 'next' ? 'slide-enter-right' : 'slide-enter-left');
    }

    // 3. Encabezados y Subtítulos
    if (cardLevelNumber) cardLevelNumber.textContent = `NIVEL ${currentCarouselIndex + 1}`;
    if (cardLevelTitle) cardLevelTitle.textContent = level.name;
    if (gdLevelSubtitle) {
      gdLevelSubtitle.textContent = level.subtitle 
        ? `${level.subtitle.toUpperCase()} • MODO HISTORIA` 
        : 'NIVELES OFICIALES • MODO HISTORIA';
    }

    // 4. Dificultad e Icono
    const diff = level.difficulty || 'Normal';
    if (cardDiffBadge) {
      cardDiffBadge.className = `gd-diff-container ${diffClasses[diff] || 'diff-normal'}`;
    }
    if (cardDiffIcon) cardDiffIcon.textContent = diffIcons[diff] || '🟢';
    if (cardDiffText) cardDiffText.textContent = diffLabels[diff] || diff.toUpperCase();

    // 5. Estrellas y Velocidad
    if (cardSpeedText) cardSpeedText.textContent = `${level.speedKey || '1x'} VELOCIDAD`;
    if (cardStarsText) {
      cardStarsText.textContent = level.stars || 1;
    }

    // 6. Dos Barras de Progreso Independientes (NORMAL MODE & PRACTICE MODE)
    const normalPct = Math.min(100, Math.max(0, record.bestPct || 0));
    const practicePct = Math.min(100, Math.max(0, record.practiceBestPct || 0));

    if (cardNormalPct) cardNormalPct.textContent = `${normalPct}%`;
    if (cardNormalBarFill) cardNormalBarFill.style.width = `${normalPct}%`;

    if (cardPracticePct) cardPracticePct.textContent = `${practicePct}%`;
    if (cardPracticeBarFill) cardPracticeBarFill.style.width = `${practicePct}%`;

    // 7. Tres Monedas Secretas
    const coinElements = [cardCoin1, cardCoin2, cardCoin3];
    coinElements.forEach((coinEl, idx) => {
      if (coinEl) {
        if (record.coins && record.coins[idx]) {
          coinEl.classList.add('collected');
        } else {
          coinEl.classList.remove('collected');
        }
      }
    });

    // 8. Paginación Inferior (Dots)
    renderCarouselDots();

    // 9. Actualizar también la insignia del Header superior
    if (difficultyBadge && diffLabel) {
      difficultyBadge.className = `diff-badge ${diffClasses[diff] || 'diff-normal'}`;
      diffLabel.textContent = (diffLabels[diff] || diff).toUpperCase();
      const dot = difficultyBadge.querySelector('.diff-dot');
      if (dot) dot.textContent = diffIcons[diff] || '🟢';
    }
  }

  function renderCarouselDots() {
    if (!carouselDots) return;
    carouselDots.innerHTML = '';
    OFFICIAL_LEVELS.forEach((lvl, idx) => {
      const dot = document.createElement('div');
      dot.className = `carousel-dot ${idx === currentCarouselIndex ? 'active' : ''}`;
      dot.title = `${idx + 1}. ${lvl.name}`;
      dot.addEventListener('click', () => {
        if (idx !== currentCarouselIndex) {
          const dir = idx > currentCarouselIndex ? 'next' : 'prev';
          currentCarouselIndex = idx;
          renderLevelCard(dir);
        }
      });
      carouselDots.appendChild(dot);
    });
  }

  // Navegación con flechas del carrusel
  function prevLevel() {
    currentCarouselIndex = (currentCarouselIndex - 1 + OFFICIAL_LEVELS.length) % OFFICIAL_LEVELS.length;
    renderLevelCard('prev');
  }

  function nextLevel() {
    currentCarouselIndex = (currentCarouselIndex + 1) % OFFICIAL_LEVELS.length;
    renderLevelCard('next');
  }

  if (prevLevelBtn) prevLevelBtn.addEventListener('click', prevLevel);
  if (nextLevelBtn) nextLevelBtn.addEventListener('click', nextLevel);

  // Navegación con teclado en el menú
  window.addEventListener('keydown', (e) => {
    const activeTag = document.activeElement ? document.activeElement.tagName : '';
    if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;

    if (!mainMenuOverlay.classList.contains('hidden')) {
      if (e.code === 'ArrowLeft') prevLevel();
      else if (e.code === 'ArrowRight') nextLevel();
    }
  });

  // Función común para iniciar el nivel aplicando el tema al Canvas
  function startCurrentLevel(mode = 'NORMAL') {
    const currentLevel = OFFICIAL_LEVELS[currentCarouselIndex];
    if (currentLevel) {
      const theme = LEVEL_THEMES[currentLevel.id] || LEVEL_THEMES['level_1_stereo_madness'];
      if (theme && engine && engine.setTheme) {
        engine.setTheme(theme);
      }
      engine.level.loadOfficialLevelByIndex(currentCarouselIndex);
    }
    setUIMode(mode);
  }

  // Botón JUGAR del Carrusel (Modo Normal)
  if (cardPlayBtn) {
    cardPlayBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      startCurrentLevel('NORMAL');
    });
  }

  // Barra Normal clicable
  if (normalBarModule) {
    normalBarModule.addEventListener('click', (e) => {
      e.stopPropagation();
      startCurrentLevel('NORMAL');
    });
  }

  // Botón PRACTICAR del Carrusel (Modo Práctica)
  if (cardPracticeBtn) {
    cardPracticeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      startCurrentLevel('PRACTICE');
    });
  }

  // Barra de Práctica clicable
  if (practiceBarModule) {
    practiceBarModule.addEventListener('click', (e) => {
      e.stopPropagation();
      startCurrentLevel('PRACTICE');
    });
  }

  // Clic en la tarjeta central inicia el nivel en Modo Normal
  if (levelCardMain) {
    levelCardMain.addEventListener('click', (e) => {
      if (e.target.closest('#cardPracticeBtn') || e.target.closest('#practiceBarModule') || e.target.closest('.coin-slot')) {
        return;
      }
      startCurrentLevel('NORMAL');
    });
  }

  // Inicializar vista del carrusel
  renderLevelCard();

  // --- AUDIO FIX GARANTIZADO ---
  async function unlockAudio() {
    await engine.audioSystem.resume();
    engine.audioSystem.playJump();
    if (audioUnlockBanner) {
      audioUnlockBanner.classList.add('hidden');
    }
    if (audioIcon) audioIcon.textContent = '🔊';
  }

  if (activateAudioBtn) activateAudioBtn.addEventListener('click', unlockAudio);
  if (audioUnlockBanner) audioUnlockBanner.addEventListener('click', unlockAudio);

  window.addEventListener('pointerdown', () => {
    if (audioUnlockBanner && !audioUnlockBanner.classList.contains('hidden')) {
      unlockAudio();
    }
  }, { once: true });

  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      const isMuted = engine.audioSystem.toggleMute();
      if (audioIcon) audioIcon.textContent = isMuted ? '🔇' : '🔊';
    });
  }

  // =========================================================================
  // 2. AUTENTICACIÓN & PERFIL DE USUARIO (CON CARGA DE SKINS DEL SERVIDOR)
  // =========================================================================
  async function syncUserCustomization() {
    if (!api.token) return;
    try {
      const res = await api.getCustomization();
      if (res && res.success && res.customization) {
        applyCustomizationToEngine(res.customization);
      }
    } catch (e) {
      console.warn('Error al sincronizar personalización con el backend:', e);
    }
  }

  function updateAuthBadge() {
    if (api.currentUser) {
      userBadgeText.textContent = api.currentUser.username.toUpperCase();
      userAuthBtn.classList.add('logged-in');
    } else {
      userBadgeText.textContent = 'LOGIN';
      userAuthBtn.classList.remove('logged-in');
    }
  }
  updateAuthBadge();
  if (api.token) {
    syncUserCustomization();
  }

  userAuthBtn.addEventListener('click', async () => {
    if (api.currentUser) {
      profileUsername.textContent = api.currentUser.username;
      profileJumps.textContent = api.currentUser.total_jumps || 0;
      profileAttempts.textContent = api.currentUser.total_attempts || 0;
      profileStars.textContent = `⭐ ${api.currentUser.total_stars || 0}`;
      profileCoins.textContent = `🪙 ${api.currentUser.total_coins || 0}`;

      const me = await api.getMe();
      if (me && me.user) {
        profileJumps.textContent = me.user.total_jumps;
        profileAttempts.textContent = me.user.total_attempts;
        profileStars.textContent = `⭐ ${me.user.total_stars}`;
        profileCoins.textContent = `🪙 ${me.user.total_coins}`;
      }

      profileModal.classList.remove('hidden');
    } else {
      authModal.classList.remove('hidden');
    }
  });

  closeAuthBtn.addEventListener('click', () => authModal.classList.add('hidden'));
  closeProfileBtn.addEventListener('click', () => profileModal.classList.add('hidden'));

  tabLoginBtn.addEventListener('click', () => {
    authMode = 'LOGIN';
    tabLoginBtn.classList.add('active');
    tabRegisterBtn.classList.remove('active');
    authSubmitBtn.textContent = 'INGRESAR';
    authErrorMsg.classList.add('hidden');
  });

  tabRegisterBtn.addEventListener('click', () => {
    authMode = 'REGISTER';
    tabRegisterBtn.classList.add('active');
    tabLoginBtn.classList.remove('active');
    authSubmitBtn.textContent = 'REGISTRARSE';
    authErrorMsg.classList.add('hidden');
  });

  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const u = authUsername.value.trim();
    const p = authPassword.value;

    authErrorMsg.classList.add('hidden');

    const res = authMode === 'LOGIN' 
      ? await api.login(u, p) 
      : await api.register(u, p);

    if (res.success) {
      authModal.classList.add('hidden');
      updateAuthBadge();
      triggerToast('🎉', 'SESIÓN INICIADA', `¡Bienvenido, ${u}!`);
      await syncUserCustomization();
    } else {
      authErrorMsg.textContent = res.error || 'Ocurrió un error.';
      authErrorMsg.classList.remove('hidden');
    }
  });

  logoutBtn.addEventListener('click', () => {
    api.logout();
    updateAuthBadge();
    profileModal.classList.add('hidden');
    triggerToast('👋', 'SESIÓN FINALIZADA', 'Has cerrado sesión.');
  });

  // --- LEADERBOARD GLOBAL ---
  openLeaderboardBtn.addEventListener('click', async () => {
    leaderboardModal.classList.remove('hidden');
    leaderboardTbody.innerHTML = '<tr><td colspan="5" class="table-loading-msg">Consultando récords globales...</td></tr>';

    const currentLvlId = engine.level ? engine.level.id : 'level_1_stereo_madness';
    const res = await api.getLeaderboard(currentLvlId);
    if (res.success && res.leaderboard.length > 0) {
      leaderboardTbody.innerHTML = res.leaderboard.map((item, idx) => {
        const medal = idx === 0 ? '🥇 1°' : (idx === 1 ? '🥈 2°' : (idx === 2 ? '🥉 3°' : `#${idx + 1}`));
        return `
          <tr>
            <td><strong>${medal}</strong></td>
            <td class="glow-cyan">${item.username}</td>
            <td class="glow-speed">${item.best_percentage}%</td>
            <td>${item.completion_time.toFixed(2)}s</td>
            <td class="glow-gold">🪙 ${item.coins_collected}/3</td>
          </tr>
        `;
      }).join('');
    } else {
      leaderboardTbody.innerHTML = '<tr><td colspan="5" class="table-loading-msg">Aún no hay récords globales para este nivel. ¡Sé el primero!</td></tr>';
    }
  });

  closeLeaderboardBtn.addEventListener('click', () => leaderboardModal.classList.add('hidden'));

  // =========================================================================
  // 3. EXPLORADOR DE NIVELES DE LA COMUNIDAD (GET /api/levels & GET /api/levels/:id)
  // =========================================================================
  async function loadCommunityList() {
    communityLevelsList.innerHTML = '<div class="table-loading-msg">Cargando niveles comunitarios...</div>';
    const res = await api.getCommunityLevels({
      sort: activeCommunitySort,
      search: communitySearchInput.value
    });

    if (res.success && res.levels.length > 0) {
      communityLevelsList.innerHTML = res.levels.map(lvl => `
        <div class="community-card">
          <div class="comm-info">
            <h4>${lvl.title} <span style="font-size: 0.75rem; color: var(--neon-cyan);">#${lvl.id}</span></h4>
            <div class="comm-meta">
              <span>👤 Creador: <strong>${lvl.creator_name}</strong></span>
              <span>🏷️ Dificultad: <strong>${lvl.difficulty}</strong></span>
              <span>🎮 ${lvl.plays} partidas</span>
            </div>
          </div>
          <div class="comm-actions">
            <button class="btn-vote btn-like" data-id="${lvl.id}" title="Me Gusta">👍 ${lvl.likes}</button>
            <button class="btn-vote btn-dislike" data-id="${lvl.id}" title="No Me Gusta">👎 ${lvl.dislikes}</button>
            <button class="menu-action-btn primary-glow btn-play-community" data-id="${lvl.id}">▶ JUGAR</button>
          </div>
        </div>
      `).join('');

      // Botón "Jugar Nivel Comunitario"
      document.querySelectorAll('.btn-play-community').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          btn.textContent = 'Cargando...';
          const lvlRes = await api.getCommunityLevel(id);
          if (lvlRes.success && lvlRes.level) {
            const raw = lvlRes.level.level_data;
            const mapData = typeof raw === 'string' ? JSON.parse(raw) : raw;
            mapData.id = 'comm_' + lvlRes.level.id;
            mapData.name = lvlRes.level.title;
            mapData.subtitle = `Por ${lvlRes.level.creator_name} • Comunidad`;
            mapData.difficulty = lvlRes.level.difficulty || 'Normal';
            engine.level.loadFromJSON(mapData);
            setUIMode('NORMAL');
            communityModal.classList.add('hidden');
            mainMenuOverlay.classList.add('hidden');
            triggerToast('🌐', 'NIVEL DE LA COMUNIDAD', `Cargado: "${lvlRes.level.title}"`);
          } else {
            alert('Error al cargar nivel: ' + (lvlRes.error || 'Desconocido'));
            btn.textContent = '▶ JUGAR';
          }
        });
      });

      // Votos Like / Dislike
      document.querySelectorAll('.btn-like').forEach(btn => {
        btn.addEventListener('click', async () => {
          const res = await api.rateCommunityLevel(btn.dataset.id, 1);
          if (res.success) loadCommunityList();
          else alert(res.error || 'Inicia sesión para votar.');
        });
      });

      document.querySelectorAll('.btn-dislike').forEach(btn => {
        btn.addEventListener('click', async () => {
          const res = await api.rateCommunityLevel(btn.dataset.id, -1);
          if (res.success) loadCommunityList();
          else alert(res.error || 'Inicia sesión para votar.');
        });
      });
    } else {
      communityLevelsList.innerHTML = '<div class="table-loading-msg">No se encontraron niveles en la comunidad con ese criterio.</div>';
    }
  }

  openCommunityBtn.addEventListener('click', () => {
    communityModal.classList.remove('hidden');
    loadCommunityList();
  });
  closeCommunityBtn.addEventListener('click', () => communityModal.classList.add('hidden'));

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCommunitySort = btn.dataset.sort;
      loadCommunityList();
    });
  });

  communitySearchInput.addEventListener('input', () => {
    loadCommunityList();
  });

  // Publicar Nivel en Comunidad desde el Editor
  publishCommunityBtn.addEventListener('click', async () => {
    if (!api.token) {
      alert('Debes iniciar sesión para publicar niveles en la comunidad.');
      authModal.classList.remove('hidden');
      return;
    }

    const title = prompt('Ingresa el título de tu nivel para la comunidad:', engine.level.name || 'Mi Nivel Neón');
    if (!title || !title.trim()) return;

    publishCommunityBtn.disabled = true;
    publishCommunityBtn.textContent = '⏳ Publicando...';

    const res = await api.uploadCommunityLevel({
      title: title.trim(),
      difficulty: engine.level.difficulty,
      level_data: engine.level.exportToJSON()
    });

    publishCommunityBtn.disabled = false;
    publishCommunityBtn.textContent = '🌐 Publicar';

    if (res.success) {
      triggerToast('🌐', 'COMUNIDAD', '¡Nivel publicado exitosamente!');
      api.unlockAchievement('CREATOR').then(r => {
        if (r && r.success) triggerToast('🛠️', '¡LOGRO DESBLOQUEADO!', 'Arquitecto Neón');
      });
      loadCommunityList();
    } else {
      alert('Error al publicar: ' + (res.error || 'Inténtalo de nuevo.'));
    }
  });

  // --- LOGROS MODAL ---
  openAchievementsBtn.addEventListener('click', async () => {
    achievementsModal.classList.remove('hidden');
    achievementsGrid.innerHTML = '<div class="table-loading-msg">Consultando catálogo de logros...</div>';

    const res = await api.getAchievements();
    if (res.success) {
      achievementsGrid.innerHTML = res.achievements.map(ach => `
        <div class="achievement-card ${ach.unlocked ? 'unlocked' : 'locked'}">
          <div class="ach-icon">${ach.icon}</div>
          <div class="ach-details">
            <h4>${ach.title} ${ach.unlocked ? '✅' : '🔒'}</h4>
            <p>${ach.desc}</p>
          </div>
        </div>
      `).join('');
    }
  });
  closeAchievementsBtn.addEventListener('click', () => achievementsModal.classList.add('hidden'));

  // =========================================================================
  // 4. TIENDA Y ARMARIO DE PERSONALIZACIÓN (ICON KIT / GARAJE DE SKINS)
  // =========================================================================
  const skinCtx = skinPreviewCanvas.getContext('2d');
  let previewAnimId = null;
  let previewRotation = 0;
  let previewBob = 0;
  let selectionSpin = 0;
  let previewParticles = [];
  let previewParticleTimer = 0;

  function triggerSelectionSpin() {
    selectionSpin = Math.PI * 2;
  }

  function setWardrobeInfo(icon, text, isLocked = false) {
    if (wardrobeInfoIcon) wardrobeInfoIcon.textContent = icon;
    if (wardrobeInfoText) wardrobeInfoText.textContent = text;
    if (wardrobeItemInfo) {
      wardrobeItemInfo.classList.toggle('is-locked', isLocked);
    }
  }

  // Previsualización en Tiempo Real con animación de flotación, giro dinámico y estela activa
  function startPreviewAnimation() {
    if (previewAnimId) cancelAnimationFrame(previewAnimId);
    previewParticles = [];
    previewParticleTimer = 0;

    let lastTime = performance.now();

    function loop(time) {
      const dt = Math.min(0.05, (time - lastTime) / 1000);
      lastTime = time;

      previewBob = Math.sin(time * 0.003) * 6;
      previewRotation = Math.sin(time * 0.0015) * 0.12;

      // Amortiguación suave del giro al seleccionar un nuevo ítem
      if (selectionSpin > 0) {
        selectionSpin = Math.max(0, selectionSpin - dt * 14);
      }

      // Emisión de partículas de estela en el cuadro central de previsualización
      const trail = engine.skinSystem.currentTrail;
      if (trail !== 'NONE') {
        previewParticleTimer += dt;
        if (previewParticleTimer >= 0.04) {
          previewParticleTimer = 0;
          const px = skinPreviewCanvas.width / 2 - 28;
          const py = skinPreviewCanvas.height / 2 + previewBob;
          let color = engine.skinSystem.currentPrimary;
          let shape = 'SQUARE';
          let size = 6 + Math.random() * 4;

          if (trail === 'FIRE') {
            color = Math.random() > 0.4 ? '#ff5500' : '#ffe600';
            shape = 'CIRCLE';
          } else if (trail === 'RAINBOW') {
            color = `hsl(${(time * 0.3) % 360}, 100%, 60%)`;
          } else if (trail === 'STAR') {
            color = '#ffffff';
            shape = 'STAR';
          }

          previewParticles.push({
            x: px + (Math.random() - 0.5) * 8,
            y: py + (Math.random() - 0.5) * 8,
            vx: -35 - Math.random() * 30,
            vy: (Math.random() - 0.5) * 22,
            size,
            color,
            shape,
            life: 0.45,
            maxLife: 0.45
          });
        }
      }

      // Actualizar partículas
      for (let i = previewParticles.length - 1; i >= 0; i--) {
        const p = previewParticles[i];
        p.life -= dt;
        if (p.life <= 0) {
          previewParticles.splice(i, 1);
          continue;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }

      // Limpiar canvas
      skinCtx.clearRect(0, 0, skinPreviewCanvas.width, skinPreviewCanvas.height);

      // Dibujar partículas de estela detrás del cubo
      for (const p of previewParticles) {
        const alpha = Math.max(0, p.life / p.maxLife);
        skinCtx.save();
        skinCtx.globalAlpha = alpha;
        skinCtx.fillStyle = p.color;
        skinCtx.shadowColor = p.color;
        skinCtx.shadowBlur = 6;
        if (p.shape === 'CIRCLE') {
          skinCtx.beginPath();
          skinCtx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
          skinCtx.fill();
        } else if (p.shape === 'STAR') {
          skinCtx.translate(p.x, p.y);
          skinCtx.rotate(time * 0.005);
          skinCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        } else {
          skinCtx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
        skinCtx.restore();
      }

      // Dibujar cubo flotante con su diseño, colores dinámicos y rotación
      skinCtx.save();
      skinCtx.translate(skinPreviewCanvas.width / 2, skinPreviewCanvas.height / 2 + previewBob);
      skinCtx.rotate(previewRotation + selectionSpin);

      engine.skinSystem.drawCube(skinCtx, 76, 76);
      skinCtx.restore();

      if (previewSkinName) {
        const skinMeta = engine.skinSystem.SKINS.find(s => s.id === engine.skinSystem.currentIcon);
        previewSkinName.textContent = skinMeta ? skinMeta.name.toUpperCase() : `${engine.skinSystem.currentIcon} CUBE`;
      }

      previewAnimId = requestAnimationFrame(loop);
    }

    previewAnimId = requestAnimationFrame(loop);
  }

  function stopPreviewAnimation() {
    if (previewAnimId) {
      cancelAnimationFrame(previewAnimId);
      previewAnimId = null;
    }
  }

  function renderWardrobeUI() {
    const stats = {
      total_jumps: (api.currentUser ? api.currentUser.total_jumps : 0) + sessionJumps,
      total_attempts: (api.currentUser ? api.currentUser.total_attempts : 0) + engine.player.attempts,
      total_coins: Math.max(api.currentUser ? (api.currentUser.total_coins || 0) : 0, getTotalCoinsCollected())
    };
    const completedLevels = getCompletedLevelIds();

    // Sincronizar pickers de color inline
    if (primaryColorPicker) {
      primaryColorPicker.value = engine.skinSystem.currentPrimary;
      primaryColorPicker.oninput = (e) => {
        engine.skinSystem.currentPrimary = e.target.value;
        primaryColorPalette.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        setWardrobeInfo('🎨', `Color Primario personalizado: ${e.target.value.toUpperCase()}`);
      };
    }

    if (secondaryColorPicker) {
      secondaryColorPicker.value = engine.skinSystem.currentSecondary;
      secondaryColorPicker.oninput = (e) => {
        engine.skinSystem.currentSecondary = e.target.value;
        secondaryColorPalette.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        setWardrobeInfo('✨', `Color Secundario personalizado: ${e.target.value.toUpperCase()}`);
      };
    }

    // 1. Selector de Skins (6 Modelos de Cubo)
    const skinButtons = document.querySelectorAll('.skin-icon-btn');
    skinButtons.forEach(btn => {
      const iconKey = btn.dataset.icon;
      const skinMeta = engine.skinSystem.SKINS.find(s => s.id === iconKey);
      const isUnlocked = engine.skinSystem.isItemUnlocked(skinMeta, stats, completedLevels);

      btn.classList.toggle('active', engine.skinSystem.currentIcon === iconKey);
      btn.classList.toggle('locked', !isUnlocked);

      if (skinMeta) {
        btn.innerHTML = `${skinMeta.name} ${!isUnlocked ? '<span class="item-lock-icon">🔒</span>' : ''}`;
        btn.title = isUnlocked ? skinMeta.desc : `🔒 Requiere: ${skinMeta.req}`;
      }

      btn.onmouseenter = () => {
        if (!isUnlocked && skinMeta) {
          setWardrobeInfo('🔒', `BLOQUEADO: ${skinMeta.name} (Requiere: ${skinMeta.req})`, true);
        } else if (skinMeta) {
          setWardrobeInfo('🎨', `${skinMeta.name}: ${skinMeta.desc}`);
        }
      };

      btn.onclick = () => {
        if (!isUnlocked) {
          triggerToast('🔒', 'BLOQUEADO', `Requiere: ${skinMeta.req}`);
          setWardrobeInfo('🔒', `BLOQUEADO: ${skinMeta.name} (Requiere: ${skinMeta.req})`, true);
          return;
        }
        skinButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        engine.skinSystem.currentIcon = iconKey;
        triggerSelectionSpin();
        setWardrobeInfo('✅', `Seleccionado: ${skinMeta.name}`);
      };
    });

    // 2. Paleta de Colores Primarios (Cuerpo)
    primaryColorPalette.innerHTML = '';
    engine.skinSystem.PRIMARY_COLORS.forEach(c => {
      const isUnlocked = engine.skinSystem.isItemUnlocked(c, stats, completedLevels);
      const swatch = document.createElement('div');
      swatch.className = `color-swatch ${c.hex === engine.skinSystem.currentPrimary ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}`;
      swatch.style.backgroundColor = c.hex;
      swatch.title = isUnlocked ? c.name : `🔒 ${c.name} (${c.req})`;

      swatch.onmouseenter = () => {
        if (!isUnlocked) {
          setWardrobeInfo('🔒', `Color Bloqueado: ${c.name} (Requiere: ${c.req})`, true);
        } else {
          setWardrobeInfo('🎨', `Color Primario: ${c.name}`);
        }
      };

      swatch.addEventListener('click', () => {
        if (!isUnlocked) {
          triggerToast('🔒', 'COLOR BLOQUEADO', `Requiere: ${c.req}`);
          setWardrobeInfo('🔒', `Color Bloqueado: ${c.name} (Requiere: ${c.req})`, true);
          return;
        }
        primaryColorPalette.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        engine.skinSystem.currentPrimary = c.hex;
        if (primaryColorPicker) primaryColorPicker.value = c.hex;
        triggerSelectionSpin();
        setWardrobeInfo('✅', `Color Primario: ${c.name}`);
      });
      primaryColorPalette.appendChild(swatch);
    });

    // 3. Paleta de Colores Secundarios (Detalles, Ojos, Bordes)
    secondaryColorPalette.innerHTML = '';
    engine.skinSystem.SECONDARY_COLORS.forEach(c => {
      const isUnlocked = engine.skinSystem.isItemUnlocked(c, stats, completedLevels);
      const swatch = document.createElement('div');
      swatch.className = `color-swatch ${c.hex === engine.skinSystem.currentSecondary ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}`;
      swatch.style.backgroundColor = c.hex;
      swatch.title = isUnlocked ? c.name : `🔒 ${c.name} (${c.req})`;

      swatch.onmouseenter = () => {
        if (!isUnlocked) {
          setWardrobeInfo('🔒', `Color Bloqueado: ${c.name} (Requiere: ${c.req})`, true);
        } else {
          setWardrobeInfo('✨', `Color Secundario: ${c.name}`);
        }
      };

      swatch.addEventListener('click', () => {
        if (!isUnlocked) {
          triggerToast('🔒', 'COLOR BLOQUEADO', `Requiere: ${c.req}`);
          setWardrobeInfo('🔒', `Color Bloqueado: ${c.name} (Requiere: ${c.req})`, true);
          return;
        }
        secondaryColorPalette.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        engine.skinSystem.currentSecondary = c.hex;
        if (secondaryColorPicker) secondaryColorPicker.value = c.hex;
        triggerSelectionSpin();
        setWardrobeInfo('✅', `Color Secundario: ${c.name}`);
      });
      secondaryColorPalette.appendChild(swatch);
    });

    // 4. Selector de Estelas y Partículas (Trails)
    trailSelectorRow.innerHTML = '';
    engine.skinSystem.TRAILS.forEach(t => {
      const isUnlocked = engine.skinSystem.isItemUnlocked(t, stats, completedLevels);
      const btn = document.createElement('button');
      btn.className = `trail-btn ${t.id === engine.skinSystem.currentTrail ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}`;
      btn.innerHTML = `${t.icon || '✨'} ${t.name} ${!isUnlocked ? '<span class="item-lock-icon">🔒</span>' : ''}`;
      btn.title = isUnlocked ? t.desc : `🔒 Requiere: ${t.req}`;

      btn.onmouseenter = () => {
        if (!isUnlocked) {
          setWardrobeInfo('🔒', `Estela Bloqueada: ${t.name} (Requiere: ${t.req})`, true);
        } else {
          setWardrobeInfo(t.icon || '✨', `${t.name}: ${t.desc}`);
        }
      };

      btn.addEventListener('click', () => {
        if (!isUnlocked) {
          triggerToast('🔒', 'ESTELA BLOQUEADA', `Requiere: ${t.req}`);
          setWardrobeInfo('🔒', `Estela Bloqueada: ${t.name} (Requiere: ${t.req})`, true);
          return;
        }
        trailSelectorRow.querySelectorAll('.trail-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        engine.skinSystem.currentTrail = t.id;
        triggerSelectionSpin();
        setWardrobeInfo(t.icon || '✨', `Estela Activada: ${t.name}`);
      });
      trailSelectorRow.appendChild(btn);
    });
  }

  openWardrobeBtn.addEventListener('click', () => {
    wardrobeModal.classList.remove('hidden');
    renderWardrobeUI();
    startPreviewAnimation();
  });

  closeWardrobeBtn.addEventListener('click', () => {
    wardrobeModal.classList.add('hidden');
    stopPreviewAnimation();
  });

  // Guardar y persistir personalización en backend y localStorage
  saveWardrobeBtn.addEventListener('click', async () => {
    const skinConfig = {
      selected_skin: engine.skinSystem.currentIcon,
      primary_color: engine.skinSystem.currentPrimary,
      secondary_color: engine.skinSystem.currentSecondary,
      trail_effect: engine.skinSystem.currentTrail,
      unlocked_skins: Array.from(engine.skinSystem.unlockedSkins)
    };

    // Guardar siempre localmente (invitados)
    localStorage.setItem('neon_dash_skin', skinConfig.selected_skin);
    localStorage.setItem('neon_dash_primary', skinConfig.primary_color);
    localStorage.setItem('neon_dash_secondary', skinConfig.secondary_color);
    localStorage.setItem('neon_dash_trail', skinConfig.trail_effect);

    // Persistir en backend si está logueado (CERO MOCKS)
    if (api.token) {
      saveWardrobeBtn.disabled = true;
      saveWardrobeBtn.textContent = 'Guardando...';
      const saveRes = await api.updateCustomization(skinConfig);
      saveWardrobeBtn.disabled = false;
      saveWardrobeBtn.textContent = 'GUARDAR Y SALIR';

      if (saveRes && saveRes.success) {
        triggerToast('🎨', 'ARMARIO NEÓN', '¡Personalización guardada en tu cuenta!');
      } else {
        triggerToast('⚠️', 'AVISO', 'Guardado localmente');
      }
    } else {
      triggerToast('👕', 'ARMARIO', 'Skin y estela aplicadas al cubo');
    }

    wardrobeModal.classList.add('hidden');
    stopPreviewAnimation();
  });

  // =========================================================================
  // 5. CONTROL DE MODOS DE JUEGO (NORMAL, PRACTICE, EDITOR)
  // =========================================================================
  function setUIMode(mode) {
    engine.setMode(mode);
    mainMenuOverlay.classList.add('hidden');
    victoryOverlay.classList.add('hidden');
    currentRunMaxPct = 0;
    levelStartTime = Date.now();

    if (mode === 'PRACTICE') {
      practiceBar.classList.remove('hidden');
      editorBar.classList.add('hidden');
      engineStatus.textContent = 'Modo Práctica • Usa Z para Checkpoint, X para Borrar';
      triggerToast('◈', 'MODO PRÁCTICA', 'Usa Z para guardar checkpoints');
    } else if (mode === 'EDITOR') {
      practiceBar.classList.add('hidden');
      editorBar.classList.remove('hidden');
      engineStatus.textContent = 'Editor de Niveles • Haz clic en el canvas para colocar objetos';
    } else {
      practiceBar.classList.add('hidden');
      editorBar.classList.add('hidden');
      engineStatus.textContent = 'Modo Normal • Beat Sync Activo';
    }
  }

  menuBtn.addEventListener('click', () => {
    engine.setPaused(true);
    mainMenuOverlay.classList.remove('hidden');
    victoryOverlay.classList.add('hidden');
    renderLevelCard();
  });

  openEditorBtn.addEventListener('click', () => setUIMode('EDITOR'));

  // Práctica Checkpoints
  addCheckpointBtn.addEventListener('click', () => {
    engine.placePracticeCheckpoint();
    triggerToast('📍', 'PUNTO DE CONTROL', 'Checkpoint colocado');
  });
  delCheckpointBtn.addEventListener('click', () => {
    engine.removePracticeCheckpoint();
    triggerToast('🗑', 'PUNTO DE CONTROL', 'Último checkpoint borrado');
  });

  // Editor Tools
  document.querySelectorAll('.tool-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tool-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      engine.editor.setTool(btn.dataset.tool);
    });
  });

  panLeftBtn.addEventListener('click', () => engine.editor.setCameraX(engine.editor.cameraX - 250));
  panRightBtn.addEventListener('click', () => engine.editor.setCameraX(engine.editor.cameraX + 250));

  exportJsonBtn.addEventListener('click', () => {
    jsonTextArea.value = engine.level.exportToJSON();
    jsonModal.classList.remove('hidden');
  });

  importJsonBtn.addEventListener('click', () => {
    jsonTextArea.value = '';
    jsonTextArea.placeholder = 'Pega aquí el contenido JSON del mapa...';
    jsonModal.classList.remove('hidden');
  });

  closeJsonModalBtn.addEventListener('click', () => jsonModal.classList.add('hidden'));

  jsonApplyBtn.addEventListener('click', () => {
    try {
      engine.level.loadFromJSON(jsonTextArea.value);
      jsonModal.classList.add('hidden');
      triggerToast('💾', 'EDITOR', '¡Mapa cargado con éxito!');
    } catch (err) {
      alert('Error en formato JSON: ' + err.message);
    }
  });

  jsonDownloadBtn.addEventListener('click', () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonTextArea.value || engine.level.exportToJSON());
    const dl = document.createElement('a');
    dl.setAttribute('href', dataStr);
    dl.setAttribute('download', 'neon_dash_level.json');
    dl.click();
  });

  clearLevelBtn.addEventListener('click', () => {
    if (confirm('¿Deseas vaciar todos los obstáculos del nivel?')) {
      engine.editor.clearAll();
      triggerToast('🗑', 'EDITOR', 'Mapa vaciado');
    }
  });

  playLevelBtn.addEventListener('click', () => setUIMode('NORMAL'));

  // =========================================================================
  // 6. BOTONES DE LA PANTALLA DE VICTORIA
  // =========================================================================
  victoryNextBtn.addEventListener('click', () => {
    victoryOverlay.classList.add('hidden');
    // Avanzar al siguiente nivel oficial
    currentCarouselIndex = (currentCarouselIndex + 1) % OFFICIAL_LEVELS.length;
    engine.level.loadOfficialLevelByIndex(currentCarouselIndex);
    setUIMode('NORMAL');
    renderLevelCard();
  });

  victoryReplayBtn.addEventListener('click', () => {
    victoryOverlay.classList.add('hidden');
    setUIMode('NORMAL');
  });

  victoryMenuBtn.addEventListener('click', () => {
    engine.setPaused(true);
    victoryOverlay.classList.add('hidden');
    mainMenuOverlay.classList.remove('hidden');
    renderLevelCard();
  });

  console.info('🚀 Neon Dash: Sistema de Niveles Oficiales, Comunidad y Armario de Skins activo.');
});
