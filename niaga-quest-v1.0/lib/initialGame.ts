
import type { GameState, Player } from "@/types/game";

import {
  BOARD_START_POSITION,
  BOARD_FINISH_POSITION,
} from "@/lib/board";

export { BOARD_FINISH_POSITION };

export const initialPlayers: Player[] = [
  {
    id: "player-1",
    name: "You",
    type: "human",
    isHost: true,
    position: BOARD_START_POSITION,
    status: "playing",
    score: 0,
    money: 1200,
    completedPaths: 0,
    finishOrder: null,
  },
  {
    id: "npc-1",
    name: "Alex",
    type: "npc",
    isHost: false,
    position: BOARD_START_POSITION,
    status: "playing",
    score: 0,
    money: 1200,
    completedPaths: 0,
    finishOrder: null,
  },
  {
    id: "npc-2",
    name: "Sarah",
    type: "npc",
    isHost: false,
    position: BOARD_START_POSITION,
    status: "playing",
    score: 0,
    money: 1200,
    completedPaths: 0,
    finishOrder: null,
  },
  {
    id: "npc-3",
    name: "Daniel",
    type: "npc",
    isHost: false,
    position: BOARD_START_POSITION,
    status: "playing",
    score: 0,
    money: 1200,
    completedPaths: 0,
    finishOrder: null,
  },
];

export const initialGameState: GameState = {
  players: initialPlayers,
  currentPlayerIndex: 0,
  currentPhase: "rolling",
  diceResult: null,
  currentScenario: null,
  votes: [],
  round: 1,
  winnerCount: 0,
};
