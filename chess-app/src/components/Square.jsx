import React from 'react'

export default function Square({ piece, isLight, isSelected, isLegal, isCapture, isCheck, onClick, rank, file, showCoords }) {
  let bg = isLight ? '#f0d9b5' : '#b58863'
  if (isCheck) bg = '#e74c3c'
  else if (isSelected) bg = isLight ? '#f6f669cc' : '#baca2b'
  
  return (
    <div
      onClick={onClick}
      style={{
        width: 80,
        height: 80,
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        cursor: (piece || isLegal) ? 'pointer' : 'default',
        userSelect: 'none',
        transition: 'background 0.15s',
      }}
    >
      {/* Coordinate labels */}
      {showCoords && file === 0 && (
        <span style={{ position:'absolute', top:3, left:4, fontSize:11, fontWeight:'bold', color: isLight ? '#b58863' : '#f0d9b5', lineHeight:1 }}>
          {8 - rank}
        </span>
      )}
      {showCoords && rank === 7 && (
        <span style={{ position:'absolute', bottom:3, right:4, fontSize:11, fontWeight:'bold', color: isLight ? '#b58863' : '#f0d9b5', lineHeight:1 }}>
          {String.fromCharCode(97 + file)}
        </span>
      )}

      {/* Legal move dot / capture ring */}
      {isLegal && !piece && (
        <div style={{
          width: 26, height: 26, borderRadius: '50%',
          background: 'rgba(0,0,0,0.18)',
          pointerEvents: 'none',
        }} />
      )}
      {isCapture && (
        <div style={{
          position:'absolute', inset:0,
          border: '6px solid rgba(0,0,0,0.22)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }} />
      )}

      {/* Piece */}
      {piece && (
        <span style={{
          fontSize: 52,
          lineHeight: 1,
          filter: isSelected ? 'drop-shadow(0 0 6px rgba(255,255,100,0.9))' : 'drop-shadow(1px 2px 2px rgba(0,0,0,0.4))',
          transform: isSelected ? 'scale(1.15)' : 'scale(1)',
          transition: 'transform 0.1s',
          zIndex: 1,
        }}>
          {piece}
        </span>
      )}
    </div>
  )
}
