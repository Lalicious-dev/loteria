// client/src/utils/game.js
export function checkWin(board, drawnSet, patterns) {
  for (const pattern of patterns) {
    if (pattern.every(idx => drawnSet.has(board[idx]))) {
      return true;
    }
  }
  return false;
}

export function generateEmptyDrawn() {
  return new Set();
}
