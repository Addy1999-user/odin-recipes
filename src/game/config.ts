import type { UpgradeDef } from './types';

export const TICK_MS = 100;
export const OFFLINE_CAP_SECONDS = 60 * 60 * 8;
export const CHEST_COINS_THRESHOLD = 500;
export const PRESTIGE_MULTIPLIER = 0.1;

export const UPGRADES: UpgradeDef[] = [
  { id: 'finger', name: 'Turbo Finger', baseCost: 15, costGrowth: 1.18, tapBonus: 1, autoBonus: 0, desc: '+1 tap power' },
  { id: 'crew', name: 'Tap Crew', baseCost: 60, costGrowth: 1.22, tapBonus: 0, autoBonus: 1, desc: '+1 coins/sec' },
  { id: 'factory', name: 'Coin Factory', baseCost: 250, costGrowth: 1.26, tapBonus: 1, autoBonus: 3, desc: '+1 tap, +3/sec' }
];
