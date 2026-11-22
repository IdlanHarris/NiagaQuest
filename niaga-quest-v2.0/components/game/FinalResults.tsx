"use client";

import type { Player } from "@/types/game";

interface FinalResultsProps {
  players: Player[];
  onRestart: () => void;
}

export default function FinalResults({ players, onRestart }: FinalResultsProps) {
  const rankedPlayers = [...players].sort(
    (a, b) => (a.finishOrder ?? Number.MAX_SAFE_INTEGER) - (b.finishOrder ?? Number.MAX_SAFE_INTEGER)
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050B14]/90 p-4 backdrop-blur-md">
      <section role="dialog" aria-modal="true" aria-labelledby="final-results-title" className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-amber-300/40 bg-[#101B2D] p-6 shadow-2xl sm:p-8">
        <div className="text-center">
          <span className="inline-flex rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-[10px] font-black tracking-[0.2em] text-emerald-200">GAME COMPLETED</span>
          <h2 id="final-results-title" className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">Final Results</h2>
          <p className="mt-2 text-sm text-slate-400">Every player has reached the finish line. Here is the final ranking.</p>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          {rankedPlayers.slice(0, 3).map((player, index) => (
            <div key={player.id} className={`rounded-2xl border p-4 text-center ${index === 0 ? "border-amber-300/60 bg-amber-300/10 sm:-translate-y-2" : "border-slate-700 bg-[#172438]"}`}>
              <p className="text-2xl">{index === 0 ? "🏆" : index === 1 ? "🥈" : "🥉"}</p>
              <p className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{index === 0 ? "Champion" : index === 1 ? "Runner-up" : "Third place"}</p>
              <p className="mt-1 truncate text-lg font-black text-white">{player.name}</p>
              <p className="mt-1 text-xs font-bold text-amber-200">{player.score} achievement points</p>
            </div>
          ))}
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-700">
          <div className="grid grid-cols-[48px_minmax(0,1fr)_90px_110px] gap-2 bg-[#172438] px-4 py-3 text-[9px] font-black uppercase tracking-[0.13em] text-slate-400 sm:grid-cols-[60px_minmax(0,1fr)_130px_150px]">
            <span>Rank</span><span>Player</span><span className="text-right">Points</span><span className="text-right">Final money</span>
          </div>
          {rankedPlayers.map((player) => (
            <div key={player.id} className="grid grid-cols-[48px_minmax(0,1fr)_90px_110px] items-center gap-2 border-t border-slate-700/70 bg-[#0D1422] px-4 py-3 text-sm sm:grid-cols-[60px_minmax(0,1fr)_130px_150px]">
              <span className="font-black text-amber-200">#{player.finishOrder ?? "—"}</span>
              <span className="min-w-0"><span className="block truncate font-bold text-white">{player.name}</span><span className="text-[10px] text-slate-500">{player.type === "human" ? "Human player" : "NPC"}</span></span>
              <span className="text-right font-bold text-amber-200">{player.score}</span>
              <span className="text-right font-bold text-emerald-200">RM{player.money.toLocaleString("en-MY")}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={onRestart} className="flex-1 rounded-xl bg-amber-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-amber-300">Restart Game</button>
          <a href="/lobby" className="flex-1 rounded-xl border border-slate-600 bg-[#202D40] px-5 py-3 text-center text-sm font-bold text-slate-100 transition hover:border-amber-300/60 hover:bg-[#26374B]">Return to Lobby</a>
        </div>
      </section>
    </div>
  );
}
