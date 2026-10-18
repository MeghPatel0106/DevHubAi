import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Send,
  User,
  Bot,
  TrendingUp,
  Target,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Layers,
  Code2,
  Briefcase,
  Award,
  RefreshCw,
  FolderGit2,
  Cpu,
  FileText,
  GitBranch,
  ShieldCheck,
  ChevronRight,
  Lightbulb,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import {
  getCareerGoalsApi,
  updateCareerGoalsApi,
  getLatestAIAnalysisApi,
  runAIProfileAnalysisApi,
  askAICareerQuestionApi,
} from '../services/api.js';
import PageHeader from '../components/PageHeader.jsx';
import Skeleton from '../components/Skeleton.jsx';

const TARGET_ROLES = [
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'DevOps Engineer',
  'Data Scientist',
  'ML Engineer',
];

const EXPERIENCE_LEVELS = ['Fresher', 'Intern', 'Junior', 'Mid-level', 'Senior'];

const PRIMARY_GOALS = [
  'Get first job',
  'Get internship',
  'Switch role',
  'Prepare for interviews',
  'Become job-ready',
  'Improve current profile',
];

export default function AICareerGuidePage({ onNavigate }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [goals, setGoals] = useState({
    targetRole: 'Full Stack Developer',
    experienceLevel: 'Junior',
    primaryGoal: 'Get first job',
  });
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'gaps' | 'roadmap' | 'projects' | 'interview' | 'chat'

  // Chat State
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello ${user?.name?.split(' ')[0] || 'Developer'}. I am your DevHub AI Career Advisor. I have analyzed your verified skills, projects, experience, and GitHub telemetry. What career topic or interview preparation question can I help you with?`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const suggestedPrompts = [
    'How can I improve my resume for my target role?',
    'What standout project should I build next?',
    'Top technical interview questions for my stack',
    'How can I close my highest priority skill gaps?',
  ];

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [goalsRes, analysisRes] = await Promise.allSettled([
        getCareerGoalsApi(),
        getLatestAIAnalysisApi(),
      ]);

      if (goalsRes.status === 'fulfilled' && goalsRes.value.success) {
        setGoals({
          targetRole: goalsRes.value.data?.targetRole || 'Full Stack Developer',
          experienceLevel: goalsRes.value.data?.experienceLevel || 'Junior',
          primaryGoal: goalsRes.value.data?.primaryGoal || 'Get first job',
        });
      }

      if (analysisRes.status === 'fulfilled' && analysisRes.value.success) {
        setAnalysis(analysisRes.value.data || null);
      }
    } catch (err) {
      showToast('Failed to load career analysis.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleRunAnalysis = async () => {
    try {
      setAnalyzing(true);
      const res = await runAIProfileAnalysisApi(goals);
      if (res.success) {
        setAnalysis(res.data);
        showToast('AI profile analysis generated successfully.', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to generate profile analysis.', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGoalChange = async (key, val) => {
    const nextGoals = { ...goals, [key]: val };
    setGoals(nextGoals);
    try {
      setAnalyzing(true);
      const res = await runAIProfileAnalysisApi(nextGoals);
      if (res.success) {
        setAnalysis(res.data);
      }
    } catch (err) {
      console.error('Failed to update analysis on goal change:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const newMessages = [...messages, { role: 'user', content: text.trim() }];
    setMessages(newMessages);
    if (!textToSend) setInputMessage('');
    setIsThinking(true);

    try {
      const res = await askAICareerQuestionApi(text.trim());
      if (res.success && res.data?.answer) {
        setMessages([...newMessages, { role: 'assistant', content: res.data.answer }]);
      }
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content:
            err.response?.data?.message ||
            'I am currently experiencing high demand. Please try asking your career question again in a moment.',
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const readinessScore = typeof analysis?.overallScore === 'number' ? analysis.overallScore : 0;

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--status-success)';
    if (score >= 60) return 'var(--accent-primary)';
    return '#f59e0b';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <PageHeader
        title="AI Career Advisor"
        subtitle="Personalized career intelligence synthesized from your real developer profile, skills, and projects."
        actions={
          <button
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="btn btn-primary btn-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
            {analyzing ? 'Analyzing Profile...' : 'Re-analyze Profile'}
          </button>
        }
      />

      {/* Target Goal Customization Bar */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          background: 'var(--bg-surface-secondary)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Active Career Objective
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
              Target Role: <strong>{goals.targetRole}</strong> · Level: <strong>{goals.experienceLevel}</strong>
            </div>
          </div>
        </div>

        {/* Goal Controls */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={goals.targetRole}
            onChange={(e) => handleGoalChange('targetRole', e.target.value)}
            className="form-input"
            style={{ width: 'auto', padding: '4px 8px', fontSize: '0.8rem' }}
          >
            {TARGET_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          <select
            value={goals.experienceLevel}
            onChange={(e) => handleGoalChange('experienceLevel', e.target.value)}
            className="form-input"
            style={{ width: 'auto', padding: '4px 8px', fontSize: '0.8rem' }}
          >
            {EXPERIENCE_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl} Level
              </option>
            ))}
          </select>

          <select
            value={goals.primaryGoal}
            onChange={(e) => handleGoalChange('primaryGoal', e.target.value)}
            className="form-input"
            style={{ width: 'auto', padding: '4px 8px', fontSize: '0.8rem' }}
          >
            {PRIMARY_GOALS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <button
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.78rem' }}
          >
            Apply & Analyze
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Skeleton height="140px" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <Skeleton height="90px" />
            <Skeleton height="90px" />
            <Skeleton height="90px" />
            <Skeleton height="90px" />
          </div>
          <Skeleton height="260px" />
        </div>
      ) : (
        <>
          {/* Main Readiness Score & Overview Card */}
          <div
            className="card"
            style={{
              padding: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {/* Circular Score Visualizer */}
              <div
                style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  background: 'var(--bg-surface-secondary)',
                  border: `4px solid ${getScoreColor(readinessScore)}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                  {readinessScore}%
                </span>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '2px' }}>
                  Readiness
                </span>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                    {goals.targetRole} Readiness
                  </h2>
                  <span
                    className={`badge ${readinessScore >= 80 ? 'badge-green' : readinessScore >= 60 ? 'badge-blue' : 'badge-amber'}`}
                  >
                    {readinessScore >= 80 ? 'Competitive' : readinessScore >= 60 ? 'On Track' : 'Needs Optimization'}
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', marginTop: '4px', maxWidth: '640px', lineHeight: 1.5, margin: '4px 0 0' }}>
                  {analysis?.summary || 'Analysis indicates strong core technical capabilities. Prioritize containerization and project deployment to maximize hiring conviction.'}
                </p>
              </div>
            </div>

            {analysis?.lastAnalyzedAt && (
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Evaluated {new Date(analysis.lastAnalyzedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>

          {/* Category Breakdown Score Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '10px',
            }}
          >
            {[
              { label: 'Profile', score: analysis?.categoryScores?.profile ?? 0, icon: User },
              { label: 'Skills Alignment', score: analysis?.categoryScores?.skills ?? 0, icon: Cpu },
              { label: 'Projects Depth', score: analysis?.categoryScores?.projects ?? 0, icon: FolderGit2 },
              { label: 'Experience', score: analysis?.categoryScores?.experience ?? 0, icon: Briefcase },
              { label: 'GitHub Telemetry', score: analysis?.categoryScores?.github ?? 0, icon: GitBranch },
              { label: 'ATS Resume', score: analysis?.categoryScores?.resume ?? 0, icon: FileText },
            ].map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div key={idx} className="card" style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>{cat.label}</span>
                    <Icon className="w-3.5 h-3.5 text-secondary" style={{ color: 'var(--text-secondary)' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 700, color: getScoreColor(cat.score) }}>
                      {cat.score}%
                    </span>
                  </div>
                  <div className="progress-container" style={{ height: '4px', marginTop: '6px' }}>
                    <div className="progress-fill" style={{ width: `${cat.score}%`, background: getScoreColor(cat.score) }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Section Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '2px',
              overflowX: 'auto',
            }}
          >
            {[
              { id: 'overview', label: 'Evaluation & Strengths', icon: ShieldCheck },
              { id: 'gaps', label: `Skill Gaps (${analysis?.skillGaps?.length || 0})`, icon: AlertCircle },
              { id: 'roadmap', label: 'Career Roadmap', icon: TrendingUp },
              { id: 'projects', label: 'Recommended Projects', icon: Lightbulb },
              { id: 'interview', label: 'Interview Prep', icon: BookOpen },
              { id: 'chat', label: 'Advisor Q&A', icon: Bot },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline'}`}
                  style={{
                    fontSize: '0.78rem',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-md)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Icon className="w-3.5 h-3.5" /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: Evaluation, Strengths & Next Actions */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Strengths & Weaknesses Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '16px',
                }}
              >
                {/* Verified Strengths */}
                <div className="card" style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 600, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--status-success)' }} />
                    Verified Strengths
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(analysis?.strengths || []).map((str, idx) => (
                      <div key={idx} style={{ padding: '10px 12px', background: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                          {str.title}
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 4px', lineHeight: 1.4 }}>
                          {str.description}
                        </p>
                        {str.impact && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', fontWeight: 500 }}>
                            Impact: {str.impact}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Areas for Growth */}
                <div className="card" style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 600, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertCircle className="w-4 h-4" style={{ color: '#f59e0b' }} />
                    Key Improvement Areas
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(analysis?.weaknesses || []).map((w, idx) => (
                      <div key={idx} style={{ padding: '10px 12px', background: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                          {w.title}
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 4px', lineHeight: 1.4 }}>
                          {w.description}
                        </p>
                        {w.suggestion && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--status-warning)', fontWeight: 500 }}>
                            Recommendation: {w.suggestion}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Your Next Best Actions Checklist */}
              {analysis?.nextActions && analysis.nextActions.length > 0 && (
                <div className="card" style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 600, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Zap className="w-4 h-4 text-accent" style={{ color: 'var(--accent-primary)' }} />
                    Your Next Best Actions
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {analysis.nextActions.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          background: 'var(--bg-surface-secondary)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '8px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span
                            className={`badge ${item.priority === 'High' ? 'badge-amber' : 'badge-blue'}`}
                            style={{ fontSize: '0.66rem' }}
                          >
                            {item.priority} Priority
                          </span>
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                            {item.action}
                          </span>
                        </div>

                        {item.pageLink && onNavigate && (
                          <button
                            onClick={() => onNavigate(item.pageLink)}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                          >
                            Go to {item.category} <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Skill Gap Analysis Matrix */}
          {activeTab === 'gaps' && (
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
                  Skill Gap Matrix for {goals.targetRole}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '2px' }}>
                  Identifies standard technologies expected in technical interviews that are missing from your mapped skills.
                </p>
              </div>

              {analysis?.skillGaps && analysis.skillGaps.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                  {analysis.skillGaps.map((gap, idx) => (
                    <div
                      key={idx}
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-primary)' }}>
                            {gap.skill}
                          </span>
                          <span
                            className={`badge ${gap.priority === 'High' ? 'badge-amber' : 'badge-neutral'}`}
                            style={{ fontSize: '0.64rem' }}
                          >
                            {gap.priority} Priority
                          </span>
                        </div>

                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '6px' }}>
                          <strong>Why:</strong> {gap.reason}
                        </div>
                      </div>

                      <div style={{ padding: '8px 10px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.74rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--accent-primary)', display: 'block' }}>Actionable Learning:</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{gap.recommendedLearning}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
                  No major skill gaps identified for your target role! Your mapped skills match the core benchmark.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Career Roadmap */}
          {activeTab === 'roadmap' && (
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
                  Personalized Engineering Roadmap ({goals.targetRole})
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '2px' }}>
                  Step-by-step milestone progression tailored to your current readiness score.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {(analysis?.roadmap || []).map((phase) => (
                  <div
                    key={phase.phaseNumber}
                    style={{
                      padding: '16px 18px',
                      background: 'var(--bg-surface-secondary)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      borderLeft: '4px solid var(--accent-primary)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="badge badge-blue" style={{ fontSize: '0.68rem' }}>
                          Phase {phase.phaseNumber}
                        </span>
                        <span style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-primary)' }}>
                          {phase.title}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        {phase.duration}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', marginTop: '10px' }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                          Milestone Goals
                        </span>
                        <ul style={{ margin: '4px 0 0', paddingLeft: '16px', fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                          {phase.goals.map((g, i) => (
                            <li key={i}>{g}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                          Action Items
                        </span>
                        <ul style={{ margin: '4px 0 0', paddingLeft: '16px', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          {phase.actionItems.map((a, i) => (
                            <li key={i}>{a}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Recommended Projects */}
          {activeTab === 'projects' && (
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
                  Tailored Gap-Bridging Project Ideas
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '2px' }}>
                  Project architectures specifically designed to bridge your missing skills and demonstrate production capabilities.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
                {(analysis?.recommendedProjects || []).map((proj, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '16px',
                      background: 'var(--bg-surface-secondary)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '10px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-primary)' }}>
                          {proj.title}
                        </span>
                        <span className="badge badge-purple" style={{ fontSize: '0.64rem' }}>
                          {proj.difficulty}
                        </span>
                      </div>

                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '4px 0 8px' }}>
                        {proj.description}
                      </p>

                      <div style={{ fontSize: '0.74rem', color: 'var(--accent-primary)', fontWeight: 500, marginBottom: '8px' }}>
                        🎯 {proj.fillsGap}
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {proj.techStack.map((tech, tIdx) => (
                          <span
                            key={tIdx}
                            style={{
                              fontSize: '0.7rem',
                              padding: '2px 6px',
                              borderRadius: 'var(--radius-sm)',
                              background: 'var(--bg-surface)',
                              border: '1px solid var(--border-subtle)',
                              color: 'var(--text-secondary)',
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Interview Preparation */}
          {activeTab === 'interview' && (
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
                  Technical Interview Preparation Focus
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '2px' }}>
                  Targeted questions and system design topics aligned with your technology stack.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(analysis?.interviewTopics || []).map((topicGroup, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '14px',
                      background: 'var(--bg-surface-secondary)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
                      {topicGroup.category}
                    </div>

                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {topicGroup.topics.map((t, tIdx) => (
                        <li key={tIdx}>{t}</li>
                      ))}
                    </ul>

                    {topicGroup.practiceTips && (
                      <div style={{ marginTop: '8px', fontSize: '0.74rem', color: 'var(--accent-primary)', fontWeight: 500 }}>
                        💡 Tip: {topicGroup.practiceTips}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: Interactive Advisor Q&A */}
          {activeTab === 'chat' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Suggested Prompt Buttons */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
                {suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="btn btn-outline btn-sm"
                    style={{
                      whiteSpace: 'nowrap',
                      fontSize: '0.74rem',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <Sparkles className="w-3 h-3 text-accent" style={{ color: 'var(--accent-primary)' }} />
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>

              {/* Chat Window */}
              <div
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '460px',
                  padding: 0,
                  overflow: 'hidden',
                }}
              >
                {/* Messages Feed */}
                <div
                  style={{
                    flex: 1,
                    padding: '18px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  {messages.map((msg, i) => {
                    const isAI = msg.role === 'assistant';
                    return (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          gap: '10px',
                          alignItems: 'flex-start',
                          maxWidth: isAI ? '85%' : '75%',
                          alignSelf: isAI ? 'flex-start' : 'flex-end',
                        }}
                      >
                        {isAI && (
                          <div
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: 'var(--radius-md)',
                              background: 'var(--accent-primary-subtle)',
                              color: 'var(--accent-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Bot className="w-3.5 h-3.5" />
                          </div>
                        )}

                        <div
                          style={{
                            padding: '12px 14px',
                            borderRadius: 'var(--radius-lg)',
                            background: isAI ? 'var(--bg-surface-secondary)' : 'var(--accent-primary)',
                            border: isAI ? '1px solid var(--border-subtle)' : 'none',
                            color: isAI ? 'var(--text-primary)' : '#ffffff',
                            fontSize: '0.84rem',
                            lineHeight: 1.5,
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {msg.content}
                        </div>

                        {!isAI && (
                          <div
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: 'var(--radius-md)',
                              background: 'var(--bg-surface-secondary)',
                              border: '1px solid var(--border-subtle)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <User className="w-3.5 h-3.5 text-secondary" style={{ color: 'var(--text-secondary)' }} />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {isThinking && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--accent-primary-subtle)',
                          color: 'var(--accent-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        Analyzing career context and preparing response...
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input Bar */}
                <div
                  style={{
                    padding: '12px 16px',
                    borderTop: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface)',
                    display: 'flex',
                    gap: '8px',
                  }}
                >
                  <input
                    type="text"
                    placeholder="Ask your career advisor anything (e.g. How to explain technical tradeoffs in interviews)..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="form-input"
                    style={{ flex: 1, fontSize: '0.84rem' }}
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim() || isThinking}
                    className="btn btn-primary btn-sm"
                  >
                    <Send className="w-3.5 h-3.5" /> Ask
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
