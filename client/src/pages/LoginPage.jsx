import React, { useState } from 'react';
import {
  Code2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage({ onNavigate }) {
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.email.trim() || !formData.password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    try {
      setSubmitting(true);
      await login(formData.email.trim().toLowerCase(), formData.password);
    } catch (err) {
      setErrorMessage(err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setFormData({
      email: 'alex.developer@devhub.ai',
      password: 'password123',
    });
    setErrorMessage('');
  };

  return (
    <div className="auth-split-layout">
      {/* Left Brand Pane (Desktop) */}
      <div className="auth-brand-pane">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="sidebar-brand-icon" style={{ width: '28px', height: '28px' }}>
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>
              DevHub AI
            </span>
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '12px', color: '#FFFFFF' }}>
            Your developer career, organized.
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.92rem', lineHeight: 1.6, maxWidth: '420px', marginBottom: '24px' }}>
            Manage your verified engineering portfolio, track job applications, and optimize your developer profile in one place.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              'Showcase full-stack repositories and live deployments',
              'Track interview rounds, offers, and salary notes',
              'ATS-ready resume exports and skills matrix',
            ].map((text, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: '#CBD5E1' }}>
                <CheckCircle2 className="w-4 h-4 text-accent" style={{ color: '#60A5FA' }} />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
          © 2026 DevHub AI. Developer Career Platform.
        </div>
      </div>

      {/* Right Form Pane */}
      <div className="auth-form-pane">
        <button
          onClick={() => onNavigate('landing')}
          className="btn btn-ghost btn-sm"
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            gap: '6px',
            color: 'var(--text-secondary)',
          }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>

        <div className="auth-card">
          <div className="auth-header">
            <h2 className="auth-title">Welcome back</h2>
            <p className="auth-subtitle">
              Sign in to access your developer career dashboard
            </p>
          </div>

          {errorMessage && (
            <div className="auth-error-alert">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address
              </label>
              <div className="auth-input-wrapper">
                <Mail className="w-4 h-4 auth-input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="developer@example.com"
                  className="form-input auth-input"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <div className="auth-input-wrapper">
                <Lock className="w-4 h-4 auth-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="form-input auth-input"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-password-toggle"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '10px', marginTop: '6px' }}
            >
              {submitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Fill */}
          <div style={{ marginTop: '14px' }}>
            <button
              type="button"
              onClick={handleFillDemo}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', gap: '6px' }}
            >
              <Sparkles className="w-3.5 h-3.5 text-secondary" />
              <span>Use Demo Account (Alex Dev)</span>
            </button>
          </div>

          <div
            style={{
              marginTop: '20px',
              textAlign: 'center',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '14px',
            }}
          >
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate('register')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-primary)',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Create an account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
