import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Navbar({ title, timer }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isQuizTaking = location.pathname.includes('/take-quiz');
  const userName = localStorage.getItem('userName') || 'User';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    window.location.href = '/';
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-left">
          <Link to="/" className="logo">
            SystemQuiz
          </Link>
          {isQuizTaking && title && (
            <>
              <div className="nav-divider"></div>
              <h1 className="nav-title">{title}</h1>
            </>
          )}
        </div>

        {!isQuizTaking && (
          <div className="nav-links">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Trang chủ</Link>
            <Link to="/quiz" className={`nav-link ${location.pathname === '/quiz' ? 'active' : ''}`}>Làm trắc nghiệm</Link>
            <Link to="/history" className={`nav-link ${location.pathname === '/history' ? 'active' : ''}`}>Lịch sử làm bài</Link>
          </div>
        )}

        <div className="nav-actions">
          {isQuizTaking && timer && (
            <div className="timer-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              {timer}
            </div>
          )}
          <button className="icon-btn theme-toggle">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </button>
          <div className="avatar" style={{position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'}} onClick={() => {
            const menu = document.getElementById('user-menu');
            if (menu) menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
          }}>
            <img src={`https://ui-avatars.com/api/?name=${userName}&background=0D8ABC&color=fff`} alt="User Avatar" />
            <div id="user-menu" style={{display: 'none', position: 'absolute', top: '120%', right: '0', background: 'white', border: '1px solid var(--border)', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', padding: '0.5rem', minWidth: '150px', zIndex: 1000}}>
              <div style={{padding: '0.5rem', borderBottom: '1px solid var(--border)', marginBottom: '0.5rem'}}>
                <strong>{userName}</strong>
              </div>
              <button onClick={handleLogout} style={{width: '100%', textAlign: 'left', padding: '0.5rem', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', borderRadius: '0.25rem'}} onMouseOver={e => e.target.style.background = '#fee2e2'} onMouseOut={e => e.target.style.background = 'none'}>
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
