import React from 'react';

const MoodCard = ({ moodKey, moodData, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        background: isSelected ? moodData.color : 'rgba(255, 255, 255, 0.03)',
        border: '1px solid',
        borderColor: isSelected ? 'transparent' : 'var(--border-glass)',
        borderRadius: '20px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        width: '100%',
        minHeight: '140px',
        color: 'white',
        boxShadow: isSelected 
          ? `0 10px 30px ${moodData.accent}40, inset 0 0 20px rgba(255,255,255,0.2)`
          : '0 4px 15px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px) scale(1.03)';
        if (!isSelected) {
          e.currentTarget.style.borderColor = moodData.accent;
          e.currentTarget.style.boxShadow = `0 10px 25px ${moodData.accent}20`;
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        if (!isSelected) {
          e.currentTarget.style.borderColor = 'var(--border-glass)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
        } else {
          e.currentTarget.style.boxShadow = `0 10px 30px ${moodData.accent}40, inset 0 0 20px rgba(255,255,255,0.2)`;
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
        background: `radial-gradient(circle, ${moodData.accent}15 0%, transparent 70%)`,
        opacity: isSelected ? 0.3 : 0,
        pointerEvents: 'none',
        transition: 'var(--transition-smooth)',
      }} />

      {/* Floating Emoji */}
      <span style={{
        fontSize: '2.5rem',
        filter: isSelected ? 'drop-shadow(0 0 10px rgba(255,255,255,0.4))' : 'none',
        transform: isSelected ? 'scale(1.1) rotate(5deg)' : 'none',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      }}>
        {moodData.emoji}
      </span>

      {/* Mood Name */}
      <span style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: '1.15rem',
        letterSpacing: '-0.01em',
        textShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.3)' : 'none',
      }}>
        {moodData.name}
      </span>

      {/* Selected Indicator Dot */}
      {isSelected && (
        <div style={{
          position: 'absolute',
          bottom: '12px',
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
