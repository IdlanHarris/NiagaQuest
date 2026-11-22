
"use client";

import { useEffect, useState } from "react";
import type { Player } from "@/types/game";
import { boardPlots, BOARD_FINISH_POSITION } from "@/lib/board";
import PlayerCard from "@/components/game/PlayerCard";

interface GameBoardProps {
  players: Player[];
  currentPlayerIndex: number;
  diceResult: number | null;
  nextPosition: number | null;
  isRolling: boolean;
  isMoving: boolean;
  onRollDice: () => void;
  round?: number;
  gameStatus?: string;
}

const TOTAL_GRID_CELLS = BOARD_FINISH_POSITION + 1;

const playerColors = [
  "#22D3EE",
  "#A78BFA",
  "#F59E0B",
  "#34D399",
  "#F472B6",
  "#94A3B8",
];

function getPlayerColor(index: number) {
  return playerColors[index % playerColors.length];
}

/**
 * Board path:
 *
 * Row 1:  0 → 1 → 2 → 3 → 4 → 5 → 6 → 7
 *                                    ↓
 * Row 2: 17 ← 16 ← 15 ← 14 ← 13 ← 12 ← 11 ← 10
 *        ↓
 * Row 3: 20 → 21 → 22 → 23 → 24 → 25 → 26 → 27
 *                                    ↓
 * Row 4: 36 ← 35 ← 34 ← 33 ← 32 ← 31 ← 30
 *
 * Two vertical spaces connect each horizontal lane.
 */

function getGridPosition(position: number) {
  // First lane: 0–8, left to right
  if (position >= 0 && position <= 8) {
    return {
      gridRow: 1,
      gridColumn: position + 1,
    };
  }

  // First connector: 9
  if (position === 9) {
    return {
      gridRow: 2,
      gridColumn: 9,
    };
  }

  // Second lane: 10–18, right to left
  if (position >= 10 && position <= 18) {
    return {
      gridRow: 3,
      gridColumn: 19 - position,
    };
  }

  // Second connector: 19
  if (position === 19) {
    return {
      gridRow: 4,
      gridColumn: 1,
    };
  }

  // Third lane: 20–28, left to right
  if (position >= 20 && position <= 28) {
    return {
      gridRow: 5,
      gridColumn: position - 19,
    };
  }

  // Third connector: 29
  if (position === 29) {
    return {
      gridRow: 6,
      gridColumn: 9,
    };
  }

  // Final lane: 30–36, right to left
  if (position >= 30 && position <= 36) {
    return {
      gridRow: 7,
      gridColumn: 39 - position,
    };
  }

  return {
    gridRow: 1,
    gridColumn: 1,
  };
}

function getPlotColor(type: string) {
  switch (type) {
    case "scenario":
      return "bg-[#263F52] border-[#607F91]";

    case "reward":
      return "bg-[#443D2D] border-[#99845B]";

    case "penalty":
      return "bg-[#453438] border-[#936A70]";

    default:
      return "bg-[#303D50] border-[#65758A]";
  }
}

function getPlotIcon(type: string) {
  switch (type) {
    case "scenario":
      return "❖";

    case "reward":
      return "◆";

    case "penalty":
      return "⚠";

    default:
      return "▦";
  }
}

function getDirection(position: number) {
  if (position >= BOARD_FINISH_POSITION) return "";

  const current = getGridPosition(position);
  const next = getGridPosition(position + 1);

  if (next.gridColumn > current.gridColumn) return "→";
  if (next.gridColumn < current.gridColumn) return "←";
  if (next.gridRow > current.gridRow) return "↓";

  return "";
}

const pipPositions: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function DiceFace({
  value,
  isRolling,
}: {
  value: number | null;
  isRolling: boolean;
}) {
  const [rollingValue, setRollingValue] = useState(1);

  useEffect(() => {
    if (!isRolling) return;

    const interval = window.setInterval(() => {
      setRollingValue(Math.floor(Math.random() * 6) + 1);
    }, 90);

    return () => window.clearInterval(interval);
  }, [isRolling]);

  const visibleValue = isRolling ? rollingValue : value ?? 1;

  return (
    <div className="dice-2d-scene">
      <div className="dice-2d">
        {Array.from({ length: 9 }).map((_, index) => (
          <span
            key={index}
            className={`dice-pip ${
              pipPositions[visibleValue].includes(index)
                ? "dice-pip-visible"
                : ""
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function GameBoard({
  players,
  currentPlayerIndex,
  diceResult,
  nextPosition,
  isRolling,
  isMoving,
  onRollDice,
  round = 1,
  gameStatus = "Ready",
}: GameBoardProps) {
  const activePlayer = players[currentPlayerIndex];

  return (
    <section className="w-full h-[calc(100vh-105px)] min-h-0 bg-[#101725] rounded-2xl p-3 sm:p-4 border border-slate-700/70 shadow-2xl grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_430px] gap-4 overflow-hidden">

      {/* LEFT: GAME BOARD */}
      <div className="min-w-0 min-h-0 flex flex-col">

        {/* CURRENT PLAYER */}
        <div className="flex items-center justify-between gap-3 mb-3 shrink-0">
          <div />

          <div className="bg-[#202B3D] border border-slate-600/50 rounded-lg px-3 py-2">
            <p className="text-slate-400 text-[9px] font-bold tracking-widest">
              CURRENT PLAYER · {gameStatus.toUpperCase()}
            </p>

            <p className="text-white text-sm font-bold">
              {activePlayer?.name ?? "Waiting"}
            </p>
          </div>
        </div>

        {/* BOARD */}
        <div className="flex-1 min-h-0 overflow-auto rounded-lg p-1">
          <div className="grid h-full min-h-[560px] min-w-[900px] w-full grid-cols-9 grid-rows-7 gap-2">
            {Array.from({ length: TOTAL_GRID_CELLS }).map((_, index) => {
              const position = index;

              const isStart = position === 0;
              const isFinish = position === BOARD_FINISH_POSITION;

              const plot = boardPlots[position - 1];

              const playersHere = players
                .map((player, playerIndex) => ({
                  ...player,
                  playerIndex,
                }))
                .filter((player) => player.position === position);

              const isDestination = nextPosition === position;

              const isOnRoute =
                diceResult !== null &&
                activePlayer !== undefined &&
                position > activePlayer.position &&
                position <= (nextPosition ?? -1);

              const plotColor =
                isStart || isFinish
                  ? "bg-[#344638] border-[#78936D]"
                  : getPlotColor(plot?.type ?? "normal");

              const title = isStart
                ? "START"
                : isFinish
                  ? "FINISH"
                  : plot?.title ?? `Space ${position}`;

              return (
                <div
                  key={position}
                  style={getGridPosition(position)}
                  className={`
                    relative min-h-0 min-w-0 rounded-lg border
                    p-1 sm:p-2
                    flex flex-col justify-between
                    transition-all duration-300
                    overflow-hidden
                    ${plotColor}
                    ${isDestination ? "ring-2 ring-amber-300 z-10 shadow-[0_0_16px_rgba(252,211,77,.28)]" : ""}
                    ${isOnRoute ? "border-amber-300/80" : ""}
                  `}
                >

                  {/* PLOT NUMBER */}
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-[8px] sm:text-[10px] text-slate-300 font-bold">
                      {isStart
                        ? "00"
                        : isFinish
                          ? "END"
                          : String(position).padStart(2, "0")}
                    </span>

                    {isDestination && (
                      <span className="text-[7px] bg-amber-300 text-slate-950 px-1 rounded font-black">
                        HERE
                      </span>
                    )}
                  </div>

                  {/* PLOT CONTENT */}
                  <div className="min-w-0 text-center">
                    <p className="text-sm sm:text-lg leading-none text-slate-100">
                      {isStart
                        ? "🚩"
                        : isFinish
                          ? "🏁"
                          : getPlotIcon(plot?.type ?? "normal")}
                    </p>

                    <p className="mt-1 line-clamp-2 break-words text-[8px] font-bold leading-tight text-slate-100 sm:text-[10px]">
                      {title}
                    </p>
                  </div>

                  {/* PLAYER TOKENS */}
                  <div className="grid min-h-[38px] grid-cols-3 grid-rows-2 content-center justify-items-center gap-x-1 gap-y-0.5">
                    {playersHere.map((player) => (
                      <div
                        key={player.id}
                        title={player.name}
                        style={{
                          backgroundColor: getPlayerColor(player.playerIndex),
                        }}
                        className="h-5 w-5 rounded-full border border-white/80 text-[8px] font-black text-slate-950 shadow-md sm:h-[22px] sm:w-[22px] sm:text-[9px] flex items-center justify-center"
                      >
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                  </div>

                  {/* ROUTE ARROW */}
                  {!isFinish && (
                    <span className="absolute bottom-1 right-1 text-slate-200/50 text-[9px]">
                      {getDirection(position)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* LEGEND */}
        <div className="shrink-0 flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[10px] text-slate-400">
          <span>▦ Normal</span>
          <span>❖ Scenario</span>
          <span>◆ Reward</span>
          <span>⚠ Penalty</span>
          <span>● Player tokens</span>
        </div>
      </div>

      {/* RIGHT: PLAYER PANEL AND DICE */}
      <aside className="min-h-0 bg-[#1A2536] border border-slate-700/70 rounded-xl p-3 flex flex-col gap-2 overflow-hidden">

        {/* PLAYER HEADER */}
        <div className="flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-white font-black text-lg">
              Players
            </h3>

            <p className="text-slate-400 text-[10px]">
              Session participants
            </p>
          </div>

          <span className="bg-[#29384D] text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg">
            {players.length}/6
          </span>
        </div>

        {/* PLAYER GRID: 1 COLUMN × 6 ROWS */}
        <div className="flex-1 min-h-0 grid grid-cols-1 grid-rows-6 gap-1.5">
          {players.map((player, index) => (
            <PlayerCard
              key={player.id}
              player={player}
              index={index}
              isActive={index === currentPlayerIndex}
            />
          ))}
        </div>

        {/* DICE CONTROL PANEL */}
        <div className="shrink-0 h-[164px] bg-[#202D40] border border-slate-600/60 rounded-xl p-2.5 flex flex-col justify-between gap-1.5">

          {/* TURN INFORMATION */}
          <div className="w-full flex justify-between items-center">
            <div>
              <p className="text-amber-300 text-[10px] font-bold tracking-widest">
                ROUND {round} · PLAYER TURN
              </p>

              <p className="text-white text-sm font-bold">
                {activePlayer?.name ?? "Game completed"}
              </p>
            </div>

            <span className={`rounded-full px-2 py-1 text-[8px] font-black uppercase tracking-wide ${isRolling || isMoving ? "bg-amber-300/10 text-amber-200" : "bg-emerald-300/10 text-emerald-200"}`}>
              {isMoving ? "Moving" : isRolling ? "Rolling" : diceResult !== null ? "Result" : "Ready"}
            </span>
          </div>

          {/* 2D DICE */}
          <div className="flex items-center justify-center gap-3">
            <DiceFace value={diceResult} isRolling={isRolling} />

            <div className="min-w-0">
              <p className="text-white text-sm font-bold">
                {isRolling
                  ? "Rolling..."
                  : isMoving
                    ? "Moving..."
                    : diceResult !== null
                      ? `Result: ${diceResult}`
                      : "Roll the dice"}
              </p>

              <p className="text-slate-400 text-[10px] mt-1">
                {isRolling
                  ? "Please wait"
                  : isMoving
                    ? "Moving to destination..."
                    : "Roll to move forward"}
              </p>
            </div>
          </div>

          {/* ROLL BUTTON */}
          <button
            type="button"
            onClick={onRollDice}
            disabled={
              isRolling ||
              isMoving ||
              diceResult !== null ||
              activePlayer?.status === "finished"
            }
            className="w-full bg-amber-400 hover:bg-amber-300 disabled:bg-slate-600 disabled:text-slate-400 text-slate-950 font-black py-2.5 px-4 rounded-lg text-sm transition-colors shadow-lg disabled:cursor-not-allowed"
          >
            {isRolling
              ? "Rolling..."
              : isMoving
                ? "Moving..."
                : "🎲 Roll Dice"}
          </button>
        </div>
      </aside>

      {/* DICE STYLING */}
      <style jsx global>{`
        .dice-2d-scene {
          width: 76px;
          height: 76px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
        }

        .dice-2d {
          width: 62px;
          height: 62px;
          padding: 9px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(3, 1fr);
          gap: 3px;
          background: linear-gradient(145deg, #ffffff, #dce3eb);
          border: 2px solid #b6c3d2;
          border-radius: 12px;
          box-shadow:
            0 5px 0 #9aa8b8,
            0 9px 16px rgba(0, 0, 0, 0.25),
            inset 0 1px 3px rgba(255, 255, 255, 0.9);
        }

        .dice-pip {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: transparent;
          align-self: center;
          justify-self: center;
        }

        .dice-pip-visible {
          background: #172235;
          box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </section>
  );
}
