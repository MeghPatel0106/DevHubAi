import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Printer,
  CheckCircle2,
  Edit2,
  Trash2,
  Eye,
  Star,
  Sparkles,
  ArrowLeft,
  Save,
  Layers,
  Globe,
  Github,
  Linkedin,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Award,
  FolderGit2,
  Cpu,
  Check,
  RotateCcw,
} from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  getResumesApi,
  createResumeApi,
  updateResumeApi,
  deleteResumeApi,
  setDefaultResumeApi,
  getMyProfileApi,
  getProjectsApi,
  getSkillsApi,
  getCertificatesApi,
} from '../services/api.js';
import Modal from '../components/Modal.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Skeleton from '../components/Skeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function ResumePage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // View Modes: 'list' | 'builder' | 'preview'
  const [viewMode, setViewMode] = useState('list');
  const [activeResumeId, setActiveResumeId] = useState(null);

  // Mobile builder tab: 'edit' | 'preview'
  const [mobileTab, setMobileTab] = useState('edit');

  // Resume Form Data
  const [resumeForm, setResumeForm] = useState({
    title: 'Full-Stack Software Engineer',
    template: 'modern',
    isDefault: false,
    personal: {
      fullName: '',
      headline: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      github: '',
      linkedin: '',
    },
    summary: '',
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
  });

  // Active builder section tab
  const [editorSection, setEditorSection] = useState('personal');

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const res = await getResumesApi();
      if (res.success) {
        setResumes(res.data || []);
      }
    } catch (err) {
      showToast('Failed to load resumes from server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  // Autofill helper from Profile, Projects, Skills, Certificates
  const handleAutofill = async (isNew = false) => {
    try {
      const [profRes, projRes, skillRes, certRes] = await Promise.allSettled([
        getMyProfileApi(),
        getProjectsApi(),
        getSkillsApi(),
        getCertificatesApi(),
      ]);

      const prof = profRes.status === 'fulfilled' && profRes.value.success ? profRes.value.data : {};
      const projs = projRes.status === 'fulfilled' && projRes.value.success ? projRes.value.data : [];
      const skillsList = skillRes.status === 'fulfilled' && skillRes.value.success ? skillRes.value.data : [];
      const certsList = certRes.status === 'fulfilled' && certRes.value.success ? certRes.value.data : [];

      const initialData = {
        title: isNew ? `${prof.headline || 'Software Engineer'} Resume` : resumeForm.title,
        template: resumeForm.template || 'modern',
        isDefault: isNew ? resumes.length === 0 : resumeForm.isDefault,
        personal: {
          fullName: prof.fullName || user?.name || '',
          headline: prof.headline || 'Senior Full-Stack Engineer',
          email: user?.email || '',
          phone: '',
          location: prof.location || 'Remote',
          website: prof.website || prof.personalWebsite || '',
          github: prof.github || '',
          linkedin: prof.linkedin || '',
        },
        summary: prof.bio || 'Results-driven software engineer with extensive experience building scalable web applications, resilient distributed backend systems, and modern user experiences.',
        skills: skillsList.length > 0 ? skillsList.map((s) => s.name) : ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS'],
        experience: prof.experience?.length > 0
          ? prof.experience.map((e) => ({
              company: e.company,
              position: e.position,
              location: e.location || '',
              startDate: e.startDate ? new Date(e.startDate).getFullYear().toString() : '',
              endDate: e.current ? 'Present' : e.endDate ? new Date(e.endDate).getFullYear().toString() : '',
              description: e.description || '',
            }))
          : [
              {
                company: 'Tech Innovations Inc.',
                position: 'Senior Full Stack Developer',
                location: 'San Francisco, CA',
                startDate: '2023',
                endDate: 'Present',
                description: 'Architected high-throughput microservices using Node.js and MongoDB. Led frontend migration to React.',
              },
            ],
        education: prof.education?.length > 0
          ? prof.education.map((edu) => ({
              school: edu.school || edu.institution,
              degree: edu.degree,
              fieldOfStudy: edu.fieldOfStudy,
              year: edu.endDate ? new Date(edu.endDate).getFullYear().toString() : '2023',
            }))
          : [
              {
                school: 'University of Engineering & Technology',
                degree: 'Bachelor of Science',
                fieldOfStudy: 'Computer Science',
                year: '2022',
              },
            ],
        projects: projs.length > 0
          ? projs.slice(0, 4).map((p) => ({
              title: p.title,
              description: p.description,
              technologies: Array.isArray(p.technologies) ? p.technologies.join(', ') : '',
              liveUrl: p.liveUrl || '',
              githubUrl: p.githubUrl || '',
            }))
          : [],
        certifications: certsList.length > 0
          ? certsList.map((c) => ({
              title: c.title,
              issuer: c.issuer,
              issueDate: c.issueDate ? new Date(c.issueDate).getFullYear().toString() : '',
            }))
          : [],
      };

      setResumeForm(initialData);
      showToast('Profile, skills, projects, and certifications imported into resume builder.', 'info');
    } catch (err) {
      console.error('Autofill error:', err);
    }
  };

  const handleOpenCreate = async () => {
    setActiveResumeId(null);
    await handleAutofill(true);
    setViewMode('builder');
  };

  const handleOpenEdit = (resume) => {
    setActiveResumeId(resume._id);
    setResumeForm({
      title: resume.title || 'Primary Resume',
      template: resume.template || 'modern',
      isDefault: Boolean(resume.isDefault),
      personal: {
        fullName: resume.personal?.fullName || resume.user?.name || user?.name || '',
        headline: resume.personal?.headline || '',
        email: resume.personal?.email || user?.email || '',
        phone: resume.personal?.phone || '',
        location: resume.personal?.location || '',
        website: resume.personal?.website || '',
        github: resume.personal?.github || '',
        linkedin: resume.personal?.linkedin || '',
      },
      summary: resume.summary || '',
      skills: Array.isArray(resume.skills) ? resume.skills : [],
      experience: Array.isArray(resume.experience) ? resume.experience : [],
      education: Array.isArray(resume.education) ? resume.education : [],
      projects: Array.isArray(resume.projects) ? resume.projects : [],
      certifications: Array.isArray(resume.certifications) ? resume.certifications : [],
    });
    setViewMode('builder');
  };

  const handleOpenPreview = (resume) => {
    setActiveResumeId(resume._id);
    setResumeForm({
      title: resume.title || 'Primary Resume',
      template: resume.template || 'modern',
      isDefault: Boolean(resume.isDefault),
      personal: resume.personal || {
        fullName: user?.name || '',
        headline: 'Software Engineer',
        email: user?.email || '',
      },
      summary: resume.summary || '',
      skills: resume.skills || [],
      experience: resume.experience || [],
      education: resume.education || [],
      projects: resume.projects || [],
      certifications: resume.certifications || [],
    });
    setViewMode('preview');
  };

  const handleSaveResume = async () => {
    if (!resumeForm.title.trim()) {
      showToast('Resume title is required.', 'error');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title: resumeForm.title.trim(),
        summary: resumeForm.summary.trim(),
        skills: resumeForm.skills,
        experience: resumeForm.experience,
        education: resumeForm.education,
        projects: resumeForm.projects,
        certifications: resumeForm.certifications,
        personal: resumeForm.personal,
        template: resumeForm.template || 'modern',
        isDefault: resumeForm.isDefault,
      };

      if (activeResumeId) {
        const res = await updateResumeApi(activeResumeId, payload);
        if (res.success) {
          showToast('Resume saved successfully.', 'success');
          fetchResumes();
          setViewMode('list');
        }
      } else {
        const res = await createResumeApi(payload);
        if (res.success) {
          showToast('New resume created successfully.', 'success');
          fetchResumes();
          setViewMode('list');
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save resume.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (id, title) => {
    try {
      const res = await setDefaultResumeApi(id);
      if (res.success) {
        setResumes((prev) =>
          prev.map((r) => ({
            ...r,
            isDefault: r._id === id,
          }))
        );
        showToast(`"${title}" is now your default primary resume.`, 'success');
      }
    } catch (err) {
      showToast('Failed to set default resume.', 'error');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete resume "${title}"? This action cannot be undone.`)) return;

    try {
      const res = await deleteResumeApi(id);
      if (res.success) {
        setResumes((prev) => prev.filter((r) => r._id !== id));
        showToast('Resume deleted.', 'info');
      }
    } catch (err) {
      showToast('Failed to delete resume.', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Skill input handler
  const [newSkillInput, setNewSkillInput] = useState('');
  const handleAddSkill = () => {
    if (!newSkillInput.trim()) return;
    const skillName = newSkillInput.trim();
    if (!resumeForm.skills.includes(skillName)) {
      setResumeForm({ ...resumeForm, skills: [...resumeForm.skills, skillName] });
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skill) => {
    setResumeForm({
      ...resumeForm,
      skills: resumeForm.skills.filter((s) => s !== skill),
    });
  };

  // Experience handlers
  const handleAddExperienceItem = () => {
    setResumeForm({
      ...resumeForm,
      experience: [
        ...resumeForm.experience,
        {
          company: 'Company Name',
          position: 'Role Title',
          location: 'Location',
          startDate: '2022',
          endDate: 'Present',
          description: 'Key technical achievements and responsibilities...',
        },
      ],
    });
  };

  const handleUpdateExperienceItem = (index, field, value) => {
    const updated = [...resumeForm.experience];
    updated[index] = { ...updated[index], [field]: value };
    setResumeForm({ ...resumeForm, experience: updated });
  };

  const handleRemoveExperienceItem = (index) => {
    setResumeForm({
      ...resumeForm,
      experience: resumeForm.experience.filter((_, i) => i !== index),
    });
  };

  // Education handlers
  const handleAddEducationItem = () => {
    setResumeForm({
      ...resumeForm,
      education: [
        ...resumeForm.education,
        {
          school: 'University / Institute',
          degree: 'Degree',
          fieldOfStudy: 'Field of Study',
          year: '2023',
        },
      ],
    });
  };

  const handleUpdateEducationItem = (index, field, value) => {
    const updated = [...resumeForm.education];
    updated[index] = { ...updated[index], [field]: value };
    setResumeForm({ ...resumeForm, education: updated });
  };

  const handleRemoveEducationItem = (index) => {
    setResumeForm({
      ...resumeForm,
      education: resumeForm.education.filter((_, i) => i !== index),
    });
  };

  // Projects handlers
  const handleAddProjectItem = () => {
    setResumeForm({
      ...resumeForm,
      projects: [
        ...resumeForm.projects,
        {
          title: 'Project Title',
          description: 'Brief description of system design and impact...',
          technologies: 'React, Node.js, MongoDB',
          liveUrl: '',
          githubUrl: '',
        },
      ],
    });
  };

  const handleUpdateProjectItem = (index, field, value) => {
    const updated = [...resumeForm.projects];
    updated[index] = { ...updated[index], [field]: value };
    setResumeForm({ ...resumeForm, projects: updated });
  };

  const handleRemoveProjectItem = (index) => {
    setResumeForm({
      ...resumeForm,
      projects: resumeForm.projects.filter((_, i) => i !== index),
    });
  };

  // ==========================================
  // RENDER ATS RESUME SHEET
  // ==========================================
  const renderResumeSheet = () => {
    const { personal, summary, skills, experience, education, projects, certifications, template } = resumeForm;

    return (
      <div
        id="resume-printable-doc"
        className={`resume-doc template-${template || 'modern'}`}
        style={{
          background: '#ffffff',
          color: '#1e293b',
          padding: '36px 40px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          borderRadius: 'var(--radius-md)',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          lineHeight: 1.5,
          minHeight: '800px',
        }}
      >
        {/* Header / Personal */}
        <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '16px', marginBottom: '18px' }}>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: '0 0 4px', color: '#0f172a', letterSpacing: '-0.5px' }}>
            {personal.fullName || 'Developer Name'}
          </h1>
          <div style={{ fontSize: '0.98rem', fontWeight: 600, color: '#2563eb', marginBottom: '8px' }}>
            {personal.headline || 'Software Engineer'}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.8rem', color: '#64748b' }}>
            {personal.email && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Mail className="w-3 h-3" /> {personal.email}
              </span>
            )}
            {personal.phone && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Phone className="w-3 h-3" /> {personal.phone}
              </span>
            )}
            {personal.location && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <MapPin className="w-3 h-3" /> {personal.location}
              </span>
            )}
            {personal.website && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Globe className="w-3 h-3" /> {personal.website}
              </span>
            )}
            {personal.github && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Github className="w-3 h-3" /> {personal.github}
              </span>
            )}
            {personal.linkedin && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Linkedin className="w-3 h-3" /> {personal.linkedin}
              </span>
            )}
          </div>
        </div>

        {/* Professional Summary */}
        {summary && (
          <div style={{ marginBottom: '18px' }}>
            <h2 style={{ fontSize: '0.88rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px', marginBottom: '8px' }}>
              Professional Summary
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.55, margin: 0, whiteSpace: 'pre-line' }}>
              {summary}
            </p>
          </div>
        )}

        {/* Technical Skills */}
        {skills.length > 0 && (
          <div style={{ marginBottom: '18px' }}>
            <h2 style={{ fontSize: '0.88rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px', marginBottom: '8px' }}>
              Technical Proficiencies
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {skills.map((s, i) => (
                <span
                  key={i}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    color: '#1e293b',
                    fontSize: '0.78rem',
                    padding: '2px 7px',
                    borderRadius: '3px',
                    fontWeight: 500,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Work Experience */}
        {experience.length > 0 && (
          <div style={{ marginBottom: '18px' }}>
            <h2 style={{ fontSize: '0.88rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px', marginBottom: '10px' }}>
              Work Experience
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {experience.map((exp, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                      {exp.position} <span style={{ fontWeight: 400, color: '#2563eb' }}>| {exp.company}</span>
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>
                      {exp.startDate} — {exp.endDate || 'Present'} {exp.location ? `· ${exp.location}` : ''}
                    </span>
                  </div>
                  {exp.description && (
                    <p style={{ fontSize: '0.82rem', color: '#334155', margin: '4px 0 0', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Featured Projects */}
        {projects.length > 0 && (
          <div style={{ marginBottom: '18px' }}>
            <h2 style={{ fontSize: '0.88rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px', marginBottom: '10px' }}>
              Key Projects
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {projects.map((proj, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>
                      {proj.title}
                    </span>
                    {proj.technologies && (
                      <span style={{ fontSize: '0.74rem', color: '#64748b', fontStyle: 'italic' }}>
                        Tech: {proj.technologies}
                      </span>
                    )}
                  </div>
                  {proj.description && (
                    <p style={{ fontSize: '0.8rem', color: '#334155', margin: '2px 0 0', lineHeight: 1.45 }}>
                      {proj.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div style={{ marginBottom: '18px' }}>
            <h2 style={{ fontSize: '0.88rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px', marginBottom: '8px' }}>
              Education
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {education.map((edu, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>
                      {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                    </span>
                    <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                      {edu.school}
                    </div>
                  </div>
                  {edu.year && (
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {edu.year}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div>
            <h2 style={{ fontSize: '0.88rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px', marginBottom: '8px' }}>
              Certifications & Credentials
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {certifications.map((cert, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>
                    {cert.title} <span style={{ fontWeight: 400, color: '#64748b' }}>· {cert.issuer}</span>
                  </span>
                  {cert.issueDate && <span style={{ color: '#64748b', fontSize: '0.76rem' }}>{cert.issueDate}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==========================================
  // VIEW: FULLSCREEN / PREVIEW MODE
  // ==========================================
  if (viewMode === 'preview') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <button onClick={() => setViewMode('list')} className="btn btn-outline btn-sm">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Resumes
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setViewMode('builder')} className="btn btn-secondary btn-sm">
              <Edit2 className="w-3.5 h-3.5" /> Edit Resume
            </button>
            <button onClick={handlePrint} className="btn btn-primary btn-sm">
              <Printer className="w-3.5 h-3.5" /> Print / Save PDF
            </button>
          </div>
        </div>

        <div style={{ maxWidth: '820px', margin: '0 auto', width: '100%' }}>
          {renderResumeSheet()}
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: 2-PANEL RESUME BUILDER
  // ==========================================
  if (viewMode === 'builder') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Top Builder Navbar */}
        <div
          className="card"
          style={{
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '260px' }}>
            <button onClick={() => setViewMode('list')} className="btn btn-outline btn-sm" title="Back">
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <input
              type="text"
              value={resumeForm.title}
              onChange={(e) => setResumeForm({ ...resumeForm, title: e.target.value })}
              className="form-input"
              style={{ fontWeight: 600, fontSize: '0.94rem', maxWidth: '320px' }}
              placeholder="Resume Title (e.g. Senior Backend Resume)"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => handleAutofill(false)}
              className="btn btn-outline btn-sm"
              title="Import profile details"
            >
              <Sparkles className="w-3.5 h-3.5" /> Sync from Profile
            </button>

            <button onClick={handlePrint} className="btn btn-secondary btn-sm" title="Print document">
              <Printer className="w-3.5 h-3.5" /> Print / PDF
            </button>

            <button
              onClick={handleSaveResume}
              disabled={saving}
              className="btn btn-primary btn-sm"
            >
              <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save Resume'}
            </button>
          </div>
        </div>

        {/* Mobile Tab Toggle (< 900px) */}
        <div className="mobile-builder-tabs" style={{ display: 'none' }}>
          <button
            onClick={() => setMobileTab('edit')}
            className={`btn btn-sm ${mobileTab === 'edit' ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1 }}
          >
            <Edit2 className="w-3 h-3" /> Edit Form
          </button>
          <button
            onClick={() => setMobileTab('preview')}
            className={`btn btn-sm ${mobileTab === 'preview' ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1 }}
          >
            <Eye className="w-3 h-3" /> Live Preview
          </button>
        </div>

        {/* Two-Panel Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 480px) 1fr', gap: '20px', alignItems: 'flex-start' }}>
          {/* Left Panel: Form Controls */}
          <div
            className="card"
            style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              maxHeight: 'calc(100vh - 180px)',
              overflowY: 'auto',
            }}
          >
            {/* Section Selector Tabs */}
            <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '4px', borderBottom: '1px solid var(--border-subtle)' }}>
              {[
                { id: 'personal', label: 'Personal', icon: Mail },
                { id: 'summary', label: 'Summary', icon: FileText },
                { id: 'skills', label: 'Skills', icon: Cpu },
                { id: 'experience', label: 'Experience', icon: Briefcase },
                { id: 'projects', label: 'Projects', icon: FolderGit2 },
                { id: 'education', label: 'Education', icon: GraduationCap },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setEditorSection(tab.id)}
                  className={`btn btn-sm ${editorSection === tab.id ? 'btn-primary' : 'btn-outline'}`}
                  style={{ fontSize: '0.74rem', padding: '4px 8px', whiteSpace: 'nowrap' }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Section Form: Personal Information */}
            {editorSection === 'personal' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h4 style={{ fontSize: '0.86rem', fontWeight: 600, margin: 0 }}>Contact & Header</h4>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    value={resumeForm.personal.fullName}
                    onChange={(e) =>
                      setResumeForm({
                        ...resumeForm,
                        personal: { ...resumeForm.personal, fullName: e.target.value },
                      })
                    }
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Professional Headline</label>
                  <input
                    type="text"
                    value={resumeForm.personal.headline}
                    onChange={(e) =>
                      setResumeForm({
                        ...resumeForm,
                        personal: { ...resumeForm.personal, headline: e.target.value },
                      })
                    }
                    className="form-input"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      value={resumeForm.personal.email}
                      onChange={(e) =>
                        setResumeForm({
                          ...resumeForm,
                          personal: { ...resumeForm.personal, email: e.target.value },
                        })
                      }
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      value={resumeForm.personal.phone}
                      onChange={(e) =>
                        setResumeForm({
                          ...resumeForm,
                          personal: { ...resumeForm.personal, phone: e.target.value },
                        })
                      }
                      className="form-input"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    value={resumeForm.personal.location}
                    onChange={(e) =>
                      setResumeForm({
                        ...resumeForm,
                        personal: { ...resumeForm.personal, location: e.target.value },
                      })
                    }
                    className="form-input"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div className="form-group">
                    <label className="form-label">GitHub</label>
                    <input
                      type="text"
                      value={resumeForm.personal.github}
                      onChange={(e) =>
                        setResumeForm({
                          ...resumeForm,
                          personal: { ...resumeForm.personal, github: e.target.value },
                        })
                      }
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">LinkedIn</label>
                    <input
                      type="text"
                      value={resumeForm.personal.linkedin}
                      onChange={(e) =>
                        setResumeForm({
                          ...resumeForm,
                          personal: { ...resumeForm.personal, linkedin: e.target.value },
                        })
                      }
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Section Form: Professional Summary */}
            {editorSection === 'summary' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h4 style={{ fontSize: '0.86rem', fontWeight: 600, margin: 0 }}>Summary</h4>
                <div className="form-group">
                  <textarea
                    value={resumeForm.summary}
                    onChange={(e) => setResumeForm({ ...resumeForm, summary: e.target.value })}
                    className="form-textarea"
                    rows={6}
                    placeholder="Highlight your software engineering background, leadership, and key domains..."
                  />
                </div>
              </div>
            )}

            {/* Section Form: Technical Skills */}
            {editorSection === 'skills' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ fontSize: '0.86rem', fontWeight: 600, margin: 0 }}>Skills Matrix</h4>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    className="form-input"
                    placeholder="e.g. React, TypeScript, GraphQL"
                    style={{ flex: 1 }}
                  />
                  <button type="button" onClick={handleAddSkill} className="btn btn-primary btn-sm">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                  {resumeForm.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: 'var(--bg-surface-secondary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '2px 8px',
                        fontSize: '0.76rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-muted)' }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Section Form: Work Experience */}
            {editorSection === 'experience' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '0.86rem', fontWeight: 600, margin: 0 }}>Experience Entries</h4>
                  <button type="button" onClick={handleAddExperienceItem} className="btn btn-secondary btn-sm">
                    <Plus className="w-3 h-3" /> Add Position
                  </button>
                </div>

                {resumeForm.experience.map((exp, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg-surface-secondary)',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Position #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExperienceItem(idx)}
                        className="icon-btn"
                        style={{ width: '24px', height: '24px', color: 'var(--status-danger)' }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleUpdateExperienceItem(idx, 'company', e.target.value)}
                      placeholder="Company"
                      className="form-input"
                    />
                    <input
                      type="text"
                      value={exp.position}
                      onChange={(e) => handleUpdateExperienceItem(idx, 'position', e.target.value)}
                      placeholder="Role / Title"
                      className="form-input"
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <input
                        type="text"
                        value={exp.startDate}
                        onChange={(e) => handleUpdateExperienceItem(idx, 'startDate', e.target.value)}
                        placeholder="Start Year"
                        className="form-input"
                      />
                      <input
                        type="text"
                        value={exp.endDate}
                        onChange={(e) => handleUpdateExperienceItem(idx, 'endDate', e.target.value)}
                        placeholder="End Year / Present"
                        className="form-input"
                      />
                    </div>
                    <textarea
                      value={exp.description}
                      onChange={(e) => handleUpdateExperienceItem(idx, 'description', e.target.value)}
                      placeholder="Bullet points / achievements..."
                      className="form-textarea"
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Section Form: Projects */}
            {editorSection === 'projects' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '0.86rem', fontWeight: 600, margin: 0 }}>Showcase Projects</h4>
                  <button type="button" onClick={handleAddProjectItem} className="btn btn-secondary btn-sm">
                    <Plus className="w-3 h-3" /> Add Project
                  </button>
                </div>

                {resumeForm.projects.map((proj, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg-surface-secondary)',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Project #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveProjectItem(idx)}
                        className="icon-btn"
                        style={{ width: '24px', height: '24px', color: 'var(--status-danger)' }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={proj.title}
                      onChange={(e) => handleUpdateProjectItem(idx, 'title', e.target.value)}
                      placeholder="Project Name"
                      className="form-input"
                    />
                    <input
                      type="text"
                      value={proj.technologies}
                      onChange={(e) => handleUpdateProjectItem(idx, 'technologies', e.target.value)}
                      placeholder="Technologies (e.g. React, Node, Redis)"
                      className="form-input"
                    />
                    <textarea
                      value={proj.description}
                      onChange={(e) => handleUpdateProjectItem(idx, 'description', e.target.value)}
                      placeholder="Short overview of architecture and impact..."
                      className="form-textarea"
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Section Form: Education */}
            {editorSection === 'education' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '0.86rem', fontWeight: 600, margin: 0 }}>Education</h4>
                  <button type="button" onClick={handleAddEducationItem} className="btn btn-secondary btn-sm">
                    <Plus className="w-3 h-3" /> Add Education
                  </button>
                </div>

                {resumeForm.education.map((edu, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg-surface-secondary)',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Degree #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEducationItem(idx)}
                        className="icon-btn"
                        style={{ width: '24px', height: '24px', color: 'var(--status-danger)' }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={edu.school}
                      onChange={(e) => handleUpdateEducationItem(idx, 'school', e.target.value)}
                      placeholder="University / Institute"
                      className="form-input"
                    />
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleUpdateEducationItem(idx, 'degree', e.target.value)}
                      placeholder="Degree (e.g. B.S.)"
                      className="form-input"
                    />
                    <input
                      type="text"
                      value={edu.fieldOfStudy}
                      onChange={(e) => handleUpdateEducationItem(idx, 'fieldOfStudy', e.target.value)}
                      placeholder="Field of Study (e.g. Computer Science)"
                      className="form-input"
                    />
                    <input
                      type="text"
                      value={edu.year}
                      onChange={(e) => handleUpdateEducationItem(idx, 'year', e.target.value)}
                      placeholder="Year (e.g. 2023)"
                      className="form-input"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel: Live ATS Resume Preview */}
          <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 180px)' }}>
            {renderResumeSheet()}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: RESUME LIST / DASHBOARD
  // ==========================================
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <PageHeader
        title="Resume"
        subtitle="Build, manage and maintain your professional ATS-friendly resumes."
        actions={
          <button onClick={handleOpenCreate} className="btn btn-primary btn-sm">
            <Plus className="w-3.5 h-3.5" /> Create Resume
          </button>
        }
      />

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
          <Skeleton height="160px" />
          <Skeleton height="160px" />
        </div>
      ) : resumes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No resume yet"
          description="Create your first professional resume using your developer profile, skills and projects."
          action={
            <button onClick={handleOpenCreate} className="btn btn-primary btn-sm">
              <Plus className="w-3.5 h-3.5" /> Create Resume
            </button>
          }
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px',
          }}
        >
          {resumes.map((resume) => (
            <div
              key={resume._id}
              className="card"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-surface-secondary)',
                        color: 'var(--accent-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '0.98rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                        {resume.title}
                      </h3>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        Updated {new Date(resume.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {resume.isDefault && (
                    <span className="badge badge-green" style={{ fontSize: '0.68rem', gap: '3px' }}>
                      <CheckCircle2 className="w-3 h-3" /> Default
                    </span>
                  )}
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.45, marginBottom: '14px' }}>
                  {resume.summary ? (resume.summary.length > 120 ? `${resume.summary.substring(0, 120)}...` : resume.summary) : 'Custom tailored ATS software engineering resume.'}
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '12px',
                }}
              >
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => handleOpenPreview(resume)}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.76rem', padding: '3px 8px' }}
                  >
                    <Eye className="w-3 h-3" /> Preview
                  </button>
                  <button
                    onClick={() => handleOpenEdit(resume)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.76rem', padding: '3px 8px' }}
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {!resume.isDefault && (
                    <button
                      onClick={() => handleSetDefault(resume._id, resume.title)}
                      className="icon-btn"
                      style={{ width: '28px', height: '28px' }}
                      title="Set as Default Resume"
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(resume._id, resume.title)}
                    className="icon-btn"
                    style={{ width: '28px', height: '28px', color: 'var(--status-danger)' }}
                    title="Delete Resume"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
