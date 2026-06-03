import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Key, Phone, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

const Register = () => {
  const [step, setStep] = useState(1); // 1 = Registration form, 2 = OTP Verification
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Verification states
  const [otpCode, setOtpCode] = useState('');
  const [tempUserId, setTempUserId] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [demoOtp, setDemoOtp] = useState('');
  
  // Validation / Response states
  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const { register, verifyOtp, resendOtp, loading, error, setError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Read location state for redirected verification (from login)
  useEffect(() => {
    if (location.state && location.state.step === 2) {
      setStep(2);
      setTempUserId(location.state.tempUserId);
      setEmail(location.state.email || '');
      setResendTimer(60);
      if (location.state.otpCode) {
        setDemoOtp(location.state.otpCode);
        setSuccessMessage(`Your account is unverified. An OTP has been generated. Demo Code: ${location.state.otpCode}`);
      } else {
        setSuccessMessage('Your account is unverified. An OTP has been sent. Check the backend console.');
      }
    }
  }, [location]);

  // Handle countdown timer for resending OTP
  useEffect(() => {
    let interval = null;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Step 1: Submit user registration fields
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setError(null);
    setSuccessMessage('');

    if (!username || !email || !password) {
      setValidationError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }

    const result = await register(username, email, password);
    
    if (result.success) {
      if (result.verified === false) {
        setTempUserId(result.tempUserId);
        setStep(2);
        setResendTimer(60);
        if (result.otpCode) {
          setDemoOtp(result.otpCode);
          setSuccessMessage(`A verification code has been generated. Demo Code: ${result.otpCode}`);
        } else {
          setSuccessMessage('A verification code has been generated. Please check your backend console logs.');
        }
      } else {
        // Fallback if verification was bypassed/succeeded immediately
        navigate('/');
      }
    }
  };

  // Step 2: Submit OTP code for verification
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setError(null);

    if (!otpCode || otpCode.length !== 6) {
      setValidationError('Please enter the 6-digit verification code');
      return;
    }

    const result = await verifyOtp(tempUserId, otpCode);
    if (result.success) {
      navigate('/');
    }
  };

  // Resend OTP trigger
  const handleResendOtp = async () => {
    setValidationError('');
    setError(null);
    setSuccessMessage('');
    
    const result = await resendOtp(tempUserId);
    if (result.success) {
      setResendTimer(60);
      if (result.otpCode) {
        setDemoOtp(result.otpCode);
        setSuccessMessage(`A new verification code has been generated. Demo Code: ${result.otpCode}`);
      } else {
        setSuccessMessage('A new verification code has been generated. Check the backend console.');
      }
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
        maxWidth: '440px',
        padding: '40px',
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4)',
      }}>
        {step === 1 ? (
          /* STEP 1: Registration Form */
          <>
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
                Create Account
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Sign up to build your personalized soundtracks
              </p>
            </div>

            {/* Alerts */}
            {(error || validationError) && (
              <div className="alert-box alert-danger">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{validationError || error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="username">Username</label>
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
                    <User size={18} />
                  </span>
                  <input
                    id="username"
                    type="text"
                    className="form-input"
                    placeholder="music_lover"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ paddingLeft: '45px' }}
                    disabled={loading}
                  />
                </div>
              </div>

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
                    disabled={loading}
                  />
                </div>
              </div>



              <div className="form-group" style={{ marginBottom: '30px' }}>
                <label className="form-label" htmlFor="password">Password</label>
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
                    id="password"
                    type="password"
                    className="form-input"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Sending OTP...
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UserPlus size={18} /> Get OTP Verification
                  </span>
                )}
              </button>
            </form>

            {/* Footer */}
            <div style={{
              textAlign: 'center',
              marginTop: '25px',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
            }}>
              Already have an account?{' '}
              <Link to="/login" style={{
                color: '#818cf8',
                textDecoration: 'none',
                fontWeight: 600,
                transition: 'var(--transition-smooth)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#c7d2fe'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#818cf8'}
              >
                Log in here
              </Link>
            </div>
          </>
        ) : (
          /* STEP 2: OTP Verification Form */
          <>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
                color: '#818cf8',
                boxShadow: '0 0 15px rgba(99, 102, 241, 0.2)',
              }}>
                <ShieldCheck size={32} />
              </div>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.8rem',
                fontWeight: 800,
                marginBottom: '8px',
                color: 'white',
              }}>
                OTP Verification
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                An activation code was sent to <strong style={{ color: 'white' }}>{email}</strong>.
              </p>
            </div>

            {/* Alerts */}
            {successMessage && (
              <div className="alert-box alert-success">
                <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                <span>{successMessage}</span>
              </div>
            )}

            {(error || validationError) && (
              <div className="alert-box alert-danger">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{validationError || error}</span>
              </div>
            )}

            <form onSubmit={handleVerifySubmit}>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" htmlFor="otpCode" style={{ textAlign: 'center' }}>
                  Enter 6-Digit Code
                </label>
                <input
                  id="otpCode"
                  type="text"
                  maxLength="6"
                  className="form-input"
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  style={{
                    letterSpacing: '10px',
                    textAlign: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                  }}
                  disabled={loading}
                />
                {demoOtp && (
                  <div style={{
                    marginTop: '15px',
                    padding: '10px 14px',
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: '#c7d2fe',
                    textAlign: 'center',
                    fontWeight: 500,
                  }}>
                    Demo Verification Code: <strong style={{ color: 'white', letterSpacing: '1px' }}>{demoOtp}</strong>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="glow-button"
                style={{ width: '100%', padding: '12px', fontSize: '1rem', marginBottom: '20px' }}
                disabled={loading}
              >
                {loading ? 'Activating...' : 'Verify & Register'}
              </button>
            </form>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
            }}>
              <span>Didn't receive the code?</span>
              {resendTimer > 0 ? (
                <span style={{ color: 'var(--text-muted)' }}>Resend in {resendTimer}s</span>
              ) : (
                <button
                  onClick={handleResendOtp}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#818cf8',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    transition: 'var(--transition-smooth)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#c7d2fe'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#818cf8'}
                >
                  Resend OTP
                </button>
              )}
            </div>

            <button
              onClick={() => {
                setStep(1);
                setValidationError('');
                setError(null);
                setSuccessMessage('');
              }}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                textAlign: 'center',
                fontSize: '0.825rem',
                marginTop: '25px',
                transition: 'var(--transition-smooth)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              ← Back to Registration details
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;
