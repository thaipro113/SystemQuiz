import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
import Home from './components/Home';
import QuizTaking from './components/QuizTaking';
import QuizHistory from './components/QuizHistory';
import AdminDashboard from './components/AdminDashboard';
import './index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
  const [role, setRole] = useState(() => localStorage.getItem('role') || '');

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    if (token) {
      setIsAuthenticated(true);
      setRole(userRole);
    } else {
      setIsAuthenticated(false);
      setRole('');
    }
  };

  const handleLoginSuccess = () => {
    checkAuth();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    checkAuth();
  };

  return (
    <BrowserRouter>
      <Routes>
        {!isAuthenticated ? (
          // If not logged in, show Auth component for all routes
          <Route path="*" element={<Auth onLoginSuccess={handleLoginSuccess} />} />
        ) : role === 'Admin' ? (
          // If Admin, show Admin Dashboard and restrict other frontend pages
          <>
            <Route path="/admin" element={<AdminDashboard handleLogout={handleLogout} />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </>
        ) : (
          // If normal user, show the main app
          <>
            <Route path="/" element={<Home />} />
            <Route path="/quiz" element={<QuizTaking />} />
            <Route path="/take-quiz/:id" element={<QuizTaking />} />
            <Route path="/history" element={<QuizHistory />} />
            
            {/* Redirect any other unknown routes to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
