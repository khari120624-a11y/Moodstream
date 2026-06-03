import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Key, Mail, Lock, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import api from '../services/api';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Pre-fill email from query param or state if redirected from forgot-password
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    // Attempt to load email from navigation state
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setError(null);

    if (!email || !otpCode || !newPassword || !confirmPassword) {
      setValidationError('Please fill in all fields');
      return;
    }

    if (otpCode.length !== 6) {
      setValidationError('OTP code must be exactly 6 digits');
      return;
    }

    if (newPassword.length < 6) {
      setValidationError('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/reset-password', {
        email,
        otpCode,
        newPassword
      });
      setLoading(false);
      alert('Password reset successful! Redirecting to login.');
      navigate('/login');
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to reset password. Please check the code and try again.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 140px)',
      padding: '20px',
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '40px',
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4)',
      }}>
        {/* Back Link */}
        <Link to="/forgot-password" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--text-secondary)',
          textDecoration: 'none',
          fontSize: '0.85rem',
          marginBottom: '24px',
          transition: 'var(--transition-smooth)',
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <ArrowLeft size={16} /> Back
        </Link>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem',
            fontWeight: 800,
            marginBottom: '8px',
            background: 'linear-gradient(to right, #ffffff, #c7d2fe)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Set New Password
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Verify your identity with the 6-digit OTP code and secure your account.
          </p>
        </div>

        {/* Alerts */}
        {(error || validationError) && (
          <div className="alert-box alert-danger" style={{ marginBottom: '20px' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{validationError || error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email input (read-only if pre-filled, editable if typed manually) */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
              }}>
                <Mail size={18} />
              </span>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '45px' }}
                disabled={loading || !!location.state?.email}
              />
            </div>
          </div>

          {/* OTP Code */}
          <div className="form-group">
            <label className="form-label" htmlFor="otpCode">6-Digit Code</label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
              }}>
                <Key size={18} />
              </span>
              <input
                id="otpCode"
                type="text"
                maxLength={6}
                pattern="\d{6}"
                className="form-input"
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                style={{ paddingLeft: '45px', letterSpacing: '2px', fontWeight: 600 }}
                disabled={loading}
              />
            </div>
          </div>

          {/* New Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="newPassword">New Password</label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
              }}>
                <Lock size={18} />
              </span>
              <input
                id="newPassword"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ paddingLeft: '45px' }}
                disabled={loading}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-group" style={{ marginBottom: '30px' }}>
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
              }}>
                <Lock size={18} />
              </span>
              <input
                id="confirmPassword"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ paddingLeft: '45px' }}
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="glow-button"
            style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <RefreshCw size={18} className="spin-slow" /> Resetting...
              </span>
            ) : (
              <span>Reset Password</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
