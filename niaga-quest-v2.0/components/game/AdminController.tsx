
"use client";

import { useState } from "react";
import type { Player } from "@/types/game";
import { BOARD_FINISH_POSITION, BOARD_START_POSITION } from "@/lib/board";

type AdminControllerProps = {
  players: Player[];
  disabled?: boolean;
  onMovePlayer: (playerId: string, destination: number) => void;
  onResetPlayer: (playerId: string) => void;
  microphoneEnabled: boolean;
  onToggleMicrophone: () => void;
  onClose: () => void;
};

export default function AdminController({
  players,
  disabled = false,
  onMovePlayer,
  onResetPlayer,
  microphoneEnabled,
  onToggleMicrophone,
  onClose,
}: AdminControllerProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState(
    () => players[0]?.id ?? ""
  );
  const [destination, setDestination] = useState(String(BOARD_FINISH_POSITION));

  const selectedPlayer = players.find(
    (player) => player.id === selectedPlayerId
  );

  function handleMove() {
    const parsedDestination = Number(destination);
    if (
      !selectedPlayer ||
      !Number.isInteger(parsedDestination) ||
      parsedDestination < BOARD_START_POSITION ||
      parsedDestination > BOARD_FINISH_POSITION ||
      disabled
    ) {
      return;
    }

    onMovePlayer(selectedPlayerId, parsedDestination);
  }

  function handleReset() {
    if (!selectedPlayer || disabled) return;
    onResetPlayer(selectedPlayerId);
  }

  return (
    <section className="fixed right-4 top-[86px] z-[70] w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-amber-300/50 bg-[#101B2D]/98 p-4 shadow-2xl backdrop-blur">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black tracking-[0.18em] text-amber-300">
            ADMIN CONTROLLER
          </p>
          <h2 className="mt-1 text-lg font-black text-white">
            Game testing tools
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            Move a player to a board position to test game states. These
            controls only affect this local prototype.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close admin controller"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-600 text-lg text-slate-300 hover:bg-slate-700"
        >
          ×
        </button>
      </div>

      {/* MICROPHONE SETTING */}
      <div className="mb-4 rounded-xl border border-slate-700 bg-[#0B1422] p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-white">Microphone input</p>
            <p className="mt-1 text-xs text-slate-400">
              Enable or disable speech-to-text during presentations.
            </p>
          </div>

          <button
            type="button"
            onClick={onToggleMicrophone}
            aria-pressed={microphoneEnabled}
            className={`shrink-0 rounded-lg px-3 py-2 text-xs font-black transition ${
              microphoneEnabled
                ? "bg-emerald-400/15 text-emerald-200 border border-emerald-400/50 hover:bg-emerald-400/25"
                : "bg-slate-700/60 text-slate-300 border border-slate-600 hover:bg-slate-700"
            }`}
          >
            {microphoneEnabled ? "ON" : "OFF"}
          </button>
        </div>

        <p className="mt-2 text-[10px] text-slate-500">
          {microphoneEnabled
            ? "Players can use the microphone button."
            : "Microphone input is disabled for all players."}
        </p>
      </div>

      <label
        className="mb-1 block text-xs font-bold text-slate-300"
        htmlFor="admin-player"
      >
        Select player
      </label>

      <select
        id="admin-player"
        value={selectedPlayerId}
        onChange={(event) => setSelectedPlayerId(event.target.value)}
        className="w-full rounded-lg border border-slate-600 bg-[#0B1422] px-3 py-2 text-sm text-white outline-none focus:border-amber-300"
      >
        {players.map((player) => (
          <option key={player.id} value={player.id}>
            {player.name} ({player.type.toUpperCase()})
          </option>
        ))}
      </select>

      <div className="mt-3 grid grid-cols-[1fr_auto] items-end gap-2">
        <div>
          <label
            className="mb-1 block text-xs font-bold text-slate-300"
            htmlFor="admin-position"
          >
            Destination (0–36)
          </label>
          <input
            id="admin-position"
            type="number"
            min={BOARD_START_POSITION}
            max={BOARD_FINISH_POSITION}
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-[#0B1422] px-3 py-2 text-sm text-white outline-none focus:border-amber-300"
          />
        </div>

        <button
          type="button"
          onClick={handleMove}
          disabled={disabled}
          className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-black text-[#172033] transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Move
        </button>
      </div>

      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => setDestination(String(BOARD_FINISH_POSITION))}
          className="flex-1 rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-200 hover:bg-emerald-400/20"
        >
          Set destination: Finish
        </button>

        <button
          type="button"
          onClick={handleReset}
          disabled={disabled}
          className="flex-1 rounded-lg border border-slate-500 bg-slate-700/40 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700/70 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Reset to Start
        </button>
      </div>

      <div className="mt-3 rounded-lg border border-slate-700 bg-[#0B1422] p-3">
        {selectedPlayer ? (
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="text-slate-400">Current test state</span>
            <span className="font-bold text-white">
              {selectedPlayer.position === BOARD_FINISH_POSITION
                ? `FINISH · #${selectedPlayer.finishOrder ?? "—"}`
                : selectedPlayer.position === BOARD_START_POSITION
                  ? "START"
                  : `Space ${selectedPlayer.position}`}
            </span>
          </div>
        ) : (
          <p className="text-xs text-slate-400">No player selected.</p>
        )}
      </div>

      <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
        Sending a player to Finish marks them as finished and assigns a
        finishing order. Resetting returns that player to Start.
      </p>
    </section>
  );
}
