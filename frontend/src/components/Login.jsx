import { useState } from 'react';

export default function Login({ onLoginSuccess, onNavigateToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onLoginSuccess(data);
    } catch (err) {
      setError(err.message || 'Server error. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAccountSelect = async (selectedEmail, selectedPassword) => {
    setShowGoogleModal(false);
    setEmail(selectedEmail);
    setPassword(selectedPassword);
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: selectedEmail, password: selectedPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Google Authentication failed');
      }

      onLoginSuccess(data);
    } catch (err) {
      setError(err.message || 'Server error during Google authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="glass-card auth-card">
        <div className="auth-header">
          <h2>smart aptitude</h2>
          <p>Sign in to your dashboard</p>
        </div>

        {error && (
          <div className="alert-box alert-error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="e.g. rahul@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: '2.75rem' }}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  // Eye-Off Icon
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  // Eye Icon
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <button type="button" className="btn-google-oauth" onClick={() => setShowGoogleModal(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5.04c1.67 0 3.2.58 4.38 1.69l3.27-3.27C17.67 1.54 15.02 1 12 1 7.35 1 3.39 3.65 1.5 7.5l3.85 3C6.27 7.57 8.92 5.04 12 5.04z"/>
            <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.48-1.11 2.73-2.37 3.58l3.69 2.87c2.16-1.99 3.43-4.92 3.43-8.55z"/>
            <path fill="#FBBC05" d="M5.35 14.5c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3L1.5 6.9C.54 8.84 0 11.02 0 13.3c0 2.28.54 4.46 1.5 6.4l3.85-3.2z"/>
            <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.69-2.87c-1.02.68-2.33 1.09-3.97 1.09-3.08 0-5.73-2.53-6.65-5.46L1.8 16.05C3.69 19.9 7.65 23 12 23z"/>
          </svg>
          Continue with Google
        </button>

        <div className="auth-toggle">
          Don't have an account?{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToRegister(); }}>
            Register
          </a>
        </div>
      </div>

      {/* Simulated Google Accounts Selector Modal */}
      {showGoogleModal && (
        <div className="modal-overlay" style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', position: 'relative' }}>
            <button 
              type="button"
              onClick={() => setShowGoogleModal(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.5rem' }}
            >
              &times;
            </button>
            <h3 className="section-title" style={{ justifyContent: 'center', borderLeft: 'none', paddingLeft: 0, marginBottom: '1rem', borderBottom: 'none' }}>
              Sign in with Google
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.4' }}>
              Select a Google account to continue to Smart Aptitude Test Portal
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { name: 'Alex Student', email: 'student@example.com', pw: 'student123', avatar: 'AS' },
                { name: 'System Admin', email: 'admin7@gmail.com', pw: 'admin@77', avatar: 'SA' },
                { name: 'rahul m', email: 'rahul@gmail.com', pw: 'rahul123', avatar: 'RM' }
              ].map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleGoogleAccountSelect(acc.email, acc.pw)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.75rem 1rem',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    color: 'var(--text-main)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.background = 'rgba(59, 130, 246, 0.04)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'var(--color-primary)',
                    color: 'var(--text-dark)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '0.9rem'
                  }}>
                    {acc.avatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-main)' }}>{acc.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{acc.email}</div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-secondary)' }}><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
