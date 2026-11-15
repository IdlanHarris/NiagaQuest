
"use client";

import { useState } from "react";

import GameBoard from "@/components/game/GameBoard";
import ScenarioPopup from "@/components/game/ScenarioPopup";
import PresentationPanel from "@/components/game/PresentationPanel";

import { initialGameState } from "@/lib/initialGame";
import { BOARD_FINISH_POSITION, boardPlots } from "@/lib/board";
import { scenarios } from "@/lib/scenarios";

import type { Scenario } from "@/types/game";

export default function GamePage() {
  const [players, setPlayers] = useState(
    () => initialGameState.players.map((player) => ({ ...player }))
  );

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [nextPosition, setNextPosition] = useState<number | null>(null);
  const [hasRolled, setHasRolled] = useState(false);

  const [currentScenario, setCurrentScenario] =
    useState<Scenario | null>(null);

  const [showPresentation, setShowPresentation] = useState(false);
  const [presentationAnswer, setPresentationAnswer] = useState("");

  const activePlayer = players[currentPlayerIndex];

  function finishTurn() {
    setCurrentScenario(null);
    setShowPresentation(false);
    setPresentationAnswer("");
    setDiceResult(null);
    setNextPosition(null);
    setHasRolled(false);

    setCurrentPlayerIndex(
      (previousIndex) => (previousIndex + 1) % players.length
    );
  }

  function rollDice() {
    if (hasRolled || currentScenario || !activePlayer) return;

    const result = Math.floor(Math.random() * 6) + 1;

    const destination = Math.min(
      activePlayer.position + result,
      BOARD_FINISH_POSITION
    );

    setDiceResult(result);
    setNextPosition(destination);
    setHasRolled(true);
  }

  function movePlayer() {
    if (!hasRolled || nextPosition === null || !activePlayer) return;

    const destination = nextPosition;

    setPlayers((previousPlayers) =>
      previousPlayers.map((player, index) => {
        if (index !== currentPlayerIndex) return player;

        return {
          ...player,
          position: destination,
          completedPaths:
            destination === BOARD_FINISH_POSITION
              ? player.completedPaths + 1
              : player.completedPaths,
        };
      })
    );

    setDiceResult(null);
    setNextPosition(null);
    setHasRolled(false);

    const landedPlot = boardPlots[destination - 1];

    if (landedPlot?.type === "scenario") {
      const existingScenario = scenarios.find(
        (scenario) => scenario.id === landedPlot.scenarioId
      );

      const fallbackScenario: Scenario = {
        id: landedPlot.scenarioId ?? `plot-${landedPlot.id}`,
        title: landedPlot.title,
        description: landedPlot.description,
        question: `How would you handle this situation as an entrepreneur: ${landedPlot.description}`,
        npcAnswer:
          "I would assess the situation, identify the main risks, consider practical alternatives and implement a solution that supports the business.",
      };

      setCurrentScenario(existingScenario ?? fallbackScenario);
      return;
    }

    finishTurn();
  }

  function submitPresentation(answer: string) {
    setPresentationAnswer(answer);
  }

  return (
    <main className="min-h-screen bg-[#0B1025] p-4 sm:p-8">
      <div className="max-w-[1800px] mx-auto">

        {/* GAME HEADER */}
        <header className="mb-6 flex flex-wrap justify-between items-center gap-4">
          <div>
            <p className="text-amber-400 text-sm font-bold tracking-widest">
              NIAGAQUEST
            </p>

            <h1 className="text-3xl font-black text-white">
              Game Session
            </h1>
          </div>

          <div className="bg-[#1C2342] border border-slate-700 rounded-xl px-4 py-3">
            <p className="text-xs text-slate-400">
              GAME STATUS
            </p>

            <p className="text-emerald-400 font-bold">
              {showPresentation
                ? presentationAnswer
                  ? "Presentation Submitted"
                  : "Player Presentation"
                : currentScenario
                ? "Scenario Encounter"
                : hasRolled
                ? "Movement Ready"
                : "Waiting for Roll"}
            </p>
          </div>
        </header>

        {/* GAME BOARD AND PLAYER PANEL */}
        <GameBoard
          players={players}
          currentPlayerIndex={currentPlayerIndex}
          diceResult={diceResult}
          nextPosition={nextPosition}
        />

        {/* COMPACT DICE AND MOVEMENT BAR */}
        <section className="bg-[#1C2342] border border-slate-700 rounded-xl px-4 py-3 mt-4">

          <div className="flex flex-wrap lg:flex-nowrap items-center gap-3">

            {/* PLAYER TURN */}
            <div className="min-w-[110px] flex-1">
              <p className="text-slate-400 text-[10px] font-bold tracking-widest">
                PLAYER TURN
              </p>

              <p className="text-white font-bold text-sm mt-1">
                {activePlayer?.name}
              </p>
            </div>

            {/* CURRENT POSITION */}
            <div className="min-w-[110px] flex-1">
              <p className="text-slate-400 text-[10px] font-bold tracking-widest">
                POSITION
              </p>

              <p className="text-white font-bold text-sm mt-1">
                {activePlayer?.position === 0
                  ? "START"
                  : activePlayer?.position === BOARD_FINISH_POSITION
                  ? "FINISH"
                  : `Space ${activePlayer?.position}`}
              </p>
            </div>

            {/* DICE RESULT */}
            <div className="flex items-center gap-2">
              <div className="w-11 h-11 rounded-lg bg-white text-slate-950 flex items-center justify-center text-2xl font-black shadow">
                {diceResult ?? "🎲"}
              </div>

              {hasRolled && nextPosition !== null && (
                <div className="text-xs">
                  <p className="text-slate-400">Destination</p>

                  <p className="text-cyan-300 font-bold">
                    {nextPosition === BOARD_FINISH_POSITION
                      ? "FINISH"
                      : `Space ${nextPosition}`}
                  </p>
                </div>
              )}
            </div>

            {/* ACTION BUTTON */}
            <div className="ml-auto">
              {!hasRolled && !currentScenario && !showPresentation ? (
                <button
                  onClick={rollDice}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-5 py-3 rounded-lg text-sm transition-colors whitespace-nowrap"
                >
                  🎲 Roll Dice
                </button>
              ) : hasRolled ? (
                <button
                  onClick={movePlayer}
                  className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black px-5 py-3 rounded-lg text-sm transition-colors whitespace-nowrap"
                >
                  Move Player →
                </button>
              ) : (
                <span className="text-slate-400 text-xs">
                  Scenario in progress
                </span>
              )}
            </div>

          </div>
        </section>

        {/* SCENARIO POPUP */}
        {currentScenario && !showPresentation && (
          <ScenarioPopup
            scenario={currentScenario}
            onContinue={() => setShowPresentation(true)}
          />
        )}

        {/* PRESENTATION PANEL */}
        {currentScenario && showPresentation && (
          <PresentationPanel
            scenario={currentScenario}
            playerName={activePlayer.name}
            onSubmit={submitPresentation}
          />
        )}

      </div>
    </main>
  );
}
