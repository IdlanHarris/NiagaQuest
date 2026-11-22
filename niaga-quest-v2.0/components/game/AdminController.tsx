
"use client";

import { useState } from "react";
import type { Player, Scenario } from "@/types/game";
import {
  BOARD_FINISH_POSITION,
  BOARD_START_POSITION,
} from "@/lib/board";
import { scenarios } from "@/lib/scenarios";

type AdminControllerProps = {
  players: Player[];
  disabled?: boolean;
  activePlayerId?: string;
  pendingRetry: {
    playerId: string;
    scenario: Scenario;
  } | null;
  onMovePlayer: (playerId: string, destination: number) => void;
  onResetPlayer: (playerId: string) => void;
  microphoneEnabled: boolean;
  onToggleMicrophone: () => void;
  onSimulateRejectedScenario: (
    playerId: string,
    scenarioId: string
  ) => void;
  onClearPendingRetry: () => void;
  onClose: () => void;
};

export default function AdminController({
  players,
  disabled = false,
  activePlayerId,
  pendingRetry,
  onMovePlayer,
  onResetPlayer,
  microphoneEnabled,
  onToggleMicrophone,
  onSimulateRejectedScenario,
  onClearPendingRetry,
  onClose,
}: AdminControllerProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState(
    () => activePlayerId ?? players[0]?.id ?? ""
  );

  const [destination, setDestination] = useState(
    String(BOARD_FINISH_POSITION)
  );

  const [selectedScenarioId, setSelectedScenarioId] = useState(
    () => scenarios[0]?.id ?? ""
  );

  const selectedPlayer = players.find(
    (player) => player.id === selectedPlayerId
  );

  const activePlayer = players.find(
    (player) => player.id === activePlayerId
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

  function handleSimulateRetry() {
    if (
      !selectedPlayer ||
      !selectedScenarioId ||
      disabled
    ) {
      return;
    }

    onSimulateRejectedScenario(
      selectedPlayerId,
      selectedScenarioId
    );
  }

  return (
    <section className="fixed right-4 top-[86px] z-[70] max-h-[calc(100vh-110px)] w-[min(360px,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-amber-300/50 bg-[#101B2D]/98 p-4 shadow-2xl backdrop-blur">
      {/* HEADER */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black tracking-[0.18em] text-amber-300">
            ADMIN CONTROLLER
          </p>

          <h2 className="mt-1 text-lg font-black text-white">
            Game testing tools
          </h2>

          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            Test player positions, scenario retries and microphone settings.
            These controls only affect this local prototype.
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

      {/* ACTIVE PLAYER */}
      <div className="mb-4 rounded-xl border border-[#B67DDB] bg-[#B67DDB] p-3">
        <p className="text-[10px] font-black tracking-wider text-[#292D62]">
          ACTIVE PLAYER
        </p>

        <p className="mt-1 text-sm font-bold text-[#292D62]">
          {activePlayer?.name ?? "No active player"}
        </p>

        <p className="mt-1 text-xs text-[#292D62]">
          {activePlayer
            ? `Position ${activePlayer.position}`
            : "No player currently selected"}
        </p>
      </div>

      {/* MICROPHONE SETTING */}
      <div className="mb-4 rounded-xl border border-slate-700 bg-[#0B1422] p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-white">
              Microphone input
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Enable or disable speech-to-text during presentations.
            </p>
          </div>

          <button
            type="button"
            onClick={onToggleMicrophone}
            aria-pressed={microphoneEnabled}
            className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-black transition ${
              microphoneEnabled
                ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-200 hover:bg-emerald-400/25"
                : "border-slate-600 bg-slate-700/60 text-slate-300 hover:bg-slate-700"
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

      {/* PLAYER SELECTION */}
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

      {/* PLAYER POSITION */}
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
          onClick={() =>
            setDestination(String(BOARD_FINISH_POSITION))
          }
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

      {/* SCENARIO RETRY TESTING */}
      <div className="mt-4 rounded-xl border border-amber-400/30 bg-[#0B1422] p-3">
        <p className="text-xs font-black tracking-wider text-amber-300">
          SCENARIO RETRY TEST
        </p>

        <p className="mt-1 text-xs leading-relaxed text-slate-400">
          Simulate a rejected scenario to check whether the player retries
          it on their next turn.
        </p>

        <label
          htmlFor="admin-scenario"
          className="mb-1 mt-3 block text-xs font-bold text-slate-300"
        >
          Select scenario
        </label>

        <select
          id="admin-scenario"
          value={selectedScenarioId}
          onChange={(event) =>
            setSelectedScenarioId(event.target.value)
          }
          className="w-full rounded-lg border border-slate-600 bg-[#101B2D] px-3 py-2 text-sm text-white outline-none focus:border-amber-300"
        >
          {scenarios.map((scenario) => (
            <option key={scenario.id} value={scenario.id}>
              {scenario.title}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleSimulateRetry}
          disabled={disabled || !selectedPlayer || !selectedScenarioId}
          className="mt-3 w-full rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-xs font-black text-[#292D62] transition hover:bg-amber-400/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Simulate Rejected Scenario
        </button>

        <div className="mt-3 rounded-lg border border-slate-700 bg-[#101B2D] p-3">
          {pendingRetry ? (
            <>
              <p className="text-[10px] font-black tracking-wider text-amber-300">
                PENDING RETRY
              </p>

              <p className="mt-1 text-sm font-bold text-white">
                {players.find(
                  (player) => player.id === pendingRetry.playerId
                )?.name ?? "Unknown player"}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {pendingRetry.scenario.title}
              </p>

              <button
                type="button"
                onClick={onClearPendingRetry}
                className="mt-3 w-full rounded-lg border border-red-400/40 bg-red-400/10 px-3 py-2 text-xs font-bold text-red-200 hover:bg-red-400/20"
              >
                Clear Pending Retry
              </button>
            </>
          ) : (
            <p className="text-xs text-slate-400">
              No pending scenario retry.
            </p>
          )}
        </div>
      </div>

      {/* PLAYER TEST STATE */}
      <div className="mt-3 rounded-lg border border-slate-700 bg-[#0B1422] p-3">
        {selectedPlayer ? (
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="text-slate-400">
              Current test state
            </span>

            <span className="font-bold text-white">
              {selectedPlayer.position === BOARD_FINISH_POSITION
                ? `FINISH · #${selectedPlayer.finishOrder ?? "—"}`
                : selectedPlayer.position === BOARD_START_POSITION
                  ? "START"
                  : `Space ${selectedPlayer.position}`}
            </span>
          </div>
        ) : (
          <p className="text-xs text-slate-400">
            No player selected.
          </p>
        )}
      </div>

      <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
        Sending a player to Finish marks them as finished and assigns a
        finishing order. Resetting returns that player to Start.
      </p>
    </section>
  );
}
