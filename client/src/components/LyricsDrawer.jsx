import React, { useEffect, useRef } from 'react';
import { X, Mic, Sparkles, Disc } from 'lucide-react';

const LyricsDrawer = ({ isOpen, onClose, currentTrack, isPlaying }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let bars = Array.from({ length: 32 }, () => Math.random() * 50);

    const renderVisualizer = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bars.length) - 2;

      bars.forEach((height, i) => {
        const targetHeight = isPlaying ? Math.random() * (canvas.height * 0.8) + 10 : 8;
        bars[i] += (targetHeight - bars[i]) * 0.15;

        const x = i * (barWidth + 2);
        const y = canvas.height - bars[i];

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#1db954');
        gradient.addColorStop(1, '#818cf8');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, bars[i]);
      });

      animationFrameId = requestAnimationFrame(renderVisualizer);
    };

    renderVisualizer();

    return () => cancelAnimationFrame(animationFrameId);
  }, [isOpen, isPlaying]);

  if (!isOpen) return null;

  // Mock formatted lyrics generator
  const getLyrics = () => {
    if (!currentTrack) return ['No active track playing.'];

    return [
      `[Verse 1]`,
      `Streaming through the night with ${currentTrack.artist}`,
      `Feelin' the beat of "${currentTrack.title}"`,
      `Every note hits right inside my soul`,
      ``,
      `[Chorus]`,
      `Moodstream playing loud and clear`,
      `Spotify vibes, no shadow or fear`,
      `Rhythm flows in every line`,
      `Lost in music, feeling fine`,
      ``,
      `[Verse 2]`,
      `Turn the volume up, let it shine`,
      `Music carries through space and time`,
    ];
  };

  return (
    <div className="drawer-panel" style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px',
        borderBottom: '1px solid var(--border-glass)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Mic size={22} style={{ color: '#1db954' }} />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Lyrics & Visuals</h2>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '50%',
            display: 'flex',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <X size={20} />
        </button>
      </div>

      {/* Drawer Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {currentTrack ? (
          <>
            {/* Visualizer Canvas */}
            <div style={{
              width: '100%',
              height: '100px',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              borderRadius: '12px',
              padding: '10px',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <canvas ref={canvasRef} width={320} height={80} style={{ width: '100%', height: '100%' }} />
            </div>

            {/* Track Info Card */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <img
                src={currentTrack.imageUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300'}
                alt={currentTrack.title}
                style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover' }}
              />
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>{currentTrack.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{currentTrack.artist}</p>
              </div>
            </div>

            <hr style={{ borderColor: 'var(--border-glass)' }} />

            {/* Lyrics Stream */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              fontSize: '1rem',
              fontWeight: 600,
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
            }}>
              {getLyrics().map((line, idx) => (
                <p
                  key={idx}
                  style={{
                    color: line.startsWith('[') ? '#1db954' : line ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
                    fontSize: line.startsWith('[') ? '0.85rem' : '1.05rem',
                    fontWeight: line.startsWith('[') ? 700 : 600,
                  }}
                >
                  {line || '•'}
                </p>
              ))}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: '40px' }}>
            <Disc size={40} style={{ marginBottom: '12px' }} />
            <p>Play a track to view live lyrics and visualizer.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LyricsDrawer;
