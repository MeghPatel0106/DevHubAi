import React from 'react';
import {
  Code2,
  Sparkles,
  ArrowRight,
  GitBranch,
  FileText,
  Briefcase,
  Layers,
  Cpu,
  CheckCircle2,
} from 'lucide-react';

export default function LandingPage({ onNavigate }) {
  const features = [
    {
      icon: Layers,
      title: 'Developer Portfolio',
      description:
        'Showcase your engineering projects, technologies, and live deployments with a customizable public profile at /u/yourname.',
    },
    {
      icon: Briefcase,
      title: 'Job Application Tracker',
      description:
        'Organize software engineering opportunities through screening, technical interviews, offers, and compensation notes.',
    },
    {
      icon: Cpu,
      title: 'Technical Skills Matrix',
      description:
        'Map your technical proficiencies across languages, frameworks, cloud platforms, and databases with verified indicators.',
    },
    {
      icon: FileText,
      title: 'Targeted Resume Builder',
      description:
        'Manage multiple targeted resume versions with ATS keyword match readiness and one-click PDF exports.',
    },
    {
      icon: GitBranch,
      title: 'GitHub Telemetry',
      description:
        'Connect your GitHub profile to showcase verified repository statistics, language distributions, and commit metrics.',
    },
    {
      icon: Sparkles,
      title: 'AI Career Guidance',
      description:
        'Get actionable recommendations on skills to learn next, system design preparation, and bio optimization.',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Top Navbar */}
      <header className="landing-navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="sidebar-brand-icon" style={{ width: '30px', height: '30px' }}>
            <Code2 className="w-4 h-4 text-white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
            DevHub AI
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => onNavigate('login')}
            className="btn btn-outline btn-sm"
          >
            Sign In
          </button>
          <button
            onClick={() => onNavigate('register')}
            className="btn btn-primary btn-sm"
          >
            Get Started <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-pill">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Next-Generation Developer Career Platform</span>
        </div>

        <h1 className="landing-hero-title">
          Your developer career, organized.
        </h1>

        <p className="landing-hero-subtitle">
          DevHub AI helps software engineers build verified portfolios, track job applications, manage resumes, and accelerate career growth in one calm workspace.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigate('register')}
            className="btn btn-primary btn-lg"
          >
            Get Started for Free <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('login')}
            className="btn btn-secondary btn-lg"
          >
            Sign In to Dashboard
          </button>
        </div>

        {/* Feature Checkpoints */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
            marginTop: '36px',
            color: 'var(--text-secondary)',
            fontSize: '0.82rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 className="w-4 h-4 text-green" style={{ color: 'var(--status-success)' }} />
            <span>Secure HTTP-Only JWT Sessions</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 className="w-4 h-4 text-green" style={{ color: 'var(--status-success)' }} />
            <span>Real-Time Cloud Storage</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 className="w-4 h-4 text-green" style={{ color: 'var(--status-success)' }} />
            <span>100% Developer Privacy</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ maxWidth: '1140px', margin: '0 auto 64px', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 700, marginBottom: '6px' }}>
            Everything You Need to Manage Your Career
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '540px', margin: '0 auto' }}>
            Built specifically for software engineers, from junior developers to staff architects.
          </p>
        </div>

        <div className="landing-features-grid" style={{ margin: 0, padding: 0 }}>
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="feature-card">
                <div
                  className="feature-icon-wrapper"
                  style={{
                    background: 'var(--accent-primary-subtle)',
                    color: 'var(--accent-primary)',
                  }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>{feat.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.5 }}>
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Call to Action Section */}
      <section style={{ maxWidth: '960px', margin: '0 auto 80px', padding: '0 24px' }}>
        <div
          className="card"
          style={{
            padding: '48px 32px',
            textAlign: 'center',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--bg-surface)',
          }}
        >
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '8px' }}>
            Ready to Take Control of Your Engineering Career?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '520px', margin: '0 auto 24px' }}>
            Join developers building verified portfolios, tracking interviews, and managing technical skills with DevHub AI.
          </p>
          <button
            onClick={() => onNavigate('register')}
            className="btn btn-primary btn-lg"
          >
            Create Your Account <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '24px 36px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          color: 'var(--text-secondary)',
          fontSize: '0.82rem',
          background: 'var(--bg-surface)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Code2 className="w-4 h-4 text-accent" style={{ color: 'var(--accent-primary)' }} />
          <span>DevHub AI © 2026 — Developer Career Management Platform</span>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('login')}>Sign In</span>
          <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('register')}>Register</span>
        </div>
      </footer>
    </div>
  );
}
