import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function AdminDashboard() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [collapsedTopics, setCollapsedTopics] = useState({});

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
  }, []);

  // Initialize and manage collapsedTopics state
  useEffect(() => {
    const currentTopics = [...new Set(questions.map(q => q.topic || 'General'))];
    
    setCollapsedTopics(prev => {
      const updated = { ...prev };
      
      // Add new topics as collapsed
      currentTopics.forEach(topic => {
        if (!(topic in updated)) {
          updated[topic] = true; // New topics start collapsed
        }
      });
      
      // Remove topics that no longer exist
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

      fetchQuestions(); // Refresh list

      if (keepOpen) {
        // Clear content but keep topic
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

  if (loading) return <div className="container"><h2 className="title">Loading Admin Panel...</h2></div>;

  return (
    <div className="container glass-card" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 className="title" style={{ margin: 0 }}>Admin Dashboard</h2>
        <button className="btn" style={{ width: 'auto' }} onClick={() => {
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
        <form onSubmit={(e) => handleAddSubmit(e, false)} style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '1rem', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>{editingId ? 'Edit Question' : 'Create Question'}</h3>

          <div className="input-group">
            <label>Topic</label>
            <input
              type="text"
              className="input-field"
              placeholder="E.g., Math, Science, IT..."
              value={newQuestion.topic}
              onChange={e => setNewQuestion({ ...newQuestion, topic: e.target.value })}
              required
            />
          </div>

          <div className="input-group">
            <label>Question Content</label>
            <textarea
              className="input-field"
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
                  className="input-field"
                  placeholder={`Answer ${index + 1}`}
                  value={ans.content}
                  onChange={e => updateAnswer(index, 'content', e.target.value)}
                  required
                />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="btn">Save Question</button>
            {!editingId && (
              <button type="button" className="btn btn-outline" onClick={(e) => handleAddSubmit(e, true)}>
                Save & Add Another
              </button>
            )}
          </div>
        </form>
      )}

      <div>
        <h3 style={{ marginBottom: '1rem' }}>Existing Questions ({questions.length})</h3>
        {questions.length === 0 ? <p>No questions yet.</p> : null}

        {/* Check for duplicate topics and show warning */}
        {(() => {
          const topics = questions.map(q => q.topic || 'General');
          const duplicates = topics.filter((topic, index) => {
            const similarTopics = topics.filter(t => 
              t.toLowerCase().trim() === topic.toLowerCase().trim() && t !== topic
            );
            return similarTopics.length > 0;
          });
          
          if (duplicates.length > 0) {
            const uniqueDuplicates = [...new Set(duplicates.map(d => d.toLowerCase().trim()))];
            return (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid var(--danger)',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '1.5rem',
                color: 'var(--danger)'
              }}>
                <strong>⚠️ Duplicate Topics Detected:</strong>
                <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                  You have similar topic names that might be duplicates. Consider editing questions to use consistent topic names.
                </p>
                <ul style={{ marginTop: '0.5rem', marginLeft: '1rem' }}>
                  {uniqueDuplicates.map(dup => {
                    const variants = [...new Set(topics.filter(t => t.toLowerCase().trim() === dup))];
                    return (
                      <li key={dup} style={{ fontSize: '0.9rem' }}>
                        Similar topics: {variants.join(', ')}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          }
          return null;
        })()}

        {/* Lấy ra danh sách các Topic duy nhất */}
        {[...new Set(questions.map(q => q.topic || 'General'))].map(topicName => {
          const topicQuestions = questions.filter(q => (q.topic || 'General') === topicName);
          const isCollapsed = collapsedTopics[topicName] ?? true;
          const questionCount = topicQuestions.length;

          return (
            <div key={topicName} style={{ marginBottom: '2rem' }}>
              {/* Interactive Topic Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: isCollapsed ? '0' : '1rem' }}>
                <button
                  onClick={() => toggleTopic(topicName)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleTopic(topicName);
                    }
                  }}
                  aria-expanded={!isCollapsed}
                  aria-controls={`topic-${topicName}-questions`}
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
                  {/* Collapse/Expand Icon */}
                  <span style={{ 
                    fontSize: '1rem',
                    transition: 'transform 0.3s ease',
                    transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)',
                  }}>
                    ▶
                  </span>
                  
                  {/* Topic Name */}
                  <span style={{ flex: 1, fontWeight: 'bold' }}>
                    Topic: {topicName}
                  </span>
                  
                  {/* Question Count Badge */}
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

                {/* Add Question Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddQuestionToTopic(topicName);
                  }}
                  className="btn-outline"
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
                  + Add Question
                </button>
              </div>

              {/* Collapsible Question List */}
              <div
                id={`topic-${topicName}-questions`}
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
                    <div key={q.id} style={{ padding: '1.5rem', background: 'var(--surface)', borderRadius: '0.5rem', marginBottom: '1rem', borderLeft: '4px solid var(--primary)', marginLeft: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <span style={{ fontWeight: 'bold' }}>Q: {q.content}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', borderRadius: '0.25rem', cursor: 'pointer' }} onClick={() => handleEdit(q)}>Edit</button>
                          <button style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', borderRadius: '0.25rem', background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', cursor: 'pointer' }} onClick={() => handleDelete(q.id)}>Delete</button>
                        </div>
                      </div>
                      <ul style={{ marginTop: '1rem', listStyle: 'none' }}>
                        {q.answers.map((a, j) => (
                          <li key={j} style={{ marginBottom: '0.5rem', color: a.isCorrect ? 'var(--success)' : 'var(--text-main)' }}>
                            {a.content} {a.isCorrect && '✅'}
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
  );
}
