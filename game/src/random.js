// Seeded PRNG (Mulberry32)

let currentSeed = 1;

export function setSeed(seed) {
  currentSeed = seed;
}

export function random() {
  let t = currentSeed += 0x6D2B79F5;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

export function randomRange(min, max) {
  return min + random() * (max - min);
}

export function randomInt(min, max) {
  return Math.floor(randomRange(min, max + 1));
}

export function randomChoice(arr) {
  return arr[randomInt(0, arr.length - 1)];
}
