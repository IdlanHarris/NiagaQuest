
"use client";

import type { Player } from "@/types/game";
import { BOARD_FINISH_POSITION } from "@/lib/board";

interface PlayerCardProps {
  player: Player;
  index: number;
  isActive: boolean;
}

const playerColors = [
  "#22D3EE",
  "#A78BFA",
  "#F59E0B",
  "#34D399",
  "#F472B6",
  "#94A3B8",
];

export default function PlayerCard({
  player,
  index,
  isActive,
}: PlayerCardProps) {
  const finished = player.status === "finished";
  const locked = player.status === "locked";

  const positionLabel =
    player.position === 0
      ? "START"
      : player.position === BOARD_FINISH_POSITION
        ? "FINISH"
        : `Plot ${String(player.position).padStart(2, "0")}`;

  const statusLabel = finished
    ? `Finished #${player.finishOrder ?? "—"}`
    : locked
      ? "Locked"
      : isActive
        ? "Active turn"
        : "Playing";

  return (
    <article
      aria-current={isActive ? "true" : undefined}
      className={`min-h-0 min-w-0 rounded-lg border px-2.5 py-2 transition-all duration-200 ${
        isActive
          ? "bg-[#363B78] border-[#B67DDB] shadow-[0_0_0_1px_rgba(182,125,219,.25)]"
          : "bg-[#292D62] border-[#B67DDB]/50"
      } ${finished ? "opacity-90" : ""}`}
    >
      <div className="flex min-w-0 items-center gap-2">
        <div
          style={{
            backgroundColor: playerColors[index % playerColors.length],
          }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/30 text-sm font-black text-[#292D62]"
        >
          {player.name.charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold leading-tight text-[#E8E2D4]">
            {player.name}
          </p>
          <p className="text-[9px] uppercase tracking-wide text-[#E8E2D4]/80">
            {player.type === "npc" ? "NPC" : "Host"}
          </p>
        </div>

        <span
          className={`max-w-[112px] truncate rounded-full px-2 py-1 text-[9px] font-bold ${
            finished
              ? "bg-emerald-400/15 text-emerald-200"
              : locked
                ? "bg-rose-400/15 text-rose-200"
                : isActive
                  ? "bg-[#B67DDB] text-[#292D62]"
                  : "bg-[#42478B] text-[#E8E2D4]"
          }`}
        >
          {statusLabel}
        </span>

        {isActive && (
          <span
            className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-[#B67DDB]"
            title="Current player"
          />
        )}
      </div>

      <div className="mt-2 grid grid-cols-4 gap-1.5">
        <div className="min-w-0 rounded bg-[#292D62] px-1.5 py-1.5">
          <p className="text-[8px] uppercase tracking-wide text-[#E8E2D4]/75">
            Position
          </p>
          <p className="truncate text-[11px] font-bold text-[#E8E2D4]">
            {positionLabel}
          </p>
        </div>

        <div className="min-w-0 rounded bg-[#292D62] px-1.5 py-1.5">
          <p className="text-[8px] uppercase tracking-wide text-[#E8E2D4]/75">
            Money
          </p>
          <p className="truncate text-[11px] font-bold text-emerald-200">
            RM{player.money.toLocaleString("en-MY")}
          </p>
        </div>

        <div className="min-w-0 rounded bg-[#292D62] px-1.5 py-1.5">
          <p className="text-[8px] uppercase tracking-wide text-[#E8E2D4]/75">
            Achievement
          </p>
          <p className="truncate text-[11px] font-bold text-[#B67DDB]">
            {player.score} pts
          </p>
        </div>

        <div className="min-w-0 rounded bg-[#292D62] px-1.5 py-1.5">
          <p className="text-[8px] uppercase tracking-wide text-[#E8E2D4]/75">
            Progress
          </p>
          <p className="truncate text-[11px] font-bold text-[#E8E2D4]">
            {Math.round(
              (player.position / BOARD_FINISH_POSITION) * 100
            )}%
          </p>
        </div>
      </div>
    </article>
  );
}
