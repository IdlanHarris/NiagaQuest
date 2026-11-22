import type { Player } from "@/types/game";

interface TurnIndicatorProps {
  player: Player | undefined;
  round: number;
  gameStatus: string;
}

export default function TurnIndicator({ player, round, gameStatus }: TurnIndicatorProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-700/70 bg-[#172438] px-3 py-2">
      <div className="min-w-0">
        <p className="text-[9px] font-black tracking-[0.16em] text-slate-400">ROUND {round}</p>
        <p className="truncate text-sm font-black text-white">{player ? `${player.name}'s turn` : "Game complete"}</p>
      </div>
      <span className="h-8 w-px bg-slate-600/70" />
      <div className="min-w-0">
        <p className="text-[9px] font-black tracking-[0.16em] text-slate-400">GAME STATE</p>
        <p className="truncate text-xs font-bold text-emerald-300">{gameStatus}</p>
      </div>
    </div>
  );
}
