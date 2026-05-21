import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import api from '../utils/api';

export default function UserProfile() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) {
        setError('Không tìm thấy thông tin người dùng.');
        setLoading(false);
        return;
      }
      try {
        const res = await api.get(`/auth/stats/${userId}`);
        setStats(res.data);
      } catch (err) {
        console.error("Lỗi khi tải thống kê:", err);
        setError('Không thể tải thông tin hồ sơ. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
        <h1 className="section-title" style={{ marginBottom: '2rem', textAlign: 'center' }}>Hồ sơ cá nhân</h1>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Đang tải thông tin...</div>
        ) : error ? (
          <div className="error-message" style={{ textAlign: 'center', color: 'var(--danger)' }}>{error}</div>
        ) : stats ? (
          <div className="profile-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Header / Info Section */}
            <div className="profile-header" style={{ display: 'flex', alignItems: 'center', gap: '2rem', background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              <img 
                src={`https://ui-avatars.com/api/?name=${stats.userName}&background=0D8ABC&color=fff&size=120`} 
                alt="Avatar" 
                style={{ borderRadius: '50%', border: '4px solid var(--primary-light)' }}
              />
              <div>
                <h2 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', color: 'var(--text-color)' }}>{stats.name || stats.userName}</h2>
                <p style={{ color: 'var(--text-light)', fontSize: '1.2rem', margin: 0 }}>@{stats.userName}</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              
              <div className="stat-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', textAlign: 'center', borderTop: '4px solid var(--primary)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏆</div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-light)', margin: '0 0 0.5rem 0' }}>Điểm kinh nghiệm</h3>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.totalXP} XP</div>
              </div>

              <div className="stat-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', textAlign: 'center', borderTop: '4px solid var(--secondary)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔥</div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-light)', margin: '0 0 0.5rem 0' }}>Chuỗi ngày học</h3>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--secondary)' }}>{stats.currentStreak} ngày</div>
              </div>

              <div className="stat-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', textAlign: 'center', borderTop: '4px solid var(--success)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-light)', margin: '0 0 0.5rem 0' }}>Bài Quiz đã hoàn</h3>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)' }}>{stats.completedQuizzes}</div>
              </div>

              <div className="stat-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', textAlign: 'center', borderTop: '4px solid var(--warning)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🌍</div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-light)', margin: '0 0 0.5rem 0' }}>Xếp hạng toàn cầu</h3>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning)' }}>#{stats.globalRank > 0 ? stats.globalRank : '---'}</div>
              </div>

            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
