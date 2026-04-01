import React, { useState } from 'react'

const RULES = [
  {
    icon: '♟',
    title: 'The Board & Setup',
    content: `Chess is played on an 8×8 board with 64 squares alternating between light and dark colors. Each player starts with 16 pieces: 1 King, 1 Queen, 2 Rooks, 2 Bishops, 2 Knights, and 8 Pawns. White always moves first.`,
  },
  {
    icon: '♔',
    title: 'The King',
    content: `The King moves one square in any direction. The King must never move into check (a square attacked by an opponent). Protecting your King is the most important goal in chess.`,
  },
  {
    icon: '♕',
    title: 'The Queen',
    content: `The Queen is the most powerful piece. She can move any number of squares in any direction — horizontally, vertically, or diagonally — as long as no piece blocks her path.`,
  },
  {
    icon: '♖',
    title: 'The Rook',
    content: `The Rook moves any number of squares horizontally or vertically. Two Rooks working together are extremely powerful, especially in the endgame.`,
  },
  {
    icon: '♗',
    title: 'The Bishop',
    content: `The Bishop moves any number of squares diagonally. Each Bishop stays on its starting color for the entire game. Two Bishops of opposite colors cover the whole board.`,
  },
  {
    icon: '♘',
    title: 'The Knight',
    content: `The Knight moves in an "L" shape — two squares in one direction, then one square perpendicular. Knights are the only pieces that can jump over other pieces.`,
  },
  {
    icon: '♙',
    title: 'The Pawn',
    content: `Pawns move forward one square (or two from their starting position). They capture diagonally forward. When a pawn reaches the opposite end of the board, it promotes to any piece (usually a Queen).`,
  },
  {
    icon: '🏰',
    title: 'Castling',
    content: `Castling is a special move where the King moves two squares toward a Rook, and the Rook jumps to the other side of the King. You can castle if: neither piece has moved, no pieces are between them, the King is not in check, and the King does not pass through check.`,
  },
  {
    icon: '⚡',
    title: 'En Passant',
    content: `If a pawn moves two squares forward from its starting position and lands beside an opponent's pawn, the opponent can capture it "in passing" — moving diagonally to the square the pawn passed through. This must be done immediately on the next move.`,
  },
  {
    icon: '👑',
    title: 'Check & Checkmate',
    content: `When your King is under attack, it is in "check" — you must get out of check immediately. If there is no legal move to escape check, it is "checkmate" and the game is over. The player who delivers checkmate wins.`,
  },
  {
    icon: '🤝',
    title: 'Stalemate & Draw',
    content: `Stalemate occurs when a player has no legal moves but is NOT in check — the game is a draw. Other draws include: insufficient material, threefold repetition, and the 50-move rule.`,
  },
  {
    icon: '💡',
    title: 'Basic Strategy Tips',
    content: `1. Control the center (e4, d4, e5, d5 squares)\n2. Develop your pieces early (Knights and Bishops first)\n3. Castle early to protect your King\n4. Connect your Rooks\n5. Think before you move — look for your opponent's threats\n6. Trade pieces wisely — don't give up valuable pieces for cheap ones`,
  },
]

export default function RulesScreen({ onBack, onStartTrial }) {
  const [page, setPage] = useState(0)
  const rule = RULES[page]

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backBtn}>← Back</button>
        <h2 style={styles.heading}>Chess Rules & Guide</h2>
        <div style={{ width: 80 }} />
      </div>

      {/* Progress dots */}
      <div style={styles.dots}>
        {RULES.map((_, i) => (
          <div
            key={i}
            onClick={() => setPage(i)}
            style={{
              ...styles.dot,
              background: i === page ? '#f0d9b5' : i < page ? '#b58863' : '#444',
              transform: i === page ? 'scale(1.3)' : 'scale(1)',
            }}
          />
        ))}
      </div>

      {/* Rule card */}
      <div style={styles.card}>
        <div style={styles.ruleIcon}>{rule.icon}</div>
        <h3 style={styles.ruleTitle}>{rule.title}</h3>
        <p style={styles.ruleContent}>{rule.content}</p>
      </div>

      {/* Navigation */}
      <div style={styles.nav}>
        <button
          onClick={() => setPage(p => Math.max(0, p-1))}
          disabled={page === 0}
          style={{ ...styles.navBtn, opacity: page === 0 ? 0.3 : 1 }}
        >
          ← Previous
        </button>
        <span style={{ color: '#888', fontSize: 13 }}>{page+1} / {RULES.length}</span>
        {page < RULES.length - 1 ? (
          <button onClick={() => setPage(p => p+1)} style={styles.navBtn}>Next →</button>
        ) : (
          <button onClick={onStartTrial} style={styles.trialBtn}>
            🎮 Start Free Trial Game
          </button>
        )}
      </div>

      {/* Skip to trial anytime */}
      {page < RULES.length - 1 && (
        <button onClick={onStartTrial} style={styles.skipBtn}>
          Skip to Trial Game →
        </button>
      )}
    </div>
  )
}

const styles = {
  container: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    minHeight: '100vh', padding: '24px 16px',
    background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0d0d1a 100%)',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    width: '100%', maxWidth: 600, marginBottom: 24,
  },
  heading: { color: '#f0d9b5', fontFamily: 'Georgia, serif', fontSize: 22, margin: 0 },
  backBtn: {
    background: 'transparent', border: '1px solid #555', color: '#aaa',
    padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13,
  },
  dots: { display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap', justifyContent: 'center' },
  dot: {
    width: 10, height: 10, borderRadius: '50%', cursor: 'pointer',
    transition: 'all 0.2s',
  },
  card: {
    background: 'rgba(255,255,255,0.05)', border: '1px solid #333',
    borderRadius: 16, padding: '36px 32px', maxWidth: 560, width: '100%',
    textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    minHeight: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  },
  ruleIcon: { fontSize: 56, marginBottom: 16 },
  ruleTitle: { color: '#f0d9b5', fontSize: 22, fontFamily: 'Georgia, serif', marginBottom: 16 },
  ruleContent: { color: '#ccc', fontSize: 15, lineHeight: 1.8, whiteSpace: 'pre-line', margin: 0 },
  nav: {
    display: 'flex', alignItems: 'center', gap: 20, marginTop: 28,
  },
  navBtn: {
    background: 'rgba(255,255,255,0.08)', border: '1px solid #555',
    color: '#f0d9b5', padding: '10px 20px', borderRadius: 8,
    cursor: 'pointer', fontSize: 14, transition: 'background 0.15s',
  },
  trialBtn: {
    background: '#27ae60', border: 'none', color: '#fff',
    padding: '12px 24px', borderRadius: 8, cursor: 'pointer',
    fontSize: 15, fontWeight: 'bold', letterSpacing: 1,
  },
  skipBtn: {
    marginTop: 16, background: 'transparent', border: 'none',
    color: '#666', cursor: 'pointer', fontSize: 13, textDecoration: 'underline',
  },
}
