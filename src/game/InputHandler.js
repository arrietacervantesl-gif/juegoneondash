/**
 * Gestor de Entrada para Geometry Dash
 * Soporta Teclado (Espacio, Arriba, W), Ratón y Pantalla Táctil con buffer de salto
 * y soporte para salto continuo por pulsación sostenida (Hold-to-jump).
 */
export class InputHandler {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.isJumpHeld = false;
    this.jumpBufferTimer = 0;
    this.JUMP_BUFFER_DURATION = 0.12; // 120ms de tolerancia antes de tocar suelo

    // Bindings de eventos
    this._onKeyDown = this.handleKeyDown.bind(this);
    this._onKeyUp = this.handleKeyUp.bind(this);
    this._onPointerDown = this.handlePointerDown.bind(this);
    this._onPointerUp = this.handlePointerUp.bind(this);

    this.attachListeners();
  }

  attachListeners() {
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);

    if (this.canvas) {
      this.canvas.addEventListener('pointerdown', this._onPointerDown);
      window.addEventListener('pointerup', this._onPointerUp);
    }
  }

  handleKeyDown(e) {
    // Si el usuario está interactuando con formularios o entradas de texto, no interceptar
    const activeTag = document.activeElement ? document.activeElement.tagName : '';
    if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') {
      return;
    }

    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      e.preventDefault();
      if (!this.isJumpHeld) {
        this.triggerJumpPress();
      }
      this.isJumpHeld = true;
    }
  }

  handleKeyUp(e) {
    const activeTag = document.activeElement ? document.activeElement.tagName : '';
    if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') {
      return;
    }

    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      e.preventDefault();
      this.isJumpHeld = false;
    }
  }

  handlePointerDown(e) {
    if (e.button === 0) { // Clic izquierdo o toque táctil
      if (!this.isJumpHeld) {
        this.triggerJumpPress();
      }
      this.isJumpHeld = true;
    }
  }

  handlePointerUp(e) {
    if (e.button === 0) {
      this.isJumpHeld = false;
    }
  }

  triggerJumpPress() {
    this.jumpBufferTimer = this.JUMP_BUFFER_DURATION;
  }

  /**
   * Actualiza el temporizador de buffer de salto
   * @param {number} dt Delta time en segundos
   */
  update(dt) {
    if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer -= dt;
      if (this.jumpBufferTimer < 0) {
        this.jumpBufferTimer = 0;
      }
    }
  }

  /**
   * Determina si el jugador debe saltar:
   * 1. Si mantiene presionado el botón (Hold-to-jump)
   * 2. Si pulsó recientemente y aún está dentro del buffer
   */
  shouldJump() {
    return this.isJumpHeld || this.jumpBufferTimer > 0;
  }

  /**
   * Consume la intención de salto puntual del buffer tras ejecutarlo
   */
  consumeJump() {
    this.jumpBufferTimer = 0;
  }

  destroy() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    if (this.canvas) {
      this.canvas.removeEventListener('pointerdown', this._onPointerDown);
      window.removeEventListener('pointerup', this._onPointerUp);
    }
  }
}
