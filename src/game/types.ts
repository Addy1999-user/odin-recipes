export type UpgradeId = 'finger' | 'crew' | 'factory';

export interface UpgradeDef {
  id: UpgradeId;
  name: string;
  baseCost: number;
  costGrowth: number;
  tapBonus: number;
  autoBonus: number;
  desc: string;
}

export interface Quest {
  id: string;
  label: string;
  target: number;
  progress: number;
  reward: number;
  completed: boolean;
}

export interface GameState {
  coins: number;
  lifetimeCoins: number;
  tapPower: number;
  autoPerSec: number;
  prestige: number;
  chestProgress: number;
  chestReady: boolean;
  lastSavedAt: number;
  lastDailyClaim: string | null;
  soundOn: boolean;
  cosmeticsOwned: string[];
  upgrades: Record<UpgradeId, number>;
  quests: Quest[];
}
