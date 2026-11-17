// Canvas Renderer & Visual Effects

import { WORLD_WIDTH, WORLD_HEIGHT, ROAD_WIDTH, BLOCK_SIZE, MAP_SIZE } from './config.js';

export function renderGame(ctx, width, height, state, camX, camY) {
  ctx.clearRect(0, 0, width, height);

  ctx.save();
  // Camera translation
  ctx.translate(width / 2 - camX, height / 2 - camY);

  // 1. Draw Ground / Asphalt Roads & Sidewalks
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  // Draw grid roads
  ctx.fillStyle = '#0f172a';
  for (let x = 0; x <= WORLD_WIDTH; x += BLOCK_SIZE) {
    ctx.fillRect(x - ROAD_WIDTH / 2, 0, ROAD_WIDTH, WORLD_HEIGHT);
  }
  for (let y = 0; y <= WORLD_HEIGHT; y += BLOCK_SIZE) {
    ctx.fillRect(0, y - ROAD_WIDTH / 2, WORLD_WIDTH, ROAD_WIDTH);
  }

  // Draw dashed center lines & crosswalks
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 2;
  ctx.setLineDash([15, 15]);
  for (let x = BLOCK_SIZE; x < WORLD_WIDTH; x += BLOCK_SIZE) {
    ctx.beginPath();
    ctx.moveTo(x - ROAD_WIDTH / 2, 0);
    ctx.lineTo(x - ROAD_WIDTH / 2, WORLD_HEIGHT);
    ctx.stroke();
  }
  for (let y = BLOCK_SIZE; y < WORLD_HEIGHT; y += BLOCK_SIZE) {
    ctx.beginPath();
    ctx.moveTo(0, y - ROAD_WIDTH / 2);
    ctx.lineTo(WORLD_WIDTH, y - ROAD_WIDTH / 2);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // 2. Draw Blocks & Buildings
  if (state.world && state.world.blocks) {
    for (const b of state.world.blocks) {
      // Drop shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(b.x + 8, b.y + 8, b.width, b.height);

      if (b.isPark) {
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(b.x, b.y, b.width, b.height);
        // Park paths
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 6;
        ctx.strokeRect(b.x + 20, b.y + 20, b.width - 40, b.height - 40);
      } else if (b.isBeach) {
        ctx.fillStyle = '#fde047'; // sand
        ctx.fillRect(b.x, b.y, b.width, b.height);
      } else {
        // Building footprint
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.width, b.height);

        // Roof inset
        ctx.fillStyle = b.roofColor;
        ctx.fillRect(b.x + 10, b.y + 10, b.width - 20, b.height - 20);

        // Rooftop details (AC units / water towers)
        ctx.fillStyle = '#475569';
        ctx.fillRect(b.x + 25, b.y + 25, 16, 16);
        ctx.fillRect(b.x + b.width - 40, b.y + 25, 20, 20);

        if (b.hasHelipad) {
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(b.x + b.width / 2, b.y + b.height / 2, 25, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Lit windows at night / dusk
        if (b.lights) {
          ctx.fillStyle = '#fef08a';
          for (let wx = b.x + 20; wx < b.x + b.width - 20; wx += 20) {
            for (let wy = b.y + 20; wy < b.y + b.height - 20; wy += 20) {
              ctx.fillRect(wx, wy, 6, 8);
            }
          }
        }
      }
    }
  }

  // 3. Draw Water along south edge
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(0, WORLD_HEIGHT - 120, WORLD_WIDTH, 120);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(0, WORLD_HEIGHT - 120, WORLD_WIDTH, 10);

  // 4. Draw Parked Cars
  if (state.world && state.world.parkedCars) {
    for (const car of state.world.parkedCars) {
      drawCarBody(ctx, car.x, car.y, car.width, car.height, car.angle, car.color, false);
    }
  }

  // 5. Draw Traffic Cars
  if (state.world && state.world.traffic) {
    for (const car of state.world.traffic) {
      drawCarBody(ctx, car.x, car.y, car.width, car.height, car.angle, car.color, false);
    }
  }

  // 6. Draw Police Pursuits
  if (state.police) {
    for (const cop of state.police) {
      const flashing = Math.floor(Date.now() / 150) % 2 === 0;
      drawCarBody(ctx, cop.x, cop.y, 38, 70, cop.angle, '#1e293b', true, flashing);
    }
  }

  // 7. Draw Pedestrians
  if (state.world && state.world.pedestrians) {
    for (const ped of state.world.pedestrians) {
      ctx.fillStyle = ped.color;
      ctx.beginPath();
      ctx.arc(ped.x, ped.y, 7, 0, Math.PI * 2);
      ctx.fill();
      // head
      ctx.fillStyle = '#fcd34d';
      ctx.beginPath();
      ctx.arc(ped.x, ped.y - 4, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 8. Draw Mission Targets & Dropoffs
  if (state.currentMissionObj) {
    const m = state.currentMissionObj;
    if (m.target) {
      drawPillar(ctx, m.target.x, m.target.y, '#38bdf8');
    }
    if (m.dropoff) {
      drawPillar(ctx, m.dropoff.x, m.dropoff.y, '#4ade80');
    }
    if (m.drops) {
      for (const drop of m.drops) {
        if (!drop.collected) {
          drawPillar(ctx, drop.x, drop.y, '#facc15');
        }
      }
    }
  }

  // 9. Draw Player (on foot or in car)
  const p = state.player;
  if (p.inCar) {
    drawCarBody(ctx, p.x, p.y, p.carWidth, p.carHeight, p.angle, p.carColor, false, false, true);
  } else {
    // On foot player
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
    ctx.fill();
    // Head
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.arc(p.x, p.y - 5, 5, 0, Math.PI * 2);
    ctx.fill();
    // Gun or punch indicator
    if (p.weapon === 'pistol') {
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + Math.cos(p.angle) * 16, p.y + Math.sin(p.angle) * 16);
      ctx.stroke();
    }
  }

  // 10. Draw Muzzle Flashes & Particles
  if (state.particles) {
    for (const part of state.particles) {
      ctx.fillStyle = part.color || '#facc15';
      ctx.beginPath();
      ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();

  // --- HUD & UI Overlays (Screen space) ---
  renderHUD(ctx, width, height, state);
}

function drawCarBody(ctx, x, y, w, h, angle, color, isCop = false, flashing = false, isPlayer = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(-w/2 + 2, -h/2 + 4, w, h);

  // Body
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(-w/2, -h/2, w, h, 8);
  ctx.fill();

  // Windshield & Roof
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-w/2 + 4, -h/4, w - 8, h/2);

  // Headlights
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(-w/2 + 2, -h/2, 6, 4);
  ctx.fillRect(w/2 - 8, -h/2, 6, 4);

  if (isCop) {
    // Siren light bar
    ctx.fillStyle = flashing ? '#ef4444' : '#38bdf8';
    ctx.fillRect(-6, -4, 12, 8);
  }

  if (isPlayer) {
    // Player indicator ring
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(w, h)/1.2, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawPillar(ctx, x, y, color) {
  const time = Date.now() / 300;
  const radius = 30 + Math.sin(time) * 5;

  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Vertical light pillar
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.arc(x, y, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1.0;
}

function renderHUD(ctx, width, height, state) {
  if (state.mode === 'title') {
    renderTitleScreen(ctx, width, height);
    return;
  }
  if (state.mode === 'pause') {
    renderPauseScreen(ctx, width, height);
    return;
  }
  if (state.mode === 'busted') {
    renderOverlayMessage(ctx, width, height, "BUSTED", "Busted by the Port Azahar Police Department", "#ef4444");
    return;
  }
  if (state.mode === 'wasted') {
    renderOverlayMessage(ctx, width, height, "WASTED", "Hospital bill paid. Back on the streets.", "#ef4444");
    return;
  }
  if (state.mode === 'mission_complete') {
    renderOverlayMessage(ctx, width, height, "MISSION COMPLETE", state.missionTitle + " Passed! Reward collected.", "#4ade80");
    return;
  }
  if (state.mode === 'ending') {
    renderOverlayMessage(ctx, width, height, "THE END - PORT AZAHAR CONQUERED", "You escaped Marisol Kane's web and sailed into the sunset. Free roam unlocked!", "#38bdf8");
    return;
  }

  // Standard Playing HUD
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.fillRect(20, 20, 280, 110);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, 280, 110);

  // Health bar
  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px system-ui';
  ctx.fillText('HEALTH', 35, 45);
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(95, 33, 180, 12);
  ctx.fillStyle = '#4ade80';
  ctx.fillRect(95, 33, 180 * (state.player.health / 100), 12);

  // Cash
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 20px system-ui';
  ctx.fillText(`$${state.player.cash.toLocaleString()}`, 35, 80);

  // Wanted Stars
  ctx.fillStyle = '#facc15';
  ctx.font = '18px system-ui';
  let stars = '';
  for (let i = 0; i < 5; i++) {
    stars += i < state.wantedLevel ? '★ ' : '☆ ';
  }
  ctx.fillText(stars, 35, 115);

  // Minimap (top right)
  const mapSize = 160;
  const mapX = width - mapSize - 20;
  const mapY = 20;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(mapX, mapY, mapSize, mapSize);
  ctx.strokeStyle = '#334155';
  ctx.strokeRect(mapX, mapY, mapSize, mapSize);

  // Player blip on minimap
  const blipX = mapX + (state.player.x / WORLD_WIDTH) * mapSize;
  const blipY = mapY + (state.player.y / WORLD_HEIGHT) * mapSize;
  ctx.fillStyle = '#4ade80';
  ctx.beginPath();
  ctx.arc(blipX, blipY, 4, 0, Math.PI * 2);
  ctx.fill();

  // Mission Objective Banner (top center)
  if (state.currentMissionObj) {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(width / 2 - 220, 20, 440, 50);
    ctx.strokeStyle = '#38bdf8';
    ctx.strokeRect(width / 2 - 220, 20, 440, 50);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`MISSION: ${state.currentMissionObj.title.toUpperCase()}`, width / 2, 40);
    ctx.font = '12px system-ui';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(state.currentMissionObj.desc, width / 2, 58);
    ctx.textAlign = 'left';
  }

  // Speedometer if in car
  if (state.player.inCar) {
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 24px system-ui';
    ctx.fillText(`${Math.round(state.player.speed * 20)} MPH`, width - 180, height - 40);
  }
}

function renderTitleScreen(ctx, width, height) {
  ctx.fillStyle = '#0b0e14';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 56px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('PORT AZAHAR', width / 2, height / 2 - 120);

  ctx.fillStyle = '#f8fafc';
  ctx.font = '22px system-ui';
  ctx.fillText('Grand Auto Crime: The Driver Story', width / 2, height / 2 - 70);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '16px system-ui';
  ctx.fillText('Controls: WASD / Arrows to Move/Drive | E/F to Enter/Car | Space to Handbrake | Click to Shoot/Punch | M to Mute', width / 2, height / 2 - 10);

  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(width / 2 - 120, height / 2 + 40, 240, 50);
  ctx.fillStyle = '#0b0e14';
  ctx.font = 'bold 18px system-ui';
  ctx.fillText('START GAME', width / 2, height / 2 + 72);

  ctx.textAlign = 'left';
}

function renderPauseScreen(ctx, width, height) {
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 40px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('PAUSED', width / 2, height / 2 - 40);

  ctx.font = '18px system-ui';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('Press ESC to Resume', width / 2, height / 2 + 20);
  ctx.textAlign = 'left';
}

function renderOverlayMessage(ctx, width, height, title, subtitle, color) {
  ctx.fillStyle = 'rgba(0,0,0,0.85)';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = color;
  ctx.font = 'bold 48px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText(title, width / 2, height / 2 - 30);

  ctx.fillStyle = '#f8fafc';
  ctx.font = '20px system-ui';
  ctx.fillText(subtitle, width / 2, height / 2 + 20);

  ctx.font = '16px system-ui';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('Press ENTER or Click to Continue', width / 2, height / 2 + 80);
  ctx.textAlign = 'left';
}
