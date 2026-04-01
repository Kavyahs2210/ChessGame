import React from 'react'

export default function HomeScreen({ onSelect }) {
  return (
    <div style={styles.container}>
      <div style={styles.logo}>♟</div>
      <h1 style={styles.title}>CHESS</h1>
      <p style={styles.subtitle}>Classic strategy. Timeless game.</p>

      <div style={styles.cards}>
        <ModeCard
          icon="📖"
          title="Learn Chess"
          desc="Rules, tips & a free guided trial game"
          color="#4a90d9"
          onClick={() => onSelect('rules')}
        />
        <ModeCard
          icon="👥"
          title="Two Players"
          desc="Play locally against a friend"
          color="#27ae60"
          onClick={() => onSelect('two-player')}
        />
        <ModeCard
          icon="🤖"
          title="vs Computer"
          desc="Challenge the AI — 3 difficulty levels"
          color="#8e44ad"
          onClick={() => onSelect('solo')}
        />
      </div>
    </div>
  )
}

function ModeCard({ icon, title, desc, color, onClick }) {
  const [hovered, setHovered] = React.useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...styles.card,
        borderColor: color,
        background: hovered ? color + '22' : 'rgba(255,255,255,0.04)',
        transform: hovered ? 'translateY(-4px) scale(1.02)' : 'none',
        boxShadow: hovered ? `0 8px 32px ${color}44` : '0 2px 8px rgba(0,0,0,0.4)',
      }}
    >
      <div style={{ fontSize: 40, marginBottom: 10 }}>{icon}</div>
      <div style={{ ...styles.cardTitle, color }}>{title}</div>
      <div style={styles.cardDesc}>{desc}</div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '100vh',
    background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0d0d1a 100%)',
    padding: 24,
  },
  logo: { fontSize: 72, marginBottom: 8, filter: 'drop-shadow(0 4px 12px rgba(240,217,181,0.4))' },
  title: {
    color: '#f0d9b5', fontFamily: 'Georgia, serif',
    fontSize: 48, letterSpacing: 10, margin: 0,
    textShadow: '0 2px 16px rgba(240,217,181,0.3)',
  },
  subtitle: { color: '#888', fontSize: 15, marginTop: 8, marginBottom: 48, letterSpacing: 2 },
  cards: { display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' },
  card: {
    width: 200, padding: '28px 20px', borderRadius: 14,
    border: '2px solid', cursor: 'pointer',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    textAlign: 'center', transition: 'all 0.2s ease',
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, letterSpacing: 1 },
  cardDesc: { color: '#aaa', fontSize: 13, lineHeight: 1.5 },
}
