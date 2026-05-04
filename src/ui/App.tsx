import { useEffect, useMemo, useState } from 'react';
import { TICK_MS, UPGRADES } from '../game/config';
import { applyOfflineProgress, buyUpgrade, canClaimDailyReward, claimDailyReward, claimQuest, createInitialState, openChest, prestigeReset, tap, tickAuto } from '../game/engine';
import type { GameState } from '../game/types';
import { loadGame, saveGame } from '../services/storage';

export const App = () => {
  const [state, setState] = useState<GameState>(createInitialState());
  const [notice, setNotice] = useState('Welcome to Tap Empire');

  useEffect(() => {
    const loaded = loadGame();
    const { state: withOffline, gained } = applyOfflineProgress(loaded);
    setState(withOffline);
    if (gained > 0) setNotice(`Welcome back! Offline gain +${Math.floor(gained)} coins`);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setState((s) => tickAuto(s, TICK_MS / 1000)), TICK_MS);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const saver = window.setInterval(() => saveGame(state), 1000);
    return () => window.clearInterval(saver);
  }, [state]);

  const onTap = () => {
    setState((s) => tap(s));
  };

  const dailyAvailable = canClaimDailyReward(state);
  const prestigeReady = Math.floor(state.lifetimeCoins / 5000) > 0;
  const progressPct = Math.min(100, (state.chestProgress / 500) * 100);

  const monetization = useMemo(
    () => ({
      showRewardedAd: async (placement: 'daily_double' | 'chest_boost') => console.info('TODO integrate rewarded ad', placement),
      purchaseCosmetic: async (sku: string) => console.info('TODO integrate IAP', sku)
    }),
    []
  );

  return (
    <main className="wrap">
      <section className="topCard">
        <h1>Tap Empire</h1>
        <p className="coins">🪙 {Math.floor(state.coins).toLocaleString()}</p>
        <p>Tap: {state.tapPower.toFixed(1)} | Auto: {state.autoPerSec.toFixed(1)}/sec | Prestige: {state.prestige}</p>
        <button className="tapBtn" onClick={onTap}>TAP</button>
        <p className="notice">{notice}</p>
      </section>

      <section className="grid">
        <div className="card">
          <h3>Upgrades</h3>
          {UPGRADES.map((u) => {
            const cost = Math.floor(u.baseCost * Math.pow(u.costGrowth, state.upgrades[u.id]));
            return <button key={u.id} className="item" onClick={() => setState((s) => buyUpgrade(s, u.id))}>{u.name} Lv.{state.upgrades[u.id]}<small>{u.desc} • Cost {cost}</small></button>;
          })}
        </div>

        <div className="card">
          <h3>Daily + Chest</h3>
          <button className="item" disabled={!dailyAvailable} onClick={() => setState((s) => claimDailyReward(s))}>Daily Reward {dailyAvailable ? '(Ready)' : '(Claimed)'}</button>
          <button className="item" disabled={!state.chestReady} onClick={() => setState((s) => openChest(s))}>Open Reward Chest</button>
          <div className="bar"><span style={{ width: `${progressPct}%` }} /></div>
          <button className="item" onClick={() => monetization.showRewardedAd('chest_boost')}>Watch Ad (hook)</button>
        </div>

        <div className="card">
          <h3>Quests</h3>
          {state.quests.map((q) => <button key={q.id} className="item" onClick={() => setState((s) => claimQuest(s, q.id))}>{q.label} {q.progress}/{q.target}<small>Reward: {q.reward}</small></button>)}
        </div>

        <div className="card">
          <h3>Empire</h3>
          <button className="item" disabled={!prestigeReady} onClick={() => setState((s) => prestigeReset(s))}>Prestige Reset (+permanent boost)</button>
          <button className="item" onClick={() => setState((s) => ({ ...s, soundOn: !s.soundOn }))}>Sound: {state.soundOn ? 'On' : 'Off'}</button>
          <button className="item" onClick={() => monetization.purchaseCosmetic('theme_neon')}>Buy Neon Theme (IAP hook)</button>
        </div>
      </section>
    </main>
  );
};
