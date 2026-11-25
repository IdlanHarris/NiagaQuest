
import { useReducer } from "react";
import { initialGameState } from "@/lib/initialGame";
import type { Player } from "@/types/game";
import { BOARD_FINISH_POSITION } from "@/lib/board";

export interface GameRuntimeState {
  players: Player[];
  currentPlayerIndex: number;
  turnSequence: number;
  round: number;
}

export type GameRuntimeAction =
  | {
      type: "SET_PLAYERS";
      players: Player[];
    }
  | {
      type: "MOVE_PLAYER_STEP";
      playerIndex: number;
      position: number;
    }
  | {
      type: "APPLY_PLAYER_EFFECT";
      playerIndex: number;
      moneyChange: number;
      scoreChange: number;
    }
  | {
      type: "FINISH_TURN";
      nextPlayerIndex: number;
      advanceRound: boolean;
    }
  | {
      type: "SET_TURN";
      playerIndex: number;
      incrementSequence: boolean;
    }
  | {
      type: "RESET_GAME";
      players: Player[];
      currentPlayerIndex: number;
    };

export function createInitialRuntimeState(): GameRuntimeState {
  const players = initialGameState.players.map((player) => ({
    ...player,
  }));

  const humanIndex = players.findIndex(
    (player) => player.type === "human"
  );

  return {
    players,
    currentPlayerIndex: humanIndex >= 0 ? humanIndex : 0,
    turnSequence: 0,
    round: 1,
  };
}

export function gameReducer(
  state: GameRuntimeState,
  action: GameRuntimeAction
): GameRuntimeState {
  switch (action.type) {
    case "SET_PLAYERS":
      return {
        ...state,
        players: action.players,
      };

    case "MOVE_PLAYER_STEP": {
      const nextFinishOrder =
        Math.max(
          0,
          ...state.players.map(
            (player) => player.finishOrder ?? 0
          )
        ) + 1;

      return {
        ...state,
        players: state.players.map((player, index) => {
          if (index !== action.playerIndex) return player;

          const reachedFinish =
            action.position === BOARD_FINISH_POSITION &&
            player.status !== "finished";

          return {
            ...player,
            position: action.position,
            status:
              action.position === BOARD_FINISH_POSITION
                ? "finished"
                : player.status,
            finishOrder: reachedFinish
              ? nextFinishOrder
              : player.finishOrder,
            completedPaths: reachedFinish
              ? player.completedPaths + 1
              : player.completedPaths,
          };
        }),
      };
    }

    case "APPLY_PLAYER_EFFECT":
      return {
        ...state,
        players: state.players.map((player, index) =>
          index === action.playerIndex
            ? {
                ...player,
                money: player.money + action.moneyChange,
                score: player.score + action.scoreChange,
              }
            : player
        ),
      };

    case "FINISH_TURN":
      return {
        ...state,
        currentPlayerIndex: action.nextPlayerIndex,
        turnSequence: state.turnSequence + 1,
        round: action.advanceRound
          ? state.round + 1
          : state.round,
      };

    case "SET_TURN":
      return {
        ...state,
        currentPlayerIndex: action.playerIndex,
        turnSequence: action.incrementSequence
          ? state.turnSequence + 1
          : state.turnSequence,
      };

    case "RESET_GAME":
      return {
        players: action.players,
        currentPlayerIndex: action.currentPlayerIndex,
        turnSequence: 0,
        round: 1,
      };

    default:
      return state;
  }
}

export function useGameReducer() {
  return useReducer(
    gameReducer,
    undefined,
    createInitialRuntimeState
  );
}
