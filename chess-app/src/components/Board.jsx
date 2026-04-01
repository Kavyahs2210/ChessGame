import React, { useState, useEffect, useCallback } from 'react'
import Square from './Square'
import {
  initialBoard, getLegalMoves, applyMove,
  isInCheck, hasAnyLegalMoves, color, PIECE_UNICODE
} from '../utils/chess'
import { getBestMove } from '../utils/ai'

const DEFAULT_CASTLE = {
  w: { kingSide: true, queenSide: true },
  b: { kingSide: true, queenSide: true },
}
function cloneCastle(cr) { return { w: { ...cr.w }, b: { ...cr.b } } }

// Trial hints: suggested moves for beginners
const TRIAL_HINTS = [
  "Try moving a center pawn forward two squares (e2→e4 or d2→d4).",
  "Develop a Knight — it can jump over pieces!",
  "Move another center pawn or develop your other Knight.",
  "Bring out a Bishop along the diagonal.",
  "Castle to protect your King!",
  "Connect your Rooks by moving your Queen.",
  "Look for pieces you can capture safely.",
  "Keep your pieces active and in the center.",
]

export default function Board({ mode, difficulty, onHome }) {
  const [board, setBoard] = useState(initialBoard())
  const [selected, setSelected] = useState(null)
  const [legalMoves, setLegalMoves] = useState([])
  const [turn, setTurn] = useState('w')
  const [enPassant, setEnPassant] = useState(null)
  const [castleRights, setCastleRights] = useState(DEFAULT_CASTLE)
  const [status, setStatus] = useState(null)
  const [capturedW, setCapturedW] = useState([])
  const [capturedB, setCapturedB] = useState([])
  const [moveHistory, setMoveHistory] = useState([])
  const [promotionPending, setPromotionPending] = useState(null)
  const [aiThinking, setAiThinking] = useState(false)
  const [trialHint, setTrialHint] = useState(0)
  const [showHint, setShowHint] = useState(false)

  const isTrial = mode === 'trial'
  const isSolo = mode === 'solo'
  const legalSet = new Set(legalMoves.map(([r,c]) => `${r},${c}`))

  // AI move trigger
  useEffect(() => {
    if (!isSolo || turn !== 'b' || status === 'checkmate' || status === 'stalemate' || promotionPending) return
    setAiThinking(true)
    const timer = setTimeout(() => {
      const move = getBestMove(board, enPassant, castleRights, difficulty)
      if (move) executeMove(move.from, move.to, move.to[2])
      setAiThinking(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [turn, isSolo, board])

  function resetGame() {
    setBoard(initialBoard()); setSelected(null); setLegalMoves([])
    setTurn('w'); setEnPassant(null); setCastleRights(DEFAULT_CASTLE)
    setStatus(null); setCapturedW([]); setCapturedB([])
    setMoveHistory([]); setPromotionPending(null)
    setTrialHint(0); setShowHint(false)
  }

  function handleClick(row, col) {
    if (promotionPending || status === 'checkmate' || status === 'stalemate') return
    if (isSolo && turn === 'b') return // AI's turn

    const piece = board[row][col]

    if (selected) {
      const move = legalMoves.find(([r,c]) => r===row && c===col)
      if (move) { executeMove(selected, [row, col], move[2]); return }
      if (piece && color(piece) === turn) {
        setSelected([row, col])
        setLegalMoves(getLegalMoves(board, row, col, enPassant, castleRights))
        return
      }
      setSelected(null); setLegalMoves([]); return
    }

    if (piece && color(piece) === turn) {
      setSelected([row, col])
      setLegalMoves(getLegalMoves(board, row, col, enPassant, castleRights))
    }
  }

  function executeMove(from, to, special) {
    const piece = board[from[0]][from[1]]
    const clr = color(piece), t = piece[1]
    const captured = board[to[0]][to[1]]

    let newBoard = applyMove(board, from, to, enPassant)
    const newCastle = cloneCastle(castleRights)
    let newEnPassant = null

    if (special === 'castle-k') {
      const rank = clr === 'w' ? 7 : 0
      newBoard[rank][5] = newBoard[rank][7]; newBoard[rank][7] = null
    }
    if (special === 'castle-q') {
      const rank = clr === 'w' ? 7 : 0
      newBoard[rank][3] = newBoard[rank][0]; newBoard[rank][0] = null
    }

    if (t === 'K') { newCastle[clr].kingSide = false; newCastle[clr].queenSide = false }
    if (t === 'R') {
      if (from[1] === 7) newCastle[clr].kingSide = false
      if (from[1] === 0) newCastle[clr].queenSide = false
    }

    if (t === 'P' && Math.abs(to[0]-from[0]) === 2) newEnPassant = [(from[0]+to[0])/2, to[1]]

    // Pawn promotion
    const movedPiece = newBoard[to[0]][to[1]]
    if (movedPiece === clr+'Q' && t === 'P' && (to[0] === 0 || to[0] === 7)) {
      if (clr === 'w') {
        // Show promotion modal for human
        newBoard[to[0]][to[1]] = null
        setBoard(newBoard)
        setPromotionPending({ board: newBoard, to, clr, from, newCastle, newEnPassant, captured })
        setSelected(null); setLegalMoves([])
        return
      } else {
        newBoard[to[0]][to[1]] = 'bQ' // AI always promotes to Queen
      }
    }

    if (captured) {
      if (color(captured) === 'w') setCapturedW(p => [...p, captured])
      else setCapturedB(p => [...p, captured])
    }
    if (t === 'P' && enPassant && to[0] === enPassant[0] && to[1] === enPassant[1]) {
      const epPiece = clr === 'w' ? 'bP' : 'wP'
      if (clr === 'w') setCapturedB(p => [...p, epPiece])
      else setCapturedW(p => [...p, epPiece])
    }

    finishMove(newBoard, clr, newEnPassant, newCastle, from, to, piece, captured)
  }

  function finishMove(newBoard, clr, newEnPassant, newCastle, from, to, piece, captured) {
    const nextTurn = clr === 'w' ? 'b' : 'w'
    const inCheck = isInCheck(newBoard, nextTurn, newEnPassant)
    const hasLegal = hasAnyLegalMoves(newBoard, nextTurn, newEnPassant, newCastle)
    let newStatus = null
    if (!hasLegal) newStatus = inCheck ? 'checkmate' : 'stalemate'
    else if (inCheck) newStatus = 'check'

    const files = 'abcdefgh'
    const notation = `${PIECE_UNICODE[piece]}${files[from[1]]}${8-from[0]}→${files[to[1]]}${8-to[0]}${captured ? '×' : ''}`
    setMoveHistory(h => [...h, { notation, clr }])

    if (isTrial) setTrialHint(h => Math.min(h+1, TRIAL_HINTS.length-1))

    setBoard(newBoard); setTurn(nextTurn); setEnPassant(newEnPassant)
    setCastleRights(newCastle); setStatus(newStatus)
    setSelected(null); setLegalMoves([])
  }

  function handlePromotion(pieceType) {
    const { board: pb, to, clr, from, newCastle, newEnPassant, captured } = promotionPending
    const newBoard = pb.map(r => [...r])
    newBoard[to[0]][to[1]] = clr + pieceType
    if (captured) {
      if (color(captured) === 'w') setCapturedW(p => [...p, captured])
      else setCapturedB(p => [...p, captured])
    }
    setPromotionPending(null)
    finishMove(newBoard, clr, newEnPassant, newCastle, from, to, clr+'P', captured)
  }

  const inCheckColor = (status === 'check' || status === 'checkmate') ? turn : null
  function getKingSquare(clr) {
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        if (board[r][c] === clr+'K') return `${r},${c}`
    return null
  }
  const kingInCheckSq = inCheckColor ? getKingSquare(inCheckColor) : null

  const modeLabel = isTrial ? '📖 Trial Game' : isSolo ? `🤖 vs AI (${difficulty})` : '👥 Two Players'

  return (
    <div style={{ display:'flex', gap:20, alignItems:'flex-start', flexWrap:'wrap', justifyContent:'center' }}>
      {/* Left panel */}
      <div style={{ display:'flex', flexDirection:'column', gap:12, minWidth:160, maxWidth:180 }}>
        <button onClick={onHome} style={backBtnStyle}>← Home</button>
        <div style={{ color:'#b58863', fontSize:13, fontWeight:'bold' }}>{modeLabel}</div>
        <CapturedPieces pieces={capturedB} label="White captured" />
        <MoveHistory moves={moveHistory} />
        {isTrial && (
          <div style={{ marginTop:8 }}>
            <button onClick={() => setShowHint(h => !h)} style={hintBtnStyle}>
              💡 {showHint ? 'Hide Hint' : 'Show Hint'}
            </button>
            {showHint && (
              <div style={{ background:'rgba(240,217,181,0.1)', border:'1px solid #b58863', borderRadius:8, padding:10, marginTop:8, color:'#f0d9b5', fontSize:13, lineHeight:1.6 }}>
                {TRIAL_HINTS[trialHint]}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Board */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
        <PlayerTag clr="b" turn={turn} status={status} aiThinking={isSolo && aiThinking} isSolo={isSolo} />

        <div style={{
          border:'3px solid #2c2c2c',
          boxShadow:'0 8px 32px rgba(0,0,0,0.6)',
          display:'inline-block', borderRadius:4, overflow:'hidden',
        }}>
          {board.map((rowArr, r) => (
            <div key={r} style={{ display:'flex' }}>
              {rowArr.map((piece, c) => {
                const key = `${r},${c}`
                const isCapture = legalSet.has(key) && !!piece
                return (
                  <Square
                    key={c}
                    piece={piece ? PIECE_UNICODE[piece] : null}
                    isLight={(r+c)%2===0}
                    isSelected={selected?.[0]===r && selected?.[1]===c}
                    isLegal={legalSet.has(key) && !piece}
                    isCapture={isCapture}
                    isCheck={kingInCheckSq === key}
                    onClick={() => handleClick(r, c)}
                    rank={r} file={c} showCoords
                  />
                )
              })}
            </div>
          ))}
        </div>

        <PlayerTag clr="w" turn={turn} status={status} isSolo={isSolo} />

        {(status === 'checkmate' || status === 'stalemate') && (
          <div style={{ textAlign:'center', marginTop:8 }}>
            <div style={{ color:'#f0d9b5', fontSize:20, fontWeight:'bold', marginBottom:10 }}>
              {status === 'checkmate'
                ? `${turn === 'w' ? '⬛ Black' : '⬜ White'} wins by checkmate!`
                : '🤝 Stalemate — Draw!'}
            </div>
            <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
              <button onClick={resetGame} style={actionBtnStyle('#27ae60')}>Play Again</button>
              <button onClick={onHome} style={actionBtnStyle('#b58863')}>Home</button>
            </div>
          </div>
        )}
      </div>

      {/* Right panel */}
      <div style={{ minWidth:160 }}>
        <CapturedPieces pieces={capturedW} label="Black captured" />
      </div>

      {promotionPending && (
        <PromotionModal clr={promotionPending.clr} onSelect={handlePromotion} />
      )}
    </div>
  )
}

function PlayerTag({ clr, turn, status, aiThinking, isSolo }) {
  const isActive = turn === clr && status !== 'checkmate' && status !== 'stalemate'
  const label = clr === 'w' ? '⬜ White' : '⬛ Black'
  const isAI = isSolo && clr === 'b'
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:8,
      color:'#f0d9b5', fontSize:14, fontWeight: isActive ? 'bold' : 'normal',
      opacity: isActive ? 1 : 0.45, transition:'opacity 0.2s',
    }}>
      <div style={{
        width:10, height:10, borderRadius:'50%',
        background: clr === 'w' ? '#f0d9b5' : '#333',
        border:'2px solid #f0d9b5',
        boxShadow: isActive ? '0 0 8px #f6f669' : 'none',
      }} />
      {label} {isAI ? '🤖' : ''}
      {isActive && status === 'check' && <span style={{ color:'#e74c3c', fontSize:12 }}>CHECK!</span>}
      {aiThinking && isAI && <span style={{ color:'#888', fontSize:12 }}>thinking...</span>}
    </div>
  )
}

function CapturedPieces({ pieces, label }) {
  return (
    <div>
      <div style={{ color:'#777', fontSize:11, marginBottom:3 }}>{label}</div>
      <div style={{ fontSize:20, minHeight:24, letterSpacing:1, flexWrap:'wrap', display:'flex' }}>
        {pieces.map((p, i) => <span key={i}>{PIECE_UNICODE[p]}</span>)}
      </div>
    </div>
  )
}

function MoveHistory({ moves }) {
  const ref = React.useRef(null)
  React.useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight }, [moves])
  return (
    <div ref={ref} style={{ color:'#ccc', fontSize:12, maxHeight:260, overflowY:'auto', paddingRight:4 }}>
      <div style={{ color:'#777', fontSize:11, marginBottom:3 }}>Move History</div>
      {moves.map((m, i) => (
        <div key={i} style={{ padding:'1px 0', color: m.clr === 'w' ? '#f0d9b5' : '#b58863' }}>
          {Math.floor(i/2)+1}{i%2===0?'. ':' ... '}{m.notation}
        </div>
      ))}
    </div>
  )
}

function PromotionModal({ clr, onSelect }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100 }}>
      <div style={{ background:'#1e1e2e', borderRadius:14, padding:28, display:'flex', flexDirection:'column', alignItems:'center', gap:16, boxShadow:'0 8px 40px rgba(0,0,0,0.8)', border:'1px solid #444' }}>
        <div style={{ color:'#f0d9b5', fontSize:18, fontWeight:'bold' }}>Promote Pawn</div>
        <div style={{ display:'flex', gap:12 }}>
          {['Q','R','B','N'].map(p => (
            <button key={p} onClick={() => onSelect(p)} style={{
              width:68, height:68, fontSize:46, background:'#2c2c3e',
              border:'2px solid #555', borderRadius:10, cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
              transition:'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background='#444'; e.currentTarget.style.borderColor='#f0d9b5' }}
            onMouseLeave={e => { e.currentTarget.style.background='#2c2c3e'; e.currentTarget.style.borderColor='#555' }}
            >
              {PIECE_UNICODE[clr+p]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const backBtnStyle = {
  background:'transparent', border:'1px solid #444', color:'#aaa',
  padding:'6px 12px', borderRadius:6, cursor:'pointer', fontSize:12, textAlign:'left',
}
const hintBtnStyle = {
  background:'rgba(181,136,99,0.2)', border:'1px solid #b58863',
  color:'#b58863', padding:'6px 12px', borderRadius:6, cursor:'pointer', fontSize:12, width:'100%',
}
const actionBtnStyle = (bg) => ({
  padding:'10px 22px', fontSize:14, cursor:'pointer',
  background: bg, color:'#fff', border:'none', borderRadius:6,
  fontWeight:'bold', letterSpacing:1,
})
