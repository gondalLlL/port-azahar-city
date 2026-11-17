// Shot Staging Handler

import { MISSIONS } from './config.js';

export function setupShot(state, query) {
  const params = new URLSearchParams(query);
  const shot = params.get('shot');

  if (!shot) return;

  if (shot === 'title') {
    state.mode = 'title';
  } else if (shot === 'drive') {
    state.mode = 'playing';
    state.player.x = 4000;
    state.player.y = 3000;
    state.player.inCar = true;
    state.player.speed = 5.0;
    state.wantedLevel = 0;
    state.currentMissionObj = MISSIONS[0];
  } else if (shot === 'chase') {
    state.mode = 'playing';
    state.player.x = 2500;
    state.player.y = 2500;
    state.player.inCar = true;
    state.player.speed = 6.0;
    state.wantedLevel = 3;
    state.police = [
      { x: 2400, y: 2600, angle: 0, speed: 6.5 },
      { x: 2600, y: 2500, angle: Math.PI / 2, speed: 6.0 },
      { x: 2500, y: 2400, angle: Math.PI, speed: 6.2 }
    ];
    state.currentMissionObj = MISSIONS[2];
  } else if (shot === 'night') {
    state.mode = 'playing';
    state.player.x = 4500;
    state.player.y = 2500;
    state.player.inCar = false;
    state.wantedLevel = 0;
    state.currentMissionObj = MISSIONS[1];
  }

  // Signal shot ready after a brief render delay
  setTimeout(() => {
    window.__shotReady = true;
  }, 300);
}
