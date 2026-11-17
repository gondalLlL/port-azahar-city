// Port Azahar - Main Game Entry

import { setSeed } from './random.js';
import { initInput, isKeyPressed, getMouseState } from './input.js';
import { generateWorld } from './world.js';
import { renderGame } from './render.js';
import { setupShot } from './shots.js';
import { initAudio, playSound, toggleMute } from './audio.js';
import { MISSIONS, WORLD_WIDTH, WORLD_HEIGHT } from './config.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

initInput(canvas);

// Parse URL seed
const urlParams = new URLSearchParams(window.location.search);
const seed = Number(urlParams.get('seed')) || 1;
setSeed(seed);

const world = generateWorld();

const state = {
  mode: 'title', // title, playing, pause, mission_complete, mission_fail, busted, wasted, ending
  world,
  player: {
    x: 3000,
    y: 3000,
    angle: 0,
    speed: 0,
    health: 100,
    armor: 100,
    cash: 500,
    inCar: false,
    carColor: '#38bdf8',
    carWidth: 34,
    carHeight: 64,
    weapon: 'pistol'
  },
  wantedLevel: 0,
  currentMissionIndex: 0,
  currentMissionObj: MISSIONS[0],
  police: [],
  particles: []
};

// Check for shot staging
setupShot(state, window.location.search);

// Load saved game if exists
try {
  const saved = localStorage.getItem('port_azahar_save');
  if (saved) {
    const data = JSON.parse(saved);
    state.player.cash = data.cash || 500;
    state.currentMissionIndex = data.missionIndex || 0;
    state.currentMissionObj = MISSIONS[state.currentMissionIndex] || MISSIONS[0];
  }
} catch (e) {}

function saveGame() {
  try {
    localStorage.setItem('port_azahar_save', JSON.stringify({
      cash: state.player.cash,
      missionIndex: state.currentMissionIndex
    }));
  } catch (e) {}
}

let lastTime = performance.now();

function gameLoop(now) {
  const dt = (now - lastTime) / 1000;
  lastTime = now;

  update(dt);
  render();

  requestAnimationFrame(gameLoop);
}

function update(dt) {
  const mouse = getMouseState();

  if (state.mode === 'title') {
    if (mouse.clicked || isKeyPressed('Enter') || isKeyPressed(' ')) {
      playSound('ui');
      state.mode = 'playing';
    }
    return;
  }

  if (state.mode === 'pause') {
    if (isKeyPressed('Escape')) {
      state.mode = 'playing';
    }
    return;
  }

  if (['busted', 'wasted', 'mission_complete', 'ending'].includes(state.mode)) {
    if (mouse.clicked || isKeyPressed('Enter') || isKeyPressed(' ')) {
      playSound('ui');
      if (state.mode === 'mission_complete') {
        state.currentMissionIndex++;
        if (state.currentMissionIndex < MISSIONS.length) {
          state.currentMissionObj = MISSIONS[state.currentMissionIndex];
          state.mode = 'playing';
          saveGame();
        } else {
          state.mode = 'ending';
        }
      } else if (state.mode === 'ending') {
        state.mode = 'playing';
      } else {
        state.player.health = 100;
        state.mode = 'playing';
      }
    }
    return;
  }

  if (isKeyPressed('Escape')) {
    state.mode = 'pause';
    return;
  }

  if (isKeyPressed('KeyM')) {
    toggleMute();
  }

  const p = state.player;

  // Player movement & driving physics
  if (p.inCar) {
    if (isKeyPressed('KeyW') || isKeyPressed('ArrowUp')) {
      p.speed = Math.min(p.speed + 0.15, 8.0);
    } else if (isKeyPressed('KeyS') || isKeyPressed('ArrowDown')) {
      p.speed = Math.max(p.speed - 0.15, -3.0);
    } else {
      p.speed *= 0.95; // friction
    }

    if (isKeyPressed('KeyA') || isKeyPressed('ArrowLeft')) {
      p.angle -= 0.04 * (p.speed / 4);
    }
    if (isKeyPressed('KeyD') || isKeyPressed('ArrowRight')) {
      p.angle += 0.04 * (p.speed / 4);
    }

    p.x += Math.cos(p.angle) * p.speed;
    p.y += Math.sin(p.angle) * p.speed;

    // Exit car with E or F
    if (isKeyPressed('KeyE') || isKeyPressed('KeyF')) {
      p.inCar = false;
      p.x += 40; // step out
    }
  } else {
    let moveX = 0;
    let moveY = 0;
    const speed = isKeyPressed('ShiftLeft') ? 5.0 : 3.0;

    if (isKeyPressed('KeyW') || isKeyPressed('ArrowUp')) moveY -= 1;
    if (isKeyPressed('KeyS') || isKeyPressed('ArrowDown')) moveY += 1;
    if (isKeyPressed('KeyA') || isKeyPressed('ArrowLeft')) moveX -= 1;
    if (isKeyPressed('KeyD') || isKeyPressed('ArrowRight')) moveX += 1;

    if (moveX !== 0 || moveY !== 0) {
      const len = Math.hypot(moveX, moveY);
      p.x += (moveX / len) * speed;
      p.y += (moveY / len) * speed;
      p.angle = Math.atan2(moveY, moveX);
    }

    // Enter nearby car or shoot
    if (isKeyPressed('KeyE') || isKeyPressed('KeyF')) {
      // Check parked cars
      for (const car of state.world.parkedCars) {
        if (Math.hypot(car.x - p.x, car.y - p.y) < 50) {
          p.inCar = true;
          p.carColor = car.color;
          break;
        }
      }
    }

    if (mouse.clicked) {
      playSound('gunshot');
      state.particles.push({ x: p.x + Math.cos(p.angle) * 20, y: p.y + Math.sin(p.angle) * 20, size: 6, color: '#facc15', life: 10 });
      state.wantedLevel = Math.min(state.wantedLevel + 1, 5);
    }
  }

  // Clamp player within world bounds
  p.x = Math.max(50, Math.min(WORLD_WIDTH - 50, p.x));
  p.y = Math.max(50, Math.min(WORLD_HEIGHT - 50, p.y));

  // Update traffic
  for (const car of state.world.traffic) {
    car.x += car.vx * car.speed;
    car.y += car.vy * car.speed;
    if (car.x < 0 || car.x > WORLD_WIDTH) car.vx *= -1;
    if (car.y < 0 || car.y > WORLD_HEIGHT) car.vy *= -1;
  }

  // Update pedestrians
  for (const ped of state.world.pedestrians) {
    ped.x += ped.vx;
    ped.y += ped.vy;
    ped.timer--;
    if (ped.timer <= 0) {
      ped.vx = (Math.random() - 0.5) * 1.5;
      ped.vy = (Math.random() - 0.5) * 1.5;
      ped.timer = Math.random() * 120 + 60;
    }
  }

  // Update particles
  for (let i = state.particles.length - 1; i >= 0; i--) {
    state.particles[i].life--;
    if (state.particles[i].life <= 0) {
      state.particles.splice(i, 1);
    }
  }

  // Check mission target / dropoff completion
  if (state.currentMissionObj) {
    const m = state.currentMissionObj;
    if (m.target && Math.hypot(m.target.x - p.x, m.target.y - p.y) < 80) {
      playSound('sting');
      state.mode = 'mission_complete';
      state.player.cash += m.cashReward || 1000;
    } else if (m.dropoff && Math.hypot(m.dropoff.x - p.x, m.dropoff.y - p.y) < 80) {
      playSound('sting');
      state.mode = 'mission_complete';
      state.player.cash += m.cashReward || 1000;
    }
  }
}

function render() {
  const p = state.player;
  renderGame(ctx, canvas.width, canvas.height, state, p.x, p.y);
}

requestAnimationFrame(gameLoop);
