import React from 'react';
import {
  LayoutDashboard,
  User,
  Globe,
  FolderGit2,
  FileText,
  Award,
  Send,
  GitBranch,
  Cpu,
  Sparkles,
  Settings,
  LogOut,
  Code2,
  X,
  Search,
  BookmarkCheck,
  Building,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Sidebar({ activePage, setActivePage, isOpen, onClose }) {
  const { user, logout } = useAuth();
  const isRecruiter = user?.role === 'recruiter';

  // Developer Navigation
  const workspaceNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'portfolio', label: 'Portfolio', icon: Globe },
  ];

  const careerNav = [
    { id: 'resume', label: 'Resume', icon: FileText },
    { id: 'skills', label: 'Skills', icon: Cpu },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'applications', label: 'Job Applications', icon: Send },
  ];

  const insightsNav = [
    { id: 'github', label: 'GitHub Analytics', icon: GitBranch },
    { id: 'ai-guide', label: 'AI Career Advisor', icon: Sparkles },
  ];

  // Recruiter Navigation
  const recruiterNav = [
    { id: 'recruiter-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'recruiter-candidates', label: 'Find Developers', icon: Search },
    { id: 'recruiter-shortlisted', label: 'Shortlisted', icon: BookmarkCheck },
    { id: 'recruiter-profile', label: 'Recruiter Profile', icon: Building },
  ];

  const handleNavClick = (id) => {
    setActivePage(id);
    if (onClose) onClose();
  };

  const handleLogout = async () => {
    if (onClose) onClose();
    await logout();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(2px)',
            zIndex: 45,
          }}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`} aria-label="Main Navigation">
        {/* Header Branding */}
        <div className="sidebar-header">
          <div className="sidebar-brand-icon">
            <Code2 className="w-4 h-4 text-white" />
          </div>
          <div className="sidebar-brand-text">
            <h1>DevHub AI</h1>
            <p>{isRecruiter ? 'Recruiter Portal' : 'Career Platform'}</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="icon-btn"
              style={{ marginLeft: 'auto', display: isOpen ? 'flex' : 'none', width: '28px', height: '28px' }}
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Items Grouped */}
        <div className="sidebar-nav">
          {isRecruiter ? (
            <>
              <div className="sidebar-section-title">Talent Discovery</div>
              {recruiterNav.map((item) => {
                const Icon = item.icon;
                const isActive =
                  activePage === item.id ||
                  (item.id === 'recruiter-candidates' && activePage === 'recruiter-candidate-details');
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span style={{ flex: 1 }}>{item.label}</span>
                  </button>
                );
              })}
            </>
          ) : (
            <>
              <div className="sidebar-section-title">Workspace</div>
              {workspaceNav.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span style={{ flex: 1 }}>{item.label}</span>
                  </button>
                );
              })}

              <div className="sidebar-section-title">Career</div>
              {careerNav.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span style={{ flex: 1 }}>{item.label}</span>
                  </button>
                );
              })}

              <div className="sidebar-section-title">Insights</div>
              {insightsNav.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span style={{ flex: 1 }}>{item.label}</span>
                  </button>
                );
              })}
            </>
          )}
        </div>

        {/* Footer Navigation: Settings & Logout */}
        <div className="sidebar-footer">
          {!isRecruiter && (
            <button
              onClick={() => handleNavClick('settings')}
              className={`nav-item ${activePage === 'settings' ? 'active' : ''}`}
            >
              <Settings className="w-4 h-4 flex-shrink-0" />
              <span>Settings</span>
            </button>
          )}

          <button
            onClick={handleLogout}
            className="nav-item"
            style={{ color: 'var(--status-danger)' }}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
