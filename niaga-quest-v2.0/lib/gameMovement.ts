
import {
  BOARD_START_POSITION,
  BOARD_FINISH_POSITION,
} from "@/lib/board";

/**
 * Keeps a position within the valid board boundaries.
 */
export function clampBoardPosition(position: number): number {
  return Math.max(
    BOARD_START_POSITION,
    Math.min(position, BOARD_FINISH_POSITION)
  );
}

/**
 * Calculates the destination after rolling the dice.
 */
export function calculateDiceDestination(
  currentPosition: number,
  diceResult: number
): number {
  return clampBoardPosition(currentPosition + diceResult);
}

/**
 * Generates every intermediate position between
 * the starting position and destination.
 *
 * The starting position is excluded.
 * The destination is included.
 */
export function getMovementPath(
  fromPosition: number,
  destination: number
): number[] {
  const start = clampBoardPosition(fromPosition);
  const end = clampBoardPosition(destination);

  const direction = end >= start ? 1 : -1;

  const path: number[] = [];

  for (
    let position = start + direction;
    direction > 0 ? position <= end : position >= end;
    position += direction
  ) {
    path.push(position);
  }

  return path;
}
