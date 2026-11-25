
"use client";

import { useEffect, useRef, useState } from "react";

import GameBoard from "@/components/game/GameBoard";
import ScenarioPopup from "@/components/game/ScenarioPopup";
import PresentationPanel from "@/components/game/PresentationPanel";
import AdminController from "@/components/game/AdminController";
import TurnIndicator from "@/components/game/TurnIndicator";
import PlotNotification from "@/components/game/PlotNotification";
import FinalResults from "@/components/game/FinalResults";
import { useGameReducer } from "@/hooks/useGameReducer";

import { initialGameState } from "@/lib/initialGame";
import { getNextTurn } from "@/lib/gameEngine";
import {
  BOARD_FINISH_POSITION,
  BOARD_START_POSITION,
  boardPlots,
} from "@/lib/board";
import { scenarios } from "@/lib/scenarios";
import {
  clampBoardPosition,
  calculateDiceDestination,
  getMovementPath,
} from "@/lib/gameMovement";

import type { Scenario, Vote, VoteChoice } from "@/types/game";

type PlotNotice = {
  title: string;
  description: string;
  moneyChange: number;
  scoreChange: number;
  movementChange: number;
  kind: "reward" | "penalty" | "movement" | "normal";
};

type VoteResult = {
  votes: Vote[];
  approved: boolean;
};

export default function GamePage() {
  const [gameState, dispatch] = useGameReducer();

  const {
  players,
  currentPlayerIndex,
  turnSequence,
  round,
} = gameState;
  const [theme, setTheme] = useState<"classic" | "modern">("classic");

  const npcTurnStartedRef = useRef<string | null>(null);
  const rollDiceRef = useRef<(isAutomatic?: boolean) => Promise<void>>(
    async () => {}
  );

  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [nextPosition, setNextPosition] = useState<number | null>(null);

  const [isRolling, setIsRolling] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  const [currentScenario, setCurrentScenario] =
    useState<Scenario | null>(null);

  const [showScenarioPopup, setShowScenarioPopup] = useState(true);
  const [showPresentation, setShowPresentation] = useState(false);
  const [plotNotice, setPlotNotice] = useState<PlotNotice | null>(null);

  // Scenario evaluation state. 
  const [isVoting, setIsVoting] = useState(false);
  const [voteResult, setVoteResult] = useState<VoteResult | null>(null);

  // Stores a rejected scenario for the player's next turn.
  const [pendingRetry, setPendingRetry] = useState<{
    playerId: string;
    scenario: Scenario;
  } | null>(null);

  // Admin tools are local prototype controls for testing game states.
  const [showAdminController, setShowAdminController] = useState(false);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("niagaquest-theme");

    if (savedTheme !== "classic" && savedTheme !== "modern") return;

    const timer = window.setTimeout(() => setTheme(savedTheme), 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("niagaquest-theme", theme);
  }, [theme]);

  const activePlayer = players[currentPlayerIndex];

  const humanPlayer = players.find(
    (player) => player.type === "human"
  );

  const allPlayersFinished =
    players.length > 0 &&
    players.every((player) => player.status === "finished");

  const gameStatus =
    allPlayersFinished ? "Completed" :
    isRolling ? "Rolling dice" :
    isMoving ? "Player moving" :
    isVoting
      ? activePlayer?.type === "npc"
        ? "Your vote needed"
        : "NPC voting"
      :
    voteResult
      ? voteResult.approved
        ? "Scenario approved"
        : "Scenario rejected"
      :
    showPresentation ? "Presentation" :
    currentScenario ? "Scenario encounter" :
    plotNotice ? "Plot effect" :
    activePlayer?.type === "npc" ? "NPC turn" : "Your turn";

  // Reopen a rejected scenario when its original player gets another turn.
  // The player retries from the same plot without rolling the dice again.
  useEffect(() => {
    if (!pendingRetry || activePlayer?.id !== pendingRetry.playerId) return;

    const timer = window.setTimeout(() => {
      setCurrentScenario(pendingRetry.scenario);
      setShowScenarioPopup(true);
      setShowPresentation(false);
      setIsVoting(false);
      setVoteResult(null);
      setPendingRetry(null);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [activePlayer?.id, pendingRetry]);

  // Automatically run NPC turns. The human player still rolls manually.
  useEffect(() => {
    if (
      activePlayer?.type !== "npc" ||
      activePlayer?.status === "finished" ||
      currentScenario ||
      plotNotice ||
      isRolling ||
      isMoving ||
      diceResult !== null ||
      isVoting ||
      voteResult ||
      pendingRetry?.playerId === activePlayer?.id
    ) {
      return;
    }

    const turnKey = `${turnSequence}:${activePlayer.id}`;

    if (npcTurnStartedRef.current === turnKey) return;

    const timer = window.setTimeout(() => {
      if (npcTurnStartedRef.current === turnKey) return;

      npcTurnStartedRef.current = turnKey;
      void rollDiceRef.current(true);
    }, 900);

    return () => window.clearTimeout(timer);
  }, [
    activePlayer?.id,
    activePlayer?.type,
    activePlayer?.status,
    turnSequence,
    currentScenario,
    plotNotice,
    isRolling,
    isMoving,
    diceResult,
    isVoting,
    voteResult,
    pendingRetry,
  ]);

  function wait(milliseconds: number) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }


  function finishTurn() {
    setCurrentScenario(null);
    setShowScenarioPopup(false);
    setShowPresentation(false);
    setIsVoting(false);
    setVoteResult(null);
    setDiceResult(null);
    setNextPosition(null);
    setIsRolling(false);
    setIsMoving(false);

    const {
      nextPlayerIndex,
      shouldAdvanceRound,
    } = getNextTurn(players, currentPlayerIndex);

    dispatch({
      type: "FINISH_TURN",
      nextPlayerIndex,
      advanceRound: shouldAdvanceRound,
    });
  }

  async function movePlayerTo(
    destination: number,
    fromPosition: number
  ) {
    const boundedDestination = clampBoardPosition(destination);

    setNextPosition(boundedDestination);
    setIsMoving(true);

    const movementPath = getMovementPath(
      fromPosition,
      boundedDestination
    );

    for (const position of movementPath) {
      await wait(400);

      dispatch({
        type: "MOVE_PLAYER_STEP",
        playerIndex: currentPlayerIndex,
        position,
      });
    }

    setIsMoving(false);

    return boundedDestination;
  }

  async function showPlotResult(notice: PlotNotice) {
    setPlotNotice(notice);
    await wait(2400);
    setPlotNotice(null);
  }

  async function resolveLanding(position: number) {
    const landedPlot = boardPlots[position - 1];

    if (!landedPlot) {
      finishTurn();
      return;
    }

    // Scenario plots pause the turn and open the scenario popup.
    if (landedPlot.type === "scenario") {
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
      setShowScenarioPopup(true);
      return;
    }

    const effect = landedPlot.effect;
    const moneyChange = effect?.money ?? 0;
    const scoreChange = effect?.score ?? 0;
    const movementChange = effect?.movement ?? 0;

    // Apply money and score effects to the active player.
    if (moneyChange !== 0 || scoreChange !== 0) {
      
      dispatch({
        type: "APPLY_PLAYER_EFFECT",
        playerIndex: currentPlayerIndex,
        moneyChange,
        scoreChange,
      });

      await showPlotResult({
        title: landedPlot.title,
        description: landedPlot.description,
        moneyChange,
        scoreChange,
        movementChange: 0,
        kind: landedPlot.type === "reward" ? "reward" : "penalty",
      });
    }

    // Apply a normal plot's movement modifier once.
    if (movementChange !== 0) {
      const adjustedPosition = Math.max(
        BOARD_START_POSITION,
        Math.min(position + movementChange, BOARD_FINISH_POSITION)
      );

      await showPlotResult({
        title: landedPlot.title,
        description: landedPlot.description,
        moneyChange: 0,
        scoreChange: 0,
        movementChange,
        kind: "movement",
      });

      if (adjustedPosition !== position) {
        const finalPosition = await movePlayerTo(
          adjustedPosition,
          position
        );

        // Do not chain another movement modifier from the plot reached by
        // this bonus movement. Resolve a scenario there if one is reached.
        const finalPlot = boardPlots[finalPosition - 1];

        if (finalPlot?.type === "scenario") {
          const matchedScenario = scenarios.find(
            (scenario) => scenario.id === finalPlot.scenarioId
          );

          setCurrentScenario(
            matchedScenario ?? {
              id: finalPlot.scenarioId ?? `plot-${finalPlot.id}`,
              title: finalPlot.title,
              description: finalPlot.description,
              question: `How would you handle this situation as an entrepreneur: ${finalPlot.description}`,
              npcAnswer:
                "I would assess the situation, identify the main risks, consider practical alternatives and implement a solution that supports the business.",
            }
          );

          setShowScenarioPopup(true);
          return;
        }

        // Resolve money and score on the space reached by bonus movement.
        // Movement modifiers are deliberately not chained.
        if (
          finalPlot &&
          (finalPlot.type === "reward" || finalPlot.type === "penalty")
        ) {
          const finalMoneyChange = finalPlot.effect?.money ?? 0;
          const finalScoreChange = finalPlot.effect?.score ?? 0;

          if (finalMoneyChange !== 0 || finalScoreChange !== 0) {
            
            dispatch({
              type: "APPLY_PLAYER_EFFECT",
              playerIndex: currentPlayerIndex,
              moneyChange: finalMoneyChange,
              scoreChange: finalScoreChange,
            });

            await showPlotResult({
              title: finalPlot.title,
              description: finalPlot.description,
              moneyChange: finalMoneyChange,
              scoreChange: finalScoreChange,
              movementChange: 0,
              kind: finalPlot.type,
            });
          }
        }
      }
    }

    finishTurn();
  }

  async function rollDice(isAutomatic = false) {
    if (
      (activePlayer?.type === "npc" && !isAutomatic) ||
      (activePlayer?.type === "human" && isAutomatic) ||
      isRolling ||
      isMoving ||
      diceResult !== null ||
      currentScenario ||
      plotNotice ||
      !activePlayer ||
      pendingRetry?.playerId === activePlayer.id
    ) {
      return;
    }

    const result = Math.floor(Math.random() * 6) + 1;
    const startingPosition = activePlayer.position;

    const destination = calculateDiceDestination(
      startingPosition,
      result
    );

    // Roll first. Do not reveal the destination until the dice stops.
    setNextPosition(null);
    setIsRolling(true);

    await wait(3000);

    setDiceResult(result);
    setIsRolling(false);

    await wait(250);

    setNextPosition(destination);

    await wait(450);

    await movePlayerTo(destination, startingPosition);
    await resolveLanding(destination);
  }

  // Keep the latest roll handler available to the automatic NPC-turn effect.
  useEffect(() => {
    rollDiceRef.current = rollDice;
  });

  function createNpcVotes(answer: string, npcVoters: typeof players): Vote[] {
    const words = answer.toLowerCase().match(/[a-z]+/g) ?? [];
    const wordSet = new Set(words);

    const roleKeywords = [
      // Finance
      ["cost", "budget", "profit", "supplier", "negotiate", "expense", "price"],
      // Marketing and customers
      ["customer", "quality", "satisfaction", "market", "feedback", "brand", "sales"],
      // Operations
      ["implement", "process", "staff", "resource", "step", "operation", "manage"],
      // Innovation
      ["innovation", "technology", "creative", "new", "different", "develop", "improve"],
      // Sustainability
      ["sustainability", "environment", "waste", "ethical", "long", "responsible", "community"],
    ];

    return npcVoters.map((voter) => {
      const npcIndex = players
        .filter((player) => player.type === "npc")
        .findIndex((player) => player.id === voter.id);

      const keywords = roleKeywords[Math.max(0, npcIndex)] ?? roleKeywords[0];

      const relevantTerms = keywords.filter(
        (keyword) => wordSet.has(keyword)
      ).length;

      const hasReasoning =
        wordSet.has("because") || wordSet.has("therefore");

      const hasEnoughDetail = words.length >= 18;

      const hasAction = [
        "negotiate",
        "compare",
        "research",
        "review",
        "reduce",
        "increase",
        "plan",
        "monitor",
        "communicate",
        "invest",
        "switch",
        "develop",
        "implement",
        "improve",
        "manage",
      ].some((word) => wordSet.has(word));

      // Each NPC weighs their own area of expertise, plus clarity and reasoning.
      const score =
        relevantTerms * 2 +
        Number(hasReasoning) +
        Number(hasEnoughDetail) +
        Number(hasAction);

      // A score of 3 or more is a positive recommendation.
      const choice: VoteChoice = score >= 3 ? "approve" : "reject";

      return { voterId: voter.id, choice };
    });
  }

  function submitPresentation(answer: string) {
    if (!currentScenario || !activePlayer || !answer.trim()) return;

    setIsVoting(true);
    setVoteResult(null);

    const npcVoters = players.filter(
      (player) => player.id !== activePlayer.id && player.type === "npc"
    );

    const generatedVotes = createNpcVotes(answer.trim(), npcVoters);

    window.setTimeout(() => {
      const approveCount = generatedVotes.filter(
        (vote) => vote.choice === "approve"
      ).length;

      setVoteResult({
        votes: generatedVotes,
        approved: approveCount > generatedVotes.length / 2,
      });

      setIsVoting(false);
    }, 1400);
  }

  function submitHumanVote(choice: VoteChoice) {
    if (
      !currentScenario ||
      activePlayer?.type !== "npc" ||
      !humanPlayer ||
      isVoting ||
      voteResult
    ) {
      return;
    }

    setIsVoting(true);

    const npcVoters = players.filter(
      (player) => player.type === "npc" && player.id !== activePlayer.id
    );

    const npcVotes = createNpcVotes(
      currentScenario.npcAnswer,
      npcVoters
    );

    const allVotes: Vote[] = [
      ...npcVotes,
      { voterId: humanPlayer.id, choice },
    ];

    window.setTimeout(() => {
      const approveCount = allVotes.filter(
        (vote) => vote.choice === "approve"
      ).length;

      setVoteResult({
        votes: allVotes,
        approved: approveCount > allVotes.length / 2,
      });

      setIsVoting(false);
    }, 1400);
  }

  function continueAfterVoting() {
    if (!voteResult || !currentScenario || !activePlayer) return;

    if (!voteResult.approved) {
      // Save the rejected scenario for the player's next turn.
      setPendingRetry({
        playerId: activePlayer.id,
        scenario: currentScenario,
      });
    } else {
      // Clear any previous retry after the player passes.
      setPendingRetry((previous) =>
        previous?.playerId === activePlayer.id ? null : previous
      );
    }

    // Move to the next player without changing the rejected player's position.
    finishTurn();
  }

  // Admin testing function: simulate a rejected scenario.
  function simulateRejectedScenario(playerId: string, scenarioId: string) {
    const selectedScenario = scenarios.find(
      (scenario) => scenario.id === scenarioId
    );

    if (!selectedScenario) return;

    setPendingRetry({
      playerId,
      scenario: selectedScenario,
    });
  }

  // Admin testing function: clear the pending retry.
  function clearPendingRetry() {
    setPendingRetry(null);
  }

  function applyAdminPosition(playerId: string, destination: number) {
    const selectedPlayer = players.find(
      (player) => player.id === playerId
    );

    if (
      !selectedPlayer ||
      !Number.isInteger(destination) ||
      destination < BOARD_START_POSITION ||
      destination > BOARD_FINISH_POSITION ||
      isRolling ||
      isMoving
    ) {
      return;
    }

    const isNewFinish =
      destination === BOARD_FINISH_POSITION &&
      selectedPlayer.status !== "finished";

    const isLeavingFinish =
      destination !== BOARD_FINISH_POSITION &&
      selectedPlayer.status === "finished";

    const nextFinishOrder =
      Math.max(
        0,
        ...players.map((player) => player.finishOrder ?? 0)
      ) + 1;

    const updatedPlayers = players.map((player) => {
      if (player.id !== playerId) return player;

      return {
        ...player,
        position: destination,
        status:
          destination === BOARD_FINISH_POSITION
            ? "finished" as const
            : "playing" as const,
        finishOrder: isNewFinish
          ? nextFinishOrder
          : isLeavingFinish
            ? null
            : player.finishOrder,
        completedPaths: isNewFinish
          ? player.completedPaths + 1
          : isLeavingFinish
            ? Math.max(0, player.completedPaths - 1)
            : player.completedPaths,
      };
    });

    dispatch({
      type: "SET_PLAYERS",
      players: updatedPlayers,
    });

    // If the active player is forced to finish, hand control to the next
    // unfinished player. The final-results overlay appears when everyone is done.
    if (
      selectedPlayer.id === activePlayer?.id &&
      destination === BOARD_FINISH_POSITION
    ) {
      const nextIndex = updatedPlayers.findIndex(
        (player) => player.status !== "finished"
      );

      setCurrentScenario(null);
      setShowScenarioPopup(false);
      setShowPresentation(false);
      setIsVoting(false);
      setVoteResult(null);
      setDiceResult(null);
      setNextPosition(null);
      setPendingRetry(null);

      dispatch({
        type: "SET_TURN",
        playerIndex: nextIndex,
        incrementSequence: true,
      });
    }
  }

  function resetAdminPlayer(playerId: string) {
    const resetIndex = players.findIndex(
      (player) => player.id === playerId
    );

    dispatch({
      type: "SET_PLAYERS",
      players: players.map((player) =>
        player.id === playerId
          ? {
              ...player,
              position: BOARD_START_POSITION,
              status: "playing",
              finishOrder: null,
              completedPaths: 0,
            }
          : player
      ),
    });

    if (resetIndex >= 0) {
      dispatch({
        type: "SET_TURN",
        playerIndex: resetIndex,
        incrementSequence: true,
      });
      setCurrentScenario(null);
      setShowScenarioPopup(false);
      setShowPresentation(false);
      setIsVoting(false);
      setVoteResult(null);
      setDiceResult(null);
      setNextPosition(null);
      setPendingRetry(null);
    }
  }

  function restartGame() {
    const freshPlayers = initialGameState.players.map(
      (player) => ({ ...player })
    );

    const firstHuman = freshPlayers.findIndex(
      (player) => player.type === "human"
    );

    dispatch({
      type: "RESET_GAME",
      players: freshPlayers,
      currentPlayerIndex: firstHuman >= 0 ? firstHuman : 0,
    });

    npcTurnStartedRef.current = null;

    setDiceResult(null);
    setNextPosition(null);
    setIsRolling(false);
    setIsMoving(false);

    setCurrentScenario(null);
    setShowScenarioPopup(false);
    setShowPresentation(false);
    setPlotNotice(null);

    setIsVoting(false);
    setVoteResult(null);
    setPendingRetry(null);

    setShowAdminController(false);
  }

  function continueToPresentation() {
    setShowScenarioPopup(true);
    setShowPresentation(true);
  }

  function reopenScenario() {
    setShowScenarioPopup(true);
  }

  function backToScenario() {
    setShowPresentation(false);
    setShowScenarioPopup(true);
  }

  function closePresentation() {
    setShowPresentation(false);
    setShowScenarioPopup(false);
  }

  return (
    <main
      data-theme={theme}
      className="nq-game-shell h-screen w-screen overflow-hidden bg-[#0B1220] p-2 sm:p-3"
    >
      {/* GAME HEADER */}
      <header className="mb-2 flex h-[65px] items-center justify-between gap-4 px-2">
        <div>
          <p className="text-[10px] font-black tracking-[0.25em] text-amber-400">
            NIAGAQUEST
          </p>

          <h1 className="text-2xl font-black tracking-tight text-white">
            Business Adventure
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="flex items-center rounded-lg border border-slate-700 bg-[#172438] p-1"
            aria-label="Choose visual theme"
          >
            <button
              type="button"
              onClick={() => setTheme("classic")}
              aria-pressed={theme === "classic"}
              className={`rounded-md px-3 py-2 text-[10px] font-black transition ${
                theme === "classic"
                  ? "bg-amber-300 text-slate-950"
                  : "text-slate-300 hover:bg-slate-700/70"
              }`}
            >
              Classic
            </button>

            <button
              type="button"
              onClick={() => setTheme("modern")}
              aria-pressed={theme === "modern"}
              className={`rounded-md px-3 py-2 text-[10px] font-black transition ${
                theme === "modern"
                  ? "bg-cyan-300 text-slate-950"
                  : "text-slate-300 hover:bg-slate-700/70"
              }`}
            >
              Modern
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowAdminController((open) => !open)}
            className="rounded-lg border border-[#B67DDB] bg-[#B67DDB] px-3 py-2 text-xs font-bold text-[#292D62] transition hover:bg-[#A66ACD]"
          >
            {showAdminController ? "Close Admin" : "Admin"}
          </button>

          <TurnIndicator
            player={allPlayersFinished ? undefined : activePlayer}
            round={round}
            gameStatus={gameStatus}
          />
        </div>
      </header>

      {/* ADMIN CONTROLLER: prototype-only testing tools */}
      {showAdminController && (
        <AdminController
          players={players}
          disabled={isRolling || isMoving}
          activePlayerId={activePlayer?.id}
          pendingRetry={pendingRetry}
          onMovePlayer={applyAdminPosition}
          onResetPlayer={resetAdminPlayer}
          microphoneEnabled={microphoneEnabled}
          onToggleMicrophone={() =>
            setMicrophoneEnabled((enabled) => !enabled)
          }
          onSimulateRejectedScenario={simulateRejectedScenario}
          onClearPendingRetry={clearPendingRetry}
          onClose={() => setShowAdminController(false)}
        />
      )}

      {/* MAIN GAME BOARD */}
      <div className="h-[calc(100%-77px)] min-h-0">
        <GameBoard
          players={players}
          currentPlayerIndex={currentPlayerIndex}
          diceResult={diceResult}
          nextPosition={nextPosition}
          isRolling={isRolling}
          isMoving={isMoving}
          round={round}
          gameStatus={gameStatus}
          onRollDice={() => rollDice(false)}
        />
      </div>

      {/* PLOT EFFECT FEEDBACK */}
      {plotNotice && <PlotNotification notice={plotNotice} />}

      {/* SCENARIO POPUP */}
      {currentScenario && showScenarioPopup && (
        <ScenarioPopup
          scenario={currentScenario}
          isBackground={showPresentation}
          onContinue={continueToPresentation}
          onHide={() => setShowScenarioPopup(false)}
        />
      )}

      {/* REOPEN TAB */}
      {currentScenario &&
        !showPresentation &&
        !showScenarioPopup && (
          <button
            type="button"
            onClick={reopenScenario}
            className="fixed bottom-5 left-5 z-50 flex max-w-[min(340px,calc(100vw-2.5rem))] items-center gap-3 rounded-xl border border-slate-500/80 bg-[#172438] px-4 py-3 text-left shadow-2xl transition hover:border-amber-300/80 hover:bg-[#202D40] focus:outline-none focus:ring-2 focus:ring-amber-300"
            aria-label="Reopen current business scenario"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-300/30 bg-amber-400/10 text-lg text-amber-300">
              ▤
            </span>

            <span className="min-w-0">
              <span className="block text-[9px] font-black tracking-[0.15em] text-amber-300">
                SCENARIO MINIMISED
              </span>

              <span className="block truncate text-sm font-bold text-white">
                {currentScenario.title}
              </span>
            </span>

            <span className="ml-1 text-xs font-bold text-slate-300">
              Open ↗
            </span>
          </button>
        )}

      {/* PRESENTATION PANEL */}
      {currentScenario && showPresentation && (
        <PresentationPanel
          scenario={currentScenario}
          playerName={activePlayer.name}
          onSubmit={submitPresentation}
          isVoting={isVoting}
          voteResult={voteResult}
          voterNames={Object.fromEntries(
            players.map((player) => [player.id, player.name])
          )}
          isNpcPresenter={activePlayer.type === "npc"}
          npcAnswer={currentScenario.npcAnswer}
          onHumanVote={submitHumanVote}
          onContinue={continueAfterVoting}
          onBack={backToScenario}
          onClose={closePresentation}
          microphoneEnabled={microphoneEnabled}
        />
      )}

      {/* FINAL RESULTS */}
      {allPlayersFinished && (
        <FinalResults
          players={players}
          onRestart={restartGame}
        />
      )}
    </main>
  );
}
