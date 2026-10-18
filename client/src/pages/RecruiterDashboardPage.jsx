import React, { useState, useEffect } from 'react';
import {
  Users,
  BookmarkCheck,
  FileText,
  Search,
  ArrowRight,
  ExternalLink,
  Briefcase,
  Code2,
  Sparkles,
  User,
  Building,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { getRecruiterDashboardStatsApi } from '../services/api.js';
import Skeleton from '../components/Skeleton.jsx';

export default function RecruiterDashboardPage({ onNavigate, onSelectCandidate }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    discoverableCount: 0,
    shortlistCount: 0,
    notesCount: 0,
    recentShortlists: [],
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    let isMounted = true;
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await getRecruiterDashboardStatsApi();
        if (isMounted && res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Error fetching recruiter dashboard:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  const displayName = user?.name?.split(' ')[0] || 'Recruiter';

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Skeleton height="100px" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <Skeleton height="110px" />
          <Skeleton height="110px" />
          <Skeleton height="110px" />
        </div>
        <Skeleton height="280px" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Welcome Banner */}
      <div
        className="card"
        style={{
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--accent-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1.2rem',
              flexShrink: 0,
            }}
          >
            <Building className="w-6 h-6 text-white" />
          </div>

          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              {getGreeting()}, {displayName}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '4px' }}>
              Discover verified developer talent, review live portfolios, and track candidate evaluations.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigate('recruiter-candidates')}
            className="btn btn-primary btn-sm"
          >
            <Search className="w-3.5 h-3.5" /> Find Developers
          </button>
          <button
            onClick={() => onNavigate('recruiter-shortlisted')}
            className="btn btn-secondary btn-sm"
          >
            <BookmarkCheck className="w-3.5 h-3.5" /> Shortlists ({stats.shortlistCount})
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
        }}
      >
        <div
          className="card clickable-card"
          onClick={() => onNavigate('recruiter-candidates')}
          style={{ padding: '20px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Discoverable Talent
            </span>
            <Users className="w-4 h-4 text-accent" style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {stats.discoverableCount}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Developers with active public portfolios
          </div>
        </div>

        <div
          className="card clickable-card"
          onClick={() => onNavigate('recruiter-shortlisted')}
          style={{ padding: '20px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Shortlisted Candidates
            </span>
            <BookmarkCheck className="w-4 h-4 text-green" style={{ color: 'var(--status-success)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {stats.shortlistCount}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Saved for review & interview rounds
          </div>
        </div>

        <div
          className="card"
          style={{ padding: '20px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Private Notes Logged
            </span>
            <FileText className="w-4 h-4 text-secondary" style={{ color: 'var(--text-secondary)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {stats.notesCount}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Confidential interviewer notes
          </div>
        </div>
      </div>

      {/* Talent Search Jump Card */}
      <div
        className="card"
        style={{
          padding: '24px',
          background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-secondary) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Search Verified Developers by Tech Stack
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', marginTop: '4px', maxWidth: '600px' }}>
            Filter by technologies (React, Node.js, Python, PostgreSQL, AWS), verified credentials, and GitHub repository activity.
          </p>
        </div>
        <button
          onClick={() => onNavigate('recruiter-candidates')}
          className="btn btn-primary"
          style={{ gap: '8px' }}
        >
          <span>Explore Candidates</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Recently Shortlisted Section */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>
              Recent Shortlisted Developers
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Your saved candidates awaiting team evaluation.
            </p>
          </div>
          {stats.recentShortlists?.length > 0 && (
            <button
              onClick={() => onNavigate('recruiter-shortlisted')}
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--accent-primary)', fontSize: '0.82rem' }}
            >
              View All ({stats.shortlistCount})
            </button>
          )}
        </div>

        {stats.recentShortlists?.length === 0 ? (
          <div
            style={{
              padding: '36px 16px',
              textAlign: 'center',
              background: 'var(--bg-surface-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-subtle)',
            }}
          >
            <BookmarkCheck className="w-8 h-8 text-secondary" style={{ margin: '0 auto 10px', color: 'var(--text-muted)' }} />
            <h4 style={{ fontSize: '0.94rem', fontWeight: 600, margin: 0 }}>No shortlisted candidates yet</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '400px', margin: '4px auto 14px' }}>
              When you discover promising developer talent in search, save them to your shortlist to keep track of interviews and private notes.
            </p>
            <button
              onClick={() => onNavigate('recruiter-candidates')}
              className="btn btn-primary btn-sm"
            >
              <Search className="w-3.5 h-3.5" /> Find Candidates
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {stats.recentShortlists.map((candidate) => (
              <div
                key={candidate._id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: 'var(--bg-surface-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {candidate.profileImage ? (
                    <img
                      src={candidate.profileImage}
                      alt={candidate.name}
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: 'var(--radius-md)',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--accent-primary)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                      }}
                    >
                      {candidate.name?.substring(0, 2).toUpperCase() || 'DH'}
                    </div>
                  )}

                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                      {candidate.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {candidate.headline} {candidate.location ? `• ${candidate.location}` : ''}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {candidate.portfolioSlug && (
                    <a
                      href={`/u/${candidate.portfolioSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.78rem', padding: '5px 10px' }}
                    >
                      <ExternalLink className="w-3 h-3" /> Portfolio
                    </a>
                  )}
                  <button
                    onClick={() => {
                      if (onSelectCandidate) onSelectCandidate(candidate.developerId);
                      onNavigate('recruiter-candidate-details');
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.78rem', padding: '5px 10px' }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
