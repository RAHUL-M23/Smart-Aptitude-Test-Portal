import React, { useState, useEffect, useRef } from 'react';

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

  useEffect(() => {
    fetchTestDetails();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testId]);

  const fetchTestDetails = async () => {
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
      
      // Start Countdown Timer
      startTimer();
    } catch (err) {
      setError(err.message || 'Failed to fetch test details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
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
  };

  const handleSelectOption = (questionId, optionKey) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const handleAutoSubmit = () => {
    console.log('Time is up! Auto submitting...');
    submitAnswers(true);
  };

  const handleSubmitClick = () => {
    const answeredCount = Object.keys(selectedAnswers).length;
    const unansweredCount = questions.length - answeredCount;
    
    let confirmMsg = 'Are you sure you want to submit your test?';
    if (unansweredCount > 0) {
      confirmMsg = `You have ${unansweredCount} unanswered questions. Are you sure you want to submit and end the test?`;
    }
    
    if (window.confirm(confirmMsg)) {
      submitAnswers(false);
    }
  };

  const submitAnswers = async (isAutoSubmit = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
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
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeSpent = (seconds) => {
    if (seconds === undefined || seconds === null) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

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
        <button className="btn-primary" style={{ maxWidth: '200px' }} onClick={onReturnToDashboard}>
          Return to Dashboard
        </button>
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
            onClick={onReturnToDashboard}
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
        currentQuestion && (
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
        )
      }
    </div>
  );
}
