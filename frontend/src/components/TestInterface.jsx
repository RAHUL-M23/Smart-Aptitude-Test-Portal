import { useState, useEffect, useRef } from 'react';

export default function TestInterface({ testId, user, onReturnToDashboard }) {
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const timerRef = useRef(null);

  const [hasStarted, setHasStarted] = useState(false);
  const [isFullscreenViolation, setIsFullscreenViolation] = useState(false);

  useEffect(() => {
    if (!hasStarted || result) return;

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      if (!isCurrentlyFullscreen) {
        setIsFullscreenViolation(true);
      } else {
        setIsFullscreenViolation(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [hasStarted, result]);

  function handleStartTest() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(err => {
        console.error("Error requesting fullscreen:", err);
      });
    }
    setHasStarted(true);
    startTimer();
  }

  const handleBackToDashboard = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.error(err));
    }
    onReturnToDashboard();
  };

  async function submitAnswers() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.error(err));
    }
    setSubmitting(true);
    setError('');

    // Fill missing answers with empty strings
    const finalAnswers = {};
    questions.forEach((q) => {
      finalAnswers[q.questionId] = selectedAnswers[q.questionId] || '';
    });

    const totalDurationSeconds = (test?.duration || 10) * 60;
    const spentSeconds = Math.max(0, totalDurationSeconds - timeLeft);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/tests/${testId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          answers: finalAnswers,
          timeTaken: spentSeconds,
        }),
      });

      if (!response.ok) {
        if (response.status === 403) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'You have already completed this test section and cannot submit again.');
        }
        throw new Error('Submission failed');
      }
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to submit answers. Your results could not be saved.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleAutoSubmit() {
    console.log('Time is up! Auto submitting...');
    submitAnswers();
  }

  function startTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function fetchTestDetails() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/tests/${testId}?userId=${user.id}`);
      if (response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'You have already completed this test section and cannot retake it.');
      }
      if (!response.ok) throw new Error('Failed to load test details');
      const data = await response.json();
      setTest(data.test);
      setQuestions(data.questions || []);
      setTimeLeft((data.test.duration || 10) * 60); // convert minutes to seconds
    } catch (err) {
      setError(err.message || 'Failed to fetch test details. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTestDetails();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId]);

  function handleSelectOption(questionId, optionKey) {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  }

  function handleSubmitClick() {
    const answeredCount = Object.keys(selectedAnswers).length;
    const unansweredCount = questions.length - answeredCount;
    
    let confirmMsg = 'Are you sure you want to submit your test?';
    if (unansweredCount > 0) {
      confirmMsg = `You have ${unansweredCount} unanswered questions. Are you sure you want to submit and end the test?`;
    }
    
    if (window.confirm(confirmMsg)) {
      submitAnswers();
    }
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function formatTimeSpent(seconds) {
    if (seconds === undefined || seconds === null) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }

  if (loading) {
    return (
      <div className="main-content" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h2 style={{color: 'var(--text-muted)'}}>Loading test contents, please wait...</h2>
      </div>
    );
  }

  if (error && !result) {
    return (
      <div className="main-content">
        <div className="alert-box alert-error">
          <span>{error}</span>
        </div>
        <button className="btn-primary" style={{ maxWidth: '200px' }} onClick={handleBackToDashboard}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (isFullscreenViolation && hasStarted && !result) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(20, 10, 10, 0.95)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        color: '#fff',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" style={{ marginBottom: '1.5rem', filter: 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.4))' }}>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Fullscreen Violation Detected!
        </h1>
        <p style={{ maxWidth: '600px', fontSize: '1.1rem', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '2rem' }}>
          This test is conducted in locked environment. You are not allowed to exit fullscreen or switch tabs. Please click the button below to restore fullscreen mode and continue the test.
        </p>
        <button
          className="btn-primary"
          style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            borderColor: '#ef4444',
            boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)',
            padding: '0.75rem 2rem',
            fontSize: '1.1rem',
            width: 'auto'
          }}
          onClick={() => {
            const elem = document.documentElement;
            if (elem.requestFullscreen) {
              elem.requestFullscreen().catch(err => console.error(err));
            }
          }}
        >
          Re-enter Fullscreen Mode
        </button>
      </div>
    );
  }

  if (!hasStarted && !result && test) {
    return (
      <div className="main-content test-interface-wrapper">
        <div className="glass-card result-card" style={{ maxWidth: '650px', margin: '2rem auto', textAlign: 'left', padding: '2.5rem' }}>
          <div className="test-category" style={{ marginBottom: '0.5rem' }}>{test.category}</div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-main)' }}>
            {test.testName}
          </h1>
          
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.25rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-main)' }}>Important Exam Guidelines</h3>
            <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
              <li>This test has a strict duration of <strong>{test.duration} minutes</strong>.</li>
              <li>There are <strong>{questions.length} questions</strong> in total.</li>
              <li>Once you click "Start Test", the browser will enter **Fullscreen Mode** automatically.</li>
              <li><strong>Lockdown Warning</strong>: Exiting fullscreen mode during the test is strictly prohibited. If you exit fullscreen, you will be locked out from answering questions until you restore it.</li>
              <li>Please ensure you have a stable internet connection before beginning.</li>
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button className="btn-nav" onClick={handleBackToDashboard}>
              Back to Dashboard
            </button>
            <button className="btn-primary" style={{ width: 'auto', minWidth: '150px' }} onClick={handleStartTest}>
              Start Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Scorecard/Results View
  if (result) {
    const totalQ = result.totalQuestions || questions.length;
    const scoreVal = result.score;
    const pct = Math.round(result.percentage || 0);
    const strokeDashoffset = 440 - (440 * pct) / 100;
    const timeSpent = result.timeTaken;

    return (
      <div className="main-content test-interface-wrapper">
        <div className="glass-card result-card">
          <div style={{ marginBottom: '1.5rem' }}>
            <div className="test-category">{test?.category}</div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: '800', marginTop: '0.25rem' }}>
              Assessment Completed!
            </h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Here is your performance breakdown for <strong>{test?.testName}</strong>
            </p>
          </div>

          <div className="gauge-container">
            <svg className="gauge-svg" viewBox="0 0 160 160">
              <circle className="gauge-bg" cx="80" cy="80" r="70" />
              <circle 
                className="gauge-fill" 
                cx="80" 
                cy="80" 
                r="70" 
                style={{ strokeDashoffset }}
              />
            </svg>
            <div className="gauge-text">
              {pct}%
              <span>SCORE</span>
            </div>
          </div>

          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', maxWidth: '500px' }}>
            <div className="stat-box">
              <div className="stat-val">{scoreVal} / {totalQ}</div>
              <div className="stat-lbl">Correct Answers</div>
            </div>
            <div className="stat-box">
              <div className="stat-val">{formatTimeSpent(timeSpent)}</div>
              <div className="stat-lbl">Time Spent</div>
            </div>
            <div className="stat-box">
              <div className="stat-val">
                {pct >= 50 ? (
                  <span style={{color: 'var(--color-primary)'}}>Pass</span>
                ) : (
                  <span style={{color: '#ef4444'}}>Fail</span>
                )}
              </div>
              <div className="stat-lbl">Status</div>
            </div>
          </div>

          <button 
            className="btn-primary" 
            style={{ maxWidth: '250px', margin: '0 auto' }} 
            onClick={handleBackToDashboard}
          >
            Go back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  return (
    <div className="main-content test-interface-wrapper">
      <div className="test-header">
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{test?.testName}</h2>
          <div className="progress-indicator" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Assessment in Progress
          </div>
        </div>
        <div className={`timer-box ${timeLeft <= 60 ? 'warning' : ''}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          {formatTime(timeLeft)}
        </div>
      </div>

      {submitting ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <h2 style={{color: 'var(--color-secondary)'}}>Submitting and calculating score...</h2>
        </div>
      ) :
        currentQuestion ? (
          <div className="glass-card question-card">
            <div className="question-text">
              {currentQuestion.questionText}
            </div>

            <div className="options-grid">
              {[
                { key: 'A', text: currentQuestion.optiona },
                { key: 'B', text: currentQuestion.optionb },
                { key: 'C', text: currentQuestion.optionc },
                { key: 'D', text: currentQuestion.optiond },
              ].map((opt) => (
                <button
                  key={opt.key}
                  className={`option-button ${selectedAnswers[currentQuestion.questionId] === opt.key ? 'selected' : ''}`}
                  onClick={() => handleSelectOption(currentQuestion.questionId, opt.key)}
                >
                  <span className="option-prefix">{opt.key}</span>
                  <span>{opt.text}</span>
                </button>
              ))}
            </div>

            <div className="test-navigation">
              <button
                className="btn-nav"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => prev - 1)}
              >
                Previous
              </button>
              
              {isLastQuestion ? (
                <button
                  className="btn-submit-test"
                  onClick={handleSubmitClick}
                  disabled={Object.keys(selectedAnswers).length < totalQuestions}
                  title={Object.keys(selectedAnswers).length < totalQuestions ? "Please answer all questions before submitting" : "Submit assessment answers"}
                >
                  Submit Test
                </button>
              ) : (
                <button
                  className="btn-nav"
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
                >
                  Next
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="glass-card question-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <div className="question-text" style={{ marginBottom: '2rem', fontSize: '1.25rem' }}>
              This test section currently has no questions assigned to it. The timer is running for you to complete this session.
            </div>
            <div className="test-navigation" style={{ justifyContent: 'center' }}>
              <button
                className="btn-submit-test"
                style={{ width: 'auto', minWidth: '200px' }}
                onClick={submitAnswers}
              >
                Submit and Finish Test
              </button>
            </div>
          </div>
        )
      }
    </div>
  );
}
