import { useState, useEffect } from 'react';

export default function StudentDashboard({ 
  user, 
  onSelectTest, 
  activeTab, 
  setActiveTab,
  profileName,
  setProfileName,
  profileRollNumber,
  setProfileRollNumber,
  profileDepartment,
  setProfileDepartment,
  profileError,
  profileSuccess,
  profileSaving,
  handleSaveProfile
}) {
  const [tests, setTests] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loadingTests, setLoadingTests] = useState(true);
  const [loadingAttempts, setLoadingAttempts] = useState(true);
  const [error, setError] = useState('');

  const fetchTests = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/tests`);
      if (!response.ok) throw new Error('Failed to load tests');
      const data = await response.json();
      setTests(data);
    } catch {
      setError('Could not connect to backend to fetch tests.');
    } finally {
      setLoadingTests(false);
    }
  };

  const fetchAttempts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/results/student/${user.id}`);
      if (!response.ok) throw new Error('Failed to load test history');
      const data = await response.json();
      setAttempts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAttempts(false);
    }
  };

  useEffect(() => {
    fetchTests();
    fetchAttempts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatTimeSpent = (seconds) => {
    if (seconds === undefined || seconds === null) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Calculate student aggregates (Requirement 4)
  const totalCompleted = attempts.length;
  const avgScore = totalCompleted > 0
    ? Math.round(attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / totalCompleted)
    : 0;
  const pendingTestsCount = Math.max(0, tests.length - attempts.reduce((acc, a) => {
    if (a.test && !acc.includes(a.test.testId)) {
      acc.push(a.test.testId);
    }
    return acc;
  }, []).length);

  const getTestIcon = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat === 'aptitude') {
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
          <line x1="9" y1="22" x2="15" y2="22"></line>
          <line x1="8" y1="6" x2="16" y2="6"></line>
          <line x1="16" y1="14" x2="16" y2="18"></line>
          <path d="M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01"></path>
        </svg>
      );
    }
    if (cat === 'verbal') {
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-secondary)', marginBottom: '0.5rem' }}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
      );
    }
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#a855f7', marginBottom: '0.5rem' }}>
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5.5 5.5 0 0 0 7.5 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"></path>
        <path d="M9 18h6M10 22h4"></path>
      </svg>
    );
  };

  return (
    <div className="main-content">
      {/* Welcoming Header */}
      <div className="welcome-section">
        <h1>Welcome back, {user.name}!</h1>
        <p>This is your main dashboard hub. Check your statistics, take new tests, or manage your profile.</p>
      </div>

      {/* Tab bar removed to simplify view. Profile is toggled via settings gear icon button in navigation bar. */}

      {activeTab === 'dashboard' ? (
        <>

      {error && (
        <div className="alert-box alert-error">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <span>{error}</span>
        </div>
      )}

      {/* Student Statistics Overview Section (Requirement 4) */}
      <div className="admin-stats-summary" style={{ marginBottom: '2.5rem' }}>
        <div className="glass-card admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-primary)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-num">{totalCompleted}</span>
            <span className="admin-stat-label">Tests Completed</span>
          </div>
        </div>

        <div className="glass-card admin-stat-card">
          <div className="admin-stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-num">{avgScore}%</span>
            <span className="admin-stat-label">Average Score</span>
          </div>
        </div>

        <div className="glass-card admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--color-secondary)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-num">{pendingTestsCount}</span>
            <span className="admin-stat-label">Pending Assessments</span>
          </div>
        </div>
      </div>

      {/* Available Assessments Section (Full Width) */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 className="section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--color-primary)'}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          Available Assessments
        </h2>
        {loadingTests ? (
          <div style={{color: 'var(--text-muted)'}}>Loading available tests...</div>
        ) : tests.length === 0 ? (
          <div className="glass-card" style={{textAlign: 'center', color: 'var(--text-muted)'}}>
            No tests are currently active.
          </div>
        ) : (
          <div className="cards-list">
            {tests.map((test) => {
              const isCompleted = attempts.some(a => a.test && a.test.testId === test.testId);
              const isExpired = test.expiryTimestamp && new Date(test.expiryTimestamp) < new Date();
              const isStrict = test.createdByAdmin === true;
              const isBlocked = isExpired || (isCompleted && isStrict);

              let buttonText = 'Start Test';
              if (isExpired) {
                buttonText = 'Expired';
              } else if (isCompleted) {
                buttonText = isStrict ? 'Completed' : 'Retake Test';
              }

              return (
                <div key={test.testId} className={`glass-card test-card category-${(test.category || 'general').toLowerCase()} ${isCompleted ? 'completed-card' : ''} ${isExpired ? 'expired-card' : ''}`}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1, width: '100%' }}>
                    {getTestIcon(test.category)}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div className="test-category" style={{ marginTop: '0.5rem' }}>{test.category || 'General'}</div>
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        {isCompleted && (
                          <div className="completed-badge">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '0.2rem'}}><polyline points="20 6 9 17 4 12"></polyline></svg>
                            Completed
                          </div>
                        )}
                        {isExpired && (
                          <div className="completed-badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                            Expired
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="test-name" style={{ margin: '0.25rem 0 0.5rem 0' }}>{test.testName}</div>
                    <div className="test-meta">
                      <div className="meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        {test.duration} mins
                      </div>
                      <div className="meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        {test.totalMarks || 20} Questions
                      </div>
                    </div>
                  </div>
                  <button 
                    className="btn-start"
                    style={{ 
                      width: '100%', 
                      marginTop: '1.25rem', 
                      ...(isBlocked ? { opacity: 0.5, cursor: 'not-allowed', background: 'var(--border-color)', color: 'var(--text-muted)' } : {}) 
                    }}
                    onClick={() => !isBlocked && onSelectTest(test.testId)}
                    disabled={isBlocked}
                  >
                    {buttonText}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Section: Attempt History */}
      <div>
        <h2 className="section-title" style={{ borderLeftColor: 'var(--color-secondary)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--color-secondary)'}}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
          Your History & Performance
        </h2>
        {loadingAttempts ? (
          <div style={{color: 'var(--text-muted)'}}>Loading attempt history...</div>
        ) : attempts.length === 0 ? (
          <div className="glass-card" style={{textAlign: 'center', color: 'var(--text-muted)', padding: '2rem'}}>
            You haven't taken any tests yet.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {attempts.map((attempt) => (
              <div key={attempt.resultId} className="glass-card attempt-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{fontWeight: '600', fontSize: '1.1rem', color: 'var(--text-main)'}}>
                    {attempt.test?.testName || 'Aptitude Test'}
                  </div>
                  <div style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem'}}>
                    Completed on {formatDate(attempt.submittedAt)}
                  </div>
                  <div style={{fontSize: '0.8rem', color: 'var(--color-secondary)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    Time spent: {formatTimeSpent(attempt.timeTaken)}
                  </div>
                </div>
                <div className="attempt-score-badge">
                  <div className="score-pct" style={{ color: (attempt.percentage >= 50 ? 'var(--color-primary)' : '#ef4444') }}>{Math.round(attempt.percentage)}%</div>
                  <div className="score-scaled">Score: {attempt.score}/{attempt.test?.totalMarks || 20}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </>
      ) : (
        /* Immediate flat settings view inside the dashboard tab */
        <div className="glass-card" style={{ padding: '2.5rem', maxWidth: '600px', margin: '0 auto' }}>
          <h2 className="section-title" style={{ borderLeftColor: 'var(--color-secondary)', marginBottom: '1.5rem' }}>Profile Details</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
            Update your personal details. Keep this information accurate as it is used for grading and test certification.
          </p>

          {profileError && (
            <div className="alert-box alert-error" style={{ marginBottom: '1.5rem' }}>
              <span>{profileError}</span>
            </div>
          )}
          
          {profileSuccess && (
            <div className="alert-box alert-success" style={{ marginBottom: '1.5rem' }}>
              <span>{profileSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-email">Email Address (Read-only)</label>
              <input
                id="profile-email"
                type="email"
                className="form-input"
                value={user.email}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-name">Full Name</label>
              <input
                id="profile-name"
                type="text"
                className="form-input"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                required
                disabled={profileSaving}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-rollNumber">Roll Number</label>
              <input
                id="profile-rollNumber"
                type="text"
                className="form-input"
                value={profileRollNumber}
                onChange={(e) => setProfileRollNumber(e.target.value)}
                required
                disabled={profileSaving}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-department">Department</label>
              <input
                id="profile-department"
                type="text"
                className="form-input"
                value={profileDepartment}
                onChange={(e) => setProfileDepartment(e.target.value)}
                required
                disabled={profileSaving}
              />
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                className="btn-nav" 
                onClick={() => setActiveTab('dashboard')}
                disabled={profileSaving}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary" 
                style={{ width: 'auto', minWidth: '180px' }}
                disabled={profileSaving}
              >
                {profileSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

