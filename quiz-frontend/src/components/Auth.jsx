import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', userName: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
        localStorage.setItem('userId', res.data.userId);
        
        onLoginSuccess();
        
        if (res.data.role === 'Admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        await api.post('/auth/register', formData);
        setIsLogin(true); // Switch to login after successful register
        setError('Đăng ký thành công! Vui lòng đăng nhập.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper bg-light-purple" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="card" style={{ maxWidth: '450px', width: '100%', padding: '2.5rem', margin: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="logo" style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'inline-block' }}>SystemQuiz</h1>
          <p style={{ color: 'var(--text-muted)' }}>{isLogin ? 'Đăng nhập để tiếp tục học tập' : 'Tạo tài khoản mới'}</p>
        </div>

        <div className="auth-tabs" style={{ display: 'flex', marginBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
          <button 
            style={{ flex: 1, padding: '1rem', background: 'none', border: 'none', borderBottom: isLogin ? '2px solid var(--primary)' : '2px solid transparent', color: isLogin ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer' }}
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            Đăng nhập
          </button>
          <button 
            style={{ flex: 1, padding: '1rem', background: 'none', border: 'none', borderBottom: !isLogin ? '2px solid var(--primary)' : '2px solid transparent', color: !isLogin ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer' }}
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            Đăng ký
          </button>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem', backgroundColor: error.includes('thành công') ? '#dcfce7' : '#fee2e2', color: error.includes('thành công') ? 'var(--success)' : 'var(--danger)', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {!isLogin && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Họ và tên</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', outline: 'none', fontSize: '1rem' }}
                placeholder="Ví dụ: Nguyễn Văn A"
              />
            </div>
          )}
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Tên đăng nhập (Username)</label>
            <input 
              type="text" 
              name="userName" 
              value={formData.userName} 
              onChange={handleChange} 
              required 
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', outline: 'none', fontSize: '1rem' }}
              placeholder="Nhập username"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Mật khẩu</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', outline: 'none', fontSize: '1rem' }}
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1rem', marginTop: '1rem', fontSize: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng nhập' : 'Đăng ký tài khoản')}
          </button>
        </form>
      </div>
    </div>
  );
}
