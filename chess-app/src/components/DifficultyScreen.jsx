import React from 'react'

const LEVELS = [
  { key: 'easy', icon: '🌱', label: 'Easy', desc: 'Random moves — great for beginners', color: '#27ae60' },
  { key: 'medium', icon: '⚔️', label: 'Medium', desc: 'Thinks 2 moves ahead', color: '#f39c12' },
  { key: 'hard', icon: '🔥', label: 'Hard', desc: 'Thinks 3 moves ahead — a real challenge', color: '#e74c3c' },
]

export default function DifficultyScreen({ onSelect, onBack }) {
  return (
    <div style={styles.container}>
      <button onClick={onBack} style={styles.backBtn}>← Back</button>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🤖</div>
      <h2 style={styles.title}>Choose Difficulty</h2>
      <p style={styles.sub}>You play as White. AI plays as Black.</p>
      <div style={styles.list}>
        {LEVELS.map(l => (
          <DiffCard key={l.key} {...l} onClick={() => onSelect(l.key)} />
        ))}
      </div>
    </div>
  )
}

function DiffCard({ icon, label, desc, color, onClick }) {
  const [hovered, setHovered] = React.useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:'flex', alignItems:'center', gap:16,
        background: hovered ? color+'22' : 'rgba(255,255,255,0.04)',
        border: `2px solid ${hovered ? color : '#333'}`,
        borderRadius:12, padding:'18px 24px', cursor:'pointer',
        transition:'all 0.2s', width:'100%', maxWidth:380,
        transform: hovered ? 'translateX(4px)' : 'none',
      }}
    >
      <div style={{ fontSize:32 }}>{icon}</div>
      <div>
        <div style={{ color, fontWeight:'bold', fontSize:17 }}>{label}</div>
        <div style={{ color:'#aaa', fontSize:13, marginTop:3 }}>{desc}</div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display:'flex', flexDirection:'column', alignItems:'center',
    justifyContent:'center', minHeight:'100vh', gap:16,
    background:'radial-gradient(ellipse at center, #1a1a2e 0%, #0d0d1a 100%)',
    padding:24,
  },
  backBtn: {
    position:'absolute', top:24, left:24,
    background:'transparent', border:'1px solid #555', color:'#aaa',
    padding:'6px 14px', borderRadius:6, cursor:'pointer', fontSize:13,
  },
  title: { color:'#f0d9b5', fontFamily:'Georgia, serif', fontSize:26, margin:0 },
  sub: { color:'#888', fontSize:14, marginBottom:8 },
  list: { display:'flex', flexDirection:'column', gap:12, width:'100%', alignItems:'center' },
}
