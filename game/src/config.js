// Port Azahar Configuration & Constants

export const MAP_SIZE = 40; // 40x40 city blocks
export const BLOCK_SIZE = 160; // pixels per block
export const ROAD_WIDTH = 50; // width of street between blocks
export const WORLD_WIDTH = MAP_SIZE * BLOCK_SIZE;
export const WORLD_HEIGHT = MAP_SIZE * BLOCK_SIZE;

export const DISTRICTS = [
  { name: 'The Hills', minX: 0, maxX: MAP_SIZE, minY: 0, maxY: 10, color: '#1a3a2a', roofColor: '#2b5c42', accent: '#4ade80' },
  { name: 'Old Town', minX: 0, maxX: 20, minY: 10, maxY: 25, color: '#3a261a', roofColor: '#5c3d2b', accent: '#fb923c' },
  { name: 'Neon Mile', minX: 20, maxX: MAP_SIZE, minY: 10, maxY: 25, color: '#1a1a3a', roofColor: '#2b2b5c', accent: '#38bdf8' },
  { name: 'Marina', minX: 0, maxX: 20, minY: 25, maxY: MAP_SIZE, color: '#1a2e3a', roofColor: '#2b495c', accent: '#22d3ee' },
  { name: 'Docks', minX: 20, maxX: MAP_SIZE, minY: 25, maxY: MAP_SIZE, color: '#262626', roofColor: '#3d3d3d', accent: '#facc15' }
];

export const CAR_MODELS = [
  { name: 'Sedan', width: 36, height: 68, speed: 4.5, accel: 0.1, handling: 0.08, color: '#e2e8f0' },
  { name: 'Sports Car', width: 34, height: 64, speed: 7.0, accel: 0.18, handling: 0.11, color: '#38bdf8' },
  { name: 'Muscle', width: 38, height: 72, speed: 6.0, accel: 0.14, handling: 0.07, color: '#ef4444' },
  { name: 'SUV', width: 42, height: 78, speed: 4.0, accel: 0.09, handling: 0.06, color: '#334155' },
  { name: 'Police Cruiser', width: 38, height: 70, speed: 6.5, accel: 0.16, handling: 0.10, color: '#1e293b' }
];

export const MISSIONS = [
  {
    id: 1,
    title: "First Run",
    fixer: "Marisol Kane",
    desc: "Pick up the package at the Docks warehouse and deliver it across town to Old Town before the timer runs out.",
    target: { x: 5500, y: 5500 }, // in world coordinates
    dropoff: { x: 1200, y: 2400 },
    timeLimit: 120, // seconds
    cashReward: 1500
  },
  {
    id: 2,
    title: "Borrowed Wheels",
    fixer: "Marisol Kane",
    desc: "Steal the marked azure sports car parked in Neon Mile and deliver it intact to the Marina garage.",
    target: { x: 4800, y: 2600 },
    dropoff: { x: 1600, y: 5200 },
    timeLimit: 150,
    cashReward: 3000
  },
  {
    id: 3,
    title: "Heat",
    fixer: "Marisol Kane",
    desc: "Things went sideways. Evade the cops and reach the safehouse in The Hills with a 3-star wanted level.",
    target: { x: 2400, y: 800 },
    timeLimit: 180,
    cashReward: 5000,
    requiredWanted: 3
  },
  {
    id: 4,
    title: "Three Drops",
    fixer: "Marisol Kane",
    desc: "Collect 3 cash drop boxes around the city while police pressure rises.",
    drops: [
      { x: 2000, y: 2000, collected: false },
      { x: 4000, y: 3500, collected: false },
      { x: 3000, y: 5500, collected: false }
    ],
    timeLimit: 200,
    cashReward: 7500
  },
  {
    id: 5,
    title: "Last Boat",
    fixer: "Marisol Kane",
    desc: "The city is hot. Drive full throttle to the Marina docks and board the escape boat to freedom.",
    target: { x: 1000, y: 5800 },
    timeLimit: 140,
    cashReward: 15000
  }
];
