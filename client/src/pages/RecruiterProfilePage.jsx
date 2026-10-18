import React, { useState, useEffect } from 'react';
import {
  Building,
  Briefcase,
  Globe,
  Linkedin,
  MapPin,
  Save,
  Upload,
  User,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { getRecruiterProfileApi, updateRecruiterProfileApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Skeleton from '../components/Skeleton.jsx';

export default function RecruiterProfilePage() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    jobTitle: '',
    companyWebsite: '',
    linkedinUrl: '',
    location: '',
    about: '',
    profileImage: '',
  });

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await getRecruiterProfileApi();
        if (isMounted && res.success && res.data) {
          setFormData({
            fullName: res.data.fullName || user?.name || '',
            companyName: res.data.companyName || '',
            jobTitle: res.data.jobTitle || '',
            companyWebsite: res.data.companyWebsite || '',
            linkedinUrl: res.data.linkedinUrl || '',
            location: res.data.location || '',
            about: res.data.about || '',
            profileImage: res.data.profileImage || user?.avatar || '',
          });
        }
      } catch (err) {
        console.error('Error fetching recruiter profile:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Image size exceeds 2MB limit.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, profileImage: reader.result }));
      showToast('Profile photo attached.', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.companyName.trim() || !formData.jobTitle.trim()) {
      showToast('Company Name and Job Title are required.', 'error');
      return;
    }

    try {
      setSaving(true);
      const res = await updateRecruiterProfileApi(formData);
      if (res.success) {
        showToast('Recruiter profile updated successfully.', 'success');
        refreshUser();
      }
    } catch (err) {
      showToast('Failed to update recruiter profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px' }}>
        <Skeleton height="80px" />
        <Skeleton height="360px" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '840px' }}>
      <PageHeader
        title="Recruiter Profile"
        subtitle="Manage your hiring company, title, and talent engagement preferences."
      />

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Avatar Upload Banner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', paddingBottom: '20px', borderBottom: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
            {formData.profileImage ? (
              <img
                src={formData.profileImage}
                alt={formData.fullName}
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
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1.4rem',
                }}
              >
                {formData.fullName?.substring(0, 2).toUpperCase() || 'RC'}
              </div>
            )}

            <div>
              <div style={{ fontWeight: 600, fontSize: '0.94rem', color: 'var(--text-primary)' }}>
                Profile Photo / Company Logo
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                PNG, JPG or WEBP up to 2MB.
              </div>
              <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex' }}>
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          {/* Form Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Sarah Patel"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Company / Organization *</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="TechNova Global"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Your Job Title *</label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                placeholder="Technical Recruiter / Talent Lead"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Hiring Location / Office</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="San Francisco, CA (or Remote)"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Company Website</label>
              <input
                type="url"
                name="companyWebsite"
                value={formData.companyWebsite}
                onChange={handleChange}
                placeholder="https://technova.com"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">LinkedIn Profile URL</label>
              <input
                type="url"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/sarahpatel"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">About Company / Hiring Focus</label>
            <textarea
              name="about"
              value={formData.about}
              onChange={handleChange}
              rows={4}
              placeholder="Describe your engineering team, tech stack preferences, and roles you typically recruit for..."
              className="form-textarea"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px' }}>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{ gap: '6px' }}
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Profile...' : 'Save Profile'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
