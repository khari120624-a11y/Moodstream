import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Library, Sparkles, Plus, Radio } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '60px',
      backgroundColor: '#0f0f0f',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 999,
      padding: '0 10px',
    }}>
      <Link to="/" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        textDecoration: 'none',
        color: isActive('/') ? '#ffffff' : '#b3b3b3',
        fontSize: '0.72rem',
        fontWeight: isActive('/') ? '700' : '500',
      }}>
        <Home size={22} style={{ color: isActive('/') ? '#ffffff' : '#b3b3b3' }} />
        <span>Home</span>
      </Link>

      <Link to="/vibe-room" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        textDecoration: 'none',
        color: isActive('/vibe-room') ? '#ffffff' : '#b3b3b3',
        fontSize: '0.72rem',
        fontWeight: isActive('/vibe-room') ? '700' : '500',
      }}>
        <Radio size={22} style={{ color: isActive('/vibe-room') ? '#ffffff' : '#b3b3b3' }} />
        <span>Vibe Room</span>
      </Link>

      <Link to="/playlist" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        textDecoration: 'none',
        color: isActive('/playlist') ? '#ffffff' : '#b3b3b3',
        fontSize: '0.72rem',
        fontWeight: isActive('/playlist') ? '700' : '500',
      }}>
        <Library size={22} style={{ color: isActive('/playlist') ? '#ffffff' : '#b3b3b3' }} />
        <span>Your Library</span>
      </Link>

      <Link to="/future-assessment" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        textDecoration: 'none',
        color: isActive('/future-assessment') ? '#ffffff' : '#b3b3b3',
        fontSize: '0.72rem',
        fontWeight: isActive('/future-assessment') ? '700' : '500',
      }}>
        <Sparkles size={22} style={{ color: isActive('/future-assessment') ? '#1db954' : '#b3b3b3' }} />
        <span>Future Vibe</span>
      </Link>
    </div>
  );
};

export default BottomNav;
