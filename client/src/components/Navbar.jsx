import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Music, LogIn, UserPlus, LogOut, ChevronLeft, ChevronRight, Download, Search, X } from 'lucide-react';

const Navbar = ({ searchQuery = '', setSearchQuery, onSearchSubmit }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [installPrompt, setInstallPrompt] = useState(null);

  // Mobile search toggle overlay
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Input ref to preserve cursor selection range across renders
  const inputRef = useRef(null);
  const mobileInputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Sync input value only when searchQuery is externally cleared or updated (not while actively typing)
  useEffect(() => {
    if (inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.value = searchQuery;
    }
    if (mobileInputRef.current && document.activeElement !== mobileInputRef.current) {
      mobileInputRef.current.value = searchQuery;
    }
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
    
    // Immediately propagate to parent if provided
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    // Update parent state directly so search happens naturally
    if (setSearchQuery) {
      setSearchQuery(val);
    }
  };

  const handleClear = () => {
    if (inputRef.current) inputRef.current.value = '';
    if (mobileInputRef.current) mobileInputRef.current.value = '';
    if (setSearchQuery) setSearchQuery('');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (onSearchSubmit) onSearchSubmit(e);
  };

  return (
    <nav style={{
      height: '64px',
      padding: '0 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#000000',
      zIndex: 900,
      userSelect: 'none',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'relative',
    }}>
      {/* MOBILE SEARCH OVERLAY (Full-width bar when active on mobile) */}
      {mobileSearchOpen ? (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#000000',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: '10px',
          zIndex: 999,
        }}>
          <form onSubmit={handleFormSubmit} style={{ flex: 1, position: 'relative' }}>
            <span style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
            }}>
              <Search size={18} />
            </span>
            <input
              ref={mobileInputRef}
              type="text"
              dir="ltr"
              defaultValue={searchQuery}
              onChange={handleInputChange}
              placeholder="Search tracks, artists..."
              autoFocus
              style={{
                width: '100%',
                padding: '10px 40px 10px 42px',
                borderRadius: '50px',
                backgroundColor: '#242424',
                border: '1px solid #1db954',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none',
                textAlign: 'left',
                direction: 'ltr',
              }}
            />
            {mobileInputRef.current?.value && (
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
                  padding: '4px',
                }}
              >
                <X size={16} />
              </button>
            )}
          </form>

          <button
            onClick={() => setMobileSearchOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: '#1db954',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          {/* Left section: History Back/Forward Navigation & Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                title="Go Forward"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <Link to="/" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
              color: 'white',
            }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '1.2rem',
                color: '#ffffff',
                whiteSpace: 'nowrap',
              }}>
                MoodStream
              </span>
            </Link>
          </div>

          {/* DESKTOP SEARCH BAR */}
          {setSearchQuery && (
            <div className="desktop-search-container" style={{ flex: 1, maxWidth: '460px', margin: '0 16px' }}>
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
                  ref={inputRef}
                  type="text"
                  dir="ltr"
                  defaultValue={searchQuery}
                  onChange={handleInputChange}
                  placeholder="What do you want to play?"
                  style={{
                    width: '100%',
                    padding: '10px 36px 10px 42px',
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
                {searchQuery && (
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
                    title="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </form>
            </div>
          )}

          {/* MOBILE SEARCH TRIGGER BUTTON */}
          <button
            className="mobile-search-trigger"
            onClick={() => setMobileSearchOpen(true)}
            style={{
              display: 'none',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#242424',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'white',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              marginLeft: 'auto',
              marginRight: '8px',
            }}
            title="Search Music"
          >
            <Search size={18} />
          </button>

          {/* Right User Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            {installPrompt && (
              <button
                onClick={handleInstallClick}
                style={{
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                }}
              >
                <Download size={14} />
                Install
              </button>
            )}

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#1f1f1f',
                  padding: '4px 10px 4px 6px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
                onClick={() => navigate('/playlist')}
                >
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: '#1db954',
                    color: '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                  }}>
                    {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'white' }}>
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
                    padding: '4px',
                  }}
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link to="/login" style={{
                  textDecoration: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  padding: '6px 10px',
                }}>
                  Log in
                </Link>
                <Link to="/register" className="glow-button" style={{
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                }}>
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
