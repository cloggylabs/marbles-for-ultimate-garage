const TOTAL_MARBLES = 200;
const STORAGE_KEY = 'canicasUltimateGarage';

const marbleColors = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#FFE66D', // Yellow
  '#6B5B95', // Purple
  '#88D8B0', // Mint
  '#FF8C94', // Pink
  '#5DADE2', // Sky blue
  '#F7DC6F', // Gold
  '#82E0AA', // Green
  '#BB8FCE', // Lavender
  '#F1948A', // Coral
  '#85C1E9', // Light blue
];

let marbleCount = parseInt(localStorage.getItem(STORAGE_KEY)) || 0;

const countDisplay = document.getElementById('count');
const marblesContainer = document.getElementById('marbles');
const progressFill = document.getElementById('progress');
const addBtn = document.getElementById('addBtn');
const removeBtn = document.getElementById('removeBtn');
const resetBtn = document.getElementById('resetBtn');
const celebration = document.getElementById('celebration');
const confettiOverlay = document.getElementById('confettiOverlay');
const qtyButtons = document.querySelectorAll('.qty-btn');

let selectedQty = 1;

function getRandomColor() {
  return marbleColors[Math.floor(Math.random() * marbleColors.length)];
}

function createMarble(animate = true) {
  const marble = document.createElement('div');
  marble.className = 'marble';
  const color = getRandomColor();
  marble.style.background = `radial-gradient(circle at 35% 35%, ${lightenColor(color, 30)}, ${color}, ${darkenColor(color, 30)})`;
  if (!animate) {
    marble.style.animation = 'none';
  }
  return marble;
}

function lightenColor(color, percent) {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
}

function darkenColor(color, percent) {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = (num >> 8 & 0x00FF) - amt;
  const B = (num & 0x0000FF) - amt;
  return '#' + (
    0x1000000 +
    (R > 0 ? R : 0) * 0x10000 +
    (G > 0 ? G : 0) * 0x100 +
    (B > 0 ? B : 0)
  ).toString(16).slice(1);
}

function updateDisplay() {
  countDisplay.textContent = marbleCount;
  progressFill.style.width = `${(marbleCount / TOTAL_MARBLES) * 100}%`;
  addBtn.disabled = marbleCount >= TOTAL_MARBLES;
  removeBtn.disabled = marbleCount <= 0;
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, marbleCount.toString());
}

function loadMarbles() {
  marblesContainer.innerHTML = '';
  for (let i = 0; i < marbleCount; i++) {
    marblesContainer.appendChild(createMarble(false));
  }
  updateDisplay();
}

function createConfetti() {
  confettiOverlay.innerHTML = '';
  confettiOverlay.classList.add('show');

  const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#6B5B95', '#88D8B0', '#FF8C94'];
  const shapes = ['circle', 'square', 'triangle'];

  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = Math.random() * 2 + 's';
    confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';

    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    if (shape === 'circle') {
      confetti.style.borderRadius = '50%';
    } else if (shape === 'triangle') {
      confetti.style.width = '0';
      confetti.style.height = '0';
      confetti.style.background = 'transparent';
      confetti.style.borderLeft = '5px solid transparent';
      confetti.style.borderRight = '5px solid transparent';
      confetti.style.borderBottom = '10px solid ' + colors[Math.floor(Math.random() * colors.length)];
    }

    confettiOverlay.appendChild(confetti);
  }

  setTimeout(() => {
    confettiOverlay.classList.remove('show');
  }, 5000);
}

function addMarbles() {
  if (marbleCount >= TOTAL_MARBLES) return;

  const toAdd = Math.min(selectedQty, TOTAL_MARBLES - marbleCount);

  for (let i = 0; i < toAdd; i++) {
    marbleCount++;
    const marble = createMarble(true);
    marble.style.animationDelay = `${i * 0.1}s`;
    marblesContainer.appendChild(marble);
  }

  updateDisplay();
  saveProgress();
  playPopSound();

  if (marbleCount === TOTAL_MARBLES) {
    setTimeout(() => {
      celebration.classList.add('show');
      createConfetti();
      playVictorySound();
    }, 700);
  }
}

function removeMarbles() {
  if (marbleCount <= 0) return;

  const toRemove = Math.min(selectedQty, marbleCount);

  for (let i = 0; i < toRemove; i++) {
    if (marblesContainer.lastChild) {
      marblesContainer.removeChild(marblesContainer.lastChild);
      marbleCount--;
    }
  }

  updateDisplay();
  saveProgress();
}

function resetJar() {
  if (confirm('¿Estás seguro que quieres vaciar el frasco? 🤔')) {
    marbleCount = 0;
    marblesContainer.innerHTML = '';
    updateDisplay();
    saveProgress();
    celebration.classList.remove('show');
    confettiOverlay.classList.remove('show');
  }
}

function closeCelebration() {
  celebration.classList.remove('show');
}

// Simple sound effects using Web Audio API
function playPopSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (e) {
    // Audio not supported, silently fail
  }
}

function playVictorySound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.15);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + i * 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.15 + 0.3);

      oscillator.start(audioContext.currentTime + i * 0.15);
      oscillator.stop(audioContext.currentTime + i * 0.15 + 0.3);
    });
  } catch (e) {
    // Audio not supported, silently fail
  }
}

// Event listeners
addBtn.addEventListener('click', addMarbles);
removeBtn.addEventListener('click', removeMarbles);
resetBtn.addEventListener('click', resetJar);

qtyButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    qtyButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedQty = parseInt(btn.dataset.qty);
  });
});

// Make closeCelebration available globally for onclick
window.closeCelebration = closeCelebration;

// Load saved progress on page load
loadMarbles();
