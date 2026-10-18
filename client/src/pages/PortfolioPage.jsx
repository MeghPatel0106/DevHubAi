import React, { useState, useEffect } from 'react';
import {
  Globe,
  Copy,
  Check,
  Layout,
  Palette,
  Share2,
  Eye,
  Lock,
  CheckCircle2,
  Save,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getMyProfileApi, updateMyProfileApi } from '../services/api.js';
import PageHeader from '../components/PageHeader.jsx';
import Skeleton from '../components/Skeleton.jsx';

export default function PortfolioPage({ onViewPublic }) {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const [profileData, setProfileData] = useState({
    username: '',
    portfolioSlug: '',
    isPublic: true,
    recruiterDiscoverable: false,
  });

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await getMyProfileApi();
        if (isMounted && res.success && res.data) {
          setProfileData({
            username: res.data.username || '',
            portfolioSlug: res.data.portfolioSlug || res.data.username || '',
            isPublic: res.data.isPublic !== false,
            recruiterDiscoverable: Boolean(res.data.recruiterDiscoverable),
          });
        }
      } catch (err) {
        console.error('Error fetching profile settings:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const currentSlug = profileData.portfolioSlug || profileData.username || '';
  const publicUrl = currentSlug ? `${window.location.origin}/u/${currentSlug}` : '';

  const copyUrl = () => {
    if (!publicUrl) {
      showToast('Please configure a portfolio slug first.', 'error');
      return;
    }
    navigator.clipboard?.writeText(publicUrl);
    setCopied(true);
    showToast('Public portfolio link copied to clipboard.', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePreview = () => {
    if (!currentSlug) {
      showToast('Please set your portfolio URL slug first.', 'error');
      return;
    }
    if (onViewPublic) {
      onViewPublic(currentSlug);
    } else {
      window.open(`/u/${currentSlug}`, '_blank');
    }
  };

  const handleTogglePublic = async () => {
    const newIsPublic = !profileData.isPublic;
    setProfileData((prev) => ({ ...prev, isPublic: newIsPublic }));

    try {
      setSaving(true);
      const res = await updateMyProfileApi({
        isPublic: newIsPublic,
      });
      if (res.success && res.data) {
        setProfileData((prev) => ({
          ...prev,
          isPublic: res.data.isPublic !== false,
        }));
        showToast(`Portfolio is now ${newIsPublic ? 'Publicly Accessible' : 'Private'}.`, 'success');
        refreshUser();
      }
    } catch (err) {
      showToast('Failed to update portfolio privacy setting.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleDiscoverable = async () => {
    const newDiscoverable = !profileData.recruiterDiscoverable;
    setProfileData((prev) => ({ ...prev, recruiterDiscoverable: newDiscoverable }));

    try {
      setSaving(true);
      const res = await updateMyProfileApi({
        recruiterDiscoverable: newDiscoverable,
      });
      if (res.success && res.data) {
        setProfileData((prev) => ({
          ...prev,
          recruiterDiscoverable: Boolean(res.data.recruiterDiscoverable),
        }));
        showToast(
          `Recruiter discoverability is now ${newDiscoverable ? 'Enabled' : 'Disabled'}.`,
          'success'
        );
        refreshUser();
      }
    } catch (err) {
      showToast('Failed to update recruiter discoverability.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSlug = async (e) => {
    e.preventDefault();
    const cleanSlug = profileData.portfolioSlug.toLowerCase().trim();
    if (!cleanSlug) {
      showToast('Portfolio slug cannot be empty.', 'error');
      return;
    }
    if (!/^[a-zA-Z0-9_-]{2,30}$/.test(cleanSlug)) {
      showToast('Slug must be 2-30 alphanumeric characters (underscores and hyphens allowed).', 'error');
      return;
    }

    try {
      setSaving(true);
      const res = await updateMyProfileApi({
        portfolioSlug: cleanSlug,
        username: profileData.username ? profileData.username.toLowerCase().trim() : cleanSlug,
      });
      if (res.success && res.data) {
        setProfileData((prev) => ({
          ...prev,
          portfolioSlug: res.data.portfolioSlug || cleanSlug,
          username: res.data.username || prev.username,
        }));
        showToast(`Portfolio URL slug updated to /u/${res.data.portfolioSlug || cleanSlug}`, 'success');
        refreshUser();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update portfolio slug.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '860px' }}>
      <PageHeader
        title="Portfolio Settings"
        subtitle="Configure public accessibility, custom URL slugs, and preview your live developer portfolio."
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handlePreview}
              disabled={!currentSlug || loading}
              className="btn btn-secondary btn-sm"
            >
              <Eye className="w-3.5 h-3.5" /> Preview Portfolio
            </button>
            <button
              onClick={copyUrl}
              disabled={!currentSlug || loading}
              className="btn btn-primary btn-sm"
            >
              <Share2 className="w-3.5 h-3.5" /> Share Portfolio
            </button>
          </div>
        }
      />

      {loading ? (
        <Skeleton height="140px" />
      ) : (
        <>
          {/* Public Portfolio URL Card */}
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
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className={`badge ${profileData.isPublic ? 'badge-green' : 'badge-neutral'}`}>
                  {profileData.isPublic ? 'Live & Published' : 'Private / Hidden'}
                </span>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  {profileData.isPublic ? 'Accessible without login' : 'Hidden from public visitors'}
                </span>
              </div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>Public Portfolio URL</h2>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '8px',
                  background: 'var(--bg-surface-secondary)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <code style={{ fontSize: '0.84rem', color: 'var(--accent-primary)', fontWeight: 500 }}>
                  {publicUrl || 'No portfolio slug set yet'}
                </code>
                {publicUrl && (
                  <button
                    onClick={copyUrl}
                    className="icon-btn"
                    style={{ width: '26px', height: '26px' }}
                    title="Copy URL"
                    aria-label="Copy URL"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-green" style={{ color: 'var(--status-success)' }} />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handlePreview}
                disabled={!currentSlug}
                className="btn btn-outline btn-sm"
              >
                <Eye className="w-3.5 h-3.5" /> View Public Page
              </button>
            </div>
          </div>

          {/* Privacy & Slug Settings Form */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Globe className="w-4 h-4 text-secondary" style={{ color: 'var(--text-secondary)' }} /> Portfolio Visibility & Slug
            </h3>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 16px',
                background: 'var(--bg-surface-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '12px',
              }}
            >
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Publish Portfolio to Web
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  When enabled, anyone with your link can view your verified projects, skills, and experience.
                </div>
              </div>
              <input
                type="checkbox"
                checked={profileData.isPublic}
                onChange={handleTogglePublic}
                disabled={saving}
                style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
              />
            </div>

            {/* Recruiter Discoverability Setting */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 16px',
                background: 'var(--bg-surface-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '16px',
              }}
            >
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Allow Recruiters to Discover My Profile</span>
                  <span className={`badge ${profileData.recruiterDiscoverable ? 'badge-blue' : 'badge-neutral'}`} style={{ fontSize: '0.64rem' }}>
                    {profileData.recruiterDiscoverable ? 'Discoverable' : 'Hidden'}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  When enabled, verified recruiters on DevHub AI can discover your public profile in talent search. (Default: Off)
                </div>
              </div>
              <input
                type="checkbox"
                checked={profileData.recruiterDiscoverable}
                onChange={handleToggleDiscoverable}
                disabled={saving}
                style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
              />
            </div>

            <form onSubmit={handleSaveSlug} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Custom Portfolio Slug</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', padding: '0 10px', background: 'var(--bg-surface-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    /u/
                  </div>
                  <input
                    type="text"
                    value={profileData.portfolioSlug}
                    onChange={(e) => setProfileData({ ...profileData, portfolioSlug: e.target.value })}
                    className="form-input"
                    placeholder="your-custom-slug"
                    style={{ flex: 1 }}
                  />
                  <button type="submit" disabled={saving} className="btn btn-primary btn-sm">
                    <Save className="w-3.5 h-3.5" /> Save Slug
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Section Visibility Controls */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layout className="w-4 h-4 text-secondary" style={{ color: 'var(--text-secondary)' }} /> Portfolio Sections Included
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { name: 'Developer Headline & Professional Bio', active: true, desc: 'Shown in the top hero summary' },
                { name: 'Technical Skills Matrix', active: true, desc: 'Categorized by language, framework, database, cloud' },
                { name: 'Featured & Public Projects', active: true, desc: 'Public projects with live demo and repository links' },
                { name: 'Work Experience Timeline', active: true, desc: 'Past software engineering roles and achievements' },
                { name: 'Education Credentials', active: true, desc: 'Degrees, universities, and technical bootcamps' },
                { name: 'Certifications & Verified Credentials', active: true, desc: 'Publicly listed credentials and badges' },
                { name: 'Contact & Social Channels', active: true, desc: 'GitHub, LinkedIn, and personal website links' },
              ].map((sec, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    background: 'var(--bg-surface-secondary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 500, color: 'var(--text-primary)' }}>{sec.name}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>{sec.desc}</div>
                  </div>
                  <span className="badge badge-green" style={{ fontSize: '0.68rem' }}>
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
