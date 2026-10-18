import React, { useState } from 'react';
import {
  Code2,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Briefcase,
  Building,
  Globe,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function RegisterPage({ onNavigate }) {
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'developer',
    companyName: '',
    jobTitle: '',
    companyWebsite: '',
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

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (formData.role === 'recruiter') {
      if (!formData.companyName.trim() || !formData.jobTitle.trim()) {
        setErrorMessage('Company Name and Job Title are required for recruiter accounts.');
        return;
      }
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      setSubmitting(true);
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        ...(formData.role === 'recruiter' && {
          companyName: formData.companyName.trim(),
          jobTitle: formData.jobTitle.trim(),
          companyWebsite: formData.companyWebsite.trim(),
        }),
      });
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
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
            {formData.role === 'recruiter' ? 'Discover top developer talent.' : 'Build your developer profile.'}
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.92rem', lineHeight: 1.6, maxWidth: '420px', marginBottom: '24px' }}>
            {formData.role === 'recruiter'
              ? 'Join technical hiring teams discovering verified developer portfolios, evaluating real project architectures, and managing candidate shortlists.'
              : 'Join thousands of software engineers tracking their technical skills, managing job applications, and publishing portfolios.'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(formData.role === 'recruiter'
              ? [
                  'Search candidates by skills, technology, and GitHub telemetry',
                  'Evaluate verified public project architectures and code demos',
                  'Private shortlists and interviewer candidate notes',
                ]
              : [
                  'Customizable developer portfolio URL at /u/yourname',
                  'Integrated job tracker with interview timelines',
                  'Verified technical skills matrix and credential storage',
                ]
            ).map((text, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: '#CBD5E1' }}>
                <CheckCircle2 className="w-4 h-4 text-accent" style={{ color: '#60A5FA' }} />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
          © 2026 DevHub AI. Developer & Recruiter Platform.
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
            <h2 className="auth-title">Create your account</h2>
            <p className="auth-subtitle">
              {formData.role === 'recruiter'
                ? 'Join as a technical recruiter or hiring team'
                : 'Start managing your developer portfolio and applications'}
            </p>
          </div>

          {/* Account Role Selector Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              background: 'var(--bg-surface-secondary)',
              padding: '4px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '16px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'developer' })}
              className={`btn btn-sm ${formData.role === 'developer' ? 'btn-primary' : 'btn-ghost'}`}
              style={{
                flex: 1,
                fontSize: '0.82rem',
                justifyContent: 'center',
                padding: '6px 10px',
              }}
            >
              <Code2 className="w-3.5 h-3.5" /> Developer
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'recruiter' })}
              className={`btn btn-sm ${formData.role === 'recruiter' ? 'btn-primary' : 'btn-ghost'}`}
              style={{
                flex: 1,
                fontSize: '0.82rem',
                justifyContent: 'center',
                padding: '6px 10px',
              }}
            >
              <Briefcase className="w-3.5 h-3.5" /> Recruiter
            </button>
          </div>

          {errorMessage && (
            <div className="auth-error-alert">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Full Name
              </label>
              <div className="auth-input-wrapper">
                <User className="w-4 h-4 auth-input-icon" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={formData.role === 'recruiter' ? 'Sarah Patel' : 'Alex Morgan'}
                  className="form-input auth-input"
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Work Email Address
              </label>
              <div className="auth-input-wrapper">
                <Mail className="w-4 h-4 auth-input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={formData.role === 'recruiter' ? 'sarah@technova.com' : 'alex@example.com'}
                  className="form-input auth-input"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Recruiter-Specific Fields */}
            {formData.role === 'recruiter' && (
              <>
                <div className="form-group">
                  <label className="form-label" htmlFor="companyName">
                    Company / Organization
                  </label>
                  <div className="auth-input-wrapper">
                    <Building className="w-4 h-4 auth-input-icon" />
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="TechNova Global"
                      className="form-input auth-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="jobTitle">
                    Your Role / Job Title
                  </label>
                  <div className="auth-input-wrapper">
                    <Briefcase className="w-4 h-4 auth-input-icon" />
                    <input
                      type="text"
                      id="jobTitle"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleChange}
                      placeholder="Technical Recruiter / Talent Lead"
                      className="form-input auth-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="companyWebsite">
                    Company Website (Optional)
                  </label>
                  <div className="auth-input-wrapper">
                    <Globe className="w-4 h-4 auth-input-icon" />
                    <input
                      type="url"
                      id="companyWebsite"
                      name="companyWebsite"
                      value={formData.companyWebsite}
                      onChange={handleChange}
                      placeholder="https://technova.com"
                      className="form-input auth-input"
                    />
                  </div>
                </div>
              </>
            )}

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
                  placeholder="Min. 6 characters"
                  className="form-input auth-input"
                  required
                  autoComplete="new-password"
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

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="auth-input-wrapper">
                <Lock className="w-4 h-4 auth-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  className="form-input auth-input"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '10px', marginTop: '6px' }}
            >
              {submitting
                ? 'Creating Account...'
                : formData.role === 'recruiter'
                ? 'Create Recruiter Account'
                : 'Create Developer Account'}
            </button>
          </form>

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
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('login')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-primary)',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
