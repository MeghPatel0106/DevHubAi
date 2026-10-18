import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  MapPin,
  Briefcase,
  FolderGit2,
  Award,
  FileText,
  GitBranch,
  Star,
  Globe,
  Linkedin,
  Github,
  Plus,
  Trash2,
  Edit2,
  Clock,
  Sparkles,
  User,
  CheckCircle2,
} from 'lucide-react';
import {
  getCandidateDetailsApi,
  addToShortlistApi,
  removeFromShortlistApi,
  createCandidateNoteApi,
  deleteCandidateNoteApi,
} from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import Skeleton from '../components/Skeleton.jsx';

export default function CandidateDetailsPage({ candidateId, onBack, onNavigate }) {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState(null);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [shortlistPending, setShortlistPending] = useState(false);

  // Private Recruiter Notes State
  const [notes, setNotes] = useState([]);
  const [noteContent, setNoteContent] = useState('');
  const [noteStage, setNoteStage] = useState('Review');
  const [submittingNote, setSubmittingNote] = useState(false);

  const fetchCandidateDetails = async () => {
    if (!candidateId) return;
    try {
      setLoading(true);
      const res = await getCandidateDetailsApi(candidateId);
      if (res.success && res.data) {
        setCandidate(res.data);
        setIsShortlisted(Boolean(res.data.isShortlisted));
        setNotes(res.data.notes || []);
      }
    } catch (err) {
      console.error('Error fetching candidate details:', err);
      showToast('Candidate is not discoverable or was not found.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidateDetails();
  }, [candidateId]);

  const handleToggleShortlist = async () => {
    if (!candidate) return;
    const devId = candidate.developerId;
    setShortlistPending(true);

    try {
      if (isShortlisted) {
        await removeFromShortlistApi(devId);
        setIsShortlisted(false);
        showToast(`Removed ${candidate.fullName} from your shortlist.`, 'info');
      } else {
        await addToShortlistApi(devId);
        setIsShortlisted(true);
        showToast(`Added ${candidate.fullName} to your shortlist.`, 'success');
      }
    } catch (err) {
      showToast('Failed to update shortlist status.', 'error');
    } finally {
      setShortlistPending(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) {
      showToast('Note content cannot be empty.', 'error');
      return;
    }

    try {
      setSubmittingNote(true);
      const res = await createCandidateNoteApi(candidate.developerId, {
        content: noteContent.trim(),
        stage: noteStage,
      });

      if (res.success && res.data) {
        setNotes([res.data, ...notes]);
        setNoteContent('');
        showToast('Private recruiter note saved.', 'success');
      }
    } catch (err) {
      showToast('Failed to save recruiter note.', 'error');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteCandidateNoteApi(noteId);
      setNotes(notes.filter((n) => n._id !== noteId));
      showToast('Note deleted.', 'info');
    } catch (err) {
      showToast('Failed to delete note.', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Skeleton height="60px" />
        <Skeleton height="160px" />
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
          <Skeleton height="350px" />
          <Skeleton height="350px" />
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Candidate Not Found</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: '6px', marginBottom: '16px' }}>
          This developer may have toggled their recruiter discoverability to private or does not exist.
        </p>
        <button onClick={onBack} className="btn btn-secondary btn-sm">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Search
        </button>
      </div>
    );
  }

  const publicUrl = candidate.portfolioSlug
    ? `${window.location.origin}/u/${candidate.portfolioSlug}`
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Back Navigation & Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <button
          onClick={onBack}
          className="btn btn-ghost btn-sm"
          style={{ gap: '6px', color: 'var(--text-secondary)' }}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Candidate Search
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          {publicUrl && (
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open Public Portfolio
            </a>
          )}

          <button
            onClick={handleToggleShortlist}
            disabled={shortlistPending}
            className={`btn btn-sm ${isShortlisted ? 'btn-secondary' : 'btn-primary'}`}
          >
            {isShortlisted ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5 text-green" style={{ color: 'var(--status-success)' }} />
                <span>Shortlisted</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5" />
                <span>Shortlist Candidate</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Candidate Profile Banner */}
      <div
        className="card"
        style={{
          padding: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '18px' }}>
          {candidate.profileImage ? (
            <img
              src={candidate.profileImage}
              alt={candidate.fullName}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: 'var(--radius-lg)',
                objectFit: 'cover',
                border: '2px solid var(--border-subtle)',
                flexShrink: 0,
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
                flexShrink: 0,
              }}
            >
              {candidate.fullName?.substring(0, 2).toUpperCase() || 'DH'}
            </div>
          )}

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                {candidate.fullName}
              </h1>
              <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>
                Verified Portfolio
              </span>
            </div>

            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 500 }}>
              {candidate.headline}
            </p>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {candidate.location && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin className="w-3.5 h-3.5" /> {candidate.location}
                </span>
              )}
              {candidate.yearsOfExperience > 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Briefcase className="w-3.5 h-3.5" /> {candidate.yearsOfExperience} Year{candidate.yearsOfExperience === 1 ? '' : 's'} Experience
                </span>
              )}
              {candidate.preferredRole && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Target: {candidate.preferredRole}
                </span>
              )}
            </div>

            {/* Links */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              {candidate.github && (
                <a
                  href={candidate.github.startsWith('http') ? candidate.github : `https://${candidate.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: '0.78rem', padding: '4px 8px' }}
                >
                  <Github className="w-3.5 h-3.5" /> GitHub
                </a>
              )}
              {candidate.linkedin && (
                <a
                  href={candidate.linkedin.startsWith('http') ? candidate.linkedin : `https://${candidate.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: '0.78rem', padding: '4px 8px' }}
                >
                  <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                </a>
              )}
              {candidate.website && (
                <a
                  href={candidate.website.startsWith('http') ? candidate.website : `https://${candidate.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: '0.78rem', padding: '4px 8px' }}
                >
                  <Globe className="w-3.5 h-3.5" /> Website
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout (2-Column Grid) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.2fr)', gap: '20px' }}>
        {/* Left Column: Candidate Portfolio Data */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* About / Bio */}
          {candidate.bio && (
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px' }}>Professional Summary</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
                {candidate.bio}
              </p>
            </div>
          )}

          {/* Technical Skills */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '14px' }}>
              Verified Technical Skills ({candidate.skills?.length || 0})
            </h3>
            {candidate.skills?.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>No skills mapped yet.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {candidate.skills.map((skill) => (
                  <div
                    key={skill._id || skill.name}
                    style={{
                      padding: '6px 12px',
                      background: 'var(--bg-surface-secondary)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {skill.name}
                    </span>
                    {skill.proficiency && (
                      <span className="badge badge-neutral" style={{ fontSize: '0.66rem', padding: '1px 5px' }}>
                        {skill.proficiency}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Showcase Projects */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FolderGit2 className="w-4 h-4 text-secondary" /> Showcase Projects ({candidate.projects?.length || 0})
            </h3>

            {candidate.projects?.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>No public projects published.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {candidate.projects.map((proj) => (
                  <div
                    key={proj._id}
                    style={{
                      padding: '16px',
                      background: 'var(--bg-surface-secondary)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                      <h4 style={{ fontSize: '0.96rem', fontWeight: 700, margin: 0 }}>{proj.title}</h4>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {proj.githubUrl && (
                          <a
                            href={proj.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="icon-btn"
                            title="GitHub Repo"
                          >
                            <Github className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {proj.liveUrl && (
                          <a
                            href={proj.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="icon-btn"
                            title="Live Demo"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {proj.description && (
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '6px 0 10px', lineHeight: 1.5 }}>
                        {proj.description}
                      </p>
                    )}

                    {proj.technologies?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {proj.technologies.map((t, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '0.7rem',
                              padding: '2px 7px',
                              borderRadius: 'var(--radius-sm)',
                              background: 'var(--bg-surface)',
                              border: '1px solid var(--border-subtle)',
                              color: 'var(--text-secondary)',
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Verified Certificates */}
          {candidate.certificates?.length > 0 && (
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Award className="w-4 h-4 text-secondary" /> Verified Certifications ({candidate.certificates.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {candidate.certificates.map((cert) => (
                  <div
                    key={cert._id}
                    style={{
                      padding: '12px 14px',
                      background: 'var(--bg-surface-secondary)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{cert.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {cert.issuer} {cert.credentialId ? `• ID: ${cert.credentialId}` : ''}
                      </div>
                    </div>
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: '0.76rem' }}
                      >
                        Verify <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Private Recruiter Notes & GitHub Telemetry */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Private Recruiter Notes Box */}
          <div className="card" style={{ padding: '24px', border: '1px solid var(--accent-primary-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <FileText className="w-4 h-4 text-accent" style={{ color: 'var(--accent-primary)' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Private Recruiter Notes</h3>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Confidential notes visible only to you. Not visible to the candidate or other recruiters.
            </p>

            {/* Note Creation Form */}
            <form onSubmit={handleAddNote} style={{ marginBottom: '18px' }}>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="e.g. Strong React and Node.js project. Consider for Round 1 technical interview."
                className="form-textarea"
                rows={3}
                style={{ width: '100%', fontSize: '0.82rem', marginBottom: '8px' }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                <select
                  value={noteStage}
                  onChange={(e) => setNoteStage(e.target.value)}
                  className="form-input form-input-sm"
                  style={{ width: 'auto', fontSize: '0.78rem' }}
                >
                  <option value="Review">Stage: Review</option>
                  <option value="Screening">Stage: Screening</option>
                  <option value="Interviewing">Stage: Interviewing</option>
                  <option value="Offer">Stage: Offer</option>
                  <option value="Archived">Stage: Archived</option>
                </select>

                <button
                  type="submit"
                  disabled={submittingNote || !noteContent.trim()}
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '0.78rem' }}
                >
                  <Plus className="w-3.5 h-3.5" /> Save Note
                </button>
              </div>
            </form>

            {/* Notes List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {notes.length === 0 ? (
                <div
                  style={{
                    padding: '16px',
                    textAlign: 'center',
                    background: 'var(--bg-surface-secondary)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  No private notes logged for this candidate yet.
                </div>
              ) : (
                notes.map((note) => (
                  <div
                    key={note._id}
                    style={{
                      padding: '12px',
                      background: 'var(--bg-surface-secondary)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span className="badge badge-blue" style={{ fontSize: '0.64rem' }}>
                        {note.stage || 'Review'}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => handleDeleteNote(note._id)}
                          className="icon-btn"
                          style={{ width: '22px', height: '22px', color: 'var(--status-error)' }}
                          title="Delete Note"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>
                      {note.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* GitHub Telemetry Card */}
          {candidate.githubSummary && (
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <GitBranch className="w-4 h-4 text-accent" />
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>GitHub Activity</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                <div style={{ padding: '10px', background: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Public Repos</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{candidate.githubSummary.publicRepos}</div>
                </div>
                <div style={{ padding: '10px', background: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Stars Received</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{candidate.githubSummary.totalStars}</div>
                </div>
              </div>

              {candidate.githubSummary.primaryLanguage && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Primary Language: <strong>{candidate.githubSummary.primaryLanguage}</strong>
                </div>
              )}
            </div>
          )}

          {/* ATS Resume Summary Preview */}
          {candidate.resume && (
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <FileText className="w-4 h-4 text-secondary" />
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Resume Overview</h3>
              </div>
              <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {candidate.resume.title}
              </div>
              {candidate.resume.summary && (
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.45 }}>
                  {candidate.resume.summary}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
