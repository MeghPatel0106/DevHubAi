import React, { useState, useEffect } from 'react';
import {
  BookmarkCheck,
  Search,
  ExternalLink,
  Trash2,
  MapPin,
  Briefcase,
  FileText,
  User,
  ArrowRight,
} from 'lucide-react';
import { getShortlistsApi, removeFromShortlistApi } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Skeleton from '../components/Skeleton.jsx';

export default function ShortlistedPage({ onNavigate, onSelectCandidate }) {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [shortlists, setShortlists] = useState([]);
  const [deletingId, setDeletingId] = useState(null);

  const fetchShortlists = async () => {
    try {
      setLoading(true);
      const res = await getShortlistsApi();
      if (res.success) {
        setShortlists(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching shortlists:', err);
      showToast('Failed to load shortlisted candidates.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShortlists();
  }, []);

  const handleRemove = async (developerId, name) => {
    try {
      setDeletingId(developerId);
      await removeFromShortlistApi(developerId);
      setShortlists((prev) => prev.filter((s) => s.developerId !== developerId));
      showToast(`Removed ${name} from your shortlist.`, 'info');
    } catch (err) {
      showToast('Failed to remove candidate from shortlist.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewCandidate = (developerId) => {
    if (onSelectCandidate) onSelectCandidate(developerId);
    onNavigate('recruiter-candidate-details');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <PageHeader
        title="Shortlisted Candidates"
        subtitle="Manage your saved developer talent and private team evaluations."
        action={
          <button
            onClick={() => onNavigate('recruiter-candidates')}
            className="btn btn-primary btn-sm"
          >
            <Search className="w-3.5 h-3.5" /> Find More Developers
          </button>
        }
      />

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Skeleton height="100px" />
          <Skeleton height="100px" />
          <Skeleton height="100px" />
        </div>
      ) : shortlists.length === 0 ? (
        <div
          className="card"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
          }}
        >
          <BookmarkCheck className="w-10 h-10 text-secondary" style={{ margin: '0 auto 12px', color: 'var(--text-muted)' }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>No candidates shortlisted yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: '6px', maxWidth: '440px', margin: '6px auto 18px' }}>
            When you discover candidates in developer search, save them to your shortlist to keep track of interviews and notes.
          </p>
          <button onClick={() => onNavigate('recruiter-candidates')} className="btn btn-primary btn-sm">
            <Search className="w-3.5 h-3.5" /> Explore Developers
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {shortlists.map((candidate) => (
            <div
              key={candidate._id}
              className="card"
              style={{
                padding: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {candidate.profileImage ? (
                  <img
                    src={candidate.profileImage}
                    alt={candidate.fullName}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-md)',
                      objectFit: 'cover',
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--accent-primary)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '1rem',
                      flexShrink: 0,
                    }}
                  >
                    {candidate.fullName?.substring(0, 2).toUpperCase() || 'DH'}
                  </div>
                )}

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4
                      onClick={() => handleViewCandidate(candidate.developerId)}
                      style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        margin: 0,
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                      }}
                    >
                      {candidate.fullName}
                    </h4>
                    {candidate.notesCount > 0 && (
                      <span className="badge badge-blue" style={{ fontSize: '0.66rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FileText className="w-2.5 h-2.5" /> {candidate.notesCount} note{candidate.notesCount === 1 ? '' : 's'}
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '2px 0 6px' }}>
                    {candidate.headline} {candidate.location ? `• ${candidate.location}` : ''}
                  </p>

                  {/* Skills Pills */}
                  {candidate.skills?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {candidate.skills.slice(0, 5).map((skill, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '0.7rem',
                            padding: '1px 6px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--bg-surface-secondary)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {candidate.portfolioSlug && (
                  <a
                    href={`/u/${candidate.portfolioSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                  >
                    <ExternalLink className="w-3 h-3" /> Portfolio
                  </a>
                )}
                <button
                  onClick={() => handleViewCandidate(candidate.developerId)}
                  className="btn btn-secondary btn-sm"
                >
                  Candidate Details
                </button>
                <button
                  onClick={() => handleRemove(candidate.developerId, candidate.fullName)}
                  disabled={deletingId === candidate.developerId}
                  className="icon-btn"
                  title="Remove from Shortlist"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
