import { createInitialState } from '../game/engine';
import type { GameState } from '../game/types';

const KEY = 'tap-empire-save-v1';

export const loadGame = (): GameState => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return createInitialState();
    return { ...createInitialState(), ...JSON.parse(raw) } as GameState;
  } catch {
    return createInitialState();
  }
};

export const saveGame = (state: GameState): void => {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...state, lastSavedAt: Date.now() }));
  } catch {
    // Graceful failure for private mode / quota.
  }
};
