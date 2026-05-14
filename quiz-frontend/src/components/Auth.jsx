import { useState } from 'react';
import api from '../utils/api';

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', userName: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await api.post('/auth/login', {
          userName: formData.userName,
          password: formData.password,
        });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userName', res.data.userName);
        localStorage.setItem('role', res.data.role);
        onLoginSuccess();
      } else {
        await api.post('/auth/register', formData);
        setIsLogin(true); // Switch to login after successful register
        setError('Registration successful! Please login.');
      }
    } catch (err) {
      setError(err.response?.data || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="glass-card" style={{ maxWidth: '400px', margin: '4rem auto' }}>
        <h1 className="title">System Quiz</h1>
        
        <div className="tabs">
          <button className={`tab ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)}>Login</button>
          <button className={`tab ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)}>Register</button>
        </div>

        {error && <div className={error.includes('successful') ? "error-message" : "error-message"} style={{color: error.includes('successful') ? 'var(--success)' : 'var(--danger)'}}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="input-group">
              <label>Full Name</label>
              <input type="text" name="name" className="input-field" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
            </div>
          )}
          <div className="input-group">
            <label>Username</label>
            <input type="text" name="userName" className="input-field" placeholder="username123" value={formData.userName} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" name="password" className="input-field" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
          </div>
          
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')}
          </button>
        </form>
      </div>
    </div>
  );
}
