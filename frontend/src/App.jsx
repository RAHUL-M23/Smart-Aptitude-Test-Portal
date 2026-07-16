import { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import StudentDashboard from './components/StudentDashboard';
import TestInterface from './components/TestInterface';
import AdminDashboard from './components/AdminDashboard';
import LandingDashboard from './components/LandingDashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('landing'); // landing, login, register, dashboard, test
  const [activeTestId, setActiveTestId] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [targetTestLinkId, setTargetTestLinkId] = useState(null);
  const [targetTest, setTargetTest] = useState(null);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestError, setGuestError] = useState('');
  
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

  // Check if session exists in localStorage or if shareable URL is matched
  useEffect(() => {
    const match = window.location.pathname.match(/^\/test\/take\/([a-zA-Z0-9-]+)$/);
    if (match) {
      setTargetTestLinkId(match[1]);
      setCurrentView('guest-login');
      return;
    }

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

  useEffect(() => {
    if (!targetTestLinkId) return;
    const fetchTargetTest = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/tests/by-link/${targetTestLinkId}`);
        if (!response.ok) throw new Error('Test not found or link has expired.');
        const data = await response.json();
        setTargetTest(data);
      } catch (err) {
        setGuestError(err.message || 'Error loading test details.');
      }
    };
    fetchTargetTest();
  }, [targetTestLinkId]);

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
    setCurrentView('landing');
    setActiveTestId(null);
    setTargetTestLinkId(null);
    setTargetTest(null);
    setGuestName('');
    setGuestEmail('');
    setGuestError('');
  };

  const handleGuestSubmit = async (e) => {
    e.preventDefault();
    if (!guestName || !guestEmail || !targetTest) return;
    setGuestError('');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/guest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: guestName,
          email: guestEmail,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Guest authentication failed.');

      // Temporarily store user session (guest)
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      
      // Directly start the test
      setActiveTestId(targetTest.testId);
      setCurrentView('test');
    } catch (err) {
      setGuestError(err.message || 'Server connection error.');
    }
  };

  const handleSelectTest = (testId) => {
    setActiveTestId(testId);
    setCurrentView('test');
  };

  const handleReturnToDashboard = () => {
    setActiveTestId(null);
    if (user && user.department === 'Guest') {
      handleLogout();
    } else {
      setCurrentView('dashboard');
    }
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
        <div className="brand" style={{ cursor: 'pointer' }} onClick={() => {
          if (currentView === 'test') {
            if (window.confirm("You are currently in an active test. Clicking here will exit the test. Are you sure?")) {
              handleReturnToDashboard();
            }
          } else {
            handleReturnToDashboard();
          }
        }}>
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
      if (currentView === 'landing') {
        return (
          <LandingDashboard
            onNavigateToLogin={() => setCurrentView('login')}
            onNavigateToRegister={() => setCurrentView('register')}
          />
        );
      }
      if (currentView === 'guest-login') {
        return (
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 70px)', padding: '2rem' }}>
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

            <div className="glass-card" style={{ maxWidth: '450px', width: '100%', padding: '2.5rem', textAlign: 'center' }}>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-main)' }}>smart aptitude</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Guest Session Registration</p>
              </div>

              {guestError && (
                <div className="alert-box alert-error" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                  <span>{guestError}</span>
                </div>
              )}

              {targetTest ? (
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1.75rem', textAlign: 'left' }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-secondary)', fontWeight: '600', letterSpacing: '0.05em' }}>{targetTest.category}</div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', margin: '0.25rem 0' }}>{targetTest.testName}</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Duration: <strong>{targetTest.duration} mins</strong> | Marks: <strong>{targetTest.totalMarks}</strong>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Loading assessment details...
                </div>
              )}

              <form onSubmit={handleGuestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter your full name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. name@domain.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ marginTop: '0.5rem', background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.2)' }}
                  disabled={!targetTest}
                >
                  Start Assessment Now
                </button>
              </form>
            </div>
          </div>
        );
      }
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
