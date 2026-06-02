import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Music, Heart, LogIn, UserPlus, LogOut, Home, Download } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(e);
      console.log('[PWA] beforeinstallprompt event intercepted.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstallPrompt(null);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    // Show the native install dialog
    installPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;
    console.log(`[PWA] User installation choice: ${outcome}`);
    // Clear prompt state since it's single-use
    setInstallPrompt(null);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass-panel" style={{
      margin: '20px 20px 0 20px',
      padding: '15px 30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderRadius: '16px',
      position: 'sticky',
      top: '20px',
      zIndex: 1000,
    }}>
      {/* Brand logo */}
      <Link to="/" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        textDecoration: 'none',
        color: 'white',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          padding: '8px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
        }}>
          <Music size={20} />
        </div>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: '1.4rem',
          letterSpacing: '-0.03em',
          background: 'linear-gradient(to right, #ffffff, #94a3b8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          MoodStream
        </span>
      </Link>

      {/* Nav Links */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
      }}>
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          textDecoration: 'none',
          color: isActive('/') ? 'white' : 'var(--text-secondary)',
          fontWeight: isActive('/') ? '600' : '400',
          transition: 'var(--transition-smooth)',
          fontSize: '0.95rem',
        }}>
          <Home size={16} />
          Home
        </Link>

        <Link to="/playlist" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          textDecoration: 'none',
          color: isActive('/playlist') ? 'white' : 'var(--text-secondary)',
          fontWeight: isActive('/playlist') ? '600' : '400',
          transition: 'var(--transition-smooth)',
          fontSize: '0.95rem',
        }}>
          <Heart size={16} style={{ color: isActive('/playlist') ? '#ef4444' : 'inherit' }} />
          My Playlist
        </Link>
      </div>

      {/* User Session Buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}>
        {/* PWA Install Button */}
        {installPrompt && (
          <button
            onClick={handleInstallClick}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
              transition: 'var(--transition-smooth)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.03)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
            }}
          >
            <Download size={16} />
            Install App
          </button>
        )}

        {user ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <span style={{
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
              background: 'rgba(255,255,255,0.05)',
              padding: '6px 12px',
              borderRadius: '20px',
              border: '1px solid var(--border-glass)',
            }}>
              Hi, <strong style={{ color: 'white' }}>{user.username}</strong>
            </span>
            <button
              onClick={logout}
              className="glass-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border-glass)',
                color: '#fca5a5',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.9rem',
                background: 'rgba(239, 68, 68, 0.1)',
                transition: 'var(--transition-smooth)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.borderColor = 'var(--border-glass)';
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <Link to="/login" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              padding: '8px 16px',
              borderRadius: '8px',
              transition: 'var(--transition-smooth)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <LogIn size={16} />
              Login
            </Link>
            <Link to="/register" className="glow-button" style={{
              padding: '8px 16px',
              fontSize: '0.9rem',
            }}>
              <UserPlus size={16} />
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
