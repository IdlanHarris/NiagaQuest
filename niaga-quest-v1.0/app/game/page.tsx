"use client";

import { useEffect, useRef, useState } from "react";

import GameBoard from "@/components/game/GameBoard";
import ScenarioPopup from "@/components/game/ScenarioPopup";
import PresentationPanel from "@/components/game/PresentationPanel";
import AdminController from "@/components/game/AdminController";

import { initialGameState } from "@/lib/initialGame";
import {
  BOARD_FINISH_POSITION,
  BOARD_START_POSITION,
  boardPlots,
} from "@/lib/board";
import { scenarios } from "@/lib/scenarios";

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
  const [players, setPlayers] = useState(
    () => initialGameState.players.map((player) => ({ ...player }))
  );

  // Start with the human player, even if the player array order changes.
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(() => {
    const humanIndex = initialGameState.players.findIndex(
      (player) => player.type === "human"
    );
    return humanIndex >= 0 ? humanIndex : 0;
  });
  const [turnSequence, setTurnSequence] = useState(0);
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
  const [presentationAnswer, setPresentationAnswer] = useState("");
  const [plotNotice, setPlotNotice] = useState<PlotNotice | null>(null);

  // Scenario evaluation state.
  const [isVoting, setIsVoting] = useState(false);
  const [voteResult, setVoteResult] = useState<VoteResult | null>(null);
  const [pendingRetry, setPendingRetry] = useState<{
    playerId: string;
    scenario: Scenario;
  } | null>(null);

  // Admin tools are local prototype controls for testing game states.
  const [showAdminController, setShowAdminController] = useState(false);

  const activePlayer = players[currentPlayerIndex];
  const humanPlayer = players.find((player) => player.type === "human");
  const allPlayersFinished = players.length > 0 && players.every((player) => player.status === "finished");

  // Reopen a rejected scenario when its original player gets another turn.
  // The player retries from the same plot without rolling the dice again.
  useEffect(() => {
    if (!pendingRetry || activePlayer?.id !== pendingRetry.playerId) return;

    setCurrentScenario(pendingRetry.scenario);
    setShowScenarioPopup(true);
    setShowPresentation(false);
    setPresentationAnswer("");
    setIsVoting(false);
    setVoteResult(null);
    setPendingRetry(null);
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
      voteResult
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
    turnSequence,
    currentScenario,
    plotNotice,
    isRolling,
    isMoving,
    diceResult,
    isVoting,
    voteResult,
  ]);

  function wait(milliseconds: number) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  function finishTurn() {
    setCurrentScenario(null);
    setShowScenarioPopup(true);
    setShowPresentation(false);
    setPresentationAnswer("");
    setIsVoting(false);
    setVoteResult(null);

    setDiceResult(null);
    setNextPosition(null);

    setIsRolling(false);
    setIsMoving(false);

    setCurrentPlayerIndex((previousIndex) => {
      for (let offset = 1; offset <= players.length; offset += 1) {
        const candidateIndex = (previousIndex + offset) % players.length;
        if (players[candidateIndex]?.status !== "finished") {
          return candidateIndex;
        }
      }
      return previousIndex;
    });
    setTurnSequence((previous) => previous + 1);
  }

  async function movePlayerTo(destination: number, fromPosition: number) {
    const boundedDestination = Math.max(
      BOARD_START_POSITION,
      Math.min(destination, BOARD_FINISH_POSITION)
    );

    setNextPosition(boundedDestination);
    setIsMoving(true);

    const currentPosition = fromPosition;
    const direction = boundedDestination >= currentPosition ? 1 : -1;

    for (
      let position = currentPosition + direction;
      direction > 0
        ? position <= boundedDestination
        : position >= boundedDestination;
      position += direction
    ) {
      await wait(400);

      setPlayers((previousPlayers) => {
        const nextFinishOrder =
          Math.max(0, ...previousPlayers.map((player) => player.finishOrder ?? 0)) + 1;

        return previousPlayers.map((player, index) => {
          if (index !== currentPlayerIndex) return player;

          const reachedFinish =
            position === BOARD_FINISH_POSITION &&
            player.status !== "finished";

          return {
            ...player,
            position,
            status:
              position === BOARD_FINISH_POSITION ? "finished" as const : player.status,
            finishOrder: reachedFinish ? nextFinishOrder : player.finishOrder,
            completedPaths: reachedFinish
              ? player.completedPaths + 1
              : player.completedPaths,
          };
        });
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
      setPlayers((previousPlayers) =>
        previousPlayers.map((player, index) =>
          index === currentPlayerIndex
            ? {
                ...player,
                money: player.money + moneyChange,
                score: player.score + scoreChange,
              }
            : player
        )
      );

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
        const finalPosition = await movePlayerTo(adjustedPosition, position);
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
        if (finalPlot && (finalPlot.type === "reward" || finalPlot.type === "penalty")) {
          const finalMoneyChange = finalPlot.effect?.money ?? 0;
          const finalScoreChange = finalPlot.effect?.score ?? 0;

          if (finalMoneyChange !== 0 || finalScoreChange !== 0) {
            setPlayers((previousPlayers) =>
              previousPlayers.map((player, index) =>
                index === currentPlayerIndex
                  ? {
                      ...player,
                      money: player.money + finalMoneyChange,
                      score: player.score + finalScoreChange,
                    }
                  : player
              )
            );

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
      !activePlayer
    ) {
      return;
    }

    const result = Math.floor(Math.random() * 6) + 1;
    const startingPosition = activePlayer.position;
    const destination = Math.min(
      startingPosition + result,
      BOARD_FINISH_POSITION
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
  rollDiceRef.current = rollDice;

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
      const relevantTerms = keywords.filter((keyword) => wordSet.has(keyword)).length;
      const hasReasoning = wordSet.has("because") || wordSet.has("therefore");
      const hasEnoughDetail = words.length >= 18;
      const hasAction = [
        "negotiate", "compare", "research", "review", "reduce",
        "increase", "plan", "monitor", "communicate", "invest",
        "switch", "develop", "implement", "improve", "manage",
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

    setPresentationAnswer(answer.trim());
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
      setPendingRetry({
        playerId: activePlayer.id,
        scenario: currentScenario,
      });
    }

    // Approved: proceed to the next player.
    // Rejected: next player takes a turn; the presenter retries when their
    // turn comes around again, without moving from the scenario plot.
    finishTurn();
  }


  function applyAdminPosition(playerId: string, destination: number) {
    const selectedPlayer = players.find((player) => player.id === playerId);

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
      destination === BOARD_FINISH_POSITION && selectedPlayer.status !== "finished";
    const isLeavingFinish =
      destination !== BOARD_FINISH_POSITION && selectedPlayer.status === "finished";
    const nextFinishOrder =
      Math.max(0, ...players.map((player) => player.finishOrder ?? 0)) + 1;

    const updatedPlayers = players.map((player) => {
      if (player.id !== playerId) return player;

      return {
        ...player,
        position: destination,
        status: destination === BOARD_FINISH_POSITION ? "finished" as const : "playing" as const,
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

    setPlayers(updatedPlayers);

    // If the active player is forced to finish, hand control to the next
    // unfinished player. The final-results overlay appears when everyone is done.
    if (selectedPlayer.id === activePlayer?.id && destination === BOARD_FINISH_POSITION) {
      const nextIndex = updatedPlayers.findIndex(
        (player) => player.status !== "finished"
      );

      setCurrentScenario(null);
      setShowScenarioPopup(false);
      setShowPresentation(false);
      setPresentationAnswer("");
      setIsVoting(false);
      setVoteResult(null);
      setDiceResult(null);
      setNextPosition(null);

      if (nextIndex >= 0) {
        setCurrentPlayerIndex(nextIndex);
        setTurnSequence((previous) => previous + 1);
      }
    }
  }

  function resetAdminPlayer(playerId: string) {
    setPlayers((previousPlayers) =>
      previousPlayers.map((player) =>
        player.id === playerId
          ? {
              ...player,
              position: BOARD_START_POSITION,
              status: "playing",
              finishOrder: null,
              completedPaths: 0,
            }
          : player
      )
    );
  }

  function continueToPresentation() {
    setShowScenarioPopup(false);
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
    <main className="h-screen w-screen overflow-hidden bg-[#0B1220] p-2 sm:p-3">
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

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowAdminController((open) => !open)}
            className="rounded-lg border border-amber-300/40 bg-amber-400/10 px-3 py-2 text-xs font-bold text-amber-200 transition hover:bg-amber-400/20"
          >
            {showAdminController ? "Close Admin" : "Admin"}
          </button>
          <div className="text-right">
            <p className="text-[9px] font-bold tracking-widest text-slate-500">
              GAME STATUS
            </p>
            <p className="text-sm font-bold text-emerald-400">
              {allPlayersFinished
                ? "All Players Finished"
                : isRolling
                ? "Rolling Dice"
                : isMoving
                ? "Player Moving"
                : isVoting
                ? activePlayer?.type === "npc"
                  ? "Your Vote Needed"
                  : "NPC Voting"
                : currentScenario
                ? voteResult
                  ? voteResult.approved
                    ? "Scenario Approved"
                    : "Scenario Rejected"
                  : showPresentation
                  ? "Presentation"
                  : "Scenario Encounter"
                : plotNotice
                ? "Plot Effect"
                : activePlayer?.type === "npc"
                ? "NPC Turn"
                : "Your Turn"}
            </p>
          </div>
          <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
        </div>
      </header>

      {/* ADMIN CONTROLLER: prototype-only testing tools */}
      {showAdminController && (
        <AdminController
          players={players}
          disabled={isRolling || isMoving}
          onMovePlayer={applyAdminPosition}
          onResetPlayer={resetAdminPlayer}
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
          onRollDice={() => rollDice(false)}
        />
      </div>

      {/* PLOT EFFECT RESULT */}
      {plotNotice && (
        <div className="fixed left-1/2 top-5 z-[60] w-[min(420px,calc(100vw-2rem))] -translate-x-1/2">
          <div
            className={`rounded-xl border p-4 shadow-2xl backdrop-blur ${
              plotNotice.kind === "reward"
                ? "border-emerald-400/50 bg-[#142D2A]/95"
                : plotNotice.kind === "penalty"
                ? "border-rose-400/50 bg-[#332127]/95"
                : "border-sky-400/50 bg-[#172B40]/95"
            }`}
          >
            <p
              className={`text-[10px] font-black uppercase tracking-[0.18em] ${
                plotNotice.kind === "reward"
                  ? "text-emerald-300"
                  : plotNotice.kind === "penalty"
                  ? "text-rose-300"
                  : "text-sky-300"
              }`}
            >
              {plotNotice.kind === "reward"
                ? "REWARD RECEIVED"
                : plotNotice.kind === "penalty"
                ? "PENALTY APPLIED"
                : "MOVEMENT EFFECT"}
            </p>
            <h3 className="mt-1 text-base font-black text-white">
              {plotNotice.title}
            </h3>
            <p className="mt-1 text-sm text-slate-300">
              {plotNotice.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm font-bold">
              {plotNotice.moneyChange !== 0 && (
                <span
                  className={
                    plotNotice.moneyChange > 0
                      ? "text-emerald-300"
                      : "text-rose-300"
                  }
                >
                  {plotNotice.moneyChange > 0 ? "+" : ""}
                  RM{plotNotice.moneyChange}
                </span>
              )}
              {plotNotice.scoreChange !== 0 && (
                <span
                  className={
                    plotNotice.scoreChange > 0
                      ? "text-emerald-300"
                      : "text-rose-300"
                  }
                >
                  {plotNotice.scoreChange > 0 ? "+" : ""}
                  {plotNotice.scoreChange} points
                </span>
              )}
              {plotNotice.movementChange !== 0 && (
                <span className="text-sky-200">
                  {plotNotice.movementChange > 0 ? "+" : ""}
                  {plotNotice.movementChange} spaces
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SCENARIO POPUP */}
      {currentScenario && !showPresentation && showScenarioPopup && (
        <ScenarioPopup
          scenario={currentScenario}
          onContinue={continueToPresentation}
          onHide={() => setShowScenarioPopup(false)}
        />
      )}

      {/* REOPEN TAB */}
      {currentScenario && !showPresentation && !showScenarioPopup && (
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
          <span className="ml-1 text-xs font-bold text-slate-300">Open ↗</span>
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
        />
      )}

      {/* FINAL RESULTS */}
      {allPlayersFinished && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050B14]/90 p-4 backdrop-blur-sm">
          <section className="w-full max-w-xl rounded-2xl border border-amber-300/40 bg-[#101B2D] p-6 shadow-2xl">
            <p className="text-center text-[10px] font-black tracking-[0.25em] text-amber-300">
              NIAGAQUEST · GAME COMPLETED
            </p>
            <h2 className="mt-2 text-center text-3xl font-black text-white">
              All Players Finished!
            </h2>
            <p className="mt-2 text-center text-sm text-slate-400">
              The game is complete. Here is the final finishing order.
            </p>

            <div className="mt-6 space-y-2">
              {[...players]
                .sort(
                  (a, b) =>
                    (a.finishOrder ?? Number.MAX_SAFE_INTEGER) -
                    (b.finishOrder ?? Number.MAX_SAFE_INTEGER)
                )
                .map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between rounded-xl border border-slate-700 bg-[#0B1422] px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-bold text-white">{player.name}</p>
                      <p className="text-xs text-slate-400">
                        {player.type === "human" ? "Human Player" : "NPC"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-amber-300">
                        #{player.finishOrder ?? "—"}
                      </p>
                      <p className="text-[10px] text-slate-500">Finish order</p>
                    </div>
                  </div>
                ))}
            </div>

            <p className="mt-5 text-center text-xs font-bold text-emerald-300">
              GAME STATUS: COMPLETED
            </p>
          </section>
        </div>
      )}
    </main>
  );
}
