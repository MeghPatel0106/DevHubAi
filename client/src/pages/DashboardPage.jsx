import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  Send,
  Cpu,
  Award,
  ArrowRight,
  Plus,
  CheckCircle2,
  Circle,
  ExternalLink,
  Github,
  TrendingUp,
  User,
  Sparkles,
  ChevronRight,
  Layers,
  FileText,
  Calendar,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import {
  getProjectsApi,
  getSkillsApi,
  getJobApplicationsApi,
  getMyProfileApi,
  getResumesApi,
  getCertificatesApi,
  getGitHubAnalyticsApi,
  getLatestAIAnalysisApi,
} from '../services/api.js';
import Skeleton from '../components/Skeleton.jsx';

export default function DashboardPage({ onNavigate }) {
  const { user, profile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [applications, setApplications] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [githubAnalytics, setGithubAnalytics] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [profileData, setProfileData] = useState(profile);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [projRes, skillRes, appRes, profRes, resRes, certRes, ghRes, aiRes] = await Promise.allSettled([
          getProjectsApi(),
          getSkillsApi(),
          getJobApplicationsApi(),
          getMyProfileApi(),
          getResumesApi(),
          getCertificatesApi(),
          getGitHubAnalyticsApi(),
          getLatestAIAnalysisApi(),
        ]);

        if (isMounted) {
          if (projRes.status === 'fulfilled' && projRes.value.success) {
            setProjects(projRes.value.data || []);
          }
          if (skillRes.status === 'fulfilled' && skillRes.value.success) {
            setSkills(skillRes.value.data || []);
          }
          if (appRes.status === 'fulfilled' && appRes.value.success) {
            setApplications(appRes.value.data || []);
          }
          if (profRes.status === 'fulfilled' && profRes.value.success) {
            setProfileData(profRes.value.data || null);
          }
          if (resRes.status === 'fulfilled' && resRes.value.success) {
            setResumes(resRes.value.data || []);
          }
          if (certRes.status === 'fulfilled' && certRes.value.success) {
            setCertificates(certRes.value.data || []);
          }
          if (ghRes.status === 'fulfilled' && ghRes.value.success && ghRes.value.connected) {
            setGithubAnalytics(ghRes.value.data || null);
          }
          if (aiRes.status === 'fulfilled' && aiRes.value.success) {
            setAiAnalysis(aiRes.value.data || null);
          }
        }
      } catch (err) {
        console.error('Error loading dashboard metrics:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  const completionScore = profileData?.profileCompletion ?? profile?.profileCompletion ?? 0;
  const interviewingApps = applications.filter((a) =>
    ['Screening', 'Interview'].includes(a.status)
  ).length;

  const upcomingInterviews = applications
    .filter((a) => a.interviewDate && new Date(a.interviewDate) >= new Date(new Date().setHours(0, 0, 0, 0)))
    .sort((a, b) => new Date(a.interviewDate) - new Date(b.interviewDate));
  const nextInterview = upcomingInterviews[0];

  const stats = [
    {
      label: 'Projects',
      value: projects.length,
      subtext: projects.length > 0 ? `${projects.filter((p) => p.featured).length} featured` : 'Add your first project',
      icon: FolderGit2,
      action: () => onNavigate('projects'),
    },
    {
      label: 'Skills Mapped',
      value: skills.length,
      subtext: skills.length > 0 ? `${skills.filter((s) => s.proficiency === 'Advanced' || s.proficiency === 'Expert').length} advanced` : 'Map technical proficiencies',
      icon: Cpu,
      action: () => onNavigate('skills'),
    },
    {
      label: 'Job Applications',
      value: applications.length,
      subtext: interviewingApps > 0 ? `${interviewingApps} in interview stage` : 'Track opportunities',
      icon: Send,
      action: () => onNavigate('applications'),
    },
    {
      label: 'Profile Readiness',
      value: `${completionScore}%`,
      subtext: completionScore >= 80 ? 'Profile optimized' : 'Complete details',
      icon: TrendingUp,
      action: () => onNavigate('profile'),
    },
  ];

  const profileSteps = [
    {
      text: 'Complete personal details, headline, and bio',
      done: Boolean(profileData?.bio && profileData?.headline),
      action: () => onNavigate('profile'),
    },
    {
      text: 'Add at least 2 showcase projects with tech stacks',
      done: projects.length >= 2,
      action: () => onNavigate('projects'),
    },
    {
      text: 'Map your core skills and proficiency levels',
      done: skills.length >= 3,
      action: () => onNavigate('skills'),
    },
    {
      text: 'Track active job applications and interviews',
      done: applications.length >= 1,
      action: () => onNavigate('applications'),
    },
  ];

  const displayName = user?.name?.split(' ')[0] || profileData?.fullName?.split(' ')[0] || 'Developer';
  const profilePhoto = profileData?.profileImage || profile?.profileImage || user?.avatar;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return 'Good morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Good afternoon';
    } else {
      return 'Good evening';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'DH';
    const parts = name.trim().split(' ');
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Skeleton height="100px" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <Skeleton height="110px" />
          <Skeleton height="110px" />
          <Skeleton height="110px" />
          <Skeleton height="110px" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Skeleton height="260px" />
          <Skeleton height="260px" />
        </div>
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
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt={displayName}
              style={{
                width: '52px',
                height: '52px',
                borderRadius: 'var(--radius-lg)',
                objectFit: 'cover',
                border: '2px solid var(--border-subtle)',
                flexShrink: 0,
              }}
            />
          ) : (
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
              {getInitials(user?.name || profileData?.fullName || displayName)}
            </div>
          )}

          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              {getGreeting()}, {displayName}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '4px' }}>
              Track your developer career, projects, and opportunities from one place.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigate('profile')}
            className="btn btn-secondary btn-sm"
          >
            <User className="w-3.5 h-3.5" /> Edit Profile
          </button>
          <button
            onClick={() => onNavigate('projects')}
            className="btn btn-primary btn-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Add Project
          </button>
        </div>
      </div>

      {/* Upcoming Interview Alert Banner (Real MongoDB data) */}
      {nextInterview && (
        <div
          className="card"
          style={{
            padding: '16px 20px',
            background: 'rgba(245, 158, 11, 0.06)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                background: '#f59e0b',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.94rem', color: 'var(--text-primary)' }}>
                  Upcoming Interview: {nextInterview.company}
                </span>
                <span className="badge badge-amber" style={{ fontSize: '0.68rem' }}>
                  {new Date(nextInterview.interviewDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>
                Role: {nextInterview.jobTitle || nextInterview.position} · {nextInterview.workMode || 'Remote'}
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('applications')}
            className="btn btn-secondary btn-sm"
            style={{ borderColor: 'rgba(245, 158, 11, 0.4)' }}
          >
            <UserCheck className="w-3.5 h-3.5" /> View Applications
          </button>
        </div>
      )}

      {/* Metrics Overview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
        }}
      >
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="card card-interactive"
              onClick={stat.action}
              style={{ padding: '18px 20px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  {stat.label}
                </span>
                <Icon className="w-4 h-4 text-secondary" style={{ color: 'var(--text-secondary)' }} />
              </div>

              {loading ? (
                <Skeleton width="40%" height="28px" style={{ marginBottom: '4px' }} />
              ) : (
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                  {stat.value}
                </div>
              )}

              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {stat.subtext}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2-Column Section: Profile Readiness & AI Career Insights */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Profile Readiness */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Profile Readiness</h2>
            <span className={`badge ${completionScore >= 80 ? 'badge-green' : 'badge-amber'}`}>
              {completionScore}% Complete
            </span>
          </div>

          <div className="progress-container" style={{ marginBottom: '16px' }}>
            <div className="progress-fill" style={{ width: `${completionScore}%` }}></div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {profileSteps.map((step, idx) => (
              <div
                key={idx}
                onClick={step.action}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.82rem',
                  padding: '8px 10px',
                  background: 'var(--bg-surface-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {step.done ? (
                    <CheckCircle2 className="w-4 h-4 text-green" style={{ color: 'var(--status-success)' }} />
                  ) : (
                    <Circle className="w-4 h-4 text-muted" style={{ color: 'var(--text-muted)' }} />
                  )}
                  <span style={{ color: step.done ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {step.text}
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted" />
              </div>
            ))}
          </div>
        </div>

        {/* AI Career Insights */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles className="w-4 h-4 text-accent" style={{ color: 'var(--accent-primary)' }} /> AI Career Advisor
              </h2>
              <span className="badge badge-blue">
                {aiAnalysis ? `${aiAnalysis.overallScore}% Readiness` : 'Guidance'}
              </span>
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '10px' }}>
              {aiAnalysis?.summary
                ? aiAnalysis.summary
                : projects.length === 0
                ? 'Your portfolio needs showcase projects. Add at least one production-grade full-stack project with live demo links to strengthen recruiter appeal.'
                : 'Your profile has solid technical coverage. Review your resume bullet points and prepare system design talking points for upcoming interview rounds.'}
            </p>

            {aiAnalysis?.nextActions && aiAnalysis.nextActions.length > 0 && (
              <div style={{ padding: '8px 10px', background: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-sm)', fontSize: '0.76rem', color: 'var(--text-primary)', marginBottom: '12px' }}>
                <strong style={{ color: 'var(--accent-primary)' }}>Top Next Step: </strong>
                {aiAnalysis.nextActions[0].action}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('ai-guide')}
            className="btn btn-outline btn-sm"
            style={{ width: '100%', gap: '6px' }}
          >
            <span>Open AI Career Advisor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2-Column Section: Resume & Certificates Overview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Resume Overview Card */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText className="w-4 h-4 text-secondary" style={{ color: 'var(--text-secondary)' }} />
                <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Active Resume</h2>
              </div>
              <button onClick={() => onNavigate('resume')} className="btn btn-outline btn-sm" style={{ padding: '3px 8px', fontSize: '0.74rem' }}>
                Manage
              </button>
            </div>

            {resumes.length > 0 ? (
              <div style={{ padding: '12px', background: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {(resumes.find((r) => r.isDefault) || resumes[0]).title}
                  </span>
                  <span className="badge badge-green" style={{ fontSize: '0.66rem' }}>Primary ATS</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '4px', margin: '4px 0 0' }}>
                  Updated {new Date((resumes.find((r) => r.isDefault) || resumes[0]).updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            ) : (
              <div style={{ padding: '16px', textAlign: 'center', background: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0 0 10px' }}>No resume created yet.</p>
                <button onClick={() => onNavigate('resume')} className="btn btn-primary btn-sm">
                  <Plus className="w-3 h-3" /> Create Resume
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Certificates Overview Card */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award className="w-4 h-4 text-secondary" style={{ color: 'var(--text-secondary)' }} />
                <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Certifications ({certificates.length})</h2>
              </div>
              <button onClick={() => onNavigate('certificates')} className="btn btn-outline btn-sm" style={{ padding: '3px 8px', fontSize: '0.74rem' }}>
                View All
              </button>
            </div>

            {certificates.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {certificates.slice(0, 2).map((cert) => (
                  <div key={cert._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cert.title}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}> · {cert.issuer}</span>
                    </div>
                    <span className="badge badge-neutral" style={{ fontSize: '0.64rem' }}>Verified</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '16px', textAlign: 'center', background: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0 0 10px' }}>No certificates added yet.</p>
                <button onClick={() => onNavigate('certificates')} className="btn btn-primary btn-sm">
                  <Plus className="w-3 h-3" /> Add Certificate
                </button>
              </div>
            )}
          </div>
        </div>

        {/* GitHub Telemetry Overview Card */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Github className="w-4 h-4 text-secondary" style={{ color: 'var(--text-secondary)' }} />
                <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>GitHub Activity</h2>
              </div>
              <button onClick={() => onNavigate('github')} className="btn btn-outline btn-sm" style={{ padding: '3px 8px', fontSize: '0.74rem' }}>
                {githubAnalytics ? 'Analytics' : 'Connect'}
              </button>
            </div>

            {githubAnalytics ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Account</span>
                  <span className="badge badge-blue" style={{ fontSize: '0.68rem' }}>@{githubAnalytics.profile?.username}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', textAlign: 'center' }}>
                  <div style={{ padding: '6px', background: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block' }}>Repos</span>
                    <span style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)' }}>{githubAnalytics.metrics?.publicRepos || 0}</span>
                  </div>
                  <div style={{ padding: '6px', background: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block' }}>Stars</span>
                    <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#f59e0b' }}>{githubAnalytics.metrics?.totalStars || 0}</span>
                  </div>
                  <div style={{ padding: '6px', background: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block' }}>Lang</span>
                    <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--accent-primary)' }}>{githubAnalytics.metrics?.primaryLanguage || '—'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '16px', textAlign: 'center', background: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0 0 10px' }}>Connect GitHub to showcase repositories & stats.</p>
                <button onClick={() => onNavigate('github')} className="btn btn-primary btn-sm">
                  <Github className="w-3 h-3" /> Connect GitHub
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Projects Showcase */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>Recent Projects</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '2px' }}>
              Engineering prototypes, open-source work, and live deployments
            </p>
          </div>

          <button
            onClick={() => onNavigate('projects')}
            className="btn btn-outline btn-sm"
          >
            View All Projects
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            <Skeleton height="120px" />
            <Skeleton height="120px" />
          </div>
        ) : projects.length === 0 ? (
          <div
            style={{
              padding: '28px 16px',
              textAlign: 'center',
              background: 'var(--bg-surface-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-subtle)',
            }}
          >
            <FolderGit2 className="w-6 h-6 text-muted" style={{ margin: '0 auto 6px', color: 'var(--text-muted)' }} />
            <h3 style={{ fontSize: '0.92rem', fontWeight: 600, marginBottom: '2px' }}>No projects showcased yet</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', maxWidth: '360px', margin: '0 auto 12px' }}>
              Add your engineering projects and repositories to share with recruiters and peers.
            </p>
            <button
              onClick={() => onNavigate('projects')}
              className="btn btn-primary btn-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add Project
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            {projects.slice(0, 3).map((proj) => (
              <div
                key={proj._id}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-secondary)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                      {proj.title}
                    </h4>
                    <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>
                      {proj.category || 'Full Stack'}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '10px', lineHeight: 1.4 }}>
                    {proj.description?.length > 90 ? `${proj.description.substring(0, 90)}...` : proj.description}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {proj.technologies?.slice(0, 3).map((tech, tIdx) => (
                      <span
                        key={tIdx}
                        style={{
                          fontSize: '0.68rem',
                          color: 'var(--text-secondary)',
                          background: '#FFFFFF',
                          border: '1px solid var(--border-subtle)',
                          padding: '1px 5px',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    {proj.githubUrl && (
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="icon-btn"
                        style={{ width: '26px', height: '26px' }}
                        title="GitHub Repository"
                        aria-label="GitHub Repository"
                      >
                        <Github className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {proj.liveUrl && (
                      <a
                        href={proj.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="icon-btn"
                        style={{ width: '26px', height: '26px' }}
                        title="Live Deployment"
                        aria-label="Live Deployment"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
