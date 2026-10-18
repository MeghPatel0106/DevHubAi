import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  User as UserIcon,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function TopBar({ activePage, onToggleSidebar, onQuickAction }) {
  const { user, profile, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageInfo = (page) => {
    switch (page) {
      case 'dashboard':
        return {
          title: 'Dashboard',
          description: 'Developer career overview and active milestones.',
        };
      case 'profile':
        return {
          title: 'My Profile',
          description: 'Manage personal details, experience, and education.',
        };
      case 'portfolio':
        return {
          title: 'Portfolio Settings',
          description: 'Configure public accessibility and preview your portfolio.',
        };
      case 'projects':
        return {
          title: 'Projects',
          description: 'Showcase the work that represents your developer journey.',
        };
      case 'resume':
        return {
          title: 'Resume',
          description: 'Build and manage targeted resumes and ATS keyword readiness.',
        };
      case 'certificates':
        return {
          title: 'Certificates',
          description: 'Store verified certifications, licenses, and credentials.',
        };
      case 'applications':
        return {
          title: 'Job Applications',
          description: 'Track software engineering roles, interviews, and offers.',
        };
      case 'github':
        return {
          title: 'GitHub Analytics',
          description: 'Repository statistics, languages breakdown, and activity metrics.',
        };
      case 'skills':
        return {
          title: 'Skills Matrix',
          description: 'Categorize and showcase your verified technical proficiencies.',
        };
      case 'ai-guide':
        return {
          title: 'AI Career Advisor',
          description: 'Personalized career intelligence and profile readiness analysis.',
        };
      case 'settings':
        return {
          title: 'Settings',
          description: 'Account security, preferences, and privacy controls.',
        };
      case 'recruiter-dashboard':
        return {
          title: 'Recruiter Dashboard',
          description: 'Discover and evaluate verified developer talent.',
        };
      case 'recruiter-candidates':
        return {
          title: 'Find Developers',
          description: 'Search and discover developers based on public professional portfolios.',
        };
      case 'recruiter-candidate-details':
        return {
          title: 'Candidate Evaluation',
          description: 'Review developer projects, credentials, and confidential notes.',
        };
      case 'recruiter-shortlisted':
        return {
          title: 'Shortlisted Candidates',
          description: 'Manage your saved developer talent and private team evaluations.',
        };
      case 'recruiter-profile':
        return {
          title: 'Recruiter Profile',
          description: 'Company credentials, hiring role, and contact preferences.',
        };
      default:
        return {
          title: 'DevHub AI',
          description: 'Developer Career Management Platform',
        };
    }
  };

  const pageInfo = getPageInfo(activePage);

  const getInitials = (name) => {
    if (!name) return 'DH';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const displayName = user?.name || profile?.fullName || 'Developer';
  const displayRole = user?.role === 'recruiter' ? 'Recruiter' : 'Developer';
  const avatarUrl = profile?.profileImage || user?.avatar;

  const handleLogout = async () => {
    setShowProfileMenu(false);
    await logout();
  };

  return (
    <header className="topbar">
      {/* Left: Mobile Hamburger & Page Info */}
      <div className="topbar-left">
        <button
          onClick={onToggleSidebar}
          className="icon-btn"
          style={{ display: 'none' }}
          id="mobile-menu-btn"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="topbar-page-info">
          <h2>{pageInfo.title}</h2>
          <p>{pageInfo.description}</p>
        </div>
      </div>

      {/* Center: Global Search */}
      <div className="topbar-search">
        <Search className="w-3.5 h-3.5" />
        <input
          type="text"
          placeholder="Search projects, skills, applications..."
          aria-label="Search"
        />
      </div>

      {/* Right Controls */}
      <div className="topbar-right">
        {/* Notifications */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="icon-btn"
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="notification-dot"></span>
          </button>

          {showNotifications && (
            <div
              className="card"
              style={{
                position: 'absolute',
                right: 0,
                top: '44px',
                width: '280px',
                padding: '12px',
                zIndex: 50,
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '8px',
                  borderBottom: '1px solid var(--border-subtle)',
                  marginBottom: '10px',
                }}
              >
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>Notifications</h4>
                <span className="badge badge-blue">New</span>
              </div>
              <div
                style={{
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface-secondary)',
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.4,
                }}
              >
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>
                  Welcome to DevHub AI
                </strong>
                Complete your developer profile and add projects to build your career hub.
              </div>
            </div>
          )}
        </div>

        {/* User Avatar Chip */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="user-profile-btn"
            aria-label="User account menu"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="user-avatar" />
            ) : (
              <div className="user-avatar">{getInitials(displayName)}</div>
            )}

            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {displayName}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.1 }}>
                {displayRole}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted" style={{ marginLeft: '2px' }} />
          </button>

          {showProfileMenu && (
            <div
              className="card"
              style={{
                position: 'absolute',
                right: 0,
                top: '44px',
                width: '220px',
                padding: '6px',
                zIndex: 50,
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div
                style={{
                  padding: '8px 10px',
                  borderBottom: '1px solid var(--border-subtle)',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-md)',
                      objectFit: 'cover',
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                    {getInitials(displayName)}
                  </div>
                )}

                <div style={{ overflow: 'hidden' }}>
                  <div
                    style={{
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {displayName}
                  </div>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {user?.email}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  onQuickAction && onQuickAction(user?.role === 'recruiter' ? 'recruiter-profile' : 'profile');
                  setShowProfileMenu(false);
                }}
                className="nav-item"
                style={{ padding: '6px 10px', fontSize: '0.82rem', minHeight: '34px' }}
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>{user?.role === 'recruiter' ? 'Recruiter Profile' : 'My Profile'}</span>
              </button>

              {user?.role !== 'recruiter' && (
                <button
                  onClick={() => {
                    onQuickAction && onQuickAction('settings');
                    setShowProfileMenu(false);
                  }}
                  className="nav-item"
                  style={{ padding: '6px 10px', fontSize: '0.82rem', minHeight: '34px' }}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Settings</span>
                </button>
              )}

              <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />

              <button
                onClick={handleLogout}
                className="nav-item"
                style={{
                  padding: '6px 10px',
                  fontSize: '0.82rem',
                  color: 'var(--status-danger)',
                  minHeight: '34px',
                }}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
