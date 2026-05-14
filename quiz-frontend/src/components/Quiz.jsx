import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: selectedAnswerId }
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

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

  const startQuiz = (topic) => {
    setSelectedTopic(topic);
    setFilteredQuestions(questions.filter(q => (q.topic || 'General') === topic));
    setCurrentQuestionIndex(0);
    setAnswers({});
    setResult(null);
  };

  const handleSelectAnswer = (questionId, answerId) => {
    setAnswers({ ...answers, [questionId]: answerId });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const payload = {
        answers: Object.keys(answers).map(qId => ({
          questionId: parseInt(qId),
          selectedAnswerId: answers[qId]
        }))
      };
      
      const res = await api.post('/quiz/submit', payload);
      setResult(res.data);
    } catch (err) {
      console.error(err);
      let errorMsg = 'Error submitting quiz';
      if (err.response && err.response.data) {
        errorMsg += ': ' + JSON.stringify(err.response.data);
      }
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container"><h2 className="title">Loading...</h2></div>;

  if (questions.length === 0) return (
    <div className="container glass-card" style={{marginTop: '2rem'}}>
      <h2 className="title">No questions available.</h2>
      <p style={{textAlign: 'center', color: 'var(--text-muted)'}}>Please ask the admin to create some questions first.</p>
    </div>
  );

  // Màn hình chọn Topic
  if (!selectedTopic && !result) {
    const topics = [...new Set(questions.map(q => q.topic || 'General'))];
    return (
      <div className="container glass-card" style={{marginTop: '2rem', textAlign: 'center'}}>
        <h2 className="title">Select a Topic</h2>
        <p style={{color: 'var(--text-muted)', marginBottom: '2rem'}}>Choose a topic to begin your quiz!</p>
        
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center'}}>
          {topics.map(topic => {
            const count = questions.filter(q => (q.topic || 'General') === topic).length;
            return (
              <div 
                key={topic} 
                onClick={() => startQuiz(topic)}
                style={{
                  background: 'var(--surface)', 
                  padding: '2rem', 
                  borderRadius: '1rem', 
                  cursor: 'pointer',
                  border: '2px solid transparent',
                  transition: 'all 0.3s ease',
                  minWidth: '200px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
              >
                <h3 style={{marginBottom: '0.5rem', color: 'var(--primary)'}}>{topic}</h3>
                <span style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>{count} Question{count !== 1 ? 's' : ''}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="container glass-card result-card" style={{marginTop: '2rem'}}>
        <h2 className="title">Quiz Completed!</h2>
        <div className="score-circle">
          {result.score}/{result.totalQuestions}
        </div>
        <div style={{display: 'flex', gap: '1rem', justifyContent: 'center'}}>
          <button className="btn" onClick={() => { setResult(null); setAnswers({}); setCurrentQuestionIndex(0); }}>Take Again</button>
          <button className="btn btn-outline" onClick={() => { setResult(null); setSelectedTopic(null); }}>Choose Another Topic</button>
        </div>
        
        <div style={{marginTop: '3rem', textAlign: 'left'}}>
          <h3 style={{marginBottom: '1rem'}}>Details:</h3>
          {result.details.map((detail, idx) => (
            <div key={idx} style={{marginBottom: '1rem', padding: '1rem', background: 'var(--surface)', borderRadius: '0.5rem', borderLeft: `4px solid ${detail.isCorrect ? 'var(--success)' : 'var(--danger)'}`}}>
              <p><strong>Q:</strong> {detail.questionContent}</p>
              <p style={{color: detail.isCorrect ? 'var(--success)' : 'var(--danger)', marginTop: '0.5rem'}}>
                <strong>Your Answer:</strong> {detail.selectedAnswerContent} {detail.isCorrect ? '✅' : '❌'}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const currentQ = filteredQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === filteredQuestions.length - 1;

  return (
    <div className="container glass-card" style={{marginTop: '2rem'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', color: 'var(--text-muted)'}}>
        <button className="btn-outline" style={{padding: '0.3rem 0.8rem', fontSize: '0.8rem', borderRadius: '0.25rem', width: 'auto'}} onClick={() => setSelectedTopic(null)}>
          &larr; Back to Topics
        </button>
        <div>
          <span style={{marginRight: '1rem', background: 'var(--primary)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.8rem'}}>
            Topic: {selectedTopic}
          </span>
          <span>Question {currentQuestionIndex + 1} of {filteredQuestions.length}</span>
        </div>
      </div>
      
      <h3 className="question-text">{currentQ.content}</h3>
      
      <div className="answers-list">
        {currentQ.answers.map(ans => (
          <div 
            key={ans.id} 
            className={`quiz-option ${answers[currentQ.id] === ans.id ? 'selected' : ''}`}
            onClick={() => handleSelectAnswer(currentQ.id, ans.id)}
          >
            {ans.content}
          </div>
        ))}
      </div>
      
      <div className="quiz-nav">
        <button 
          className="btn btn-outline" 
          disabled={currentQuestionIndex === 0} 
          onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
          style={{opacity: currentQuestionIndex === 0 ? 0.5 : 1}}
        >
          Previous
        </button>
        
        {isLastQuestion ? (
          <button className="btn" style={{width: 'auto'}} onClick={handleSubmit} disabled={Object.keys(answers).length !== filteredQuestions.length}>
            Submit Quiz
          </button>
        ) : (
          <button className="btn" style={{width: 'auto'}} onClick={() => setCurrentQuestionIndex(prev => prev + 1)}>
            Next Question
          </button>
        )}
      </div>
    </div>
  );
}
