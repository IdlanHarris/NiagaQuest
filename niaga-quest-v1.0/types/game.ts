
export type PlayerType = "human" | "npc";

export type PlayerStatus =
  | "playing"
  | "locked"
  | "finished";

export type GamePhase =
  | "waiting"
  | "rolling"
  | "scenario"
  | "presentation"
  | "voting"
  | "result"
  | "finished";

export type VoteChoice = "approve" | "reject";

export type PlotType =
  | "normal"
  | "scenario"
  | "reward"
  | "penalty";

export interface Player {
  id: string;
  name: string;
  type: PlayerType;
  isHost: boolean;

  // 0 = Start, 1–35 = regular plots, 36 = Finish
  position: number;

  status: PlayerStatus;
  score: number;
  money: number;

  // Number of times the player has completed the board
  completedPaths: number;

  finishOrder: number | null;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  question: string;
  npcAnswer: string;
}

export interface Vote {
  voterId: string;
  choice: VoteChoice;
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  currentPhase: GamePhase;
  diceResult: number | null;

  currentScenario: Scenario | null;
  votes: Vote[];

  round: number;
  winnerCount: number;
}
