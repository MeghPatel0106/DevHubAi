import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import PortfolioPage from './pages/PortfolioPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import ResumePage from './pages/ResumePage.jsx';
import CertificatesPage from './pages/CertificatesPage.jsx';
import JobApplicationsPage from './pages/JobApplicationsPage.jsx';
import GitHubAnalyticsPage from './pages/GitHubAnalyticsPage.jsx';
import SkillsPage from './pages/SkillsPage.jsx';
import AICareerGuidePage from './pages/AICareerGuidePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import PublicPortfolioPage from './pages/PublicPortfolioPage.jsx';

// Recruiter Portal Pages
import RecruiterDashboardPage from './pages/RecruiterDashboardPage.jsx';
import FindCandidatesPage from './pages/FindCandidatesPage.jsx';
import CandidateDetailsPage from './pages/CandidateDetailsPage.jsx';
import ShortlistedPage from './pages/ShortlistedPage.jsx';
import RecruiterProfilePage from './pages/RecruiterProfilePage.jsx';

import { Code2 } from 'lucide-react';

function AppContent() {
  const { user, isAuthenticated, loading } = useAuth();
  const [activePage, setActivePage] = useState('landing');
  const [publicUsername, setPublicUsername] = useState(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);

  const isRecruiter = user?.role === 'recruiter';

  // Check URL path on mount and popstate to support direct /u/:username public portfolio routes
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;
      if (path.startsWith('/u/')) {
        const username = path.replace('/u/', '').trim();
        if (username) {
          setPublicUsername(username);
          setActivePage('public-portfolio');
        }
      } else if (path.startsWith('/portfolio/')) {
        const username = path.replace('/portfolio/', '').trim();
        if (username) {
          setPublicUsername(username);
          setActivePage('public-portfolio');
        }
      } else if (activePage === 'public-portfolio') {
        setActivePage(isAuthenticated ? (isRecruiter ? 'recruiter-dashboard' : 'dashboard') : 'landing');
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, [isAuthenticated, isRecruiter]);

  // Synchronize active page based on authentication status & user role
  useEffect(() => {
    if (!loading) {
      // If viewing a public portfolio, let them view it freely
      if (activePage === 'public-portfolio') return;

      if (isAuthenticated) {
        if (isRecruiter) {
          // If recruiter lands on unauthenticated page or developer page, redirect to recruiter dashboard
          const developerPages = [
            'landing',
            'login',
            'register',
            'dashboard',
            'profile',
            'portfolio',
            'projects',
            'resume',
            'certificates',
            'applications',
            'github',
            'skills',
            'ai-guide',
            'settings',
          ];
          if (developerPages.includes(activePage)) {
            setActivePage('recruiter-dashboard');
          }
        } else {
          // If developer lands on unauthenticated page or recruiter page, redirect to developer dashboard
          const recruiterPages = [
            'landing',
            'login',
            'register',
            'recruiter-dashboard',
            'recruiter-candidates',
            'recruiter-candidate-details',
            'recruiter-shortlisted',
            'recruiter-profile',
          ];
          if (recruiterPages.includes(activePage)) {
            setActivePage('dashboard');
          }
        }
      } else {
        // If logged out and on a protected page, move to login
        const protectedPages = [
          'dashboard',
          'profile',
          'portfolio',
          'projects',
          'resume',
          'certificates',
          'applications',
          'github',
          'skills',
          'ai-guide',
          'settings',
          'recruiter-dashboard',
          'recruiter-candidates',
          'recruiter-candidate-details',
          'recruiter-shortlisted',
          'recruiter-profile',
        ];
        if (protectedPages.includes(activePage)) {
          setActivePage('login');
        }
      }
    }
  }, [isAuthenticated, isRecruiter, loading, activePage]);

  // Loading Screen while session is being verified
  if (loading) {
    return (
      <div className="auth-loading-screen">
        <div className="pulse-loader">
          <Code2 className="w-7 h-7 text-white" />
        </div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '8px 0 4px' }}>
            DevHub <span style={{ color: 'var(--accent-primary)' }}>AI</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            Verifying secure session...
          </p>
        </div>
      </div>
    );
  }

  // Handle Public Portfolio Page (no login required)
  if (activePage === 'public-portfolio' && publicUsername) {
    return (
      <PublicPortfolioPage
        username={publicUsername}
        onNavigate={(page) => {
          if (page === 'landing') {
            window.history.pushState({}, '', '/');
            setActivePage(isAuthenticated ? (isRecruiter ? 'recruiter-dashboard' : 'dashboard') : 'landing');
          } else {
            setActivePage(page);
          }
        }}
      />
    );
  }

  // Unauthenticated Views
  if (!isAuthenticated) {
    if (activePage === 'login') {
      return <LoginPage onNavigate={setActivePage} />;
    }
    if (activePage === 'register') {
      return <RegisterPage onNavigate={setActivePage} />;
    }
    return <LandingPage onNavigate={setActivePage} />;
  }

  // Authenticated Views
  const renderCurrentProtectedPage = () => {
    // Recruiter Views
    if (isRecruiter) {
      switch (activePage) {
        case 'recruiter-dashboard':
          return (
            <RecruiterDashboardPage
              onNavigate={setActivePage}
              onSelectCandidate={(id) => {
                setSelectedCandidateId(id);
                setActivePage('recruiter-candidate-details');
              }}
            />
          );
        case 'recruiter-candidates':
          return (
            <FindCandidatesPage
              onNavigate={setActivePage}
              onSelectCandidate={(id) => {
                setSelectedCandidateId(id);
                setActivePage('recruiter-candidate-details');
              }}
            />
          );
        case 'recruiter-candidate-details':
          return (
            <CandidateDetailsPage
              candidateId={selectedCandidateId}
              onBack={() => setActivePage('recruiter-candidates')}
              onNavigate={setActivePage}
            />
          );
        case 'recruiter-shortlisted':
          return (
            <ShortlistedPage
              onNavigate={setActivePage}
              onSelectCandidate={(id) => {
                setSelectedCandidateId(id);
                setActivePage('recruiter-candidate-details');
              }}
            />
          );
        case 'recruiter-profile':
          return <RecruiterProfilePage />;
        default:
          return (
            <RecruiterDashboardPage
              onNavigate={setActivePage}
              onSelectCandidate={(id) => {
                setSelectedCandidateId(id);
                setActivePage('recruiter-candidate-details');
              }}
            />
          );
      }
    }

    // Developer Views
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage onNavigate={setActivePage} />;
      case 'profile':
        return (
          <ProfilePage
            onViewPublic={(slug) => {
              window.history.pushState({}, '', `/u/${slug}`);
              setPublicUsername(slug);
              setActivePage('public-portfolio');
            }}
          />
        );
      case 'portfolio':
        return (
          <PortfolioPage
            onViewPublic={(slug) => {
              window.history.pushState({}, '', `/u/${slug}`);
              setPublicUsername(slug);
              setActivePage('public-portfolio');
            }}
          />
        );
      case 'projects':
        return <ProjectsPage />;
      case 'resume':
        return <ResumePage />;
      case 'certificates':
        return <CertificatesPage />;
      case 'applications':
        return <JobApplicationsPage />;
      case 'github':
        return <GitHubAnalyticsPage />;
      case 'skills':
        return <SkillsPage />;
      case 'ai-guide':
        return <AICareerGuidePage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigate={setActivePage} />;
    }
  };

  return (
    <AppLayout activePage={activePage} setActivePage={setActivePage}>
      {renderCurrentProtectedPage()}
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
