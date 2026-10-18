import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Users,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  MapPin,
  FolderGit2,
  Award,
  GitBranch,
  Star,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  User,
} from 'lucide-react';
import {
  findCandidatesApi,
  addToShortlistApi,
  removeFromShortlistApi,
} from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Skeleton from '../components/Skeleton.jsx';

export default function FindCandidatesPage({ onNavigate, onSelectCandidate }) {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [hasProjects, setHasProjects] = useState(false);
  const [hasCertificates, setHasCertificates] = useState(false);
  const [githubConnected, setGithubConnected] = useState(false);
  const [sortBy, setSortBy] = useState('recent');

  const [shortlistPending, setShortlistPending] = useState({});

  const fetchCandidates = async (pageToFetch = page) => {
    try {
      setLoading(true);
      const params = {
        page: pageToFetch,
        limit: 9,
        sortBy,
      };

      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (skillFilter.trim()) params.skill = skillFilter.trim();
      if (roleFilter.trim()) params.role = roleFilter.trim();
      if (locationFilter.trim()) params.location = locationFilter.trim();
      if (hasProjects) params.hasProjects = 'true';
      if (hasCertificates) params.hasCertificates = 'true';
      if (githubConnected) params.githubConnected = 'true';

      const res = await findCandidatesApi(params);
      if (res.success) {
        setCandidates(res.data || []);
        setTotalCount(res.total || 0);
        setTotalPages(res.totalPages || 1);
        setPage(res.page || 1);
      }
    } catch (err) {
      console.error('Error fetching candidates:', err);
      showToast('Failed to load candidate talent.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates(1);
  }, [sortBy, hasProjects, hasCertificates, githubConnected]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCandidates(1);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSkillFilter('');
    setRoleFilter('');
    setLocationFilter('');
    setHasProjects(false);
    setHasCertificates(false);
    setGithubConnected(false);
    setSortBy('recent');
    setPage(1);
  };

  const handleToggleShortlist = async (candidate) => {
    const devId = candidate.developerId;
    const isCurrentlyShortlisted = candidate.isShortlisted;

    setShortlistPending((prev) => ({ ...prev, [devId]: true }));
    try {
      if (isCurrentlyShortlisted) {
        await removeFromShortlistApi(devId);
        showToast(`Removed ${candidate.fullName} from your shortlist.`, 'info');
      } else {
        await addToShortlistApi(devId);
        showToast(`Added ${candidate.fullName} to your shortlist.`, 'success');
      }

      setCandidates((prev) =>
        prev.map((c) =>
          c.developerId === devId
            ? { ...c, isShortlisted: !isCurrentlyShortlisted }
            : c
        )
      );
    } catch (err) {
      showToast('Failed to update shortlist status.', 'error');
    } finally {
      setShortlistPending((prev) => ({ ...prev, [devId]: false }));
    }
  };

  const handleViewCandidate = (devId) => {
    if (onSelectCandidate) onSelectCandidate(devId);
    onNavigate('recruiter-candidate-details');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <PageHeader
        title="Find Developers"
        subtitle="Search and discover software engineers based on verified public portfolios and skills."
        action={
          <button
            onClick={() => onNavigate('recruiter-shortlisted')}
            className="btn btn-secondary btn-sm"
          >
            <BookmarkCheck className="w-3.5 h-3.5" /> View Shortlisted
          </button>
        }
      />

      {/* Search & Filter Bar */}
      <div className="card" style={{ padding: '20px' }}>
        <form onSubmit={handleSearchSubmit}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
            <div style={{ flex: '1 1 280px', position: 'relative' }}>
              <Search
                className="w-4 h-4"
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, headline, bio, or tech stack..."
                className="form-input"
                style={{ paddingLeft: '36px', width: '100%' }}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-sm">
              <Search className="w-3.5 h-3.5" /> Search
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

          {/* Secondary Filters */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '10px',
              paddingTop: '12px',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <input
              type="text"
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              placeholder="Filter by skill (e.g. React)"
              className="form-input form-input-sm"
            />

            <input
              type="text"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              placeholder="Target Role (e.g. Frontend)"
              className="form-input form-input-sm"
            />

            <input
              type="text"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              placeholder="Location (e.g. Remote, NY)"
              className="form-input form-input-sm"
            />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-input form-input-sm"
            >
              <option value="recent">Recently Active</option>
              <option value="name">Name (A–Z)</option>
              <option value="completion">Profile Completeness</option>
            </select>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={hasProjects}
                onChange={(e) => setHasProjects(e.target.checked)}
                style={{ accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
              />
              <span>Has Public Projects</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={hasCertificates}
                onChange={(e) => setHasCertificates(e.target.checked)}
                style={{ accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
              />
              <span>Verified Certificates</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={githubConnected}
                onChange={(e) => setGithubConnected(e.target.checked)}
                style={{ accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
              />
              <span>GitHub Connected</span>
            </label>
          </div>
        </form>
      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
          Showing <strong>{candidates.length}</strong> of <strong>{totalCount}</strong> discoverable candidate{totalCount === 1 ? '' : 's'}
        </div>
      </div>

      {/* Candidates Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          <Skeleton height="220px" />
          <Skeleton height="220px" />
          <Skeleton height="220px" />
        </div>
      ) : candidates.length === 0 ? (
        <div
          className="card"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
          }}
        >
          <Users className="w-10 h-10 text-secondary" style={{ margin: '0 auto 12px', color: 'var(--text-muted)' }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>No developers match your search</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: '6px', maxWidth: '440px', margin: '6px auto 16px' }}>
            Try adjusting your search terms, broadening tech stack filters, or resetting filters to discover all publicly available developers.
          </p>
          <button onClick={handleResetFilters} className="btn btn-secondary btn-sm">
            <RotateCcw className="w-3.5 h-3.5" /> Clear Filters
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '16px',
          }}
        >
          {candidates.map((candidate) => {
            const isShortlisted = candidate.isShortlisted;
            const isPending = shortlistPending[candidate.developerId];

            return (
              <div
                key={candidate.developerId}
                className="card"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
                }}
              >
                <div>
                  {/* Candidate Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {candidate.profileImage ? (
                        <img
                          src={candidate.profileImage}
                          alt={candidate.fullName}
                          style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: 'var(--radius-md)',
                            objectFit: 'cover',
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '46px',
                            height: '46px',
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
                        <h4
                          onClick={() => handleViewCandidate(candidate.developerId)}
                          style={{
                            fontSize: '0.98rem',
                            fontWeight: 700,
                            margin: 0,
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                          }}
                        >
                          {candidate.fullName}
                        </h4>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {candidate.headline}
                        </div>
                      </div>
                    </div>

                    {/* Shortlist Action Icon */}
                    <button
                      onClick={() => handleToggleShortlist(candidate)}
                      disabled={isPending}
                      className={`icon-btn ${isShortlisted ? 'active' : ''}`}
                      title={isShortlisted ? 'Remove from Shortlist' : 'Add to Shortlist'}
                      aria-label="Toggle shortlist"
                      style={{
                        color: isShortlisted ? 'var(--status-success)' : 'var(--text-secondary)',
                      }}
                    >
                      {isShortlisted ? (
                        <BookmarkCheck className="w-4 h-4" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Bio snippet & Location */}
                  {candidate.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '10px' }}>
                      <MapPin className="w-3 h-3" />
                      <span>{candidate.location}</span>
                    </div>
                  )}

                  {candidate.bio && (
                    <p
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.45,
                        margin: '8px 0 0',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {candidate.bio}
                    </p>
                  )}

                  {/* Skill Badges */}
                  {candidate.skills?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                      {candidate.skills.slice(0, 5).map((skill, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '0.72rem',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--bg-surface-secondary)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-primary)',
                            fontWeight: 500,
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                      {candidate.skills.length > 5 && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                          +{candidate.skills.length - 5}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer: Metadata & Buttons */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      gap: '12px',
                      fontSize: '0.76rem',
                      color: 'var(--text-secondary)',
                      padding: '10px 0',
                      borderTop: '1px solid var(--border-subtle)',
                      marginBottom: '12px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FolderGit2 className="w-3.5 h-3.5" /> {candidate.projectCount} Project{candidate.projectCount === 1 ? '' : 's'}
                    </span>
                    {candidate.certCount > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Award className="w-3.5 h-3.5" /> {candidate.certCount} Cert{candidate.certCount === 1 ? '' : 's'}
                      </span>
                    )}
                    {candidate.githubConnected && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <GitBranch className="w-3.5 h-3.5" /> {candidate.publicRepos} Repos
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {candidate.portfolioSlug && (
                      <a
                        href={`/u/${candidate.portfolioSlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-sm"
                        style={{ flex: 1, fontSize: '0.78rem', justifyContent: 'center' }}
                      >
                        <ExternalLink className="w-3 h-3" /> View Portfolio
                      </a>
                    )}
                    <button
                      onClick={() => handleViewCandidate(candidate.developerId)}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, fontSize: '0.78rem', justifyContent: 'center' }}
                    >
                      Candidate Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
          <button
            onClick={() => {
              const prev = Math.max(1, page - 1);
              setPage(prev);
              fetchCandidates(prev);
            }}
            disabled={page <= 1 || loading}
            className="btn btn-secondary btn-sm"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Previous
          </button>

          <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => {
              const next = Math.min(totalPages, page + 1);
              setPage(next);
              fetchCandidates(next);
            }}
            disabled={page >= totalPages || loading}
            className="btn btn-secondary btn-sm"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
