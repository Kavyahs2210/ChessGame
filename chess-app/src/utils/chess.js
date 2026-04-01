export const PIECE_UNICODE = {
  wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
  bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟',
}

export function initialBoard() {
  const b = Array(8).fill(null).map(() => Array(8).fill(null))
  const back = ['R','N','B','Q','K','B','N','R']
  back.forEach((p, c) => { b[0][c] = 'b'+p; b[7][c] = 'w'+p })
  for (let c = 0; c < 8; c++) { b[1][c] = 'bP'; b[6][c] = 'wP' }
  return b
}

export function color(piece) { return piece ? piece[0] : null }
export function type(piece) { return piece ? piece[1] : null }

function inBounds(r, c) { return r >= 0 && r < 8 && c >= 0 && c < 8 }

function rawMoves(board, row, col, enPassant) {
  const piece = board[row][col]
  if (!piece) return []
  const clr = color(piece), t = type(piece)
  const moves = []

  const add = (r, c) => { if (inBounds(r, c) && color(board[r][c]) !== clr) moves.push([r, c]) }
  const slide = (dr, dc) => {
    let r = row+dr, c = col+dc
    while (inBounds(r, c)) {
      if (board[r][c]) { if (color(board[r][c]) !== clr) moves.push([r, c]); break }
      moves.push([r, c]); r += dr; c += dc
    }
  }

  switch (t) {
    case 'P': {
      const dir = clr === 'w' ? -1 : 1
      const startRow = clr === 'w' ? 6 : 1
      if (inBounds(row+dir, col) && !board[row+dir][col]) {
        moves.push([row+dir, col])
        if (row === startRow && !board[row+2*dir][col] && !board[row+dir][col]) moves.push([row+2*dir, col])
      }
      for (const dc of [-1, 1]) {
        const r = row+dir, c = col+dc
        if (inBounds(r, c)) {
          if (board[r][c] && color(board[r][c]) !== clr) moves.push([r, c])
          if (enPassant && enPassant[0] === r && enPassant[1] === c) moves.push([r, c])
        }
      }
      break
    }
    case 'N': for (const [dr,dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) add(row+dr,col+dc); break
    case 'B': for (const [dr,dc] of [[-1,-1],[-1,1],[1,-1],[1,1]]) slide(dr,dc); break
    case 'R': for (const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]) slide(dr,dc); break
    case 'Q': for (const [dr,dc] of [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]) slide(dr,dc); break
    case 'K': for (const [dr,dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) add(row+dr,col+dc); break
  }
  return moves
}

function findKing(board, clr) {
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (board[r][c] === clr+'K') return [r, c]
  return null
}

export function isInCheck(board, clr, enPassant) {
  const king = findKing(board, clr)
  if (!king) return false
  const opp = clr === 'w' ? 'b' : 'w'
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (color(board[r][c]) === opp)
        if (rawMoves(board, r, c, enPassant).some(([mr,mc]) => mr===king[0] && mc===king[1])) return true
  return false
}

export function applyMove(board, from, to, enPassant) {
  const newBoard = board.map(r => [...r])
  const piece = newBoard[from[0]][from[1]]
  const clr = color(piece), t = type(piece)

  // En passant capture
  if (t === 'P' && enPassant && to[0] === enPassant[0] && to[1] === enPassant[1]) {
    const captureRow = clr === 'w' ? to[0]+1 : to[0]-1
    newBoard[captureRow][to[1]] = null
  }

  newBoard[to[0]][to[1]] = piece
  newBoard[from[0]][from[1]] = null

  // Pawn promotion
  if (t === 'P' && (to[0] === 0 || to[0] === 7)) newBoard[to[0]][to[1]] = clr+'Q'

  return newBoard
}

export function getLegalMoves(board, row, col, enPassant, castleRights) {
  const piece = board[row][col]
  if (!piece) return []
  const clr = color(piece), t = type(piece)
  let moves = rawMoves(board, row, col, enPassant)

  // Castling
  if (t === 'K') {
    const rights = castleRights[clr]
    const backRank = clr === 'w' ? 7 : 0
    if (row === backRank && col === 4) {
      // Kingside
      if (rights.kingSide && !board[backRank][5] && !board[backRank][6]) {
        if (!isInCheck(board, clr, enPassant)) {
          const b1 = applyMove(board, [backRank,4], [backRank,5], enPassant)
          if (!isInCheck(b1, clr, enPassant)) moves.push([backRank, 6, 'castle-k'])
        }
      }
      // Queenside
      if (rights.queenSide && !board[backRank][3] && !board[backRank][2] && !board[backRank][1]) {
        if (!isInCheck(board, clr, enPassant)) {
          const b1 = applyMove(board, [backRank,4], [backRank,3], enPassant)
          if (!isInCheck(b1, clr, enPassant)) moves.push([backRank, 2, 'castle-q'])
        }
      }
    }
  }

  // Filter moves that leave king in check
  return moves.filter(([tr, tc]) => {
    const nb = applyMove(board, [row, col], [tr, tc], enPassant)
    return !isInCheck(nb, clr, enPassant)
  })
}

export function hasAnyLegalMoves(board, clr, enPassant, castleRights) {
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (color(board[r][c]) === clr)
        if (getLegalMoves(board, r, c, enPassant, castleRights).length > 0) return true
  return false
}
