import { getLegalMoves, applyMove, isInCheck, color } from './chess'

const PIECE_VALUE = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 0 }

// Center bonus table for positional scoring
const CENTER_BONUS = [
  [0,0,0,0,0,0,0,0],
  [0,1,1,1,1,1,1,0],
  [0,1,2,2,2,2,1,0],
  [0,1,2,3,3,2,1,0],
  [0,1,2,3,3,2,1,0],
  [0,1,2,2,2,2,1,0],
  [0,1,1,1,1,1,1,0],
  [0,0,0,0,0,0,0,0],
]

function evaluate(board) {
  let score = 0
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c]
      if (!p) continue
      const val = PIECE_VALUE[p[1]] + CENTER_BONUS[r][c] * 0.05
      score += color(p) === 'b' ? val : -val
    }
  }
  return score
}

function getAllMoves(board, clr, enPassant, castleRights) {
  const moves = []
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (color(board[r][c]) === clr)
        for (const to of getLegalMoves(board, r, c, enPassant, castleRights))
          moves.push({ from: [r, c], to })
  return moves
}

function minimax(board, depth, alpha, beta, maximizing, enPassant, castleRights) {
  if (depth === 0) return evaluate(board)

  const clr = maximizing ? 'b' : 'w'
  const moves = getAllMoves(board, clr, enPassant, castleRights)

  if (moves.length === 0) {
    if (isInCheck(board, clr, enPassant)) return maximizing ? -100 : 100
    return 0 // stalemate
  }

  if (maximizing) {
    let best = -Infinity
    for (const { from, to } of moves) {
      const nb = applyMove(board, from, to, enPassant)
      best = Math.max(best, minimax(nb, depth-1, alpha, beta, false, null, castleRights))
      alpha = Math.max(alpha, best)
      if (beta <= alpha) break
    }
    return best
  } else {
    let best = Infinity
    for (const { from, to } of moves) {
      const nb = applyMove(board, from, to, enPassant)
      best = Math.min(best, minimax(nb, depth-1, alpha, beta, true, null, castleRights))
      beta = Math.min(beta, best)
      if (beta <= alpha) break
    }
    return best
  }
}

export function getBestMove(board, enPassant, castleRights, difficulty) {
  const depth = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3
  const moves = getAllMoves(board, 'b', enPassant, castleRights)
  if (moves.length === 0) return null

  // Easy: random move
  if (difficulty === 'easy') {
    return moves[Math.floor(Math.random() * moves.length)]
  }

  let bestScore = -Infinity
  let bestMove = moves[0]

  // Shuffle for variety
  moves.sort(() => Math.random() - 0.5)

  for (const move of moves) {
    const nb = applyMove(board, move.from, move.to, enPassant)
    const score = minimax(nb, depth-1, -Infinity, Infinity, false, null, castleRights)
    if (score > bestScore) { bestScore = score; bestMove = move }
  }
  return bestMove
}
