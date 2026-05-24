import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const colorClasses = ['html', 'js', 'react', 'asp', 'sql', 'ai'];
const getRandomColorClass = () => colorClasses[Math.floor(Math.random() * colorClasses.length)];

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all questions to extract topics
        const qRes = await api.get('/questions');
        const questions = qRes.data;
        
        // Group by topic
        const topicMap = {};
        questions.forEach(q => {
          const t = q.topic || 'General';
          if (!topicMap[t]) topicMap[t] = 0;
          topicMap[t]++;
        });
        
        const catArray = Object.keys(topicMap).map(key => ({
          name: key,
          count: topicMap[key],
          // Assign random colors/icons for dynamic topics to match design
          colorClass: getRandomColorClass()
        }));
        setCategories(catArray);

        // Fetch trending quizzes
        const tRes = await api.get('/quiz/trending');
        setTrending(tRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getIconForClass = (cls, name) => {
    switch (cls) {
      case 'html': return <div className="category-icon-wrapper html-icon">{name.substring(0,2).toUpperCase()}</div>;
      case 'js': return <div className="category-icon-wrapper js-icon">{name.substring(0,2).toUpperCase()}</div>;
      case 'react': return <div className="category-icon-wrapper react-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg></div>;
      case 'asp': return <div className="category-icon-wrapper asp-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg></div>;
      case 'sql': return <div className="category-icon-wrapper sql-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg></div>;
      default: return <div className="category-icon-wrapper ai-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg></div>;
    }
  };

  const handleStartQuiz = (topicName) => {
    navigate(`/take-quiz/${encodeURIComponent(topicName)}`);
  };
  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-container">
            <div className="hero-text-content">
              <div className="hero-badge">
                <span className="sparkle-icon">✨</span> Học tập hiệu quả hơn mỗi ngày
              </div>
              <h1 className="hero-title">
                Chinh phục tri thức cùng <br />
                <span className="text-primary">SystemQuiz</span>
              </h1>
              <p className="hero-subtitle">
                Nền tảng thi trắc nghiệm trực tuyến hiện đại giúp bạn hệ thống hóa kiến thức lập trình, từ cơ bản đến nâng cao với kho câu hỏi đa dạng và thực tiễn.
              </p>
              <div className="hero-actions">
                <Link to="/quiz" className="btn btn-primary">Bắt đầu ngay</Link>
                <button className="btn btn-secondary">Tìm hiểu thêm</button>
              </div>
            </div>
            <div className="hero-image-container">
              <div className="hero-image-wrapper">
                <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600" alt="Laptop with code" className="hero-image" />
                <div className="satisfaction-badge">
                  <div className="satisfaction-icon">✓</div>
                  <div className="satisfaction-text">
                    <strong>98% Hài lòng</strong>
                    <span>Từ 10k+ người dùng</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search Bar */}
        <section className="search-section">
          <div className="search-bar-wrapper">
            <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="text" className="search-input" placeholder="Tìm kiếm chủ đề trắc nghiệm (ví dụ: React, SQL...)" />
            <button className="btn btn-primary search-btn">Tìm kiếm</button>
          </div>
          <div className="search-suggestions">
            <span>Gợi ý:</span>
            <span className="suggestion-tag">JavaScript</span>
            <span className="suggestion-tag">React</span>
            <span className="suggestion-tag">AI</span>
            <span className="suggestion-tag">SQL Server</span>
          </div>
        </section>

        {/* Categories Section */}
        <section className="categories-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">Chủ đề nổi bật</h2>
              <p className="section-subtitle">Học tập đa dạng với các lộ trình chuyên biệt</p>
            </div>
            <Link to="/explore" className="view-all-link">Xem tất cả &rarr;</Link>
          </div>
          <div className="categories-grid">
            {loading ? (
              <p>Đang tải dữ liệu...</p>
            ) : categories.length > 0 ? (
              categories.map((cat, idx) => (
                <div key={idx} className={`category-card ${cat.colorClass}-card`}>
                  {getIconForClass(cat.colorClass, cat.name)}
                  <h3 className="category-title">{cat.name}</h3>
                  <p className="category-desc">Bộ câu hỏi trắc nghiệm liên quan đến chủ đề {cat.name}.</p>
                  <div className="category-footer">
                    <span className="question-count">{cat.count} Câu hỏi</span>
                    <button className="btn-light" onClick={() => handleStartQuiz(cat.name)}>Làm Quiz</button>
                  </div>
                </div>
              ))
            ) : (
              <p>Chưa có chủ đề nào trong hệ thống.</p>
            )}
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <div className="stat-item">
            <h2 className="stat-number text-primary">50k+</h2>
            <p className="stat-label">LƯỢT LÀM BÀI</p>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <h2 className="stat-number text-purple">15k+</h2>
            <p className="stat-label">NGƯỜI DÙNG</p>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <h2 className="stat-number text-pink">1.2k+</h2>
            <p className="stat-label">SỐ LƯỢNG QUIZ</p>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <h2 className="stat-number text-green">4.9/5</h2>
            <p className="stat-label">ĐÁNH GIÁ</p>
          </div>
        </section>

        {/* Trending Quizzes Section */}
        <section className="trending-section">
          <h2 className="section-title">Trending Quizzes</h2>
          <div className="trending-grid">
            {loading ? (
              <p>Đang tải dữ liệu...</p>
            ) : trending.length > 0 ? (
              <>
                <div className="trending-card">
                  <div className="trending-image" style={{backgroundImage: "url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800')"}}>
                    <div className="trending-badges">
                      <span className="badge badge-purple">Hot Pick</span>
                    </div>
                  </div>
                  <div className="trending-content">
                    <h3 className="trending-title">{trending[0].topic}</h3>
                    <p className="trending-desc">Một trong những chủ đề được thi nhiều nhất trên hệ thống.</p>
                    <div className="trending-footer">
                      <button onClick={() => handleStartQuiz(trending[0].topic)} className="btn btn-light-solid">Bắt đầu ngay</button>
                      <span className="trending-users">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        {trending[0].takeCount} lượt thi
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="trending-side-list">
                  {trending.slice(1, 3).map((item, idx) => (
                    <div key={idx} className={`trending-side-item border-${idx === 0 ? 'green' : 'orange'}`}>
                      <h4 className={`side-item-label text-${idx === 0 ? 'green' : 'orange'}`}>Trending</h4>
                      <h3 className="side-item-title">{item.topic}</h3>
                      <p className="side-item-desc">{item.takeCount} lượt thi gần đây</p>
                      <button onClick={() => handleStartQuiz(item.topic)} className="btn-link">Tham gia &rarr;</button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p>Chưa có dữ liệu trending.</p>
            )}
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-logo">
            <h2>SystemQuiz</h2>
            <p>© 2026 SystemQuiz. Nền tảng học tập hiện đại.</p>
          </div>
          <div className="footer-links">
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
