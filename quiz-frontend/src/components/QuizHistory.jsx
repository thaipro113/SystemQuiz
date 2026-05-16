import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import api from '../utils/api';

export default function QuizHistory() {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const userId = localStorage.getItem('userId') || 1; // fallback for testing
        const res = await api.get(`/quiz/results/${userId}`);
        
        // Map backend data to frontend format
        const mappedData = res.data.map(item => {
          const pass = (item.score / item.totalQuestions) >= 0.5;
          return {
            id: item.id,
            name: `Bài thi ${item.topic || 'Chung'}`,
            category: item.topic || "General",
            score: item.score,
            total: item.totalQuestions,
            time: new Date(item.submittedAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}),
            date: new Date(item.submittedAt).toLocaleDateString('vi-VN'),
            status: pass ? "Đạt" : "Không đạt",
            icon: pass ? "🌟" : "📝"
          };
        });
        
        setHistoryData(mappedData);
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);
  // The data is now dynamically fetched.

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        <div className="history-header">
          <h1 className="history-title">Lịch sử làm bài của bạn</h1>
          <p className="history-subtitle">Theo dõi quá trình học tập và kết quả các bài kiểm tra đã thực hiện.</p>
        </div>

        <div className="history-filters">
          <div className="search-bar-wrapper history-search">
            <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="text" className="search-input" placeholder="Tìm kiếm tên bài thi..." />
          </div>
          <div className="filter-dropdowns">
            <select className="dropdown-select">
              <option>Tất cả trạng thái</option>
              <option>Đạt</option>
              <option>Không đạt</option>
            </select>
            <select className="dropdown-select">
              <option>Mới nhất</option>
              <option>Cũ nhất</option>
              <option>Điểm cao nhất</option>
            </select>
          </div>
        </div>

        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>TÊN BÀI THI</th>
                <th>ĐIỂM SỐ</th>
                <th>THỜI GIAN LÀM</th>
                <th>TRẠNG THÁI</th>
                <th>HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>Đang tải dữ liệu...</td>
                </tr>
              ) : historyData.length > 0 ? (
                historyData.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="history-item-name">
                        <div className="history-item-icon">{item.icon}</div>
                        <div>
                          <div className="item-title">{item.name}</div>
                          <div className="item-category">{item.category}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="item-score">
                        <span className={(item.score/item.total) >= 0.5 ? "text-primary" : "text-danger"}>{item.score}</span> / {item.total}
                      </div>
                    </td>
                    <td>
                      <div className="item-time">{item.time}</div>
                      <div className="item-date">{item.date}</div>
                    </td>
                    <td>
                      <span className={`status-badge ${item.status === 'Đạt' ? 'status-pass' : 'status-fail'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn-link">Xem chi tiết</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>Chưa có lịch sử làm bài.</td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="table-footer">
            <span className="pagination-info">Hiển thị 1-4 trong số 24 kết quả</span>
            <div className="pagination-controls">
              <button className="pagination-btn disabled">&lt;</button>
              <button className="pagination-btn">&gt;</button>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-logo">
            <h2>SystemQuiz</h2>
          </div>
          <div className="footer-links">
            <a href="#">Về chúng tôi</a>
            <a href="#">Điều khoản</a>
            <a href="#">Chính sách bảo mật</a>
            <a href="#">Liên hệ</a>
          </div>
          <div className="footer-copyright">
            © 2026 SystemQuiz. Nền tảng học tập hiện đại.
          </div>
        </div>
      </footer>
    </div>
  );
}
