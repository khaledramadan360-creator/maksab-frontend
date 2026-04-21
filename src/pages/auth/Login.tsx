import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { fetchApi } from '../../services/api/auth';
import type { User } from '../../types/auth';
import './Auth.css';

interface LoginResponse {
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || status === 'submitting') return;

    setStatus('submitting');
    
    try {
      const result = await fetchApi<LoginResponse>('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      // Pass user and session to Zustand store
      login(
        result.data.user, 
        { 
          accessToken: result.data.accessToken, 
          refreshToken: result.data.refreshToken 
        }
      );
      
      // Auto-redirect since the AppRouter ProtectedRoute handles authenticated users
      // navigate('/home') is technically optional if PublicRoute also handles it, but good for explicit routing
      navigate('/home', { replace: true });

    } catch (err) {
      // Regardless of the specific error from the backend, we show a generic message.
      setStatus('error');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">تسجيل الدخول</h1>
        <p className="auth-subtitle">مرحباً بك مجدداً في برنامج بحث مكسب</p>
        
        {status === 'error' && (
          <div className="auth-error-alert">
            بيانات الاعتماد غير صالحة. يرجى التأكد من البريد الإلكتروني وكلمة المرور.
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label className="auth-label" htmlFor="email">البريد الإلكتروني</label>
            <input 
              id="email"
              type="email" 
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              disabled={status === 'submitting'}
              dir="ltr"
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-label" htmlFor="password">كلمة المرور</label>
            <input 
              id="password"
              type="password" 
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={status === 'submitting'}
              dir="ltr"
            />
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={status === 'submitting' || !email || !password}
          >
            {status === 'submitting' ? 'جاري الدخول...' : 'دخول'}
          </button>
        </form>

        <Link to="/forgot-password" className="auth-link">هل نسيت كلمة المرور؟</Link>
      </div>
    </div>
  );
};
