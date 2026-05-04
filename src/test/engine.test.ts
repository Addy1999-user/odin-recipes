import { describe, expect, it } from 'vitest';
import { buyUpgrade, claimDailyReward, createInitialState, tap, tickAuto } from '../game/engine';

describe('engine loop', () => {
  it('tap increases coins', () => {
    const s = tap(createInitialState());
    expect(s.coins).toBeGreaterThan(0);
  });

  it('upgrade spends coins and boosts', () => {
    let s = createInitialState();
    s.coins = 100;
    s = buyUpgrade(s, 'finger');
    expect(s.tapPower).toBeGreaterThan(1);
    expect(s.coins).toBeLessThan(100);
  });

  it('auto income ticks', () => {
    const s = tickAuto({ ...createInitialState(), autoPerSec: 2 }, 2);
    expect(s.coins).toBeGreaterThanOrEqual(4);
  });

  it('daily reward claim once per day', () => {
    const s1 = claimDailyReward(createInitialState(), new Date('2026-05-02T00:00:00Z'));
    const s2 = claimDailyReward(s1, new Date('2026-05-02T12:00:00Z'));
    expect(s2.coins).toBe(s1.coins);
  });
});
