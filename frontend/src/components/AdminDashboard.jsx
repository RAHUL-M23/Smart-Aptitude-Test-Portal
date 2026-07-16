import { useState, useEffect } from 'react';

const PREDEFINED_TOPICS = {
  "Quantitative Aptitude": {
    "Number System": ["Divisibility Rules", "Factors & Multiples", "HCF & LCM", "Remainders", "Unit Digit"],
    "Arithmetic": ["Percentage", "Profit & Loss", "Simple Interest", "Compound Interest", "Ratio & Proportion", "Partnership", "Average", "Age Problems", "Mixture & Allegation"],
    "Time Related": ["Time & Work", "Pipes & Cisterns", "Time, Speed & Distance", "Trains", "Boats & Streams"],
    "Algebra": ["Linear Equations", "Quadratic Equations", "Surds & Indices"],
    "Geometry & Mensuration": ["Area", "Perimeter", "Volume", "Surface Area", "Circles", "Triangles"],
    "Permutation & Probability": ["Permutation & Combination", "Probability"],
    "Data Interpretation": ["Tables", "Pie Charts", "Bar Graphs", "Line Graphs"]
  },
  "Logical Reasoning": {
    "Series": ["Number Series", "Alphabet Series"],
    "Coding-Decoding": ["Letter Coding", "Number Coding"],
    "Analogy": ["Number Analogy", "Alphabet Analogy"],
    "Classification": ["Odd One Out"],
    "Blood Relations": ["Family Tree Problems"],
    "Direction Sense": ["East-West-North-South Problems"],
    "Ranking": ["Position & Ranking"],
    "Seating Arrangement": ["Linear Arrangement", "Circular Arrangement"],
    "Puzzles": ["Floor Puzzles", "Box Puzzles"],
    "Syllogism": ["Venn Diagram", "Logical Statements"],
    "Clocks & Calendars": ["Clocks & Calendars"]
  },
  "Verbal Ability (English)": {
    "Grammar": ["Tenses", "Articles", "Prepositions", "Subject-Verb Agreement"],
    "Vocabulary": ["Synonyms", "Antonyms", "One Word Substitution"],
    "Reading": ["Reading Comprehension"],
    "Sentence Based": ["Sentence Correction", "Para Jumbles", "Fill in the Blanks", "Error Spotting"]
  },
  "Data Sufficiency": {
    "Data Sufficiency": ["Statement Based Questions", "Decision Making Problems"]
  },
  "Non-Verbal Reasoning": {
    "Non-Verbal Reasoning": ["Mirror Images", "Water Images", "Figure Series", "Pattern Completion", "Paper Folding"]
  }
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('marks'); // 'marks' or 'questions'
  const [selectedTopicsList, setSelectedTopicsList] = useState([]);
  const [questionCategory, setQuestionCategory] = useState('');
  const [questionSubTopic, setQuestionSubTopic] = useState('');
  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(true);
  const [resultsError, setResultsError] = useState('');
  
  // Student Marks Tab State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTest, setSelectedTest] = useState('All');

  // Admin Questions Tab State
  const [tests, setTests] = useState([]);
  const [selectedQuestionsTestId, setSelectedQuestionsTestId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionsError, setQuestionsError] = useState('');
  const [questionsSearch, setQuestionsSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Question CRUD State
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [questionText, setQuestionText] = useState('');
  const [optiona, setOptiona] = useState('');
  const [optionb, setOptionb] = useState('');
  const [optionc, setOptionc] = useState('');
  const [optiond, setOptiond] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('A');
  const [targetTestId, setTargetTestId] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  // Detailed Response Breakdown State
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);
  const [selectedResultDetails, setSelectedResultDetails] = useState(null);
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);
  const [breakdownError, setBreakdownError] = useState('');

  // Registered Users State
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState('');

  // Create Test Form State
  const [newTestName, setNewTestName] = useState('');
  const [newTestCategory, setNewTestCategory] = useState('');
  const [newTestDuration, setNewTestDuration] = useState('');
  const [newTestTotalMarks, setNewTestTotalMarks] = useState('');
  const [newTestExpiryDate, setNewTestExpiryDate] = useState('');
  const [newTestExpiryTime, setNewTestExpiryTime] = useState('');
  const [createTestError, setCreateTestError] = useState('');
  const [createTestSuccess, setCreateTestSuccess] = useState('');
  const [createTestSubmitting, setCreateTestSubmitting] = useState(false);
  
  // Delete Test State
  const [showDeleteTestModal, setShowDeleteTestModal] = useState(false);
  const [testToDelete, setTestToDelete] = useState(null);
  const [deleteTestSubmitting, setDeleteTestSubmitting] = useState(false);
  const [deleteTestError, setDeleteTestError] = useState('');

  // Delete User State
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteUserSubmitting, setDeleteUserSubmitting] = useState(false);
  const [deleteUserError, setDeleteUserError] = useState('');
  const [usersSuccess, setUsersSuccess] = useState('');

  const handleDeleteUserClick = (user) => {
    setUserToDelete(user);
    setDeleteUserError('');
    setUsersSuccess('');
    setShowDeleteUserModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setDeleteUserSubmitting(true);
    setDeleteUserError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'X-User-Role': 'ROLE_ADMIN'
        }
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to delete student account');
      }

      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      setUsersSuccess(`Student ${userToDelete.name} has been deleted successfully!`);
      setShowDeleteUserModal(false);
      setUserToDelete(null);
    } catch (err) {
      setDeleteUserError(err.message);
    } finally {
      setDeleteUserSubmitting(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      setUsersError('');
      setUsersSuccess('');
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/admin/users`, {
        headers: {
          'X-User-Role': 'ROLE_ADMIN'
        }
      });
      if (!response.ok) throw new Error('Failed to load registered users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setUsersError(err.message || 'Error fetching users');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'credentials') {
      fetchUsers();
    }
  }, [activeTab]);

  const handleExportExcel = async () => {
    try {
      let testIdParam = '';
      if (selectedTest !== 'All') {
        const found = tests.find(t => t.testName === selectedTest);
        if (found) {
          testIdParam = `?testId=${found.testId}`;
        }
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/results/admin/export${testIdParam}`, {
        headers: {
          'X-User-Role': 'ROLE_ADMIN'
        }
      });
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedTest !== 'All' ? `student_reports_${selectedTest.replace(/\s+/g, '_')}.xlsx` : 'student_reports.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message || 'Error exporting Excel');
    }
  };

  const handleCreateTest = async (e) => {
    e.preventDefault();
    setCreateTestSubmitting(true);
    setCreateTestError('');
    setCreateTestSuccess('');

    let expiryTimestamp = null;
    if (newTestExpiryDate && newTestExpiryTime) {
      expiryTimestamp = `${newTestExpiryDate}T${newTestExpiryTime}:00`;
    }

    const payload = {
      testName: newTestName,
      category: newTestCategory,
      duration: Number(newTestDuration),
      totalMarks: Number(newTestTotalMarks),
      expiryTimestamp,
      selectedTopics: JSON.stringify(selectedTopicsList)
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/tests/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': 'ROLE_ADMIN'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to create test');
      }

      setCreateTestSuccess('Test created successfully!');
      setNewTestName('');
      setNewTestCategory('');
      setNewTestDuration('');
      setNewTestTotalMarks('');
      setNewTestExpiryDate('');
      setNewTestExpiryTime('');
      setSelectedTopicsList([]);
      fetchTests();
    } catch (err) {
      setCreateTestError(err.message);
    } finally {
      setCreateTestSubmitting(false);
    }
  };

  const handleDeleteTestClick = (test) => {
    setTestToDelete(test);
    setDeleteTestError('');
    setShowDeleteTestModal(true);
  };

  const confirmDeleteTest = async () => {
    if (!testToDelete) return;
    setDeleteTestSubmitting(true);
    setDeleteTestError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/tests/admin/${testToDelete.testId}`, {
        method: 'DELETE',
        headers: {
          'X-User-Role': 'ROLE_ADMIN'
        }
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to delete test');
      }

      setTests(prev => prev.filter(t => t.testId !== testToDelete.testId));

      if (selectedQuestionsTestId === testToDelete.testId) {
        const remaining = tests.filter(t => t.testId !== testToDelete.testId);
        setSelectedQuestionsTestId(remaining.length > 0 ? remaining[0].testId : null);
      }
      
      if (selectedTest === testToDelete.testName) {
        setSelectedTest('All');
      }

      setShowDeleteTestModal(false);
      setTestToDelete(null);
    } catch (err) {
      setDeleteTestError(err.message);
    } finally {
      setDeleteTestSubmitting(false);
    }
  };

  const fetchResults = async () => {
    try {
      setLoadingResults(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/results`);
      if (!response.ok) throw new Error('Failed to load student results');
      const data = await response.json();
      setResults(data);
    } catch {
      setResultsError('Could not connect to backend to fetch student marks.');
    } finally {
      setLoadingResults(false);
    }
  };

  const fetchTests = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/tests`);
      if (response.ok) {
        const data = await response.json();
        setTests(data);
        if (data.length > 0 && selectedQuestionsTestId === null) {
          setSelectedQuestionsTestId(data[0].testId);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQuestions = async (testId) => {
    if (!testId) return;
    try {
      setLoadingQuestions(true);
      setQuestionsError('');
      
      // Admin questions endpoint with role constraint check in request header
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/tests/admin/${testId}/questions`, {
        headers: {
          'X-User-Role': 'ROLE_ADMIN' // Access constraint validation
        }
      });
      
      if (response.status === 403) {
        throw new Error('Access denied. Admin credentials required by security constraint.');
      }
      if (!response.ok) {
        throw new Error('Failed to load assessment questions.');
      }
      
      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (err) {
      setQuestionsError(err.message || 'Error fetching questions.');
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    fetchResults();
    fetchTests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === 'questions' && selectedQuestionsTestId !== null) {
      fetchQuestions(selectedQuestionsTestId);
    }
  }, [activeTab, selectedQuestionsTestId]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const resetQuestionForm = () => {
    setQuestionText('');
    setOptiona('');
    setOptionb('');
    setOptionc('');
    setOptiond('');
    setCorrectAnswer('A');
    setTargetTestId(tests[0]?.testId || '');
    setCurrentQuestionId(null);
    setQuestionCategory('');
    setQuestionSubTopic('');
    setImageUrl('');
    setModalError('');
  };

  const handleAddClick = () => {
    setModalMode('add');
    resetQuestionForm();
    if (tests.length > 0) {
      setTargetTestId(tests[0].testId);
    }
    setShowQuestionModal(true);
  };

  const handleEditClick = (q) => {
    setModalMode('edit');
    setCurrentQuestionId(q.questionId);
    setQuestionText(q.questionText);
    setOptiona(q.optiona);
    setOptionb(q.optionb);
    setOptionc(q.optionc);
    setOptiond(q.optiond);
    setCorrectAnswer(q.correctAnswer);
    setTargetTestId(q.testId);
    setQuestionCategory(q.category || '');
    setQuestionSubTopic(q.subTopic || '');
    setImageUrl(q.imageUrl || '');
    setModalError('');
    setShowQuestionModal(true);
  };

  const handleDeleteClick = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/tests/admin/questions/${questionId}`, {
        method: 'DELETE',
        headers: {
          'X-User-Role': 'ROLE_ADMIN'
        }
      });
      if (!response.ok) throw new Error('Failed to delete question');
      
      // Refresh list
      fetchQuestions(selectedQuestionsTestId);
    } catch (err) {
      alert(err.message || 'Error deleting question');
    }
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    setModalSubmitting(true);
    setModalError('');

    const payload = {
      questionText,
      optiona,
      optionb,
      optionc,
      optiond,
      correctAnswer,
      testId: targetTestId,
      category: questionCategory,
      subTopic: questionSubTopic,
      imageUrl
    };

    try {
      let url = `${import.meta.env.VITE_API_URL || ''}/api/tests/admin/questions`;
      let method = 'POST';

      if (modalMode === 'edit') {
        url = `${import.meta.env.VITE_API_URL || ''}/api/tests/admin/questions/${currentQuestionId}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': 'ROLE_ADMIN'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to ${modalMode === 'add' ? 'create' : 'update'} question.`);
      }

      setShowQuestionModal(false);
      resetQuestionForm();
      // Refresh list
      fetchQuestions(selectedQuestionsTestId);
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalSubmitting(false);
    }
  };

  const formatTimeSpent = (seconds) => {
    if (seconds === undefined || seconds === null) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleViewDetails = async (resultRecord) => {
    try {
      setLoadingBreakdown(true);
      setShowBreakdownModal(true);
      setSelectedResultDetails(null);
      setBreakdownError('');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/results/${resultRecord.resultId}/details`);
      if (!response.ok) throw new Error('Failed to load breakdown details');
      
      const data = await response.json();
      setSelectedResultDetails(data);
    } catch (err) {
      setBreakdownError(err.message || 'Error fetching breakdown');
    } finally {
      setLoadingBreakdown(false);
    }
  };

  // Student Marks Filtering
  const uniqueTests = ['All', ...new Set(results.filter(r => r.test?.isActive !== false).map(r => r.test?.testName).filter(Boolean))];
  const filteredResults = results.filter((res) => {
    const studentName = res.user?.name || '';
    const studentEmail = res.user?.email || '';
    const testName = res.test?.testName || '';
    
    const matchesSearch = 
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      studentEmail.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesTest = selectedTest === 'All' || testName === selectedTest;
    
    return matchesSearch && matchesTest;
  });

  // Admin Questions Filtering
  const filteredQuestions = questions.filter((q) => {
    const textMatches = q.questionText.toLowerCase().includes(questionsSearch.toLowerCase());
    
    // Categorization check
    let category = 'General';
    if (q.questionText.toLowerCase().includes('quantitative')) category = 'Quantitative';
    else if (q.questionText.toLowerCase().includes('logical')) category = 'Logical';
    else if (q.questionText.toLowerCase().includes('verbal')) category = 'Verbal';
    
    const matchesCategory = selectedCategory === 'All' || category === selectedCategory;
    return textMatches && matchesCategory;
  });

  // Aggregates
  const totalSubmissions = results.length;
  const avgPercentage = totalSubmissions > 0 
    ? Math.round(results.reduce((sum, r) => sum + (r.percentage || 0), 0) / totalSubmissions) 
    : 0;
  const highestPercentage = totalSubmissions > 0
    ? Math.round(Math.max(...results.map(r => r.percentage || 0)))
    : 0;
  const passCount = results.filter(r => (r.percentage || 0) >= 50).length;
  const passRate = totalSubmissions > 0 ? Math.round((passCount / totalSubmissions) * 100) : 0;

  return (
    <div className="main-content">
      <div className="welcome-section">
        <h1>Admin Control Center</h1>
        <p>Monitor student performance and explore assessment materials.</p>
      </div>

      {resultsError && (
        <div className="alert-box alert-error">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <span>{resultsError}</span>
        </div>
      )}

      {/* Aggregate Stats Summary Cards */}
      <div className="admin-stats-summary">
        <div className="glass-card admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-primary)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-num">{totalSubmissions}</span>
            <span className="admin-stat-label">Total Submissions</span>
          </div>
        </div>

        <div className="glass-card admin-stat-card">
          <div className="admin-stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-num">{avgPercentage}%</span>
            <span className="admin-stat-label">Average Score</span>
          </div>
        </div>

        <div className="glass-card admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--color-secondary)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-num">{highestPercentage}%</span>
            <span className="admin-stat-label">Highest Score</span>
          </div>
        </div>

        <div className="glass-card admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'rgba(13, 148, 136, 0.1)', color: 'var(--color-accent)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-num">{passRate}%</span>
            <span className="admin-stat-label">Pass Rate</span>
          </div>
        </div>
      </div>

      {/* Tab Switch Bar */}
      <div className="admin-tabs">
        <button 
          className={`admin-tab-btn ${activeTab === 'marks' ? 'active' : ''}`}
          onClick={() => setActiveTab('marks')}
        >
          Student Marks Table
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
          onClick={() => setActiveTab('questions')}
        >
          View Questions & Answers ({questions.length > 0 ? questions.length : '505'})
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'tests' ? 'active' : ''}`}
          onClick={() => setActiveTab('tests')}
        >
          Create & Manage Tests
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'credentials' ? 'active' : ''}`}
          onClick={() => setActiveTab('credentials')}
        >
          User Credentials
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === 'marks' ? (
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div className="controls-row">
            <div className="search-input-wrapper">
              <input
                type="text"
                className="form-input"
                placeholder="Search by student name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Filter by Assessment:</span>
              <select
                className="form-input"
                value={selectedTest}
                onChange={(e) => setSelectedTest(e.target.value)}
                style={{ width: 'auto', minWidth: '180px', padding: '0.5rem 1rem' }}
              >
                {uniqueTests.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExportExcel}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'auto', padding: '0.5rem 1.25rem' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Download Report (Excel)
            </button>
          </div>

          {loadingResults ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
              Loading database records...
            </div>
          ) : filteredResults.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 0' }}>
              No records match the current filter options.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="marks-table">
                <thead>
                  <tr>
                    <th>Student Details</th>
                    <th>Assessment</th>
                    <th>Raw Score</th>
                    <th>Percentage</th>
                    <th>Time Spent</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((res) => {
                    const pass = (res.percentage || 0) >= 50;
                    return (
                      <tr key={res.resultId}>
                        <td>
                          <div className="text-highlight">{res.user?.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{res.user?.email}</div>
                          {res.user?.rollNumber && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-secondary)' }}>
                              Roll: {res.user.rollNumber} | Dept: {res.user.department}
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="text-highlight">{res.test?.testName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', textTransform: 'uppercase', fontWeight: '500', letterSpacing: '0.02em', marginTop: '0.15rem' }}>
                            {res.test?.category || 'General'}
                          </div>
                        </td>
                        <td>
                          <span className="badge-score">{res.score}</span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}> / {res.test?.totalMarks || 10}</span>
                        </td>
                        <td className="text-highlight" style={{ fontWeight: '600' }}>
                          {Math.round(res.percentage)}%
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>
                          {formatTimeSpent(res.timeTaken)}
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>
                          {formatDate(res.submittedAt)}
                        </td>
                        <td>
                          {pass ? (
                            <span className="badge-role" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-primary)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                              Pass
                            </span>
                          ) : (
                            <span className="badge-role" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                              Fail
                            </span>
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-nav"
                            style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', borderColor: 'var(--color-primary)', color: 'var(--color-primary)', whiteSpace: 'nowrap' }}
                            onClick={() => handleViewDetails(res)}
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : activeTab === 'questions' ? (
        /* Questions Viewer Tab for Admin */
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div className="controls-row">
            <div className="search-input-wrapper">
              <input
                type="text"
                className="form-input"
                placeholder="Search questions pool..."
                value={questionsSearch}
                onChange={(e) => setQuestionsSearch(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button 
                className="btn-primary" 
                style={{ width: 'auto', padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}
                onClick={handleAddClick}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '0.4rem', verticalAlign: 'middle'}}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Add Question
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Assessment:</span>
                <select
                  className="form-input"
                  value={selectedQuestionsTestId || ''}
                  onChange={(e) => setSelectedQuestionsTestId(Number(e.target.value))}
                  style={{ width: 'auto', minWidth: '180px', padding: '0.5rem 1rem' }}
                >
                  {tests.map((t) => (
                    <option key={t.testId} value={t.testId}>{t.testName}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Category:</span>
                <select
                  className="form-input"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ width: 'auto', minWidth: '130px', padding: '0.5rem 1rem' }}
                >
                  <option value="All">All Categories</option>
                  <option value="Quantitative">Quantitative</option>
                  <option value="Logical">Logical</option>
                  <option value="Verbal">Verbal</option>
                </select>
              </div>
            </div>
          </div>

          {questionsError && (
            <div className="alert-box alert-error">
              <span>{questionsError}</span>
            </div>
          )}

          {loadingQuestions ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
              Loading questions list from secure database pool...
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 0' }}>
              No questions matched.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '600px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {filteredQuestions.map((q, idx) => {
                const getOptionText = (key) => {
                  if (key === 'A') return q.optiona;
                  if (key === 'B') return q.optionb;
                  if (key === 'C') return q.optionc;
                  return q.optiond;
                };

                return (
                  <div key={q.questionId} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.8rem', color: 'var(--color-secondary)', fontWeight: '600' }}>
                      <span>QUESTION #{idx + 1} (DB ID: {q.questionId})</span>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button 
                          className="btn-nav" 
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', borderColor: 'var(--color-secondary)', color: 'var(--color-secondary)' }}
                          onClick={() => handleEditClick(q)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn-logout" 
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                          onClick={() => handleDeleteClick(q.questionId)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                      {q.category && (
                        <span className="badge-role" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--color-secondary)', borderColor: 'rgba(6, 182, 212, 0.2)', fontSize: '0.75rem', padding: '0.15rem 0.5rem' }}>
                          {q.category}
                        </span>
                      )}
                      {q.subTopic && (
                        <span className="badge-role" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', borderColor: 'rgba(139, 92, 246, 0.2)', fontSize: '0.75rem', padding: '0.15rem 0.5rem' }}>
                          {q.subTopic}
                        </span>
                      )}
                    </div>

                    <div className="text-highlight" style={{ fontSize: '1.05rem', fontWeight: '500', marginBottom: '1rem', lineHeight: '1.4' }}>
                      {q.questionText}
                    </div>
                    {q.imageUrl && (
                      <div style={{ margin: '1rem 0' }}>
                        <img 
                          src={q.imageUrl} 
                          alt="Question graphic reference" 
                          style={{ maxHeight: '160px', maxWidth: '100%', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'block' }} 
                        />
                      </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.9rem', marginBottom: '1rem' }}>
                      <div><span style={{ color: 'var(--color-secondary)', fontWeight: '600' }}>A:</span> {q.optiona}</div>
                      <div><span style={{ color: 'var(--color-secondary)', fontWeight: '600' }}>B:</span> {q.optionb}</div>
                      <div><span style={{ color: 'var(--color-secondary)', fontWeight: '600' }}>C:</span> {q.optionc}</div>
                      <div><span style={{ color: 'var(--color-secondary)', fontWeight: '600' }}>D:</span> {q.optiond}</div>
                    </div>
                    <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', padding: '0.5rem 1rem', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                      <span style={{ color: 'var(--color-primary)', fontWeight: '700' }}>CORRECT ANSWER:</span>
                      <span className="text-highlight" style={{ fontWeight: '600' }}>
                        {q.correctAnswer} - {getOptionText(q.correctAnswer)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : activeTab === 'tests' ? (
        /* Create & Manage Tests Tab */
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 className="section-title" style={{ borderLeftColor: 'var(--color-primary)' }}>Create New Assessment</h2>
          
          {createTestError && (
            <div className="alert-box alert-error" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
              <span>{createTestError}</span>
            </div>
          )}
          
          {createTestSuccess && (
            <div className="alert-box alert-success" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
              <span>{createTestSuccess}</span>
            </div>
          )}

          <form onSubmit={handleCreateTest} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem', maxWidth: '600px' }}>
            <div className="form-group">
              <label className="form-label">Test Name</label>
              <input
                type="text"
                className="form-input"
                required
                value={newTestName}
                onChange={(e) => setNewTestName(e.target.value)}
                placeholder="e.g. Verbal Ability Advanced"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-input"
                  required
                  value={newTestCategory}
                  onChange={(e) => {
                    setNewTestCategory(e.target.value);
                    setSelectedTopicsList([]);
                  }}
                >
                  <option value="">Select Category...</option>
                  <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                  <option value="Logical Reasoning">Logical Reasoning</option>
                  <option value="Verbal Ability (English)">Verbal Ability (English)</option>
                  <option value="Data Sufficiency">Data Sufficiency</option>
                  <option value="Non-Verbal Reasoning">Non-Verbal Reasoning</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Total Questions/Marks</label>
                <input
                  type="number"
                  className="form-input"
                  required
                  min="1"
                  max="100"
                  value={newTestTotalMarks}
                  onChange={(e) => setNewTestTotalMarks(e.target.value)}
                  placeholder="e.g. 20"
                />
              </div>
            </div>

            {newTestCategory && PREDEFINED_TOPICS[newTestCategory] && (
              <div className="form-group" style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '0.5rem' }}>
                <label className="form-label" style={{ fontWeight: '700', marginBottom: '1rem', color: 'var(--text-main)', display: 'block' }}>
                  Select Topics for {newTestCategory}
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {Object.entries(PREDEFINED_TOPICS[newTestCategory]).map(([subSection, topics]) => (
                    <div key={subSection} style={{ paddingLeft: '0.5rem' }}>
                      <h4 style={{ color: 'var(--color-secondary)', fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.5rem' }}>{subSection}</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem', paddingLeft: '0.75rem' }}>
                        {topics.map((topic) => (
                          <label key={topic} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={selectedTopicsList.includes(topic)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedTopicsList(prev => [...prev, topic]);
                                } else {
                                  setSelectedTopicsList(prev => prev.filter(t => t !== topic));
                                }
                              }}
                            />
                            {topic}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Duration (Minutes)</label>
                <input
                  type="number"
                  className="form-input"
                  required
                  min="1"
                  value={newTestDuration}
                  onChange={(e) => setNewTestDuration(e.target.value)}
                  placeholder="e.g. 30"
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                <label className="form-label">Expiry Schedule</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="date"
                    className="form-input"
                    required
                    value={newTestExpiryDate}
                    onChange={(e) => setNewTestExpiryDate(e.target.value)}
                  />
                  <input
                    type="time"
                    className="form-input"
                    required
                    value={newTestExpiryTime}
                    onChange={(e) => setNewTestExpiryTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button
                type="submit"
                className="btn-primary"
                style={{ width: 'auto', minWidth: '180px' }}
                disabled={createTestSubmitting}
              >
                {createTestSubmitting ? 'Creating...' : 'Create Test'}
              </button>
            </div>
          </form>

          {/* List of existing tests with their expiry dates */}
          <div style={{ marginTop: '3rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Existing Assessments</h3>
            <div className="table-responsive">
               <table className="marks-table">
                <thead>
                  <tr>
                    <th>Test ID</th>
                    <th>Test Name</th>
                    <th>Category</th>
                    <th>Topics</th>
                    <th>Duration</th>
                    <th>Marks</th>
                    <th>Shareable Link</th>
                    <th>Expiry Timestamp</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tests.map((t) => {
                    let topicsStr = 'N/A';
                    if (t.selectedTopics) {
                      try {
                        const parsed = JSON.parse(t.selectedTopics);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                          topicsStr = parsed.join(', ');
                        }
                      } catch (e) {
                        topicsStr = t.selectedTopics;
                      }
                    }
                    return (
                      <tr key={t.testId}>
                        <td>{t.testId}</td>
                        <td className="text-highlight">{t.testName}</td>
                        <td>{t.category}</td>
                        <td style={{ fontSize: '0.8rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={topicsStr}>
                          {topicsStr}
                        </td>
                        <td>{t.duration} mins</td>
                        <td>{t.totalMarks}</td>
                        <td>
                          {t.uniqueLinkId ? (
                            <button
                              type="button"
                              className="btn-nav"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', margin: 0, whiteSpace: 'nowrap', width: 'auto' }}
                              onClick={() => {
                                const link = `${window.location.origin}/test/take/${t.uniqueLinkId}`;
                                navigator.clipboard.writeText(link);
                                alert("Link copied to clipboard!");
                              }}
                            >
                              📋 Copy Link
                            </button>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>N/A</span>
                          )}
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>
                          {t.expiryTimestamp ? formatDate(t.expiryTimestamp) : 'No expiry set'}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-logout"
                            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', margin: 0, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                            onClick={() => handleDeleteTestClick(t)}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Registered User Credentials Tab */
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 className="section-title" style={{ borderLeftColor: 'var(--color-secondary)' }}>Registered User Credentials</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Secure administrative view containing hashes of all registered accounts.
          </p>

          {usersError && (
            <div className="alert-box alert-error" style={{ marginBottom: '1.5rem' }}>
              <span>{usersError}</span>
            </div>
          )}

          {usersSuccess && (
            <div className="alert-box alert-success" style={{ marginBottom: '1.5rem' }}>
              <span>{usersSuccess}</span>
            </div>
          )}

          {loadingUsers ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
              Loading credential registry...
            </div>
          ) : (
            <div className="table-responsive">
              <table className="marks-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Email ID</th>
                    <th>Role</th>
                    <th>Roll Number</th>
                    <th>Department</th>
                    <th>Password (BCrypt Hash)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td className="text-highlight">{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`user-badge ${u.role === 'ROLE_ADMIN' ? 'admin' : ''}`} style={{ margin: 0 }}>
                          {u.role === 'ROLE_ADMIN' ? 'Admin' : 'Student'}
                        </span>
                      </td>
                      <td>{u.rollNumber || 'N/A'}</td>
                      <td>{u.department || 'N/A'}</td>
                      <td style={{ fontSize: '0.75rem', fontFamily: 'monospace', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={u.password}>
                        {u.password || 'N/A'}
                      </td>
                      <td>
                        {u.role !== 'ROLE_ADMIN' && (
                          <button
                            type="button"
                            className="btn-logout"
                            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', margin: 0, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                            onClick={() => handleDeleteUserClick(u)}
                            title="Delete Student"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Custom Question Modal Overlay */}
      {showQuestionModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '600px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button 
              onClick={() => setShowQuestionModal(false)} 
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.5rem' }}
            >
              &times;
            </button>
            <h2 className="section-title" style={{ borderLeftColor: 'var(--color-secondary)' }}>
              {modalMode === 'add' ? 'Add Custom Question' : 'Edit Question'}
            </h2>
            
            {modalError && (
              <div className="alert-box alert-error" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveQuestion} style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Question Text</label>
                <textarea
                  className="form-input"
                  required
                  rows="3"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  style={{ resize: 'vertical' }}
                  placeholder="Enter the question text..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Option A</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={optiona}
                    onChange={(e) => setOptiona(e.target.value)}
                    placeholder="Option A"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Option B</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={optionb}
                    onChange={(e) => setOptionb(e.target.value)}
                    placeholder="Option B"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Option C</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={optionc}
                    onChange={(e) => setOptionc(e.target.value)}
                    placeholder="Option C"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Option D</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={optiond}
                    onChange={(e) => setOptiond(e.target.value)}
                    placeholder="Option D"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Correct Option</label>
                  <select
                    className="form-input"
                    value={correctAnswer}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Target Assessment</label>
                  <select
                    className="form-input"
                    value={targetTestId}
                    onChange={(e) => setTargetTestId(Number(e.target.value))}
                  >
                    {tests.map((t) => (
                      <option key={t.testId} value={t.testId}>
                        {t.testName} ({t.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-input"
                    value={questionCategory}
                    onChange={(e) => {
                      setQuestionCategory(e.target.value);
                      setQuestionSubTopic('');
                    }}
                  >
                    <option value="">Select Category...</option>
                    {Object.keys(PREDEFINED_TOPICS).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Sub-topic</label>
                  <select
                    className="form-input"
                    value={questionSubTopic}
                    onChange={(e) => setQuestionSubTopic(e.target.value)}
                    disabled={!questionCategory}
                  >
                    <option value="">Select Sub-topic...</option>
                    {questionCategory && PREDEFINED_TOPICS[questionCategory] && 
                      Object.entries(PREDEFINED_TOPICS[questionCategory]).flatMap(([subSection, topics]) => 
                        topics.map(topic => (
                          <option key={topic} value={topic}>{subSection} - {topic}</option>
                        ))
                      )
                    }
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ border: '1px dashed var(--border-color)', padding: '1rem', borderRadius: '8px', marginTop: '0.5rem' }}>
                <label className="form-label" style={{ fontWeight: '600' }}>Question Image Support</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Paste direct image URL (e.g. https://...)"
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>OR</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setImageUrl(reader.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
                    />
                  </div>
                  {imageUrl && (
                    <div style={{ marginTop: '0.5rem', textAlign: 'center', position: 'relative' }}>
                      <img src={imageUrl} alt="Uploaded Preview" style={{ maxHeight: '120px', maxWidth: '100%', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                      <button 
                        type="button" 
                        className="btn-logout" 
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', display: 'block', margin: '0.25rem auto' }}
                        onClick={() => setImageUrl('')}
                      >
                        Remove Image
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="btn-nav" 
                  onClick={() => setShowQuestionModal(false)}
                  disabled={modalSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ width: 'auto', minWidth: '150px' }}
                  disabled={modalSubmitting}
                >
                  {modalSubmitting ? 'Saving...' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Detailed Response Breakdown Modal Overlay */}
      {showBreakdownModal && (
        <div className="modal-overlay" style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <div className="glass-card modal-card" style={{ width: '100%', maxWidth: '750px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button 
              type="button"
              onClick={() => setShowBreakdownModal(false)} 
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.5rem' }}
              disabled={loadingBreakdown}
            >
              &times;
            </button>
            
            {loadingBreakdown ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem 0' }}>
                Fetching response breakdown details from database...
              </div>
            ) : breakdownError ? (
              <div className="alert-box alert-error" style={{ marginTop: '1rem' }}>
                <span>{breakdownError}</span>
              </div>
            ) : !selectedResultDetails ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 0' }}>
                No breakdown data available.
              </div>
            ) : (
              <div>
                <h2 className="section-title" style={{ borderLeftColor: 'var(--color-primary)', marginBottom: '1.5rem' }}>
                  Response Breakdown
                </h2>
                
                {/* Student Info & Test Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Student Name</div>
                    <div className="text-highlight" style={{ fontSize: '1.05rem', fontWeight: '600' }}>{selectedResultDetails.result.user?.name}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email</div>
                    <div className="text-highlight" style={{ fontSize: '0.95rem' }}>{selectedResultDetails.result.user?.email}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Academic Info</div>
                    <div className="text-highlight" style={{ fontSize: '0.95rem' }}>
                      Roll: {selectedResultDetails.result.user?.rollNumber || 'N/A'}<br/>
                      Dept: {selectedResultDetails.result.user?.department || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Assessment Name</div>
                    <div className="text-highlight" style={{ fontSize: '0.95rem', fontWeight: '600' }}>{selectedResultDetails.result.test?.testName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Score & Percentage</div>
                    <div className="text-highlight" style={{ fontSize: '0.95rem', fontWeight: '600' }}>
                      {selectedResultDetails.result.score} / {selectedResultDetails.result.test?.totalMarks} ({Math.round(selectedResultDetails.result.percentage)}%)
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Time Elapsed</div>
                    <div className="text-highlight" style={{ fontSize: '0.95rem' }}>{formatTimeSpent(selectedResultDetails.result.timeTaken)}</div>
                  </div>
                </div>
                
                {/* Question Details */}
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-main)' }}>Question & Answer Breakdown</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {selectedResultDetails.breakdown.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
                      No detailed response options were stored for this result record.
                    </div>
                  ) : (
                    selectedResultDetails.breakdown.map((item, idx) => {
                      const isCorrect = item.selectedAnswer !== null && item.selectedAnswer.trim().toLowerCase() === item.correctAnswer.trim().toLowerCase();
                      
                      const getOptionStyle = (optChar) => {
                        const isSelected = item.selectedAnswer === optChar;
                        const isRightOpt = item.correctAnswer === optChar;
                        
                        if (isSelected && isRightOpt) {
                          return { border: '1px solid var(--color-primary)', background: 'rgba(16, 185, 129, 0.08)', color: 'var(--color-primary)' };
                        } else if (isSelected && !isRightOpt) {
                          return { border: '1px solid #ef4444', background: 'rgba(239, 68, 68, 0.08)', color: '#f87171' };
                        } else if (isRightOpt) {
                          return { border: '1px solid var(--color-primary)', background: 'rgba(16, 185, 129, 0.03)', color: 'var(--color-primary)', opacity: 0.85 };
                        }
                        return { border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)', opacity: 0.6 };
                      };
                      
                      return (
                        <div key={item.questionId} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.25rem 1.5rem', background: 'rgba(255,255,255,0.01)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.8rem', fontWeight: '600' }}>
                            <span style={{ color: 'var(--color-secondary)' }}>QUESTION #{idx + 1} (DB ID: {item.questionId})</span>
                            {item.selectedAnswer === null || item.selectedAnswer === '' ? (
                              <span style={{ color: 'var(--text-muted)' }}>Not Attempted</span>
                            ) : isCorrect ? (
                              <span style={{ color: 'var(--color-primary)' }}>Correct ✓</span>
                            ) : (
                              <span style={{ color: '#ef4444' }}>Incorrect ✗ (Selected: {item.selectedAnswer})</span>
                            )}
                          </div>
                          <div className="text-highlight" style={{ fontSize: '1.05rem', fontWeight: '500', marginBottom: '1rem', lineHeight: '1.4' }}>
                            {item.questionText}
                          </div>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', fontSize: '0.9rem' }}>
                            <div style={{ padding: '0.6rem 0.85rem', borderRadius: '6px', transition: 'all 0.2s', ...getOptionStyle('A') }}>
                              <strong>A:</strong> {item.optiona}
                            </div>
                            <div style={{ padding: '0.6rem 0.85rem', borderRadius: '6px', transition: 'all 0.2s', ...getOptionStyle('B') }}>
                              <strong>B:</strong> {item.optionb}
                            </div>
                            <div style={{ padding: '0.6rem 0.85rem', borderRadius: '6px', transition: 'all 0.2s', ...getOptionStyle('C') }}>
                              <strong>C:</strong> {item.optionc}
                            </div>
                            <div style={{ padding: '0.6rem 0.85rem', borderRadius: '6px', transition: 'all 0.2s', ...getOptionStyle('D') }}>
                              <strong>D:</strong> {item.optiond}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                
                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <button type="button" className="btn-primary" style={{ width: 'auto', minWidth: '120px' }} onClick={() => setShowBreakdownModal(false)}>
                    Close Details
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {showDeleteTestModal && testToDelete && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '450px', position: 'relative', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-main)' }}>Delete Assessment</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Are you sure you want to delete <strong>{testToDelete.testName}</strong>? This action cannot be undone. Past student records for this test will be preserved in reports.
            </p>
            {deleteTestError && (
              <div className="alert-box alert-error" style={{ marginBottom: '1rem' }}>
                <span>{deleteTestError}</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                className="btn-nav" 
                style={{ padding: '0.5rem 1.25rem' }}
                onClick={() => {
                  setShowDeleteTestModal(false);
                  setTestToDelete(null);
                }}
                disabled={deleteTestSubmitting}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-logout" 
                style={{ padding: '0.5rem 1.25rem', margin: 0 }}
                onClick={confirmDeleteTest}
                disabled={deleteTestSubmitting}
              >
                {deleteTestSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeleteUserModal && userToDelete && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '450px', position: 'relative', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-main)' }}>Delete Student Account</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Are you sure you want to delete this student account? They will no longer be able to log in, but their past test records will be preserved.
            </p>
            {deleteUserError && (
              <div className="alert-box alert-error" style={{ marginBottom: '1rem' }}>
                <span>{deleteUserError}</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                className="btn-nav" 
                style={{ padding: '0.5rem 1.25rem' }}
                onClick={() => {
                  setShowDeleteUserModal(false);
                  setUserToDelete(null);
                }}
                disabled={deleteUserSubmitting}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-logout" 
                style={{ padding: '0.5rem 1.25rem', margin: 0 }}
                onClick={confirmDeleteUser}
                disabled={deleteUserSubmitting}
              >
                {deleteUserSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
