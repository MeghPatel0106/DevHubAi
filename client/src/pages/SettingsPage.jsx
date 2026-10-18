import React, { useState } from 'react';
import {
  Shield,
  Bell,
  Save,
  Lock,
  LogOut,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import PageHeader from '../components/PageHeader.jsx';

export default function SettingsPage() {
  const { user, profile, logout } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('account');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);

  const avatarUrl = profile?.profileImage || user?.avatar;

  const getInitials = (name) => {
    if (!name) return 'DH';
    const parts = name.trim().split(' ');
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
  };

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [savingPass, setSavingPass] = useState(false);

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!passwords.newPassword || passwords.newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    setSavingPass(true);
    setTimeout(() => {
      setSavingPass(false);
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password updated successfully.', 'success');
    }, 500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px' }}>
      <PageHeader
        title="Settings"
        subtitle="Manage your account preferences, credentials, and notification controls."
      />

      {/* Tabs */}
      <div className="tabs-header">
        {[
          { id: 'account', label: 'Account', icon: User },
          { id: 'security', label: 'Security & Password', icon: Lock },
          { id: 'notifications', label: 'Notifications', icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: Account */}
      {activeTab === 'account' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User className="w-4 h-4 text-secondary" style={{ color: 'var(--text-secondary)' }} /> Account Information
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px', padding: '12px 14px', background: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user?.name}
                  style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--accent-primary)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                  }}
                >
                  {getInitials(user?.name)}
                </div>
              )}
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.94rem', color: 'var(--text-primary)' }}>{user?.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{user?.email}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  value={user?.name || ''}
                  disabled
                  className="form-input"
                  style={{ background: 'var(--bg-surface-secondary)' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="form-input"
                  style={{ background: 'var(--bg-surface-secondary)' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Account Role</label>
              <div>
                <span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>
                  {user?.role || 'Developer'} Account
                </span>
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield className="w-4 h-4 text-secondary" style={{ color: 'var(--text-secondary)' }} /> Privacy & Public Profile
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
              }}
            >
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Public Portfolio Visibility
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Allow recruiters and hiring managers to view your public profile and projects.
                </div>
              </div>
              <input
                type="checkbox"
                checked={publicProfile}
                onChange={(e) => {
                  setPublicProfile(e.target.checked);
                  showToast(`Public portfolio ${e.target.checked ? 'enabled' : 'hidden'}.`, 'info');
                }}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab: Security */}
      {activeTab === 'security' && (
        <form onSubmit={handlePasswordChange} className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lock className="w-4 h-4 text-secondary" style={{ color: 'var(--text-secondary)' }} /> Change Password
          </h3>

          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
              placeholder="••••••••"
              className="form-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                placeholder="Min. 6 characters"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                placeholder="Confirm password"
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button
              type="submit"
              disabled={savingPass}
              className="btn btn-primary btn-sm"
            >
              <Save className="w-3.5 h-3.5" /> {savingPass ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      )}

      {/* Tab: Notifications */}
      {activeTab === 'notifications' && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Bell className="w-4 h-4 text-secondary" style={{ color: 'var(--text-secondary)' }} /> Notifications
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
            }}
          >
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Application Updates & Interview Reminders
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Receive email reminders when upcoming interviews approach.
              </div>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => {
                setEmailNotifications(e.target.checked);
                showToast(`Notifications ${e.target.checked ? 'enabled' : 'disabled'}.`, 'info');
              }}
              style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            />
          </div>
        </div>
      )}

      {/* Session Management */}
      <div
        className="card"
        style={{
          padding: '20px',
          border: '1px solid var(--status-danger-border)',
          background: 'var(--status-danger-bg)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h4 style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--status-danger)', margin: 0 }}>
              End Session
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Safely end your authenticated session on this device.
            </p>
          </div>

          <button onClick={logout} className="btn btn-danger btn-sm">
            <LogOut className="w-3.5 h-3.5" /> Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
