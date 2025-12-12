const MAX_LIVES = 5;
const LIFE_INTERVAL_MINUTES = 120;
const INTERVAL_MS = LIFE_INTERVAL_MINUTES * 60 * 1000;

export type LifeState = {
  lives: number;
  lastLifeUpdate?: number | null;
};

export type RegeneratedLifeState = {
  lives: number;
  lastLifeUpdate: number;
};

export const applyLifeRegeneration = (state: LifeState): RegeneratedLifeState => {
  const now = Date.now();
  const currentLives = Math.min(Math.max(state.lives ?? 0, 0), MAX_LIVES);
  const lastUpdate = typeof state.lastLifeUpdate === "number" ? state.lastLifeUpdate : now;

  if (currentLives >= MAX_LIVES) {
    return { lives: MAX_LIVES, lastLifeUpdate: now };
  }

  const elapsed = Math.max(0, now - lastUpdate);
  const gained = Math.floor(elapsed / INTERVAL_MS);
  const newLives = Math.min(MAX_LIVES, currentLives + gained);

  if (gained <= 0) {
    return { lives: currentLives, lastLifeUpdate: lastUpdate };
  }

  if (newLives >= MAX_LIVES) {
    return { lives: MAX_LIVES, lastLifeUpdate: now };
  }

  const remainder = elapsed % INTERVAL_MS;
  return {
    lives: newLives,
    lastLifeUpdate: now - remainder,
  };
};

export const startLifeCountdown = (): number => Date.now();

export const MAX_LIVES_VALUE = MAX_LIVES;
export const LIFE_INTERVAL_MINUTES_VALUE = LIFE_INTERVAL_MINUTES;
