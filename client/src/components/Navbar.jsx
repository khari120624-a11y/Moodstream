import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Music, LogIn, UserPlus, LogOut, ChevronLeft, ChevronRight, Download, Search, X } from 'lucide-react';

const Navbar = ({ searchQuery = '', setSearchQuery, onSearchSubmit }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [installPrompt, setInstallPrompt] = useState(null);

  // Local state for smooth typing & cursor preservation
  const [localQuery, setLocalQuery] = useState(searchQuery);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstallPrompt(null);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    console.log(`[PWA] User choice: ${outcome}`);
    setInstallPrompt(null);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setLocalQuery(val);
    if (setSearchQuery) {
      setSearchQuery(val);
    }
  };

  const handleClear = () => {
    setLocalQuery('');
    if (setSearchQuery) {
      setSearchQuery('');
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (onSearchSubmit) onSearchSubmit(e);
  };

  return (
    <nav style={{
      height: '64px',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#000000',
      zIndex: 900,
      userSelect: 'none',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    }}>
      {/* Left section: History Back/Forward Navigation & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#090909',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'var(--transition-smooth)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e1e1e'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#090909'}
            title="Go Back"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => navigate(1)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#090909',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'var(--transition-smooth)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e1e1e'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#090909'}
            title="Go Forward"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textDecoration: 'none',
          color: 'white',
        }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '1.25rem',
            color: '#ffffff',
          }}>
            MoodStream
          </span>
        </Link>
      </div>

      {/* Center Search Input */}
      {setSearchQuery && (
        <div style={{ flex: 1, maxWidth: '480px', margin: '0 20px' }}>
          <form onSubmit={handleFormSubmit} style={{ position: 'relative', width: '100%' }}>
            <span style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
              zIndex: 2,
            }}>
              <Search size={18} />
            </span>
            <input
              type="text"
              dir="ltr"
              placeholder="What do you want to play? (Search tracks, artists...)"
              value={localQuery}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '10px 40px 10px 42px',
                borderRadius: '50px',
                backgroundColor: '#242424',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                fontSize: '0.875rem',
                outline: 'none',
                textAlign: 'left',
                direction: 'ltr',
                unicodeBidi: 'normal',
                transition: 'var(--transition-smooth)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#1db954';
                e.currentTarget.style.backgroundColor = '#2a2a2a';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.backgroundColor = '#242424';
              }}
            />
            {localQuery && (
              <button
                type="button"
                onClick={handleClear}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#b3b3b3',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#b3b3b3'}
                title="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </form>
        </div>
      )}

      {/* Right User Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
        {installPrompt && (
          <button
            onClick={handleInstallClick}
            style={{
              backgroundColor: '#ffffff',
              color: '#000000',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.8rem',
              transition: 'var(--transition-smooth)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Download size={14} />
            Install App
          </button>
        )}

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#1f1f1f',
              padding: '4px 12px 4px 6px',
              borderRadius: '20px',
              cursor: 'pointer',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            onClick={() => navigate('/playlist')}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#1db954',
                color: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.85rem',
              }}>
                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>
                {user.username}
              </span>
            </div>

            <button
              onClick={logout}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '6px',
                borderRadius: '50%',
                transition: 'var(--transition-smooth)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to="/login" style={{
              textDecoration: 'none',
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              fontWeight: 700,
              padding: '8px 16px',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              Log in
            </Link>
            <Link to="/register" className="glow-button" style={{
              padding: '8px 20px',
              fontSize: '0.875rem',
            }}>
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
