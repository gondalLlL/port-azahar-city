// Procedural World & City Generation

import { MAP_SIZE, BLOCK_SIZE, ROAD_WIDTH, WORLD_WIDTH, WORLD_HEIGHT, DISTRICTS, CAR_MODELS } from './config.js';
import { random, randomRange, randomInt, randomChoice } from './random.js';

export function generateWorld() {
  const blocks = [];
  const traffic = [];
  const pedestrians = [];
  const parkedCars = [];

  // Generate 40x40 blocks
  for (let bx = 0; bx < MAP_SIZE; bx++) {
    for (let by = 0; by < MAP_SIZE; by++) {
      const x = bx * BLOCK_SIZE + ROAD_WIDTH;
      const y = by * BLOCK_SIZE + ROAD_WIDTH;
      const width = BLOCK_SIZE - ROAD_WIDTH;
      const height = BLOCK_SIZE - ROAD_WIDTH;

      // Find district
      const district = DISTRICTS.find(d => bx >= d.minX && bx < d.maxX && by >= d.minY && by < d.maxY) || DISTRICTS[0];

      // Special features: parks, parking lots, beaches
      const isPark = (bx + by) % 11 === 0 && district.name !== 'Docks';
      const isParking = (bx * 3 + by * 7) % 13 === 0 && district.name !== 'The Hills';
      const isBeach = by >= MAP_SIZE - 2 && district.name === 'Marina';

      const buildingHeight = district.name === 'Neon Mile' ? randomInt(4, 10) : district.name === 'The Hills' ? randomInt(1, 3) : randomInt(2, 6);

      blocks.push({
        bx, by, x, y, width, height,
        district: district.name,
        color: district.color,
        roofColor: district.roofColor,
        accent: district.accent,
        height: buildingHeight,
        isPark,
        isParking,
        isBeach,
        hasHelipad: bx === 25 && by === 15, // Helipad on one tower in Neon Mile
        lights: random() > 0.3
      });

      // Add parked cars in parking lots
      if (isParking && width > 100 && height > 100) {
        const model = randomChoice(CAR_MODELS);
        parkedCars.push({
          x: x + width / 2,
          y: y + height / 2,
          width: model.width,
          height: model.height,
          angle: randomChoice([0, Math.PI / 2, Math.PI, Math.PI * 1.5]),
          color: model.color
        });
      }
    }
  }

  // Generate initial traffic cars on roads
  for (let i = 0; i < 45; i++) {
    const isHorizontal = random() > 0.5;
    const model = randomChoice(CAR_MODELS);
    traffic.push({
      x: randomRange(ROAD_WIDTH, WORLD_WIDTH - ROAD_WIDTH),
      y: randomRange(ROAD_WIDTH, WORLD_HEIGHT - ROAD_WIDTH),
      vx: isHorizontal ? (random() > 0.5 ? 2 : -2) : 0,
      vy: isHorizontal ? 0 : (random() > 0.5 ? 2 : -2),
      speed: randomRange(2, 4),
      width: model.width,
      height: model.height,
      angle: isHorizontal ? (random() > 0.5 ? 0 : Math.PI) : (random() > 0.5 ? Math.PI / 2 : Math.PI * 1.5),
      color: model.color,
      model: model.name,
      steerTimer: 0
    });
  }

  // Generate pedestrians on sidewalks
  for (let i = 0; i < 60; i++) {
    pedestrians.push({
      x: randomRange(ROAD_WIDTH, WORLD_WIDTH - ROAD_WIDTH),
      y: randomRange(ROAD_WIDTH, WORLD_HEIGHT - ROAD_WIDTH),
      vx: randomRange(-0.8, 0.8),
      vy: randomRange(-0.8, 0.8),
      color: randomChoice(['#ef4444', '#38bdf8', '#facc15', '#4ade80', '#c084fc', '#f472b6']),
      state: 'walk',
      timer: randomInt(60, 180)
    });
  }

  return { blocks, traffic, pedestrians, parkedCars };
}
