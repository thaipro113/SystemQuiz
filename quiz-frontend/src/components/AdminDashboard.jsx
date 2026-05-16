import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import api from '../utils/api';

export default function AdminDashboard({ handleLogout, userName }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [collapsedTopics, setCollapsedTopics] = useState({});
  const [stats, setStats] = useState({ totalUsers: 0, totalQuizzes: 0, activeUsers: 0, completionRate: 0 });

  const initialQuestionState = {
    content: '',
    topic: '',
    answers: [
      { content: '', isCorrect: true },
      { content: '', isCorrect: false },
      { content: '', isCorrect: false },
      { content: '', isCorrect: false },
    ]
  };

  const [newQuestion, setNewQuestion] = useState(initialQuestionState);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchQuestions();
    fetchStats();
  }, []);

  useEffect(() => {
    const currentTopics = [...new Set(questions.map(q => q.topic || 'General'))];

    setCollapsedTopics(prev => {
      const updated = { ...prev };

      currentTopics.forEach(topic => {
        if (!(topic in updated)) {
          updated[topic] = true;
        }
      });

      Object.keys(updated).forEach(topic => {
        if (!currentTopics.includes(topic)) {
          delete updated[topic];
        }
      });

      return updated;
    });
  }, [questions]);

  const toggleTopic = (topicName) => {
    setCollapsedTopics(prev => ({
      ...prev,
      [topicName]: !prev[topicName]
    }));
  };

  const fetchQuestions = async () => {
    try {
      const res = await api.get('/questions');
      setQuestions(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Mock stats for now - in a real app, fetch from backend
      setStats({
        totalUsers: 1200,
        totalQuizzes: questions.length,
        activeUsers: 84,
        completionRate: 92
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleAddSubmit = async (e, keepOpen = false) => {
    if (e) e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/questions/${editingId}`, newQuestion);
        alert('Question updated successfully!');
        setEditingId(null);
      } else {
        await api.post('/questions', newQuestion);
        alert('Question added successfully!');
      }

      fetchQuestions();

      if (keepOpen) {
        setNewQuestion({
          ...initialQuestionState,
          topic: newQuestion.topic
        });
      } else {
        setShowAddForm(false);
        setNewQuestion(initialQuestionState);
      }
    } catch (err) {
      alert('Error saving question');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await api.delete(`/questions/${id}`);
      fetchQuestions();
      alert('Question deleted successfully!');
    } catch (err) {
      console.error('Delete error:', err);
      let errorMessage = 'Error deleting question';

      if (err.response?.data) {
        if (err.response.data.error) {
          errorMessage += ': ' + err.response.data.error;
          if (err.response.data.innerError) {
            errorMessage += ' (' + err.response.data.innerError + ')';
          }
        } else if (typeof err.response.data === 'string') {
          errorMessage += ': ' + err.response.data;
        }
      } else if (err.message) {
        errorMessage += ': ' + err.message;
      }

      alert(errorMessage);
    }
  };

  const handleEdit = (q) => {
    setEditingId(q.id);
    setNewQuestion({
      content: q.content,
      topic: q.topic || 'General',
      answers: q.answers.map(a => ({ content: a.content, isCorrect: a.isCorrect }))
    });
    setShowAddForm(true);
    window.scrollTo(0, 0);
  };

  const updateAnswer = (index, field, value) => {
    const updatedAnswers = [...newQuestion.answers];
    if (field === 'isCorrect') {
      updatedAnswers.forEach((ans, i) => {
        ans.isCorrect = (i === index);
      });
    } else {
      updatedAnswers[index][field] = value;
    }
    setNewQuestion({ ...newQuestion, answers: updatedAnswers });
  };

  const handleAddQuestionToTopic = (topicName) => {
    setNewQuestion({
      ...initialQuestionState,
      topic: topicName
    });
    setShowAddForm(true);
    setEditingId(null);
    window.scrollTo(0, 0);
  };

  if (loading) return (
    <div className="page-wrapper">
      <Navbar userName={userName} handleLogout={handleLogout} />
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <h2>Loading Admin Panel...</h2>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <Navbar userName={userName} handleLogout={handleLogout} currentPage="admin" />

      <main className="main-content">
        {/* Admin Header */}
        <div className="admin-header">
          <div>
            <h1 className="hero-title">Admin Dashboard</h1>
            <p className="hero-subtitle">Manage quiz content and monitor platform activity</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL USERS</span>
              <span style={{ fontSize: '1.5rem' }}>👥</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.totalUsers}</div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL QUIZZES</span>
              <span style={{ fontSize: '1.5rem' }}>📝</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{questions.length}</div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>ACTIVE TODAY</span>
              <span style={{ fontSize: '1.5rem' }}>🔥</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.activeUsers}</div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>COMPLETION RATE</span>
              <span style={{ fontSize: '1.5rem' }}>✅</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.completionRate}%</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="card" style={{ padding: '2rem', marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 className="section-title" style={{ margin: 0 }}>Question Manager</h2>
            <button className="btn btn-primary" style={{ width: 'auto', border: 'none' }} onClick={() => {
              setShowAddForm(!showAddForm);
              if (editingId) {
                setEditingId(null);
                setNewQuestion(initialQuestionState);
              }
            }}>
              {showAddForm ? 'Cancel' : 'Add New Question'}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={(e) => handleAddSubmit(e, false)} style={{ background: '#f8fafc', padding: '2rem', borderRadius: '1rem', marginBottom: '2rem', border: '1px solid var(--border)' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>{editingId ? 'Edit Question' : 'Create Question'}</h3>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Topic</label>
                <input
                  type="text"
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', outline: 'none', fontSize: '1rem' }}
                  placeholder="E.g., Math, Science, IT..."
                  value={newQuestion.topic}
                  onChange={e => setNewQuestion({ ...newQuestion, topic: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Question Content</label>
                <textarea
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', outline: 'none', fontSize: '1rem', resize: 'vertical' }}
                  rows="3"
                  placeholder="What is the capital of..."
                  value={newQuestion.content}
                  onChange={e => setNewQuestion({ ...newQuestion, content: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginTop: '1rem' }}>
                <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '1rem' }}>Answers (Select the correct one)</label>
                {newQuestion.answers.map((ans, index) => (
                  <div key={index} style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={ans.isCorrect}
                      onChange={() => updateAnswer(index, 'isCorrect', true)}
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', outline: 'none', fontSize: '1rem' }}
                      placeholder={`Answer ${index + 1}`}
                      value={ans.content}
                      onChange={e => updateAnswer(index, 'content', e.target.value)}
                      required
                    />
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ border: 'none' }}>Save Question</button>
                {!editingId && (
                  <button type="button" className="btn btn-secondary" onClick={(e) => handleAddSubmit(e, true)}>
                    Save & Add Another
                  </button>
                )}
              </div>
            </form>
          )}

          <div>
            <h3 style={{ marginBottom: '1rem' }}>Existing Questions ({questions.length})</h3>
            {questions.length === 0 ? <p>No questions yet.</p> : null}

            {[...new Set(questions.map(q => q.topic || 'General'))].map(topicName => {
              const topicQuestions = questions.filter(q => (q.topic || 'General') === topicName);
              const isCollapsed = collapsedTopics[topicName] ?? true;
              const questionCount = topicQuestions.length;

              return (
                <div key={topicName} style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: isCollapsed ? '0' : '1rem' }}>
                    <button
                      onClick={() => toggleTopic(topicName)}
                      className="topic-header"
                      style={{
                        flex: 1,
                        textAlign: 'left',
                        background: 'linear-gradient(90deg, var(--primary) 0%, transparent 100%)',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        transition: 'all 0.2s ease',
                        color: 'inherit',
                        fontSize: 'inherit',
                        fontFamily: 'inherit',
                      }}
                    >
                      <span style={{
                        fontSize: '1rem',
                        transition: 'transform 0.3s ease',
                        transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)',
                      }}>
                        ▶
                      </span>

                      <span style={{ flex: 1, fontWeight: 'bold' }}>
                        Topic: {topicName}
                      </span>

                      <span style={{
                        background: 'var(--surface)',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontSize: '0.875rem',
                        fontWeight: 'normal',
                      }}>
                        {questionCount} {questionCount === 1 ? 'question' : 'questions'}
                      </span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddQuestionToTopic(topicName);
                      }}
                      className="btn-secondary"
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        width: 'auto',
                      }}
                      title={`Add question to ${topicName} topic`}
                    >
                      + Add
                    </button>
                  </div>

                  <div
                    style={{
                      maxHeight: isCollapsed ? '0' : '10000px',
                      overflow: 'hidden',
                      transition: 'max-height 0.3s ease, opacity 0.3s ease',
                      opacity: isCollapsed ? '0' : '1',
                    }}
                  >
                    {questionCount === 0 ? (
                      <div style={{
                        padding: '1.5rem',
                        background: 'var(--surface)',
                        borderRadius: '0.5rem',
                        marginLeft: '1rem',
                        marginTop: '1rem',
                        color: 'var(--text-muted)',
                        fontStyle: 'italic',
                      }}>
                        No questions in this topic yet
                      </div>
                    ) : (
                      topicQuestions.map((q) => (
                        <div key={q.id} style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '0.5rem', marginBottom: '1rem', borderLeft: '4px solid var(--primary)', marginLeft: '1rem', borderTop: '1px solid var(--border)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{q.content}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button className="btn btn-light" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleEdit(q)}>Edit</button>
                              <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: 'var(--danger)' }} onClick={() => handleDelete(q.id)}>Delete</button>
                            </div>
                          </div>
                          <ul style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            {q.answers?.map((ans, idx) => (
                              <li key={idx} style={{ color: ans.isCorrect ? 'var(--success)' : 'inherit' }}>
                                {String.fromCharCode(65 + idx)}) {ans.content} {ans.isCorrect && '✓'}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
