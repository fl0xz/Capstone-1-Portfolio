import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import { LoginView } from './views/LoginView.tsx';

function AppGate() {
  const { user, loading, isConfigured } = useAuth();
  const [skipAuth, setSkipAuth] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('connect')) setSkipAuth(true);
  }, []);

  if (loading) {
    return (
      <div className="login-page">
        <div className="login-card">
          <p>Loading Foundry Labs…</p>
        </div>
      </div>
    );
  }

  if (isConfigured && !user && !skipAuth) {
    return <LoginView />;
  }

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AppGate />
    </AuthProvider>
  </StrictMode>
);
