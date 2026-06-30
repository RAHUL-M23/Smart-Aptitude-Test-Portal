import { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import StudentDashboard from './components/StudentDashboard';
import TestInterface from './components/TestInterface';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('login'); // login, register, dashboard, test
  const [activeTestId, setActiveTestId] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  
  // Student Dashboard active tab state
  const [studentTab, setStudentTab] = useState('dashboard'); // 'dashboard' or 'settings'
  const [profileName, setProfileName] = useState('');
  const [profileRollNumber, setProfileRollNumber] = useState('');
  const [profileDepartment, setProfileDepartment] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  // Sync theme with body class
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Check if session exists in localStorage
  useEffect(() => {
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      try {
        const parsed = JSON.parse(cachedUser);
        setUser(parsed);
        setCurrentView('dashboard');
      } catch (err) {
        console.error('Error parsing cached user', err);
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Sync editable profile fields when user loads
  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfileRollNumber(user.rollNumber || '');
      setProfileDepartment(user.department || '');
    }
  }, [user, studentTab]);

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setCurrentView('login');
    setActiveTestId(null);
  };

  const handleSelectTest = (testId) => {
    setActiveTestId(testId);
    setCurrentView('test');
  };

  const handleReturnToDashboard = () => {
    setActiveTestId(null);
    setCurrentView('dashboard');
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileName || !profileRollNumber || !profileDepartment) {
      setProfileError('All profile fields are required');
      return;
    }
    setProfileError('');
    setProfileSuccess('');
    setProfileSaving(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/profile/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          name: profileName,
          rollNumber: profileRollNumber,
          department: profileDepartment
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      // Update user state
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => {
        setStudentTab('dashboard');
        setProfileSuccess('');
      }, 1000);
    } catch (err) {
      setProfileError(err.message || 'Error updating profile');
    } finally {
      setProfileSaving(false);
    }
  };

  // Render navigation bar for authenticated users
  const renderNavbar = () => {
    if (!user) return null;
    const isAdmin = user.role === 'ROLE_ADMIN';
    
    return (
      <header className="navbar">
        <div className="brand">
          <img src="/math-logo.svg" alt="Smart Aptitude Logo" style={{ height: '28px', width: 'auto', marginRight: '8px', verticalAlign: 'middle' }} />
          smart aptitude
        </div>
        <div className="nav-user">
          {/* Settings / Profile Button for Students */}
          {!isAdmin && (
            <button 
              className="btn-theme-toggle" 
              onClick={() => setStudentTab(studentTab === 'settings' ? 'dashboard' : 'settings')}
              title="Profile Settings"
              aria-label="Profile Settings"
              style={{ marginRight: '0.25rem' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            </button>
          )}
          <button 
            className="btn-theme-toggle" 
            onClick={toggleTheme}
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              // Sun Icon
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            ) : (
              // Moon Icon
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            )}
          </button>
          
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{user.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
          </div>
          <span className={`user-badge ${isAdmin ? 'admin' : ''}`}>
            {isAdmin ? 'Admin' : 'Student'}
          </span>
          <button className="btn-logout" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </header>
    );
  };

  // Render main screen view based on authentication and routing state
  const renderMainView = () => {
    if (!user) {
      return (
        <div style={{ position: 'relative' }}>
          {/* Theme Toggle for Unauthenticated Screens */}
          <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10 }}>
            <button 
              className="btn-theme-toggle" 
              onClick={toggleTheme}
              title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === 'dark' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              )}
            </button>
          </div>

          {currentView === 'register' ? (
            <Register
              onRegisterSuccess={() => setCurrentView('login')}
              onNavigateToLogin={() => setCurrentView('login')}
            />
          ) : (
            <Login
              onLoginSuccess={handleLoginSuccess}
              onNavigateToRegister={() => setCurrentView('register')}
            />
          )}
        </div>
      );
    }

    if (user.role === 'ROLE_ADMIN') {
      return <AdminDashboard user={user} />;
    }

    // Student Views
    if (currentView === 'test' && activeTestId) {
      return (
        <TestInterface
          testId={activeTestId}
          user={user}
          onReturnToDashboard={handleReturnToDashboard}
        />
      );
    }

    return (
      <StudentDashboard
        user={user}
        onSelectTest={handleSelectTest}
        activeTab={studentTab}
        setActiveTab={setStudentTab}
        profileName={profileName}
        setProfileName={setProfileName}
        profileRollNumber={profileRollNumber}
        setProfileRollNumber={setProfileRollNumber}
        profileDepartment={profileDepartment}
        setProfileDepartment={setProfileDepartment}
        profileError={profileError}
        setProfileError={setProfileError}
        profileSuccess={profileSuccess}
        setProfileSuccess={setProfileSuccess}
        profileSaving={profileSaving}
        handleSaveProfile={handleSaveProfile}
      />
    );
  };

  return (
    <div className="app-container">
      {renderNavbar()}
      {renderMainView()}

      {/* Profile Settings Edit Modal removed as settings are rendered inline */}
    </div>
  );
}

export default App;
