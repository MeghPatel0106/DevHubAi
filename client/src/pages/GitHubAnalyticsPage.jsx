import React, { useState, useEffect } from 'react';
import {
  Github,
  Star,
  GitFork,
  Code2,
  Users,
  RefreshCw,
  ExternalLink,
  Search,
  CheckCircle2,
  Lock,
  Globe,
  AlertCircle,
  Unlink,
  Calendar,
  Layers,
  ArrowUpDown,
  BookOpen,
} from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';
import {
  getGitHubAnalyticsApi,
  connectGitHubApi,
  refreshGitHubApi,
  updateGitHubVisibilityApi,
  disconnectGitHubApi,
} from '../services/api.js';
import PageHeader from '../components/PageHeader.jsx';
import Skeleton from '../components/Skeleton.jsx';
import Modal from '../components/Modal.jsx';

const LANGUAGE_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Go: '#00ADD8',
  Rust: '#dea584',
  PHP: '#4F5D95',
  Ruby: '#701516',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Vue: '#41b883',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Shell: '#89e051',
};

export default function GitHubAnalyticsPage() {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [disconnectModalOpen, setDisconnectModalOpen] = useState(false);

  const [usernameInput, setUsernameInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [showOnPortfolio, setShowOnPortfolio] = useState(true);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);

  // Repository Explorer Filters
  const [repoSearch, setRepoSearch] = useState('');
  const [languageFilter, setLanguageFilter] = useState('All');
  const [sortBy, setSortBy] = useState('updated'); // 'updated' | 'stars' | 'forks' | 'name'

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await getGitHubAnalyticsApi();
      if (res.success) {
        setConnected(Boolean(res.connected));
        setShowOnPortfolio(res.showOnPortfolio !== false);
        setLastSyncedAt(res.lastSyncedAt || null);
        setAnalyticsData(res.data || null);
        if (res.githubUsername) {
          setUsernameInput(res.githubUsername);
        }
      }
    } catch (err) {
      showToast('Failed to load GitHub analytics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!usernameInput.trim()) {
      showToast('Please enter your GitHub username.', 'error');
      return;
    }

    try {
      setConnecting(true);
      const res = await connectGitHubApi(usernameInput.trim(), showOnPortfolio);
      if (res.success) {
        setConnected(true);
        setAnalyticsData(res.data);
        setLastSyncedAt(res.lastSyncedAt);
        showToast(res.message || 'GitHub account connected.', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to connect GitHub account.', 'error');
    } finally {
      setConnecting(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setSyncing(true);
      const res = await refreshGitHubApi();
      if (res.success) {
        setAnalyticsData(res.data);
        setLastSyncedAt(res.lastSyncedAt);
        showToast('GitHub telemetry data refreshed.', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to refresh GitHub data.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleVisibility = async () => {
    const nextVal = !showOnPortfolio;
    setShowOnPortfolio(nextVal);
    try {
      const res = await updateGitHubVisibilityApi(nextVal);
      if (res.success) {
        showToast(res.message, 'success');
      }
    } catch (err) {
      showToast('Failed to update visibility.', 'error');
      setShowOnPortfolio(!nextVal);
    }
  };

  const handleDisconnect = async () => {
    try {
      const res = await disconnectGitHubApi();
      if (res.success) {
        setConnected(false);
        setAnalyticsData(null);
        setUsernameInput('');
        setDisconnectModalOpen(false);
        showToast('GitHub account disconnected.', 'info');
      }
    } catch (err) {
      showToast('Failed to disconnect GitHub account.', 'error');
    }
  };

  // Filter & sort repositories
  const repositories = analyticsData?.repositories || [];
  const availableLanguages = Array.from(
    new Set(repositories.map((r) => r.language).filter(Boolean))
  );

  const filteredRepos = repositories.filter((repo) => {
    const matchesSearch =
      repo.name.toLowerCase().includes(repoSearch.toLowerCase()) ||
      repo.description?.toLowerCase().includes(repoSearch.toLowerCase());
    const matchesLang = languageFilter === 'All' || repo.language === languageFilter;
    return matchesSearch && matchesLang;
  });

  const sortedRepos = [...filteredRepos].sort((a, b) => {
    if (sortBy === 'stars') return b.stars - a.stars;
    if (sortBy === 'forks') return b.forks - a.forks;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return new Date(b.updatedAt || b.pushedAt) - new Date(a.updatedAt || a.pushedAt);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <PageHeader
        title="GitHub Analytics"
        subtitle="Understand your development activity and showcase your work."
        actions={
          connected ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleRefresh}
                disabled={syncing}
                className="btn btn-secondary btn-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Refresh Data'}
              </button>
              <button
                onClick={() => setDisconnectModalOpen(true)}
                className="btn btn-outline btn-sm"
                style={{ color: 'var(--status-danger)' }}
              >
                <Unlink className="w-3.5 h-3.5" /> Disconnect
              </button>
            </div>
          ) : null
        }
      />

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Skeleton height="120px" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <Skeleton height="80px" />
            <Skeleton height="80px" />
            <Skeleton height="80px" />
            <Skeleton height="80px" />
          </div>
          <Skeleton height="240px" />
        </div>
      ) : !connected ? (
        /* Disconnected State */
        <div className="card" style={{ padding: '36px 24px', textAlign: 'center', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: 'var(--radius-xl)',
              background: 'var(--bg-surface-secondary)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Github className="w-7 h-7" />
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 6px' }}>
            Connect GitHub Account
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.5, maxWidth: '460px', margin: '0 auto 24px' }}>
            Connect your public GitHub profile to calculate real repository statistics, programming language distributions, and star metrics.
          </p>

          <form onSubmit={handleConnect} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '400px', margin: '0 auto' }}>
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label">GitHub Username *</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '0 10px', background: 'var(--bg-surface-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  @
                </div>
                <input
                  type="text"
                  placeholder="e.g. octocat or yourhandle"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="form-input"
                  style={{ flex: 1 }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
              <input
                type="checkbox"
                id="showOnPortfolioCheckbox"
                checked={showOnPortfolio}
                onChange={(e) => setShowOnPortfolio(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="showOnPortfolioCheckbox" className="form-label" style={{ margin: 0, cursor: 'pointer', fontSize: '0.8rem' }}>
                Display GitHub activity on my public portfolio
              </label>
            </div>

            <button type="submit" disabled={connecting} className="btn btn-primary btn-sm" style={{ padding: '8px', fontSize: '0.86rem' }}>
              <Github className="w-4 h-4" /> {connecting ? 'Connecting to GitHub...' : 'Connect GitHub Account'}
            </button>
          </form>

          <div style={{ marginTop: '20px', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            We only access public GitHub repository metadata. No passwords or private tokens are requested.
          </div>
        </div>
      ) : (
        /* Connected State with Real Analytics */
        <>
          {/* GitHub Profile Banner Card */}
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
              {analyticsData?.profile?.avatarUrl ? (
                <img
                  src={analyticsData.profile.avatarUrl}
                  alt={analyticsData.profile.name}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: 'var(--radius-lg)',
                    border: '2px solid var(--border-subtle)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--accent-primary)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Github className="w-8 h-8" />
                </div>
              )}

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                    {analyticsData?.profile?.name || analyticsData?.profile?.username}
                  </h2>
                  <span className="badge badge-blue">
                    @{analyticsData?.profile?.username}
                  </span>
                </div>

                {analyticsData?.profile?.bio && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '2px', margin: '2px 0 0' }}>
                    {analyticsData.profile.bio}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '12px', fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  <span>{analyticsData?.profile?.publicRepos || 0} Repositories</span>
                  <span>·</span>
                  <span>{analyticsData?.profile?.followers || 0} Followers</span>
                  <span>·</span>
                  <span>{analyticsData?.profile?.following || 0} Following</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
              {analyticsData?.profile?.profileUrl && (
                <a
                  href={analyticsData.profile.profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View on GitHub
                </a>
              )}

              {lastSyncedAt && (
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Synced {new Date(lastSyncedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>

          {/* Visibility Toggle Card */}
          <div
            className="card"
            style={{
              padding: '14px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--bg-surface-secondary)',
            }}
          >
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Public Portfolio Visibility
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                {showOnPortfolio
                  ? 'Your GitHub statistics and top repositories are visible to recruiters on your public portfolio.'
                  : 'GitHub statistics are hidden from public portfolio visitors.'}
              </div>
            </div>

            <button
              onClick={handleToggleVisibility}
              className={`btn btn-sm ${showOnPortfolio ? 'btn-secondary' : 'btn-outline'}`}
              style={{ fontSize: '0.78rem' }}
            >
              {showOnPortfolio ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              {showOnPortfolio ? 'Published' : 'Hidden'}
            </button>
          </div>

          {/* Real Metrics Overview Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
            }}
          >
            <div className="card" style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Public Repositories</span>
                <BookOpen className="w-4 h-4 text-secondary" style={{ color: 'var(--text-secondary)' }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {analyticsData?.metrics?.publicRepos ?? 0}
              </div>
            </div>

            <div className="card" style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Total Stars</span>
                <Star className="w-4 h-4 text-secondary" style={{ color: '#f59e0b' }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {analyticsData?.metrics?.totalStars ?? 0}
              </div>
            </div>

            <div className="card" style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Total Forks</span>
                <GitFork className="w-4 h-4 text-secondary" style={{ color: 'var(--text-secondary)' }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {analyticsData?.metrics?.totalForks ?? 0}
              </div>
            </div>

            <div className="card" style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Primary Language</span>
                <Code2 className="w-4 h-4 text-secondary" style={{ color: 'var(--accent-primary)' }} />
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {analyticsData?.metrics?.primaryLanguage || 'None detected'}
              </div>
            </div>
          </div>

          {/* Languages Breakdown */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '14px' }}>
              Programming Languages Distribution
            </h3>

            {analyticsData?.topLanguages && analyticsData.topLanguages.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Horizontal Composite Bar */}
                <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', width: '100%', marginBottom: '6px' }}>
                  {analyticsData.topLanguages.map((lang, idx) => (
                    <div
                      key={idx}
                      style={{
                        width: `${lang.percentage}%`,
                        background: LANGUAGE_COLORS[lang.name] || 'var(--accent-primary)',
                      }}
                      title={`${lang.name}: ${lang.percentage}%`}
                    />
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                  {analyticsData.topLanguages.map((lang, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: LANGUAGE_COLORS[lang.name] || 'var(--accent-primary)',
                        }}
                      />
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{lang.name}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.74rem' }}>{lang.percentage}% ({lang.count} repos)</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                No language data detected in public repositories.
              </div>
            )}
          </div>

          {/* Repository Explorer Section */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
                  Public Repositories ({sortedRepos.length})
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.76rem', marginTop: '2px', margin: 0 }}>
                  Real public repositories and projects from GitHub
                </p>
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <div className="topbar-search" style={{ maxWidth: '200px' }}>
                  <Search className="w-3.5 h-3.5" />
                  <input
                    type="text"
                    placeholder="Search repositories..."
                    value={repoSearch}
                    onChange={(e) => setRepoSearch(e.target.value)}
                  />
                </div>

                {availableLanguages.length > 0 && (
                  <select
                    value={languageFilter}
                    onChange={(e) => setLanguageFilter(e.target.value)}
                    className="form-input"
                    style={{ width: 'auto', padding: '4px 8px', fontSize: '0.78rem' }}
                  >
                    <option value="All">All Languages</option>
                    {availableLanguages.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                )}

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="form-input"
                  style={{ width: 'auto', padding: '4px 8px', fontSize: '0.78rem' }}
                >
                  <option value="updated">Recently Updated</option>
                  <option value="stars">Most Stars</option>
                  <option value="forks">Most Forks</option>
                  <option value="name">Alphabetical</option>
                </select>
              </div>
            </div>

            {sortedRepos.length === 0 ? (
              <div style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                No repositories found matching your filter criteria.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                {sortedRepos.map((repo) => (
                  <div
                    key={repo.id}
                    style={{
                      padding: '14px',
                      background: 'var(--bg-surface-secondary)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '8px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <a
                          href={repo.htmlUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            color: 'var(--accent-primary)',
                            textDecoration: 'none',
                            wordBreak: 'break-word',
                          }}
                        >
                          {repo.name}
                        </a>
                        {repo.isFork && (
                          <span className="badge badge-neutral" style={{ fontSize: '0.62rem' }}>
                            Fork
                          </span>
                        )}
                      </div>

                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '4px 0 8px' }}>
                        {repo.description || 'No description provided.'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {repo.language && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <span
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: LANGUAGE_COLORS[repo.language] || 'var(--text-muted)',
                              }}
                            />
                            {repo.language}
                          </span>
                        )}
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

                      <span>
                        Updated {new Date(repo.updatedAt || repo.pushedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Disconnect Confirmation Modal */}
      <Modal
        isOpen={disconnectModalOpen}
        onClose={() => setDisconnectModalOpen(false)}
        title="Disconnect GitHub Account"
        footer={
          <>
            <button onClick={() => setDisconnectModalOpen(false)} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button onClick={handleDisconnect} className="btn btn-danger btn-sm">
              <Unlink className="w-3.5 h-3.5" /> Disconnect
            </button>
          </>
        }
      >
        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
          Disconnecting your GitHub account will remove cached statistics and hide the GitHub activity section from your public portfolio. Your actual GitHub repositories and account will remain completely unaffected.
        </p>
      </Modal>
    </div>
  );
}
