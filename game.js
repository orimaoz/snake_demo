/**
 * Retro Snake - Arcade Edition
 * Zero-dependency HTML5 Canvas & Web Audio game engine
 */

class SoundSynthesizer {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  playEat() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(650, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {
      console.warn('Audio error', e);
    }
  }

  playBonus() {
    if (!this.enabled || !this.ctx) return;
    try {
      const notes = [440, 554, 659, 880];
      notes.forEach((freq, i) => {
        const now = this.ctx.currentTime + i * 0.05;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.07);
      });
    } catch (e) {
      console.warn('Audio error', e);
    }
  }

  playGameOver() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.4);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {
      console.warn('Audio error', e);
    }
  }

  playClick() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.03);
    } catch (e) {
      console.warn('Audio error', e);
    }
  }
}

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3 + 1;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.alpha = 1;
    this.decay = Math.random() * 0.04 + 0.02;
    this.size = Math.random() * 3 + 2;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.decay;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class SnakeGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.sound = new SoundSynthesizer();

    // Elements
    this.scoreDisplay = document.getElementById('scoreDisplay');
    this.highScoreDisplay = document.getElementById('highScoreDisplay');
    this.speedDisplay = document.getElementById('speedDisplay');
    this.soundToggleBtn = document.getElementById('soundToggleBtn');
    this.pauseBtn = document.getElementById('pauseBtn');
    this.overlayScreen = document.getElementById('overlayScreen');
    this.overlayTitle = document.getElementById('overlayTitle');
    this.overlaySubtitle = document.getElementById('overlaySubtitle');
    this.overlayStats = document.getElementById('overlayStats');
    this.finalScore = document.getElementById('finalScore');
    this.newHighScoreAlert = document.getElementById('newHighScoreAlert');
    this.startBtn = document.getElementById('startBtn');

    // Virtual D-pad
    this.btnUp = document.getElementById('btnUp');
    this.btnDown = document.getElementById('btnDown');
    this.btnLeft = document.getElementById('btnLeft');
    this.btnRight = document.getElementById('btnRight');
    this.btnAction = document.getElementById('btnAction');

    // Grid configuration (20 x 20)
    this.gridSize = 20;
    this.tileCount = this.canvas.width / this.gridSize; // 400 / 20 = 20

    // State
    this.state = 'START'; // START, PLAYING, PAUSED, GAMEOVER
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('retro_snake_high_score') || '0', 10);
    this.foodsEaten = 0;

    // Movement & Loop timing
    this.snake = [];
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.inputQueue = [];

    this.food = { x: 15, y: 10 };
    this.bonusFood = null; // { x, y, expiresAt, duration }
    this.particles = [];

    this.baseSpeed = 130; // ms per tick
    this.currentSpeed = this.baseSpeed;
    this.lastTickTime = 0;
    this.animFrameId = null;

    this.updateHUD();
    this.initEvents();
  }

  initEvents() {
    // Keyboard inputs
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));

    // UI Buttons
    this.startBtn.addEventListener('click', () => {
      this.sound.init();
      this.sound.playClick();
      if (this.state === 'START' || this.state === 'GAMEOVER') {
        this.startGame();
      } else if (this.state === 'PAUSED') {
        this.resumeGame();
      }
    });

    this.pauseBtn.addEventListener('click', () => {
      this.sound.init();
      this.sound.playClick();
      this.togglePause();
    });

    this.soundToggleBtn.addEventListener('click', () => {
      this.sound.init();
      const enabled = this.sound.toggle();
      this.soundToggleBtn.textContent = enabled ? '🔊' : '🔇';
    });

    // Touch / Mobile D-Pad controls
    const bindPress = (btn, action) => {
      const handler = (e) => {
        e.preventDefault();
        this.sound.init();
        action();
      };
      btn.addEventListener('touchstart', handler, { passive: false });
      btn.addEventListener('mousedown', handler);
    };

    bindPress(this.btnUp, () => this.queueDirection({ x: 0, y: -1 }));
    bindPress(this.btnDown, () => this.queueDirection({ x: 0, y: 1 }));
    bindPress(this.btnLeft, () => this.queueDirection({ x: -1, y: 0 }));
    bindPress(this.btnRight, () => this.queueDirection({ x: 1, y: 0 }));
    bindPress(this.btnAction, () => {
      if (this.state === 'START' || this.state === 'GAMEOVER') this.startGame();
      else this.togglePause();
    });

    // Canvas Touch Swiping
    let touchStartX = 0;
    let touchStartY = 0;
    this.canvas.addEventListener('touchstart', (e) => {
      this.sound.init();
      if (e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    this.canvas.addEventListener('touchend', (e) => {
      if (e.changedTouches.length > 0) {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);

        if (Math.max(absX, absY) > 25) {
          if (absX > absY) {
            this.queueDirection(dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 });
          } else {
            this.queueDirection(dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 });
          }
        }
      }
    }, { passive: true });
  }

  handleKeyDown(e) {
    this.sound.init();

    // Start game on key press if in start/game over screen
    if (this.state === 'START' || this.state === 'GAMEOVER') {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD', 'Space', 'Enter'].includes(e.code)) {
        this.startGame();
        return;
      }
    }

    switch (e.code) {
      case 'ArrowUp':
      case 'KeyW':
        e.preventDefault();
        this.queueDirection({ x: 0, y: -1 });
        break;
      case 'ArrowDown':
      case 'KeyS':
        e.preventDefault();
        this.queueDirection({ x: 0, y: 1 });
        break;
      case 'ArrowLeft':
      case 'KeyA':
        e.preventDefault();
        this.queueDirection({ x: -1, y: 0 });
        break;
      case 'ArrowRight':
      case 'KeyD':
        e.preventDefault();
        this.queueDirection({ x: 1, y: 0 });
        break;
      case 'Space':
        e.preventDefault();
        this.togglePause();
        break;
      case 'KeyR':
        e.preventDefault();
        this.startGame();
        break;
    }
  }

  queueDirection(dir) {
    if (this.state !== 'PLAYING') return;
    const lastDir = this.inputQueue.length > 0 
      ? this.inputQueue[this.inputQueue.length - 1] 
      : this.direction;

    // Prevent direct 180 reversal
    if (dir.x + lastDir.x === 0 && dir.y + lastDir.y === 0) return;
    if (dir.x === lastDir.x && dir.y === lastDir.y) return;

    if (this.inputQueue.length < 2) {
      this.inputQueue.push(dir);
    }
  }

  startGame() {
    this.state = 'PLAYING';
    this.score = 0;
    this.foodsEaten = 0;
    this.currentSpeed = this.baseSpeed;
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.inputQueue = [];
    this.particles = [];
    this.bonusFood = null;

    // Initial 3-segment snake in the middle
    this.snake = [
      { x: 8, y: 10 },
      { x: 7, y: 10 },
      { x: 6, y: 10 }
    ];

    this.spawnFood();
    this.overlayScreen.classList.add('hidden');
    this.pauseBtn.textContent = '⏸';
    this.updateHUD();

    this.lastTickTime = performance.now();
    if (!this.animFrameId) {
      this.loop = this.loop.bind(this);
      this.animFrameId = requestAnimationFrame(this.loop);
    }
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.pauseBtn.textContent = '▶';
      this.overlayTitle.textContent = 'PAUSED';
      this.overlaySubtitle.textContent = 'PRESS SPACE OR RESUME';
      this.overlayStats.classList.add('hidden');
      this.startBtn.textContent = 'RESUME';
      this.overlayScreen.classList.remove('hidden');
    } else if (this.state === 'PAUSED') {
      this.resumeGame();
    }
  }

  resumeGame() {
    this.state = 'PLAYING';
    this.pauseBtn.textContent = '⏸';
    this.overlayScreen.classList.add('hidden');
    this.lastTickTime = performance.now();
  }

  gameOver() {
    this.state = 'GAMEOVER';
    this.sound.playGameOver();

    let isNewHigh = false;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('retro_snake_high_score', this.highScore.toString());
      isNewHigh = true;
    }

    this.updateHUD();

    this.overlayTitle.textContent = 'GAME OVER';
    this.overlaySubtitle.textContent = 'PRESS R OR RESTART';
    this.finalScore.textContent = this.score;
    this.overlayStats.classList.remove('hidden');

    if (isNewHigh) {
      this.newHighScoreAlert.classList.remove('hidden');
    } else {
      this.newHighScoreAlert.classList.add('hidden');
    }

    this.startBtn.textContent = 'PLAY AGAIN';
    this.overlayScreen.classList.remove('hidden');
  }

  spawnFood() {
    let emptyTiles = [];
    for (let x = 0; x < this.tileCount; x++) {
      for (let y = 0; y < this.tileCount; y++) {
        const onSnake = this.snake.some(segment => segment.x === x && segment.y === y);
        const onBonus = this.bonusFood && this.bonusFood.x === x && this.bonusFood.y === y;
        if (!onSnake && !onBonus) {
          emptyTiles.push({ x, y });
        }
      }
    }

    if (emptyTiles.length > 0) {
      const idx = Math.floor(Math.random() * emptyTiles.length);
      this.food = emptyTiles[idx];
    }
  }

  spawnBonusFood() {
    let emptyTiles = [];
    for (let x = 0; x < this.tileCount; x++) {
      for (let y = 0; y < this.tileCount; y++) {
        const onSnake = this.snake.some(segment => segment.x === x && segment.y === y);
        const onFood = this.food.x === x && this.food.y === y;
        if (!onSnake && !onFood) {
          emptyTiles.push({ x, y });
        }
      }
    }

    if (emptyTiles.length > 0) {
      const idx = Math.floor(Math.random() * emptyTiles.length);
      const duration = 7000; // 7 seconds
      this.bonusFood = {
        x: emptyTiles[idx].x,
        y: emptyTiles[idx].y,
        duration: duration,
        expiresAt: performance.now() + duration
      };
    }
  }

  createBurst(x, y, color) {
    const pixelX = x * this.gridSize + this.gridSize / 2;
    const pixelY = y * this.gridSize + this.gridSize / 2;
    for (let i = 0; i < 14; i++) {
      this.particles.push(new Particle(pixelX, pixelY, color));
    }
  }

  tick() {
    if (this.state !== 'PLAYING') return;

    // Apply next queued direction
    if (this.inputQueue.length > 0) {
      this.direction = this.inputQueue.shift();
    }

    // New head position
    const head = {
      x: this.snake[0].x + this.direction.x,
      y: this.snake[0].y + this.direction.y
    };

    // Wall Collision Check
    if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
      this.gameOver();
      return;
    }

    // Self Collision Check
    for (let i = 0; i < this.snake.length; i++) {
      if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
        this.gameOver();
        return;
      }
    }

    this.snake.unshift(head);

    // Food Consumption
    let ateFood = false;
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      this.foodsEaten += 1;
      this.sound.playEat();
      this.createBurst(head.x, head.y, '#39ff14');
      this.spawnFood();
      ateFood = true;

      // Speed up slightly every 3 foods, minimum 65ms
      if (this.foodsEaten % 3 === 0 && this.currentSpeed > 65) {
        this.currentSpeed -= 6;
      }

      // Bonus food every 5 foods
      if (this.foodsEaten % 5 === 0 && !this.bonusFood) {
        this.spawnBonusFood();
      }
    }

    // Bonus Food Consumption
    if (this.bonusFood && head.x === this.bonusFood.x && head.y === this.bonusFood.y) {
      this.score += 50;
      this.sound.playBonus();
      this.createBurst(head.x, head.y, '#ffd700');
      this.bonusFood = null;
    }

    // If no food was eaten this tick, pop tail
    if (!ateFood) {
      this.snake.pop();
    }

    this.updateHUD();
  }

  updateHUD() {
    this.scoreDisplay.textContent = this.score.toString().padStart(4, '0');
    this.highScoreDisplay.textContent = this.highScore.toString().padStart(4, '0');

    const level = Math.floor((this.baseSpeed - this.currentSpeed) / 6) + 1;
    this.speedDisplay.textContent = `LVL ${level}`;
  }

  draw() {
    const ctx = this.ctx;
    const now = performance.now();

    // Clear Canvas
    ctx.fillStyle = '#060a0f';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Subtle Grid Lines
    ctx.strokeStyle = '#0d1620';
    ctx.lineWidth = 1;
    for (let i = 0; i <= this.canvas.width; i += this.gridSize) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, this.canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(this.canvas.width, i);
      ctx.stroke();
    }

    // Draw Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.update();
      p.draw(ctx);
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Check Bonus Food Expiration
    if (this.bonusFood) {
      const remaining = this.bonusFood.expiresAt - now;
      if (remaining <= 0) {
        this.bonusFood = null;
      } else {
        // Draw Bonus Food (Glowing Gold Star / Apple with timer ring)
        const bx = this.bonusFood.x * this.gridSize;
        const by = this.bonusFood.y * this.gridSize;
        const radius = this.gridSize / 2;

        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ffd700';
        ctx.fillStyle = '#ffd700';

        // Outer timer arc
        const progress = remaining / this.bonusFood.duration;
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bx + radius, by + radius, radius - 2, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
        ctx.stroke();

        // Inner glowing star/core
        ctx.beginPath();
        ctx.arc(bx + radius, by + radius, radius - 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Draw Regular Food (Glowing Neon Apple/Dot with breathing effect)
    const fx = this.food.x * this.gridSize;
    const fy = this.food.y * this.gridSize;
    const pulse = Math.sin(now / 150) * 1.5;

    ctx.save();
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#39ff14';
    ctx.fillStyle = '#ff3366'; // Retro red apple with neon glow
    ctx.beginPath();
    ctx.arc(
      fx + this.gridSize / 2,
      fy + this.gridSize / 2,
      (this.gridSize / 2 - 3) + pulse,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();

    // Draw Snake
    for (let i = 0; i < this.snake.length; i++) {
      const segment = this.snake[i];
      const sx = segment.x * this.gridSize;
      const sy = segment.y * this.gridSize;

      ctx.save();
      if (i === 0) {
        // Head
        ctx.fillStyle = '#45ff6b';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#39ff14';
        ctx.fillRect(sx + 1, sy + 1, this.gridSize - 2, this.gridSize - 2);

        // Eyes
        ctx.fillStyle = '#060a0f';
        const eyeOffset = 5;
        const eyeSize = 3;
        let eye1 = { x: sx + eyeOffset, y: sy + eyeOffset };
        let eye2 = { x: sx + this.gridSize - eyeOffset - eyeSize, y: sy + eyeOffset };

        if (this.direction.x === 1) { // moving right
          eye1 = { x: sx + this.gridSize - 5, y: sy + 4 };
          eye2 = { x: sx + this.gridSize - 5, y: sy + this.gridSize - 7 };
        } else if (this.direction.x === -1) { // moving left
          eye1 = { x: sx + 3, y: sy + 4 };
          eye2 = { x: sx + 3, y: sy + this.gridSize - 7 };
        } else if (this.direction.y === 1) { // moving down
          eye1 = { x: sx + 4, y: sy + this.gridSize - 5 };
          eye2 = { x: sx + this.gridSize - 7, y: sy + this.gridSize - 5 };
        } else if (this.direction.y === -1) { // moving up
          eye1 = { x: sx + 4, y: sy + 3 };
          eye2 = { x: sx + this.gridSize - 7, y: sy + 3 };
        }

        ctx.fillRect(eye1.x, eye1.y, eyeSize, eyeSize);
        ctx.fillRect(eye2.x, eye2.y, eyeSize, eyeSize);
      } else {
        // Body segment with trailing gradient fade
        const alpha = Math.max(0.35, 1 - (i / this.snake.length) * 0.6);
        ctx.fillStyle = `rgba(57, 255, 20, ${alpha})`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#39ff14';
        ctx.fillRect(sx + 2, sy + 2, this.gridSize - 4, this.gridSize - 4);
      }
      ctx.restore();
    }
  }

  loop(timestamp) {
    if (this.state === 'PLAYING') {
      const delta = timestamp - this.lastTickTime;
      if (delta >= this.currentSpeed) {
        this.tick();
        this.lastTickTime = timestamp;
      }
    }

    this.draw();
    this.animFrameId = requestAnimationFrame(this.loop);
  }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  window.snakeGame = new SnakeGame();
});
