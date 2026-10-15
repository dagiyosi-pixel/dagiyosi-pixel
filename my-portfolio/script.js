/* ==========================================================================
   0xDagi // S-RANK GAMIFIED ENGINE JAVASCRIPT
   ========================================================================== */

// --- 1. Sound FX Engine (Synthesized Web Audio API) ---
class GameAudio {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
  }

  playBlip(freq = 600, duration = 0.05) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  playChessMove() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {}
  }

  playVictory() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
          gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.25);
        }, idx * 100);
      });
    } catch (e) {}
  }

  playHakiThunder() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
    } catch (e) {}
  }
}

const sfx = new GameAudio();

// --- 2. Dynamic Aura & Lightning Canvas ---
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
let width, height;
let particles = [];
let lightningBolts = [];

function resizeCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class AuraParticle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 1.5;
    this.vy = -Math.random() * 1.2 - 0.3;
    this.size = Math.random() * 2.5 + 1;
    this.life = Math.random() * 100 + 60;
    this.maxLife = this.life;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
    if (this.life <= 0 || this.y < -10) {
      this.reset();
      this.y = height + 10;
    }
  }

  draw(aura) {
    const alpha = (this.life / this.maxLife) * 0.7;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);

    if (aura === 'gear5') {
      ctx.fillStyle = `rgba(245, 158, 11, ${alpha})`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#f59e0b';
    } else if (aura === 'scout') {
      ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#10b981';
    } else if (aura === 'chess') {
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#ffffff';
    } else {
      // Monarch
      ctx.fillStyle = `rgba(168, 85, 247, ${alpha})`;
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#8b5cf6';
    }

    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

for (let i = 0; i < 75; i++) {
  particles.push(new AuraParticle());
}

function triggerLightning() {
  const startX = Math.random() * width;
  let currX = startX;
  let currY = 0;
  const segments = [];

  while (currY < height) {
    const nextX = currX + (Math.random() - 0.5) * 60;
    const nextY = currY + Math.random() * 40 + 20;
    segments.push({ x1: currX, y1: currY, x2: nextX, y2: nextY });
    currX = nextX;
    currY = nextY;
  }

  lightningBolts.push({ segments, opacity: 1 });
}

function animateCanvas() {
  const currentAura = document.body.getAttribute('data-aura') || 'monarch';
  ctx.clearRect(0, 0, width, height);

  // Render particles
  particles.forEach((p) => {
    p.update();
    p.draw(currentAura);
  });

  // Render lightning
  for (let i = lightningBolts.length - 1; i >= 0; i--) {
    const bolt = lightningBolts[i];
    ctx.beginPath();
    bolt.segments.forEach((seg) => {
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
    });

    ctx.lineWidth = 2.5;
    if (currentAura === 'gear5') {
      ctx.strokeStyle = `rgba(239, 68, 68, ${bolt.opacity})`;
      ctx.shadowColor = '#ef4444';
    } else {
      ctx.strokeStyle = `rgba(192, 132, 252, ${bolt.opacity})`;
      ctx.shadowColor = '#a855f7';
    }
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.shadowBlur = 0;

    bolt.opacity -= 0.05;
    if (bolt.opacity <= 0) {
      lightningBolts.splice(i, 1);
    }
  }

  // Occasional random lightning
  if (Math.random() < 0.008) {
    triggerLightning();
  }

  requestAnimationFrame(animateCanvas);
}
animateCanvas();

// --- 3. Aura Switcher Buttons ---
const auraButtons = document.querySelectorAll('.aura-btn');
auraButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const aura = btn.getAttribute('data-aura');
    document.body.setAttribute('data-aura', aura);
    auraButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    sfx.playBlip(750, 0.08);
    triggerLightning();
  });
});

// Sound Toggle
const soundToggle = document.getElementById('soundToggle');
const soundIcon = document.getElementById('soundIcon');
soundToggle.addEventListener('click', () => {
  sfx.enabled = !sfx.enabled;
  soundIcon.textContent = sfx.enabled ? '🔊' : '🔇';
  if (sfx.enabled) sfx.playBlip(800, 0.06);
});

// Conqueror's Haki Blast Button
const hakiBtn = document.getElementById('hakiBlastBtn');
if (hakiBtn) {
  hakiBtn.addEventListener('click', () => {
    sfx.playHakiThunder();
    for (let i = 0; i < 4; i++) {
      setTimeout(triggerLightning, i * 80);
    }
    // Shake screen
    document.body.style.transform = 'translate(2px, -2px)';
    setTimeout(() => { document.body.style.transform = 'translate(-2px, 2px)'; }, 50);
    setTimeout(() => { document.body.style.transform = 'translate(0, 0)'; }, 100);
  });
}

// --- 4. PLAYABLE INTERACTIVE CHESS MINIGAME ---
// Tactical Puzzle: Scholar's Mate / Queen checkmate
// White: Queen on d1 (row 7, col 3), Bishop on c4 (row 4, col 2), King on e1 (row 7, col 4)
// Black: King on e8 (row 0, col 4), Bishop on c5 (row 3, col 2), Knight on c6 (row 2, col 2), Pawn on f7 (row 1, col 5)
// Checkmate move: White Queen moves to f7 (row 1, col 5) delivering CHECKMATE!

const initialBoard = [
  ['', '', '', '', '♚', '', '', ''], // 0
  ['♟', '♟', '♟', '♟', '', '♟', '♟', '♟'], // 1  (f7 is col 5)
  ['', '', '♞', '', '', '', '', ''], // 2
  ['', '', '♝', '', '', '', '', ''], // 3
  ['', '', '♗', '', '', '', '', ''], // 4
  ['', '', '', '', '', '', '', ''], // 5
  ['♙', '♙', '♙', '♙', '', '♙', '♙', '♙'], // 6
  ['♖', '', '', '♕', '♔', '', '♘', '♖']  // 7  (Queen is row 7, col 3)
];

let currentChess = JSON.parse(JSON.stringify(initialBoard));
let selectedSquare = null;
let puzzleSolved = false;

const boardEl = document.getElementById('chessBoard');
const msgEl = document.getElementById('chessMessage');
const statusPill = document.getElementById('chessTurnStatus');
const resetBtn = document.getElementById('resetChess');
const hintBtn = document.getElementById('hintChess');

function renderChess() {
  boardEl.innerHTML = '';
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const sq = document.createElement('div');
      const isLight = (r + c) % 2 === 0;
      sq.className = `chess-square ${isLight ? 'light' : 'dark'}`;
      sq.dataset.row = r;
      sq.dataset.col = c;
      sq.textContent = currentChess[r][c];

      if (selectedSquare && selectedSquare.r === r && selectedSquare.c === c) {
        sq.classList.add('selected');
      }

      if (selectedSquare && selectedSquare.r === 7 && selectedSquare.c === 3 && r === 1 && c === 5) {
        sq.classList.add('target-checkmate');
      }

      sq.addEventListener('click', () => handleSquareClick(r, c));
      boardEl.appendChild(sq);
    }
  }
}

function handleSquareClick(r, c) {
  if (puzzleSolved) return;

  const piece = currentChess[r][c];

  // If clicking on White Queen
  if (r === 7 && c === 3 && currentChess[r][c] === '♕') {
    selectedSquare = { r, c };
    sfx.playBlip(550, 0.04);
    msgEl.innerHTML = `<span style="color:#fbbf24;">♕ Queen Selected!</span> Now click on Black's pawn at <strong>f7</strong> to deliver Checkmate!`;
    renderChess();
    return;
  }

  // If Queen is selected and player clicks f7 (row 1, col 5)
  if (selectedSquare && selectedSquare.r === 7 && selectedSquare.c === 3) {
    if (r === 1 && c === 5) {
      // DELIVER CHECKMATE!
      currentChess[7][3] = '';
      currentChess[1][5] = '♕';
      puzzleSolved = true;
      selectedSquare = null;
      renderChess();

      sfx.playVictory();
      statusPill.textContent = 'CHECKMATE!';
      statusPill.style.background = '#ef4444';
      statusPill.style.color = '#fff';

      msgEl.innerHTML = `🏆 <strong style="color:#22c55e;">CHECKMATE! PUZZLE COMPLETED!</strong><br/>
      <span style="color:#c084fc;">[ +10,000 EXP GAINED // S-RANK HUNTER PASS GRANTED ]</span>`;
      return;
    } else {
      // Invalid move
      sfx.playBlip(200, 0.1);
      msgEl.textContent = "That move does not deliver checkmate! Queen must strike f7!";
      selectedSquare = null;
      renderChess();
      return;
    }
  }

  selectedSquare = null;
  renderChess();
}

resetBtn.addEventListener('click', () => {
  currentChess = JSON.parse(JSON.stringify(initialBoard));
  selectedSquare = null;
  puzzleSolved = false;
  statusPill.textContent = 'WHITE TO MOVE';
  statusPill.style.background = '#22c55e';
  statusPill.style.color = '#000';
  msgEl.textContent = "Click White Queen (♕ on d1) then click Black Pawn (f7) to deliver Checkmate!";
  sfx.playChessMove();
  renderChess();
});

hintBtn.addEventListener('click', () => {
  sfx.playBlip(700, 0.05);
  selectedSquare = { r: 7, c: 3 };
  msgEl.innerHTML = `💡 <strong>HINT:</strong> Queen on d1 can jump straight to <strong>f7</strong>. Bishop on c4 protects her!`;
  renderChess();
});

renderChess();

// --- 5. Terminal Console ---
const termOutput = document.getElementById('termOutput');
const termInput = document.getElementById('termInput');

const termCmds = {
  help: `COMMAND PROTOCOL:
  • quests   : List all 4 production projects
  • chess    : Read Grandmaster strategy
  • haki     : Unleash Conqueror's Haki shockwave
  • skills   : Inspect inventory stats
  • clear    : Reset console screen`,

  quests: `⚔️ PRODUCTION QUESTS (PROJECTS):
  1. ETHIOPIA // 360  -> https://ethiopia-360.vercel.app
  2. ETHIOPIA SQ3R   -> Grade 7/8 Active Recall EdTech
  3. AMT EXAM APP    -> Aviation Mechanics Timed Testing
  4. REVITCOPILOT    -> Precast BIM & Structural Engine`,

  chess: `♔ Chess Rule #1: In code, as in chess, never make a move without considering the opponent's counter.`,

  haki: () => {
    if (hakiBtn) hakiBtn.click();
    return "⚡ CONQUEROR'S HAKI SHOCKWAVE DISCHARGED!";
  },

  skills: `LVL 99 Code Monarch: Python, TypeScript, React, Next.js, Revit API, C#, Docker.`,

  clear: () => {
    termOutput.innerHTML = '';
    return '';
  }
};

termInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const cmd = termInput.value.trim().toLowerCase();
    termInput.value = '';
    if (!cmd) return;

    sfx.playBlip(650, 0.04);
    const p = document.createElement('p');
    p.innerHTML = `<span class="prompt-sym">0xDagi&gt;</span> ${cmd}`;
    termOutput.appendChild(p);

    let res = '';
    if (termCmds[cmd]) {
      res = typeof termCmds[cmd] === 'function' ? termCmds[cmd]() : termCmds[cmd];
    } else {
      res = `Directive not found: '${cmd}'. Type 'help' for available commands.`;
    }

    if (res) {
      const respP = document.createElement('p');
      respP.style.color = '#c084fc';
      respP.textContent = res;
      termOutput.appendChild(respP);
    }

    termOutput.scrollTop = termOutput.scrollHeight;
  }
});
