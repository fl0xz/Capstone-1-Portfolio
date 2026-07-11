import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function LoginView() {
  const { signIn, signUp, isConfigured } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = mode === 'signin' ? await signIn(email, password) : await signUp(email, password);

    if (result.error) setError(result.error);
    setLoading(false);
  };

  if (!isConfigured) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-logo">
            <div className="logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.9" />
                <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.6" />
                <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.6" />
                <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.3" />
              </svg>
            </div>
            <h1>Foundry Labs</h1>
            <p>Commerce Hub</p>
          </div>
          <p className="login-demo-note">
            Running in demo mode. Configure Supabase to enable team login, or continue to the
            dashboard with mock data.
          </p>
          <a href="/" className="btn-primary login-demo-btn">
            Continue to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.9" />
              <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.6" />
              <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.6" />
              <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.3" />
            </svg>
          </div>
          <h1>Foundry Labs</h1>
          <p>Commerce Hub</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <h2>{mode === 'signin' ? 'Sign in' : 'Create account'}</h2>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@foundrylabs.co"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="btn-primary login-submit" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button
          type="button"
          className="login-toggle"
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
        >
          {mode === 'signin' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}
