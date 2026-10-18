import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  MapPin,
  Globe,
  Github,
  Linkedin,
  Twitter,
  Briefcase,
  GraduationCap,
  Save,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  ExternalLink,
  Lock,
  Eye,
  CheckCircle2,
  Upload,
  Camera,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getMyProfileApi, updateMyProfileApi } from '../services/api.js';
import Modal from '../components/Modal.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Skeleton from '../components/Skeleton.jsx';

export default function ProfilePage({ onViewPublic }) {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    fullName: '',
    username: '',
    headline: '',
    bio: '',
    location: '',
    profileImage: '',
    website: '',
    personalWebsite: '',
    github: '',
    linkedin: '',
    twitter: '',
    currentRole: '',
    yearsOfExperience: 0,
    preferredRole: '',
    preferredLocation: '',
    isPublic: true,
    portfolioSlug: '',
    experience: [],
    education: [],
    profileCompletion: 0,
  });

  const [expModalOpen, setExpModalOpen] = useState(false);
  const [editingExpIdx, setEditingExpIdx] = useState(null);
  const [expForm, setExpForm] = useState({
    company: '',
    position: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
  });

  const [eduModalOpen, setEduModalOpen] = useState(false);
  const [editingEduIdx, setEditingEduIdx] = useState(null);
  const [eduForm, setEduForm] = useState({
    school: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    current: false,
  });

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await getMyProfileApi();
        if (isMounted && res.success && res.data) {
          setProfile({
            fullName: res.data.fullName || user?.name || '',
            username: res.data.username || '',
            headline: res.data.headline || '',
            bio: res.data.bio || '',
            location: res.data.location || '',
            profileImage: res.data.profileImage || '',
            website: res.data.website || res.data.personalWebsite || '',
            personalWebsite: res.data.personalWebsite || res.data.website || '',
            github: res.data.github || '',
            linkedin: res.data.linkedin || '',
            twitter: res.data.twitter || '',
            currentRole: res.data.currentRole || '',
            yearsOfExperience: res.data.yearsOfExperience || 0,
            preferredRole: res.data.preferredRole || '',
            preferredLocation: res.data.preferredLocation || '',
            isPublic: res.data.isPublic !== false,
            portfolioSlug: res.data.portfolioSlug || res.data.username || '',
            experience: res.data.experience || [],
            education: res.data.education || [],
            profileCompletion: res.data.profileCompletion || 0,
          });
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile({
      ...profile,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Profile Image File Browser and Optimizer
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP).', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image file size must be less than 5MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Optimize & resize image using HTML5 Canvas
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setProfile((prev) => ({
          ...prev,
          profileImage: optimizedDataUrl,
        }));
        showToast('Photo selected. Click "Save Profile" to apply changes.', 'info');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setProfile((prev) => ({ ...prev, profileImage: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast('Photo removed. Click "Save Profile" to apply changes.', 'info');
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();

    if (profile.username && !/^[a-zA-Z0-9_-]{2,30}$/.test(profile.username.trim())) {
      showToast('Username must be 2-30 characters (letters, numbers, underscores, hyphens).', 'error');
      return;
    }

    try {
      setSaving(true);
      const res = await updateMyProfileApi({
        ...profile,
        username: profile.username ? profile.username.toLowerCase().trim() : '',
        portfolioSlug: profile.portfolioSlug
          ? profile.portfolioSlug.toLowerCase().trim()
          : profile.username
          ? profile.username.toLowerCase().trim()
          : '',
      });

      if (res.success && res.data) {
        setProfile((prev) => ({
          ...prev,
          ...res.data,
          profileCompletion: res.data.profileCompletion || prev.profileCompletion,
        }));
        showToast('Developer profile saved successfully.', 'success');
        refreshUser();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Experience Handlers
  const handleOpenAddExp = () => {
    setEditingExpIdx(null);
    setExpForm({
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    });
    setExpModalOpen(true);
  };

  const handleOpenEditExp = (exp, idx) => {
    setEditingExpIdx(idx);
    setExpForm({
      company: exp.company || '',
      position: exp.position || '',
      location: exp.location || '',
      startDate: exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : '',
      endDate: exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : '',
      current: Boolean(exp.current),
      description: exp.description || '',
    });
    setExpModalOpen(true);
  };

  const handleSaveExperience = () => {
    if (!expForm.company.trim() || !expForm.position.trim()) {
      showToast('Company name and Position are required.', 'error');
      return;
    }

    const newEntry = {
      company: expForm.company.trim(),
      position: expForm.position.trim(),
      location: expForm.location.trim(),
      startDate: expForm.startDate ? new Date(expForm.startDate) : new Date(),
      endDate: expForm.current || !expForm.endDate ? null : new Date(expForm.endDate),
      current: expForm.current,
      description: expForm.description.trim(),
    };

    let updatedExp;
    if (editingExpIdx !== null) {
      updatedExp = profile.experience.map((item, idx) => (idx === editingExpIdx ? newEntry : item));
    } else {
      updatedExp = [newEntry, ...profile.experience];
    }

    setProfile({ ...profile, experience: updatedExp });
    setExpModalOpen(false);
    showToast('Experience updated. Click "Save Profile" to persist.', 'info');
  };

  const handleDeleteExperience = (index) => {
    const updated = profile.experience.filter((_, idx) => idx !== index);
    setProfile({ ...profile, experience: updated });
    showToast('Experience removed. Click "Save Profile" to persist.', 'info');
  };

  // Education Handlers
  const handleOpenAddEdu = () => {
    setEditingEduIdx(null);
    setEduForm({
      school: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      current: false,
    });
    setEduModalOpen(true);
  };

  const handleOpenEditEdu = (edu, idx) => {
    setEditingEduIdx(idx);
    setEduForm({
      school: edu.school || edu.institution || '',
      degree: edu.degree || '',
      fieldOfStudy: edu.fieldOfStudy || '',
      startDate: edu.startDate ? new Date(edu.startDate).toISOString().split('T')[0] : '',
      endDate: edu.endDate ? new Date(edu.endDate).toISOString().split('T')[0] : '',
      current: Boolean(edu.current),
    });
    setEduModalOpen(true);
  };

  const handleSaveEducation = () => {
    if (!eduForm.school.trim() || !eduForm.degree.trim()) {
      showToast('Institution name and Degree are required.', 'error');
      return;
    }

    const newEntry = {
      school: eduForm.school.trim(),
      degree: eduForm.degree.trim(),
      fieldOfStudy: eduForm.fieldOfStudy.trim(),
      startDate: eduForm.startDate ? new Date(eduForm.startDate) : null,
      endDate: eduForm.current || !eduForm.endDate ? null : new Date(eduForm.endDate),
      current: eduForm.current,
    };

    let updatedEdu;
    if (editingEduIdx !== null) {
      updatedEdu = profile.education.map((item, idx) => (idx === editingEduIdx ? newEntry : item));
    } else {
      updatedEdu = [newEntry, ...profile.education];
    }

    setProfile({ ...profile, education: updatedEdu });
    setEduModalOpen(false);
    showToast('Education updated. Click "Save Profile" to persist.', 'info');
  };

  const handleDeleteEducation = (index) => {
    const updated = profile.education.filter((_, idx) => idx !== index);
    setProfile({ ...profile, education: updated });
    showToast('Education removed. Click "Save Profile" to persist.', 'info');
  };

  const getInitials = (name) => {
    if (!name) return 'DH';
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  const publicSlug = profile.portfolioSlug || profile.username || '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '960px' }}>
      <PageHeader
        title="Developer Profile"
        subtitle="Manage your professional background, career bio, experience timeline, and public portfolio settings."
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => {
                if (!publicSlug) {
                  showToast('Please save a username or custom portfolio slug first.', 'error');
                  return;
                }
                if (onViewPublic) {
                  onViewPublic(publicSlug);
                } else {
                  window.open(`/u/${publicSlug}`, '_blank');
                }
              }}
              disabled={!publicSlug || loading}
              className="btn btn-outline btn-sm"
            >
              <Eye className="w-3.5 h-3.5" /> View Public Profile
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary btn-sm"
            >
              <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        }
      />

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Skeleton height="100px" />
          <Skeleton height="260px" />
        </div>
      ) : (
        <>
          {/* Profile Overview Card */}
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
              {profile.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt={profile.fullName}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: 'var(--radius-lg)',
                    objectFit: 'cover',
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
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.35rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    flexShrink: 0,
                  }}
                >
                  {getInitials(profile.fullName || user?.name)}
                </div>
              )}

              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                  {profile.fullName || user?.name || 'Developer'}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', marginTop: '2px' }}>
                  {profile.headline || 'Software Engineer'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {profile.location && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <MapPin className="w-3.5 h-3.5" /> {profile.location}
                    </span>
                  )}
                  {profile.username && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Globe className="w-3.5 h-3.5" /> /u/{profile.username}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className={`badge ${profile.profileCompletion >= 80 ? 'badge-green' : 'badge-amber'}`}>
                  {profile.profileCompletion}% Complete
                </span>
                <span className={`badge ${profile.isPublic ? 'badge-blue' : 'badge-neutral'}`}>
                  {profile.isPublic ? 'Public Portfolio' : 'Private'}
                </span>
              </div>
              <div style={{ width: '130px' }} className="progress-container">
                <div className="progress-fill" style={{ width: `${profile.profileCompletion}%` }}></div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Basic Information */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User className="w-4 h-4 text-secondary" style={{ color: 'var(--text-secondary)' }} /> Basic Information
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Alex Morgan"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Public Username (URL Slug) *</label>
                  <input
                    type="text"
                    name="username"
                    value={profile.username}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="alexmorgan"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Professional Title / Headline</label>
                <input
                  type="text"
                  name="headline"
                  value={profile.headline}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Senior Full-Stack Engineer | React, Node.js, Distributed Systems"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', alignItems: 'flex-start' }}>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={profile.location}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="San Francisco, CA (or Remote)"
                  />
                </div>

                {/* Profile Photo Browser */}
                <div className="form-group">
                  <label className="form-label">Profile Photo</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    {profile.profileImage ? (
                      <img
                        src={profile.profileImage}
                        alt="Preview"
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: 'var(--radius-md)',
                          objectFit: 'cover',
                          border: '2px solid var(--border-subtle)',
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-surface-secondary)',
                          border: '1px dashed var(--border-medium)',
                          color: 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Camera className="w-4 h-4" />
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/webp, image/gif"
                        onChange={handleImageFileChange}
                        style={{ display: 'none' }}
                        id="profile-photo-browse"
                      />
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="btn btn-secondary btn-sm"
                          style={{ gap: '5px', padding: '4px 10px', fontSize: '0.78rem' }}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{profile.profileImage ? 'Change Photo' : 'Browse Photo'}</span>
                        </button>

                        {profile.profileImage && (
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="btn btn-outline btn-sm"
                            style={{
                              color: 'var(--status-danger)',
                              borderColor: 'var(--status-danger-border)',
                              padding: '4px 8px',
                              fontSize: '0.76rem',
                            }}
                          >
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        )}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        PNG, JPG, or WebP from your device
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Professional Bio</label>
                  <span
                    onClick={() => {
                      setProfile((p) => ({
                        ...p,
                        bio: p.bio
                          ? `${p.bio}\n\nKey Focus: Architecting resilient web applications, distributed APIs, and developer productivity tools.`
                          : 'Full-stack software engineer focused on building performant web applications, clean API architectures, and scalable cloud systems.',
                      }));
                      showToast('Bio template inserted.', 'info');
                    }}
                    style={{ fontSize: '0.74rem', color: 'var(--accent-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                  >
                    <Sparkles className="w-3 h-3" /> Auto-Suggest Bio
                  </span>
                </div>
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  className="form-textarea"
                  rows={4}
                  placeholder="Share your engineering trajectory, core competencies, and career objectives..."
                />
              </div>
            </div>

            {/* Professional Information */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Briefcase className="w-4 h-4 text-secondary" style={{ color: 'var(--text-secondary)' }} /> Professional Information
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Current Role</label>
                  <input
                    type="text"
                    name="currentRole"
                    value={profile.currentRole}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. Senior Software Engineer"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Years of Experience</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    name="yearsOfExperience"
                    value={profile.yearsOfExperience}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Target Role</label>
                  <input
                    type="text"
                    name="preferredRole"
                    value={profile.preferredRole}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. Staff Backend Engineer / Architect"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Location</label>
                  <input
                    type="text"
                    name="preferredLocation"
                    value={profile.preferredLocation}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. Remote / Hybrid Bay Area"
                  />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Globe className="w-4 h-4 text-secondary" style={{ color: 'var(--text-secondary)' }} /> Links & Online Presence
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Personal Website / Portfolio</label>
                  <input
                    type="url"
                    name="website"
                    value={profile.website}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="https://alexmorgan.dev"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">GitHub URL</label>
                  <input
                    type="url"
                    name="github"
                    value={profile.github}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="https://github.com/alexmorgan"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">LinkedIn URL</label>
                  <input
                    type="url"
                    name="linkedin"
                    value={profile.linkedin}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="https://linkedin.com/in/alexmorgan"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Twitter / X URL</label>
                  <input
                    type="url"
                    name="twitter"
                    value={profile.twitter}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="https://x.com/alexmorgan"
                  />
                </div>
              </div>
            </div>

            {/* Portfolio Settings */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Globe className="w-4 h-4 text-secondary" style={{ color: 'var(--text-secondary)' }} /> Portfolio Visibility & Slug
              </h3>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  background: 'var(--bg-surface-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '14px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Public Portfolio Visibility
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Allow anyone to view your verified portfolio, projects, and skills without logging in.
                  </div>
                </div>
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={profile.isPublic}
                  onChange={handleChange}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Custom Portfolio Slug (Optional)</label>
                <input
                  type="text"
                  name="portfolioSlug"
                  value={profile.portfolioSlug}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="alex-morgan-swe"
                />
              </div>
            </div>

            {/* Work Experience Section */}
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Briefcase className="w-4 h-4 text-secondary" style={{ color: 'var(--text-secondary)' }} /> Work Experience
                </h3>
                <button
                  type="button"
                  onClick={handleOpenAddExp}
                  className="btn btn-secondary btn-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Experience
                </button>
              </div>

              {profile.experience.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', background: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0 }}>
                    No work experience listed yet. Add your past engineering roles.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {profile.experience.map((exp, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px 14px',
                        background: 'var(--bg-surface-secondary)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                          {exp.position}
                        </div>
                        <div style={{ color: 'var(--accent-primary)', fontSize: '0.82rem', fontWeight: 500 }}>
                          {exp.company} {exp.location && <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>· {exp.location}</span>}
                        </div>
                        {exp.description && (
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px', lineHeight: 1.4 }}>
                            {exp.description}
                          </p>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditExp(exp, idx)}
                          className="icon-btn"
                          style={{ width: '28px', height: '28px' }}
                          title="Edit experience"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteExperience(idx)}
                          className="icon-btn"
                          style={{ color: 'var(--status-danger)', width: '28px', height: '28px' }}
                          title="Delete experience entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Education Section */}
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <GraduationCap className="w-4 h-4 text-secondary" style={{ color: 'var(--text-secondary)' }} /> Education & Degrees
                </h3>
                <button
                  type="button"
                  onClick={handleOpenAddEdu}
                  className="btn btn-secondary btn-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Education
                </button>
              </div>

              {profile.education.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', background: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0 }}>
                    No education credentials added yet. Add university, degree, or bootcamp.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {profile.education.map((edu, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px 14px',
                        background: 'var(--bg-surface-secondary)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                          {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                          {edu.school || edu.institution}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditEdu(edu, idx)}
                          className="icon-btn"
                          style={{ width: '28px', height: '28px' }}
                          title="Edit education"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEducation(idx)}
                          className="icon-btn"
                          style={{ color: 'var(--status-danger)', width: '28px', height: '28px' }}
                          title="Delete education entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Save Action */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
              >
                <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </>
      )}

      {/* Add / Edit Experience Modal */}
      <Modal
        isOpen={expModalOpen}
        onClose={() => setExpModalOpen(false)}
        title={editingExpIdx !== null ? 'Edit Work Experience' : 'Add Work Experience'}
        footer={
          <>
            <button onClick={() => setExpModalOpen(false)} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button onClick={handleSaveExperience} className="btn btn-primary btn-sm">
              {editingExpIdx !== null ? 'Update Experience' : 'Add Experience'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="form-group">
            <label className="form-label">Company *</label>
            <input
              type="text"
              value={expForm.company}
              onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
              className="form-input"
              placeholder="e.g. Stripe"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Position *</label>
            <input
              type="text"
              value={expForm.position}
              onChange={(e) => setExpForm({ ...expForm, position: e.target.value })}
              className="form-input"
              placeholder="e.g. Senior Software Engineer"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              type="text"
              value={expForm.location}
              onChange={(e) => setExpForm({ ...expForm, location: e.target.value })}
              className="form-input"
              placeholder="e.g. San Francisco (Remote)"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                value={expForm.startDate}
                onChange={(e) => setExpForm({ ...expForm, startDate: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                value={expForm.endDate}
                disabled={expForm.current}
                onChange={(e) => setExpForm({ ...expForm, endDate: e.target.value })}
                className="form-input"
              />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="checkbox"
              id="currentExp"
              checked={expForm.current}
              onChange={(e) => setExpForm({ ...expForm, current: e.target.checked })}
              style={{ cursor: 'pointer' }}
            />
            <label htmlFor="currentExp" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>
              I currently work here
            </label>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              value={expForm.description}
              onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
              className="form-textarea"
              rows={3}
              placeholder="Key contributions and technical stack..."
            />
          </div>
        </div>
      </Modal>

      {/* Add / Edit Education Modal */}
      <Modal
        isOpen={eduModalOpen}
        onClose={() => setEduModalOpen(false)}
        title={editingEduIdx !== null ? 'Edit Education' : 'Add Education'}
        footer={
          <>
            <button onClick={() => setEduModalOpen(false)} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button onClick={handleSaveEducation} className="btn btn-primary btn-sm">
              {editingEduIdx !== null ? 'Update Education' : 'Add Education'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="form-group">
            <label className="form-label">School / Institution *</label>
            <input
              type="text"
              value={eduForm.school}
              onChange={(e) => setEduForm({ ...eduForm, school: e.target.value })}
              className="form-input"
              placeholder="e.g. Stanford University"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Degree *</label>
            <input
              type="text"
              value={eduForm.degree}
              onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
              className="form-input"
              placeholder="e.g. Bachelor of Science"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Field of Study</label>
            <input
              type="text"
              value={eduForm.fieldOfStudy}
              onChange={(e) => setEduForm({ ...eduForm, fieldOfStudy: e.target.value })}
              className="form-input"
              placeholder="e.g. Computer Science"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
