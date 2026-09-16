import React from 'react';

const MoodCard = ({ moodKey, moodData, mood, isSelected, onClick, onSelect }) => {
  const data = moodData || mood || { name: 'Vibe', emoji: '🎵', color: '#1db954', accent: '#1db954' };
  const handleClick = onClick || (onSelect ? () => onSelect(moodKey) : () => {});

  return (
    <button
      onClick={handleClick}
      style={{
        background: isSelected ? data.color : 'rgba(255, 255, 255, 0.03)',
        border: '1px solid',
        borderColor: isSelected ? 'transparent' : 'var(--border-glass)',
        borderRadius: '20px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        width: '100%',
        minHeight: '120px',
        color: 'white',
        boxShadow: isSelected 
          ? `0 10px 30px ${data.accent || '#1db954'}40, inset 0 0 20px rgba(255,255,255,0.2)`
          : '0 4px 15px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        if (!isSelected) {
          e.currentTarget.style.borderColor = data.accent || '#1db954';
          e.currentTarget.style.boxShadow = `0 10px 25px ${data.accent || '#1db954'}20`;
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        if (!isSelected) {
          e.currentTarget.style.borderColor = 'var(--border-glass)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
        } else {
          e.currentTarget.style.boxShadow = `0 10px 30px ${data.accent || '#1db954'}40, inset 0 0 20px rgba(255,255,255,0.2)`;
        }
      }}
    >
      {/* Decorative backdrop glow */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: `radial-gradient(circle, ${data.accent || '#1db954'}15 0%, transparent 70%)`,
        opacity: isSelected ? 0.3 : 0,
        pointerEvents: 'none',
        transition: 'var(--transition-smooth)',
      }} />

      {/* Floating Emoji */}
      <span style={{
        fontSize: '2.2rem',
        filter: isSelected ? 'drop-shadow(0 0 10px rgba(255,255,255,0.4))' : 'none',
        transform: isSelected ? 'scale(1.1)' : 'none',
        transition: 'all 0.3s ease',
      }}>
        {data.emoji || '🎵'}
      </span>

      {/* Mood Name */}
      <span style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: '1.05rem',
        letterSpacing: '-0.01em',
        textShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.3)' : 'none',
      }}>
        {data.name || moodKey}
      </span>

      {/* Selected Indicator Dot */}
      {isSelected && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: 'white',
          boxShadow: '0 0 8px white',
        }} />
      )}
    </button>
  );
};

export default MoodCard;
