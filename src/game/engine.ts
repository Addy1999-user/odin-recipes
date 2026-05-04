import { CHEST_COINS_THRESHOLD, OFFLINE_CAP_SECONDS, PRESTIGE_MULTIPLIER, UPGRADES } from './config';
import type { GameState, Quest, UpgradeDef, UpgradeId } from './types';

const createQuests = (): Quest[] => [
  { id: 'tap-25', label: 'Earn 25 coins', target: 25, progress: 0, reward: 20, completed: false },
  { id: 'tap-200', label: 'Earn 200 coins', target: 200, progress: 0, reward: 100, completed: false },
  { id: 'auto-20', label: 'Reach 20 coins/sec', target: 20, progress: 0, reward: 250, completed: false }
];

export const createInitialState = (): GameState => ({
  coins: 0,
  lifetimeCoins: 0,
  tapPower: 1,
  autoPerSec: 0,
  prestige: 0,
  chestProgress: 0,
  chestReady: false,
  lastSavedAt: Date.now(),
  lastDailyClaim: null,
  soundOn: true,
  cosmeticsOwned: [],
  upgrades: { finger: 0, crew: 0, factory: 0 },
  quests: createQuests()
});

export const computeUpgradeCost = (upgrade: UpgradeDef, level: number): number =>
  Math.floor(upgrade.baseCost * Math.pow(upgrade.costGrowth, level));

const totalMultiplier = (state: GameState): number => 1 + state.prestige * PRESTIGE_MULTIPLIER;

export const gainCoins = (state: GameState, baseAmount: number): GameState => {
  const amount = baseAmount * totalMultiplier(state);
  const next = { ...state, coins: state.coins + amount, lifetimeCoins: state.lifetimeCoins + amount, chestProgress: state.chestProgress + amount };
  if (next.chestProgress >= CHEST_COINS_THRESHOLD) next.chestReady = true;
  return updateQuests(next);
};

export const tap = (state: GameState): GameState => gainCoins(state, state.tapPower);

export const tickAuto = (state: GameState, seconds: number): GameState => gainCoins(state, state.autoPerSec * seconds);

export const buyUpgrade = (state: GameState, id: UpgradeId): GameState => {
  const def = UPGRADES.find((u) => u.id === id);
  if (!def) return state;
  const level = state.upgrades[id];
  const cost = computeUpgradeCost(def, level);
  if (state.coins < cost) return state;

  return {
    ...state,
    coins: state.coins - cost,
    tapPower: state.tapPower + def.tapBonus,
    autoPerSec: state.autoPerSec + def.autoBonus,
    upgrades: { ...state.upgrades, [id]: level + 1 }
  };
};

export const openChest = (state: GameState): GameState => {
  if (!state.chestReady) return state;
  const reward = 120 + Math.floor(state.prestige * 20);
  return gainCoins({ ...state, chestReady: false, chestProgress: 0 }, reward);
};

export const applyOfflineProgress = (state: GameState, now = Date.now()): { state: GameState; gained: number } => {
  const elapsed = Math.max(0, Math.floor((now - state.lastSavedAt) / 1000));
  const seconds = Math.min(elapsed, OFFLINE_CAP_SECONDS);
  const gained = seconds * state.autoPerSec * totalMultiplier(state);
  const next = gainCoins({ ...state, lastSavedAt: now }, state.autoPerSec * seconds);
  return { state: next, gained };
};

export const canClaimDailyReward = (state: GameState, now = new Date()): boolean => {
  const key = now.toISOString().slice(0, 10);
  return state.lastDailyClaim !== key;
};

export const claimDailyReward = (state: GameState, now = new Date()): GameState => {
  if (!canClaimDailyReward(state, now)) return state;
  const streakBonus = 50 + state.prestige * 10;
  return gainCoins({ ...state, lastDailyClaim: now.toISOString().slice(0, 10) }, streakBonus);
};

export const prestigeReset = (state: GameState): GameState => {
  const gainedPrestige = Math.floor(state.lifetimeCoins / 5000);
  if (gainedPrestige < 1) return state;
  return { ...createInitialState(), prestige: state.prestige + gainedPrestige, soundOn: state.soundOn, cosmeticsOwned: state.cosmeticsOwned };
};

export const updateQuests = (state: GameState): GameState => {
  const quests = state.quests.map((q) => {
    let progress = q.progress;
    if (q.id.startsWith('tap-')) progress = Math.min(q.target, state.lifetimeCoins);
    if (q.id === 'auto-20') progress = Math.min(q.target, state.autoPerSec);
    return { ...q, progress, completed: progress >= q.target };
  });
  return { ...state, quests };
};

export const claimQuest = (state: GameState, questId: string): GameState => {
  const q = state.quests.find((quest) => quest.id === questId);
  if (!q || !q.completed || q.reward <= 0) return state;
  const next = gainCoins(state, q.reward);
  return { ...next, quests: next.quests.map((quest) => (quest.id === questId ? { ...quest, reward: 0 } : quest)) };
};
