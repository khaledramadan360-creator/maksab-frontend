import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchApi, AuthApiError } from '../../services/api/auth';
import { useAuthStore } from '../../store/authStore';
import type { User } from '../../types/auth'; // Ensure using type if verbatimModuleSyntax is true
import './Auth.css';

interface AcceptInviteResponse {
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export const AcceptInvite = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();
  const { login } = useAuthStore();

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('رابط الدعوة غير صالح أو مفقود.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !fullName || !password || status === 'submitting') return;

    setStatus('submitting');
    
    try {
      const result = await fetchApi<AcceptInviteResponse>('/invites/accept', {
        method: 'POST',
        // Notice: Specifically NOT sending email.
        body: JSON.stringify({ token, fullName, password })
      });
      
      // Auto login success!
      login(
        result.data.user, 
        { 
          accessToken: result.data.accessToken, 
          refreshToken: result.data.refreshToken 
        }
      );
      
      // Instant redirect to main authenticated dashboard root
      navigate('/home', { replace: true });

    } catch (err) {
      setStatus('error');
      if (err instanceof AuthApiError) {
        // Distinguish the exact reasons an invite fails matching standard error payload structures
        if (err.code === 'InviteExpiredError') {
          setErrorMessage('انتهت صلاحية رابط الدعوة. يرجى التواصل مع الإدارة.');
        } else if (err.code === 'InviteNotUsableError') {
          setErrorMessage('لقد تم استخدام هذه الدعوة مسبقاً أو أنه تم إيقافها.');
        } else if (err.code === 'ValidationError') {
          setErrorMessage('يوجد خطأ في البيانات المدخلة، تأكد من قوة كلمة المرور.');
        } else {
          setErrorMessage(err.message || 'حدث خطأ أثناء تفعيل الحساب.');
        }
      } else {
        setErrorMessage('حدث خطأ في الاتصال بالخادم. حاول مجدداً.');
      }
    }
  };

  if (!token) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">رابط غير صالح</h1>
          <div className="auth-error-alert">{errorMessage}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">تفعيل الحساب</h1>
        <p className="auth-subtitle">أكمل بياناتك لإنهاء إعداد الحساب</p>

        {status === 'error' && (
          <div className="auth-error-alert">{errorMessage}</div>
        )}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label className="auth-label" htmlFor="fullName">الاسم بالكامل</label>
            <input 
              id="fullName"
              type="text" 
              className="auth-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="مثال: خالد علي"
              required
              disabled={status === 'submitting'}
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
            disabled={status === 'submitting' || !fullName || !password}
          >
            {status === 'submitting' ? 'جاري التفعيل...' : 'تفعيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  );
};
