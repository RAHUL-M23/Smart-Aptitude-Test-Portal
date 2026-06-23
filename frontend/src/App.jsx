import React, { useState, useEffect } from 'react';
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

  // Render navigation bar for authenticated users
  const renderNavbar = () => {
    if (!user) return null;
    const isAdmin = user.role === 'ROLE_ADMIN';
    
    return (
      <header className="navbar">
        <div className="brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--color-primary)'}}><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
          smart aptitute
        </div>
        <div className="nav-user">
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
      />
    );
  };

  return (
    <div className="app-container">
      {renderNavbar()}
      {renderMainView()}
    </div>
  );
}

export default App;
