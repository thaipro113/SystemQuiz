import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function QuizTaking() {
  const { id: topic } = useParams();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: selectedAnswerId }
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await api.get('/questions');
        const allQuestions = res.data;
        
        // Filter by topic if specified, otherwise take all
        let topicQuestions = allQuestions;
        if (topic) {
           topicQuestions = allQuestions.filter(q => (q.topic || 'General') === topic);
        }
        
        if (topicQuestions.length === 0) {
           setError('Không có câu hỏi nào cho chủ đề này.');
        } else {
           setQuestions(topicQuestions);
        }
      } catch (err) {
        console.error("Error fetching questions:", err);
        setError('Lỗi tải câu hỏi từ hệ thống.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, [topic]);

  const currentQuestion = currentQuestionIndex + 1;
  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? Math.round(((currentQuestion - 1) / totalQuestions) * 100) : 0;

  const currentQ = questions[currentQuestionIndex];

  const handleSelectOption = (answerId) => {
    setAnswers({
      ...answers,
      [currentQ.id]: answerId
    });
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
      setError('Lỗi khi nộp bài: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page-wrapper bg-light-purple"><Navbar title={topic || "Quiz"} /><main className="quiz-main-content">Đang tải...</main></div>;
  if (error) return <div className="page-wrapper bg-light-purple"><Navbar title={topic || "Quiz"} /><main className="quiz-main-content">{error}</main></div>;

  if (result) {
    return (
      <div className="page-wrapper bg-light-purple">
        <Navbar title={topic || "Quiz"} />
        <main className="quiz-main-content">
          <div className="card" style={{padding: '3rem', textAlign: 'center'}}>
            <h2 className="title">Hoàn thành bài thi!</h2>
            <div style={{fontSize: '4rem', fontWeight: 'bold', color: 'var(--primary)', margin: '2rem 0'}}>
              {result.score} / {result.totalQuestions}
            </div>
            <p>Số câu đúng: {result.correctCount}</p>
            <div style={{marginTop: '2rem'}}>
              <button className="btn btn-primary" onClick={() => navigate('/history')}>Xem lịch sử</button>
              <button className="btn btn-secondary" style={{marginLeft: '1rem'}} onClick={() => navigate('/')}>Về trang chủ</button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Generate question array 1-N

  // Options letters helper
  const getLetter = (index) => String.fromCharCode(65 + index);

  // Generate question array 1-40
  const questionArray = Array.from({ length: totalQuestions }, (_, i) => i + 1);

  return (
    <div className="page-wrapper bg-light-purple">
      <Navbar title={topic || "Làm bài thi"} timer="--:--" />
      
      <main className="quiz-main-content">
        <div className="quiz-layout">
          {/* Left Column - Question */}
          <div className="quiz-left-column card">
            <div className="quiz-progress-header">
              <span className="progress-label">TIẾN ĐỘ BÀI LÀM</span>
              <div className="progress-stats">
                <h2 className="current-q-title">Câu hỏi {currentQuestion} <span className="total-q">/ {totalQuestions}</span></h2>
                <span className="progress-percentage">{progress}% Hoàn thành</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
              </div>
            </div>

            <div className="question-container">
              <p className="question-text-large">
                {currentQ.content}
              </p>

              <div className="options-list">
                {currentQ.answers && currentQ.answers.map((opt, idx) => {
                  const letter = getLetter(idx);
                  const isSelected = answers[currentQ.id] === opt.id;
                  return (
                    <button 
                      key={opt.id} 
                      className={`option-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectOption(opt.id)}
                    >
                      <span className="option-letter">{letter}</span>
                      <span className="option-text">{opt.content}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="quiz-nav-buttons">
              <button 
                className="btn-nav btn-prev" 
                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                disabled={currentQuestionIndex === 0}
                style={{opacity: currentQuestionIndex === 0 ? 0.5 : 1}}
              >
                &larr; Câu trước
              </button>
              {currentQuestionIndex < totalQuestions - 1 ? (
                <button 
                  className="btn-nav btn-next"
                  onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                >
                  Câu tiếp theo &rarr;
                </button>
              ) : (
                <button 
                  className="btn-nav btn-next"
                  onClick={handleSubmit}
                  style={{background: 'var(--success)'}}
                >
                  Hoàn thành &rarr;
                </button>
              )}
            </div>
          </div>

          {/* Right Column - Navigation */}
          <div className="quiz-right-column">
            <div className="card q-list-card">
              <h3 className="q-list-title">Danh sách câu hỏi</h3>
              
              <div className="q-grid">
                {questionArray.map(q => {
                  let statusClass = "status-unanswered";
                  
                  const qId = questions[q - 1].id;
                  const hasAnswered = !!answers[qId];
                  
                  if (hasAnswered) statusClass = "status-answered";
                  if (q === currentQuestion) statusClass = "status-current";

                  // Make numbers two digits
                  const displayNum = q < 10 ? `0${q}` : q;
                  
                  return (
                    <button 
                      key={q} 
                      className={`q-grid-item ${statusClass}`}
                      onClick={() => setCurrentQuestionIndex(q - 1)}
                    >
                      {displayNum}
                    </button>
                  );
                })}
              </div>

              <div className="q-legend">
                <div className="legend-item">
                  <span className="legend-dot dot-answered"></span> Đã hoàn thành ({Object.keys(answers).length})
                </div>
                <div className="legend-item">
                  <span className="legend-dot dot-current"></span> Đang làm (1)
                </div>
                <div className="legend-item">
                  <span className="legend-dot dot-unanswered"></span> Chưa làm ({totalQuestions - Object.keys(answers).length})
                </div>
              </div>

              <button className="btn-submit-quiz" onClick={handleSubmit}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                Nộp bài thi
              </button>
            </div>

            <div className="help-card">
              <h3 className="help-title">Cần trợ giúp?</h3>
              <p className="help-desc">Bạn có thể xem lại tài liệu chương 4 trước khi nộp bài nếu cảm thấy chưa chắc chắn.</p>
              <button className="btn-help">Xem tài liệu</button>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer" style={{background: 'transparent', borderTop: 'none'}}>
        <div className="footer-container" style={{justifyContent: 'space-between', padding: '1.5rem 2rem'}}>
          <div className="footer-logo">
            <h2>SystemQuiz</h2>
          </div>
          <div className="footer-copyright" style={{flex: 1, textAlign: 'left', marginLeft: '1rem'}}>
            © 2026 SystemQuiz. Nền tảng học tập hiện đại.
          </div>
          <div className="footer-links" style={{marginTop: 0}}>
            <a href="#">Về chúng tôi</a>
            <a href="#">Điều khoản</a>
            <a href="#">Chính sách bảo mật</a>
            <a href="#">Liên hệ</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
