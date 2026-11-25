
import type { Player } from "@/types/game";

interface NextTurnResult {
  nextPlayerIndex: number;
  shouldAdvanceRound: boolean;
}

/**
 * Finds the next player who has not finished the game.
 * This preserves the existing turn-selection behaviour.
 */
export function getNextTurn(
  players: Player[],
  currentPlayerIndex: number
): NextTurnResult {
  if (players.length === 0) {
    return {
      nextPlayerIndex: 0,
      shouldAdvanceRound: false,
    };
  }

  let nextPlayerIndex = currentPlayerIndex;

  for (let offset = 1; offset <= players.length; offset += 1) {
    const candidateIndex =
      (currentPlayerIndex + offset) % players.length;

    if (players[candidateIndex]?.status !== "finished") {
      nextPlayerIndex = candidateIndex;
      break;
    }
  }

  const shouldAdvanceRound =
    nextPlayerIndex <= currentPlayerIndex &&
    players[nextPlayerIndex]?.status !== "finished";

  return {
    nextPlayerIndex,
    shouldAdvanceRound,
  };
}
