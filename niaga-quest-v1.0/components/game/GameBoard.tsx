
"use client";

import type { Player } from "@/types/game";
import { boardPlots, BOARD_FINISH_POSITION } from "@/lib/board";

interface GameBoardProps {
  players: Player[];
  currentPlayerIndex: number;
  diceResult: number | null;
  nextPosition: number | null;
}

const TOTAL_GRID_CELLS = 42;
const GRID_COLUMNS = 7;

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
      return "bg-sky-500/20 border-sky-400";
    case "reward":
      return "bg-amber-400/20 border-amber-400";
    case "penalty":
      return "bg-rose-500/20 border-rose-400";
    default:
      return "bg-slate-500/20 border-slate-400";
  }
}

function getPlotIcon(type: string) {
  switch (type) {
    case "scenario":
      return "❓";
    case "reward":
      return "💰";
    case "penalty":
      return "⚠️";
    default:
      return "🏢";
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

export default function GameBoard({
  players,
  currentPlayerIndex,
  diceResult,
  nextPosition,
}: GameBoardProps) {
  const activePlayer = players[currentPlayerIndex];

  return (
    <section className="w-full bg-[#10152D] rounded-2xl p-4 sm:p-6 border border-slate-700 shadow-2xl grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_460px] gap-5">

      {/* BOARD HEADING */}
      <div className="col-span-full">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div>
            <p className="text-amber-400 text-xs font-bold tracking-widest">
              NIAGAQUEST BOARD
            </p>

            <h2 className="text-white text-2xl font-black mt-1">
              Business Adventure
            </h2>
          </div>

          <div className="bg-[#1C2342] border border-slate-700 rounded-lg px-4 py-2">
            <p className="text-slate-400 text-xs">
              CURRENT TURN
            </p>

            <p className="text-white font-bold">
              {activePlayer?.name ?? "Waiting"}
            </p>
          </div>
        </div>
      </div>

      {/* LEFT SIDE: WIDER BOARD */}
      <div className="min-w-0 flex justify-center">

        <div className="w-full max-w-[1000px]">

          <div className="w-full aspect-[1.35/1] grid grid-cols-7 grid-rows-6 gap-2">

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
                    className="min-h-0 rounded-lg bg-[#0B1025]/40 border border-slate-800/40"
                  />
                );
              }

              const playersHere = players.filter(
                (player) => player.position === position
              );

              const isDestination = nextPosition === position;

              const isOnRoute =
                diceResult !== null &&
                activePlayer !== undefined &&
                position > activePlayer.position &&
                position <= (nextPosition ?? -1);

              const plotColor =
                isStart || isFinish
                  ? "bg-emerald-500/20 border-emerald-400"
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
                    relative min-h-0 min-w-0 rounded-lg border-2 p-1 sm:p-2
                    flex flex-col justify-between transition-all
                    ${plotColor}
                    ${isDestination ? "ring-4 ring-cyan-400 scale-[1.03] z-10" : ""}
                    ${isOnRoute ? "ring-2 ring-cyan-300/60" : ""}
                  `}
                >

                  {/* POSITION NUMBER */}
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-[9px] sm:text-[10px] text-slate-300 font-bold">
                      {isStart
                        ? "00"
                        : isFinish
                        ? "END"
                        : String(position).padStart(2, "0")}
                    </span>

                    {isDestination && (
                      <span className="text-[8px] bg-cyan-400 text-slate-950 px-1 rounded font-black">
                        TARGET
                      </span>
                    )}
                  </div>

                  {/* PLOT CONTENT */}
                  <div className="text-center min-w-0">
                    <p className="text-lg sm:text-2xl">
                      {isStart
                        ? "🚩"
                        : isFinish
                        ? "🏁"
                        : getPlotIcon(plot?.type ?? "normal")}
                    </p>

                    <p className="text-white text-[8px] sm:text-xs font-bold leading-tight mt-1 break-words">
                      {title}
                    </p>
                  </div>

                  {/* PLAYER TOKENS */}
                  <div className="flex flex-wrap justify-center gap-1 min-h-4">
                    {playersHere.map((player) => (
                      <div
                        key={player.id}
                        title={`${player.name} (${player.type})`}
                        className={`
                          w-4 h-4 sm:w-5 sm:h-5 rounded-full
                          flex items-center justify-center
                          text-[8px] font-black text-white border border-white
                          ${player.type === "npc"
                            ? "bg-violet-600"
                            : "bg-cyan-600"}
                        `}
                      >
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                  </div>

                  {/* ROUTE DIRECTION */}
                  {!isFinish && (
                    <span className="absolute bottom-1 right-1 text-slate-300/60 text-[10px]">
                      {getDirection(position)}
                    </span>
                  )}

                </div>
              );
            })}

          </div>

          {/* BOARD LEGEND */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-xs text-slate-300">
            <span>🏢 Normal</span>
            <span>❓ Scenario</span>
            <span>💰 Reward</span>
            <span>⚠️ Penalty</span>
            <span>🔵 Human</span>
            <span>🟣 NPC</span>
          </div>

          {/* MOVEMENT PREVIEW */}
          {diceResult !== null && nextPosition !== null && (
            <div className="mt-4 bg-[#151D38] border border-cyan-400/40 rounded-xl p-3">
              <p className="text-cyan-300 text-xs font-bold tracking-widest">
                MOVEMENT PREVIEW
              </p>

              <p className="text-white mt-2 text-sm">
                {activePlayer?.name} will move{" "}
                <span className="text-cyan-300 font-black">
                  {diceResult} spaces
                </span>
                .
              </p>
            </div>
          )}

        </div>
      </div>

      {/* RIGHT SIDE: WIDER PLAYER PANEL */}
      <aside className="bg-[#151D38] border border-slate-700 rounded-xl p-4 h-fit">

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-black text-lg">
            Players
          </h3>

          <span className="text-xs text-slate-400">
            {players.length}/6
          </span>
        </div>

        {/* TWO COLUMNS, UP TO THREE ROWS */}
        <div className="grid grid-cols-2 gap-3">

          {players.map((player, index) => {
            const isCurrentPlayer = index === currentPlayerIndex;

            return (
              <div
                key={player.id}
                className={`
                  rounded-xl p-3 border transition-all min-w-0
                  ${isCurrentPlayer
                    ? "bg-cyan-500/10 border-cyan-400"
                    : "bg-[#10152D] border-slate-700"}
                `}
              >

                {/* PLAYER NAME */}
                <div className="flex items-center gap-2">
                  <div
                    className={`
                      w-8 h-8 shrink-0 rounded-full
                      flex items-center justify-center
                      text-white font-black text-xs
                      ${player.type === "npc"
                        ? "bg-violet-600"
                        : "bg-cyan-600"}
                    `}
                  >
                    {player.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-white font-bold text-sm truncate">
                      {player.name}
                    </p>

                    <p className="text-slate-400 text-[10px] uppercase">
                      {player.type === "npc" ? "NPC Player" : "Human Player"}
                    </p>
                  </div>
                </div>

                {/* PLAYER STATS */}
                <div className="grid grid-cols-2 gap-2 mt-3">

                  <div className="bg-[#0B1025] rounded-md p-2">
                    <p className="text-slate-400 text-[9px]">
                      POSITION
                    </p>

                    <p className="text-white text-xs font-bold">
                      {player.position === 0
                        ? "START"
                        : player.position === BOARD_FINISH_POSITION
                        ? "FINISH"
                        : `Space ${player.position}`}
                    </p>
                  </div>

                  <div className="bg-[#0B1025] rounded-md p-2">
                    <p className="text-slate-400 text-[9px]">
                      SCORE
                    </p>

                    <p className="text-amber-400 text-xs font-bold">
                      {player.score}
                    </p>
                  </div>

                  <div className="bg-[#0B1025] rounded-md p-2">
                    <p className="text-slate-400 text-[9px]">
                      MONEY
                    </p>

                    <p className="text-emerald-400 text-xs font-bold">
                      RM {player.money}
                    </p>
                  </div>

                  <div className="bg-[#0B1025] rounded-md p-2">
                    <p className="text-slate-400 text-[9px]">
                      PATHS
                    </p>

                    <p className="text-white text-xs font-bold">
                      {player.completedPaths}
                    </p>
                  </div>

                </div>

                {/* CURRENT PLAYER INDICATOR */}
                {isCurrentPlayer && (
                  <p className="text-cyan-300 text-[9px] font-black mt-3">
                    CURRENT TURN
                  </p>
                )}

              </div>
            );
          })}

        </div>
      </aside>

    </section>
  );
}
