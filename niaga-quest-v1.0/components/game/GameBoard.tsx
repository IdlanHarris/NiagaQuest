
"use client";

import { useEffect, useState } from "react";
import type { Player } from "@/types/game";
import { boardPlots, BOARD_FINISH_POSITION } from "@/lib/board";

interface GameBoardProps {
  players: Player[];
  currentPlayerIndex: number;
  diceResult: number | null;
  nextPosition: number | null;
  isRolling: boolean;
  isMoving: boolean;
  onRollDice: () => void;
}

const TOTAL_GRID_CELLS = 42;
const GRID_COLUMNS = 7;

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

function getGridPosition(position: number) {
  const row = Math.floor(position / GRID_COLUMNS);
  const columnInRow = position % GRID_COLUMNS;

  const column =
    row % 2 === 0
      ? columnInRow
      : GRID_COLUMNS - 1 - columnInRow;

  return {
    gridRow: row + 1,
    gridColumn: column + 1,
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
  if (position === BOARD_FINISH_POSITION) return "";

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
      <div className={"dice-2d"}>
        {Array.from({ length: 9 }).map((_, index) => (
          <span
            key={index}
            className={`dice-pip ${
              pipPositions[visibleValue].includes(index) ? "dice-pip-visible" : ""
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
}: GameBoardProps) {
  const activePlayer = players[currentPlayerIndex];

  return (
    <section className="w-full h-[calc(100vh-105px)] min-h-0 bg-[#101725] rounded-2xl p-3 sm:p-4 border border-slate-700/70 shadow-2xl grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_430px] gap-4 overflow-hidden">

      {/* LEFT: GAME BOARD */}
      <div className="min-w-0 min-h-0 flex flex-col">

        <div className="flex items-center justify-between gap-3 mb-3 shrink-0">
          <div> {/* title not in use */}
            {/* <p className="text-amber-400 text-[10px] font-bold tracking-[0.2em]">
              NIAGAQUEST
            </p>
            <h2 className="text-white text-xl font-black">
              Business Adventure
            </h2> */}
          </div>

          <div className="bg-[#202B3D] border border-slate-600/50 rounded-lg px-3 py-2">
            <p className="text-slate-400 text-[9px] font-bold tracking-widest">
              CURRENT PLAYER
            </p>
            <p className="text-white text-sm font-bold">
              {activePlayer?.name ?? "Waiting"}
            </p>
          </div>
        </div>

        {/* BOARD */}
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <div className="h-full max-h-full aspect-[1.35/1] max-w-full grid grid-cols-7 grid-rows-6 gap-1.5 sm:gap-2">

            {Array.from({ length: TOTAL_GRID_CELLS }).map((_, index) => {
              const position = index;

              const isStart = position === 0;
              const isFinish = position === BOARD_FINISH_POSITION;

              const plot = boardPlots[position - 1];

              const isOccupied =
                isStart || isFinish || Boolean(plot);

              if (!isOccupied) {
                return (
                  <div
                    key={index}
                    className="min-h-0 rounded-lg bg-[#151F2E]/50 border border-slate-700/30"
                  />
                );
              }

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
                  key={index}
                  style={getGridPosition(position)}
                  className={`
                    relative min-h-0 min-w-0 rounded-lg border
                    p-1 sm:p-2 flex flex-col justify-between
                    transition-all duration-300 overflow-hidden
                    ${plotColor}
                    ${isDestination ? "ring-2 ring-amber-300 z-10" : ""}
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
                  <div className="text-center min-w-0">
                    <p className="text-sm sm:text-xl text-slate-100">
                      {isStart
                        ? "🚩"
                        : isFinish
                        ? "🏁"
                        : getPlotIcon(plot?.type ?? "normal")}
                    </p>

                    <p className="text-slate-100 text-[7px] sm:text-[10px] font-bold leading-tight mt-1 break-words">
                      {title}
                    </p>
                  </div>

                  {/* SIX PLAYER TOKENS: 3 COLUMNS × 2 ROWS */}
                  <div className="grid grid-cols-3 gap-0.5 justify-items-center min-h-[14px]">
                    {playersHere.map((player) => (
                      <div
                        key={player.id}
                        title={player.name}
                        style={{
                          backgroundColor: getPlayerColor(player.playerIndex),
                        }}
                        className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-white/70 flex items-center justify-center text-[7px] font-black text-slate-950 shadow-md"
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

        {/* PLAYER GRID: 2 COLUMNS × 3 ROWS */}
        <div className="flex-1 min-h-0 grid grid-cols-2 grid-rows-3 gap-2">

          {players.map((player, index) => {
            const isCurrentPlayer = index === currentPlayerIndex;

            return (
              <div
                key={player.id}
                className={`
                  rounded-xl p-2 border min-w-0 min-h-0 transition-all flex flex-col justify-center
                  ${isCurrentPlayer
                    ? "bg-[#26374B] border-amber-300/80 shadow-md"
                    : "bg-[#202D40] border-slate-600/50"}
                `}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    style={{
                      backgroundColor: getPlayerColor(index),
                    }}
                    className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-slate-950 font-black text-xs border border-white/30"
                  >
                    {player.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-white text-xs font-bold truncate">
                      {player.name}
                    </p>
                    <p className="text-slate-400 text-[9px] uppercase">
                      {player.type === "npc" ? "NPC" : "Host"}
                    </p>
                  </div>

                  {isCurrentPlayer && (
                    <span className="w-2 h-2 bg-amber-300 rounded-full shrink-0 animate-pulse" />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1 mt-2">
                  <div className="bg-[#111B29] rounded-md p-1.5">
                    <p className="text-slate-500 text-[8px]">POSITION</p>
                    <p className="text-white text-[10px] font-bold truncate">
                      {player.position === 0
                        ? "START"
                        : player.position === BOARD_FINISH_POSITION
                        ? "FINISH"
                        : `Space ${player.position}`}
                    </p>
                  </div>

                  <div className="bg-[#111B29] rounded-md p-1.5">
                    <p className="text-slate-500 text-[8px]">SCORE</p>
                    <p className="text-amber-300 text-[10px] font-bold">
                      {player.score}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

        </div>

        {/* DICE CONTROL PANEL */}
        <div className="shrink-0 h-[190px] bg-[#202D40] border border-slate-600/60 rounded-xl p-3 flex flex-col justify-between gap-2">

          <div className="w-full flex justify-between items-center">
            <div>
              <p className="text-amber-300 text-[10px] font-bold tracking-widest">
                PLAYER TURN
              </p>
              <p className="text-white text-sm font-bold">
                {activePlayer?.name}
              </p>
            </div>

            <span className="text-slate-400 text-[9px]">
              {isMoving
                ? "MOVING..."
                : isRolling
                ? "ROLLING..."
                : diceResult !== null
                ? "RESULT"
                : "READY"}
            </span>
          </div>

          {/* 2D DICE */}
          <div className="flex items-center justify-center gap-4">
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

          <button
            onClick={onRollDice}
            disabled={isRolling || isMoving || diceResult !== null}
            className="w-full bg-amber-400 hover:bg-amber-300 disabled:bg-slate-600 disabled:text-slate-400 text-slate-950 font-black py-3 px-4 rounded-lg text-sm transition-colors shadow-lg disabled:cursor-not-allowed"
          >
            {isRolling
              ? "Rolling..."
              : isMoving
              ? "Moving..."
              : "🎲 Roll Dice"}
          </button>

        </div>

      </aside>

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
          box-shadow: 0 5px 0 #9aa8b8, 0 9px 16px rgba(0, 0, 0, .25),
            inset 0 1px 3px rgba(255, 255, 255, .9);
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
          box-shadow: inset 0 1px 1px rgba(255, 255, 255, .2);
        }

        .dice-2d-rolling { //not in use rn
          animation: diceRoll2D 2.2s ease-in-out infinite alternate;
        }

        .dice-2d-settled {
          animation: diceSettle .65s cubic-bezier(.16, 1, .3, 1) both;
        }

        @keyframes diceRoll2D { //not in use rn
        0% {
          transform: translate3d(0, ,-2px, 0) rotate(-5deg) scale(1);
        }

        25% {
          transform: translate3d(0, 1px, 0) rotate(85deg) scale(1.015);
        }

        50% {
          transform: translate3d(0, -3px, 0) rotate(175deg) scale(1.025);
        }

        75% {
          transform: translate3d(0, 1px, 0) rotate(265deg) scale(1.01);
        }

        100% {
          transform: translate3d(0, -2px, 0) rotate(355deg) scale(1);
        }
      }

        @keyframes diceSettle { //not in use rn//not in use rn
          0% { transform: scale(1.12) rotate(8deg); }
          70% { transform: scale(.94) rotate(-3deg); }
          100% { transform: scale(1) rotate(0); }
        }
      `}</style>

    </section>
  );
}
