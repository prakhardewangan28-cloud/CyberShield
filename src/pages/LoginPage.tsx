import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  Cpu, 
  CheckCircle2, 
  Zap,
  Network
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useApi } from '../context/ApiContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const { addToast } = useToast();
  const { isDemoMode, isConnected } = useApi();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('cybershield');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter both username and password.');
      return;
    }

    try {
      await login(username.trim(), password.trim(), isDemoMode);
      addToast('success', 'Authentication Successful', `Welcome back, ${username}!`);
      navigate('/');
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setErrorMsg(errorObj.message || 'Authentication failed. Please verify credentials.');
      addToast('error', 'Login Failed', errorObj.message || 'Invalid credentials');
    }
  };

  const fillCredentials = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setErrorMsg('');
  };

  return (
    <div 
      className="circuit-grid-bg"
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        position: 'relative'
      }}
    >
      <div className="scanline-overlay" />

      <div 
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'rgba(16, 24, 39, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(0, 229, 255, 0.25)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.6), 0 0 25px rgba(0, 229, 255, 0.2)',
          padding: '2.25rem',
          position: 'relative',
          zIndex: 10
        }}
        className="animate-fade-in"
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 1rem auto',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.2), rgba(139, 92, 246, 0.25))',
              border: '2px solid rgba(0, 229, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan)',
              boxShadow: '0 0 20px rgba(0, 229, 255, 0.3)'
            }}
          >
            <Shield size={34} />
          </div>

          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '0.02em', color: '#fff', margin: 0 }}>
            CYBER<span style={{ color: 'var(--accent-cyan)' }}>SHIELD</span>
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
            Cybersecurity Network Monitoring System
          </p>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-violet)', fontWeight: 500, marginTop: '0.2rem' }}>
            Python Multithreading &bull; Event Queue &bull; REST API
          </div>
        </div>

        {/* Backend Connectivity Status Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.3rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(21, 31, 50, 0.8)',
              border: 'var(--border-subtle)',
              fontSize: '0.72rem'
            }}
          >
            <span 
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: isConnected ? 'var(--sev-low)' : 'var(--sev-medium)'
              }}
              className={isConnected ? 'pulse-indicator-green' : 'pulse-indicator-amber'}
            />
            <span style={{ color: isConnected ? 'var(--sev-low)' : 'var(--sev-medium)', fontWeight: 500 }}>
              {isConnected ? 'Backend: Online (Port 5000)' : 'Simulation Mode Active (Safe Demo Access)'}
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div 
            style={{
              backgroundColor: 'rgba(255, 59, 92, 0.15)',
              border: '1px solid var(--sev-critical)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#ff859b',
              fontSize: '0.82rem'
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Username or Operator ID
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <User size={16} />
              </div>
              <input
                type="text"
                className="input-field"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Enter username (e.g. admin)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', fontSize: '0.95rem' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Access Security Dashboard</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials Autofill */}
        <div style={{ marginTop: '1.75rem', borderTop: 'var(--border-subtle)', paddingTop: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.6rem', textAlign: 'center' }}>
            Presentation Quick-Fill Credentials:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => fillCredentials('admin', 'cybershield')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.74rem' }}
            >
              Admin (Full)
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('analyst', 'cybershield')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.74rem' }}
            >
              SOC Analyst
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('viewer', 'cybershield')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.74rem' }}
            >
              Auditor View
            </button>
          </div>
        </div>

        {/* Architecture Note */}
        <div 
          style={{
            marginTop: '1.5rem',
            backgroundColor: 'rgba(7, 11, 20, 0.6)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem',
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}
        >
          <Network size={18} style={{ color: 'var(--accent-cyan)', minWidth: '18px' }} />
          <span>
            Communicates with Python backend via REST API (<code>/api/v1/auth/login</code>). Session auth enforces role-based access.
          </span>
        </div>
      </div>
    </div>
  );
};
