import React, { useState, useEffect } from 'react';
import {
  Globe,
  MapPin,
  Github,
  Linkedin,
  Twitter,
  ExternalLink,
  Code2,
  Briefcase,
  GraduationCap,
  Sparkles,
  Layers,
  Cpu,
  CheckCircle2,
  Calendar,
  Lock,
  ArrowLeft,
  Mail,
  Award,
  FileText,
  Printer,
  Download,
  Share2,
  ChevronDown,
  Menu,
  X,
  Star,
  GitFork,
  BookOpen,
} from 'lucide-react';
import { getPublicPortfolioApi } from '../services/api.js';
import Skeleton from '../components/Skeleton.jsx';

export default function PublicPortfolioPage({ username, onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        setError(null);
        setIsPrivate(false);

        const res = await getPublicPortfolioApi(username);
        if (isMounted) {
          if (res.success && res.data) {
            setData(res.data);
            // Basic recruiter SEO title
            if (res.data.profile?.fullName) {
              document.title = `${res.data.profile.fullName} — ${res.data.profile.headline || 'Developer Portfolio'} | DevHub AI`;
            }
          } else {
            setError(res.message || 'Developer portfolio not found');
          }
        }
      } catch (err) {
        if (isMounted) {
          if (err.response?.status === 403 || err.response?.data?.isPrivate) {
            setIsPrivate(true);
          } else {
            setError(err.response?.data?.message || 'Developer portfolio not found');
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (username) {
      fetchPortfolio();
    }
    return () => {
      isMounted = false;
    };
  }, [username]);

  const getInitials = (name) => {
    if (!name) return 'DH';
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Group skills by category
  const skillsByCategory = (data?.skills || []).reduce((acc, skill) => {
    const cat = skill.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  const profile = data?.profile || {};
  const projects = data?.projects || [];
  const featuredProjects = projects.filter((p) => p.featured);
  const otherProjects = projects.filter((p) => !p.featured);
  const certificates = data?.certificates || [];
  const resume = data?.resume || null;
  const github = data?.github || null;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '40px 20px' }}>
        <div style={{ maxWidth: '880px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Skeleton height="140px" borderRadius="var(--radius-xl)" />
          <Skeleton height="200px" borderRadius="var(--radius-xl)" />
          <Skeleton height="280px" borderRadius="var(--radius-xl)" />
        </div>
      </div>
    );
  }

  if (isPrivate) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '36px 24px', textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--status-warning-bg)',
              color: 'var(--status-warning)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Lock className="w-5 h-5" />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 6px' }}>Private Portfolio</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.5, marginBottom: '20px' }}>
            This developer's portfolio is currently set to private by the owner.
          </p>
          <button onClick={() => onNavigate && onNavigate('landing')} className="btn btn-primary btn-sm" style={{ margin: '0 auto' }}>
            <ArrowLeft className="w-3.5 h-3.5" /> Return to DevHub AI
          </button>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '36px 24px', textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--status-danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Lock className="w-5 h-5" />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 6px' }}>Developer Not Found</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.5, marginBottom: '20px' }}>
            {error || 'No developer profile matches this public URL.'}
          </p>
          <button onClick={() => onNavigate && onNavigate('landing')} className="btn btn-primary btn-sm" style={{ margin: '0 auto' }}>
            <ArrowLeft className="w-3.5 h-3.5" /> Return to DevHub AI
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: '60px' }}>
      {/* Sticky Recruiter Navigation Header */}
      <header
        className="no-print"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '10px 20px',
        }}
      >
        <div
          style={{
            maxWidth: '920px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => onNavigate && onNavigate('landing')}
              className="btn btn-outline btn-sm"
              style={{ padding: '4px 8px', fontSize: '0.74rem' }}
              title="Return to DevHub AI"
            >
              <ArrowLeft className="w-3 h-3" /> DevHub AI
            </button>
            <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
              {profile.fullName}
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="desktop-only" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {profile.bio && (
              <button onClick={() => scrollToSection('about')} className="link-button" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                About
              </button>
            )}
            {Object.keys(skillsByCategory).length > 0 && (
              <button onClick={() => scrollToSection('skills')} className="link-button" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Skills
              </button>
            )}
            {projects.length > 0 && (
              <button onClick={() => scrollToSection('projects')} className="link-button" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Projects
              </button>
            )}
            {github && (
              <button onClick={() => scrollToSection('github')} className="link-button" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                GitHub
              </button>
            )}
            {profile.experience?.length > 0 && (
              <button onClick={() => scrollToSection('experience')} className="link-button" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Experience
              </button>
            )}
            {certificates.length > 0 && (
              <button onClick={() => scrollToSection('certificates')} className="link-button" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Certifications
              </button>
            )}
            {resume && (
              <button onClick={() => scrollToSection('resume')} className="link-button" style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                Resume
              </button>
            )}
            <button onClick={() => scrollToSection('contact')} className="btn btn-primary btn-sm" style={{ padding: '4px 10px', fontSize: '0.76rem' }}>
              Contact
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="mobile-only">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="icon-btn"
              style={{ width: '32px', height: '32px' }}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div
            style={{
              padding: '12px 0',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              borderTop: '1px solid var(--border-subtle)',
              marginTop: '8px',
            }}
          >
            {profile.bio && (
              <button onClick={() => scrollToSection('about')} className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start' }}>
                About
              </button>
            )}
            {Object.keys(skillsByCategory).length > 0 && (
              <button onClick={() => scrollToSection('skills')} className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start' }}>
                Technical Skills
              </button>
            )}
            {projects.length > 0 && (
              <button onClick={() => scrollToSection('projects')} className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start' }}>
                Projects ({projects.length})
              </button>
            )}
            {github && (
              <button onClick={() => scrollToSection('github')} className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start' }}>
                GitHub Activity
              </button>
            )}
            {profile.experience?.length > 0 && (
              <button onClick={() => scrollToSection('experience')} className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start' }}>
                Work Experience
              </button>
            )}
            {certificates.length > 0 && (
              <button onClick={() => scrollToSection('certificates')} className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start' }}>
                Certifications ({certificates.length})
              </button>
            )}
            {resume && (
              <button onClick={() => scrollToSection('resume')} className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start' }}>
                ATS Resume
              </button>
            )}
            <button onClick={() => scrollToSection('contact')} className="btn btn-primary btn-sm" style={{ justifyContent: 'center' }}>
              Contact Developer
            </button>
          </div>
        )}
      </header>

      {/* Main Recruiter Portfolio Body */}
      <main style={{ maxWidth: '880px', margin: '24px auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* 1. Recruiter Hero Section */}
        <section
          className="card"
          style={{
            padding: '32px 28px',
            display: 'flex',
            gap: '24px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          {profile.profileImage ? (
            <img
              src={profile.profileImage}
              alt={profile.fullName}
              style={{
                width: '96px',
                height: '96px',
                borderRadius: 'var(--radius-xl)',
                objectFit: 'cover',
                border: '3px solid var(--border-subtle)',
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: '96px',
                height: '96px',
                borderRadius: 'var(--radius-xl)',
                background: 'var(--accent-primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {getInitials(profile.fullName)}
            </div>
          )}

          <div style={{ flex: 1, minWidth: '260px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                {profile.fullName}
              </h1>
              <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>
                <CheckCircle2 className="w-3 h-3" /> Verified Candidate
              </span>
            </div>

            <div style={{ fontSize: '1rem', color: 'var(--accent-primary)', fontWeight: 500, marginBottom: '6px' }}>
              {profile.headline || 'Software Engineer'}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {profile.location && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin className="w-3.5 h-3.5 text-muted" /> {profile.location}
                </span>
              )}
              {profile.yearsOfExperience > 0 && (
                <span>· {profile.yearsOfExperience}+ Years Experience</span>
              )}
            </div>

            {/* Social & Professional Links */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
              {profile.github && (
                <a
                  href={profile.github.startsWith('http') ? profile.github : `https://github.com/${profile.github}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ padding: '4px 10px', fontSize: '0.76rem' }}
                >
                  <Github className="w-3.5 h-3.5" /> GitHub
                </a>
              )}
              {profile.linkedin && (
                <a
                  href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ padding: '4px 10px', fontSize: '0.76rem' }}
                >
                  <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                </a>
              )}
              {profile.website && (
                <a
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ padding: '4px 10px', fontSize: '0.76rem' }}
                >
                  <Globe className="w-3.5 h-3.5" /> Website
                </a>
              )}
              {profile.twitter && (
                <a
                  href={profile.twitter.startsWith('http') ? profile.twitter : `https://twitter.com/${profile.twitter}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ padding: '4px 10px', fontSize: '0.76rem' }}
                >
                  <Twitter className="w-3.5 h-3.5" /> Twitter
                </a>
              )}
              <button
                onClick={handleCopyLink}
                className="btn btn-outline btn-sm"
                style={{ padding: '4px 10px', fontSize: '0.76rem' }}
                title="Share Portfolio Link"
              >
                <Share2 className="w-3.5 h-3.5" /> {copied ? 'Copied' : 'Share'}
              </button>
            </div>
          </div>
        </section>

        {/* 2. About / Bio Section */}
        {profile.bio && (
          <section id="about" className="card" style={{ padding: '24px 28px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles className="w-4 h-4 text-accent" style={{ color: 'var(--accent-primary)' }} /> Professional Summary
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>
              {profile.bio}
            </p>
          </section>
        )}

        {/* 3. Technical Skills Matrix */}
        {Object.keys(skillsByCategory).length > 0 && (
          <section id="skills" className="card" style={{ padding: '24px 28px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu className="w-4 h-4 text-secondary" style={{ color: 'var(--text-secondary)' }} /> Technical Skills Matrix
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {Object.entries(skillsByCategory).map(([category, catSkills]) => (
                <div key={category}>
                  <div style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                    {category}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {catSkills.map((s) => (
                      <span
                        key={s._id || s.name}
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-primary)',
                          background: 'var(--bg-surface-secondary)',
                          border: '1px solid var(--border-subtle)',
                          padding: '3px 9px',
                          borderRadius: 'var(--radius-sm)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span>{s.name}</span>
                        {s.proficiency && (
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                            · {s.proficiency}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. Showcase & Featured Projects */}
        {projects.length > 0 && (
          <section id="projects">
            <div style={{ marginBottom: '14px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Engineering Projects</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '2px' }}>
                Key software engineering prototypes, system designs, and live deployments
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {projects.map((proj) => (
                <div
                  key={proj._id}
                  className="card"
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                        {proj.title}
                      </h3>
                      <span className="badge badge-neutral" style={{ fontSize: '0.66rem' }}>
                        {proj.category || 'Full Stack'}
                      </span>
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.45, marginBottom: '14px' }}>
                      {proj.description}
                    </p>
                  </div>

                  <div>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      {proj.technologies?.map((tech, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '0.7rem',
                            color: 'var(--text-secondary)',
                            background: 'var(--bg-surface-secondary)',
                            border: '1px solid var(--border-subtle)',
                            padding: '1px 6px',
                            borderRadius: 'var(--radius-sm)',
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                      {proj.liveUrl && (
                        <a
                          href={proj.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-primary btn-sm"
                          style={{ padding: '3px 8px', fontSize: '0.74rem' }}
                        >
                          <ExternalLink className="w-3 h-3" /> Live Demo
                        </a>
                      )}
                      {proj.githubUrl && (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-outline btn-sm"
                          style={{ padding: '3px 8px', fontSize: '0.74rem' }}
                        >
                          <Github className="w-3 h-3" /> Source Code
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* GitHub Activity & Open Source Telemetry (When enabled) */}
        {github && (
          <section id="github" className="card" style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Github className="w-4 h-4 text-secondary" style={{ color: 'var(--text-secondary)' }} /> GitHub Activity & Open Source
                </h2>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Verified public repositories and code activity for <strong>@{github.username}</strong>
                </div>
              </div>

              {github.profileUrl && (
                <a
                  href={github.profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                >
                  <ExternalLink className="w-3 h-3" /> View Profile on GitHub
                </a>
              )}
            </div>

            {/* Quick Metrics Bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '10px',
                marginBottom: '16px',
              }}
            >
              <div style={{ padding: '10px 12px', background: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block' }}>Repositories</span>
                <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{github.publicRepos}</span>
              </div>
              <div style={{ padding: '10px 12px', background: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block' }}>Total Stars</span>
                <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f59e0b' }}>{github.totalStars}</span>
              </div>
              <div style={{ padding: '10px 12px', background: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block' }}>Total Forks</span>
                <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{github.totalForks}</span>
              </div>
              <div style={{ padding: '10px 12px', background: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block' }}>Primary Language</span>
                <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--accent-primary)' }}>{github.primaryLanguage || '—'}</span>
              </div>
            </div>

            {/* Top Repositories Grid */}
            {github.topRepositories && github.topRepositories.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
                {github.topRepositories.map((repo, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px',
                      background: 'var(--bg-surface-secondary)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '6px',
                    }}
                  >
                    <div>
                      <a
                        href={repo.htmlUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: '0.86rem',
                          fontWeight: 600,
                          color: 'var(--accent-primary)',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <BookOpen className="w-3 h-3" /> {repo.name}
                      </a>
                      {repo.description && (
                        <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: '4px 0 0', lineHeight: 1.35 }}>
                          {repo.description}
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      <span>{repo.language || 'Code'}</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {repo.stars > 0 && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                            <Star className="w-2.5 h-2.5" /> {repo.stars}
                          </span>
                        )}
                        {repo.forks > 0 && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                            <GitFork className="w-2.5 h-2.5" /> {repo.forks}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 5. Work Experience Timeline */}
        {profile.experience && profile.experience.length > 0 && (
          <section id="experience" className="card" style={{ padding: '24px 28px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase className="w-4 h-4 text-secondary" style={{ color: 'var(--text-secondary)' }} /> Work Experience
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {profile.experience.map((exp, idx) => (
                <div
                  key={idx}
                  style={{
                    paddingBottom: idx === profile.experience.length - 1 ? 0 : '16px',
                    borderBottom: idx === profile.experience.length - 1 ? 'none' : '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '4px' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.96rem', color: 'var(--text-primary)' }}>
                        {exp.position}
                      </div>
                      <div style={{ color: 'var(--accent-primary)', fontSize: '0.84rem', fontWeight: 500 }}>
                        {exp.company}
                        {exp.location && <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}> · {exp.location}</span>}
                      </div>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {exp.startDate ? new Date(exp.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : ''}
                      {' — '}
                      {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : ''}
                    </div>
                  </div>

                  {exp.description && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', marginTop: '6px', lineHeight: 1.5 }}>
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. Education Credentials */}
        {profile.education && profile.education.length > 0 && (
          <section className="card" style={{ padding: '24px 28px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GraduationCap className="w-4 h-4 text-secondary" style={{ color: 'var(--text-secondary)' }} /> Education & Credentials
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {profile.education.map((edu, idx) => (
                <div key={idx}>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                    {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                    {edu.school || edu.institution}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 7. Certifications & Verified Credentials */}
        {certificates.length > 0 && (
          <section id="certificates" className="card" style={{ padding: '24px 28px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award className="w-4 h-4 text-secondary" style={{ color: 'var(--text-secondary)' }} /> Certifications & Verified Credentials
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
              {certificates.map((cert) => (
                <div
                  key={cert._id}
                  style={{
                    padding: '12px 14px',
                    background: 'var(--bg-surface-secondary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '2px' }}>
                      {cert.title}
                    </div>
                    <div style={{ color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 500 }}>
                      {cert.issuer}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    <span>
                      {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : ''}
                    </span>
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline btn-sm"
                        style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                      >
                        <ExternalLink className="w-2.5 h-2.5" /> Verify
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 8. Recruiter ATS Resume Section */}
        {resume && (
          <section id="resume" className="card" style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText className="w-4 h-4 text-secondary" style={{ color: 'var(--text-secondary)' }} /> Candidate Resume
                </h2>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  Verified ATS Resume format · Updated {new Date(resume.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>

              <button
                onClick={() => window.print()}
                className="btn btn-primary btn-sm no-print"
              >
                <Printer className="w-3.5 h-3.5" /> Print / Download Resume
              </button>
            </div>

            {/* ATS Resume Preview Sheet */}
            <div
              className="ats-resume-sheet"
              style={{
                background: '#FFFFFF',
                color: '#111827',
                padding: '24px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            >
              <div style={{ textAlign: 'center', borderBottom: '1.5px solid #111827', paddingBottom: '10px', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {profile.fullName}
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#4b5563' }}>
                  {profile.headline || 'Software Developer'} {profile.location && `| ${profile.location}`}
                </div>
              </div>

              {resume.summary && (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #d1d5db', paddingBottom: '2px', marginBottom: '6px' }}>
                    Professional Summary
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#374151', lineHeight: 1.45, margin: 0 }}>
                    {resume.summary}
                  </p>
                </div>
              )}

              {resume.skills && resume.skills.length > 0 && (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #d1d5db', paddingBottom: '2px', marginBottom: '6px' }}>
                    Core Technical Skills
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#374151', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {resume.skills.map((s, i) => (
                      <span key={i} style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '3px', fontSize: '0.74rem' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {resume.experience && resume.experience.length > 0 && (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #d1d5db', paddingBottom: '2px', marginBottom: '6px' }}>
                    Professional Experience
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {resume.experience.map((exp, i) => (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600 }}>
                          <span>{exp.position} — {exp.company}</span>
                          <span style={{ fontWeight: 400, color: '#6b7280' }}>
                            {exp.startDate ? new Date(exp.startDate).getFullYear() : ''} - {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).getFullYear() : ''}
                          </span>
                        </div>
                        {exp.description && (
                          <div style={{ fontSize: '0.78rem', color: '#4b5563', marginTop: '2px' }}>
                            {exp.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 9. Recruiter Contact & Professional CTA */}
        <section
          id="contact"
          className="card"
          style={{
            padding: '32px 28px',
            textAlign: 'center',
            background: 'var(--bg-surface)',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 8px' }}>
            Interested in working with {profile.fullName?.split(' ')[0] || 'this developer'}?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', maxWidth: '480px', margin: '0 auto 20px', lineHeight: 1.5 }}>
            Reach out directly for software engineering roles, technical advisory, or consulting opportunities.
          </p>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {profile.linkedin && (
              <a
                href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary btn-sm"
              >
                <Linkedin className="w-3.5 h-3.5" /> Connect on LinkedIn
              </a>
            )}
            {profile.github && (
              <a
                href={profile.github.startsWith('http') ? profile.github : `https://github.com/${profile.github}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline btn-sm"
              >
                <Github className="w-3.5 h-3.5" /> GitHub Profile
              </a>
            )}
            {profile.website && (
              <a
                href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline btn-sm"
              >
                <Globe className="w-3.5 h-3.5" /> Personal Website
              </a>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}
