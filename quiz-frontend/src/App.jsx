import { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Quiz from './components/Quiz';
import AdminDashboard from './components/AdminDashboard';
import './index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('userName');
    const userRole = localStorage.getItem('role');
    if (token) {
      setIsAuthenticated(true);
      setUserName(user);
      setRole(userRole);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    setUserName('');
    setRole('');
  };

  return (
    <>
      <nav className="navbar">
        <div className="logo">SystemQuiz PRO</div>
        {isAuthenticated && (
          <div className="user-info">
            <span style={{background: role === 'Admin' ? 'var(--danger)' : 'var(--primary)', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.8rem', color: 'white'}}>
              {role || 'User'}
            </span>
            <span>Welcome, {userName}!</span>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        )}
      </nav>

      {!isAuthenticated ? (
        <Auth onLoginSuccess={() => {
          setIsAuthenticated(true);
          setUserName(localStorage.getItem('userName'));
          setRole(localStorage.getItem('role'));
        }} />
      ) : role === 'Admin' ? (
        <AdminDashboard />
      ) : (
        <Quiz />
      )}
    </>
  );
}

export default App;
