import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { fetchApi, AuthApiError } from '../../services/api/auth';
import './Auth.css';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  // If no token exists in the URL, we instantly put it in an error state.
  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('الرابط غير صالح. التوكن مفقود من الرابط.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newPassword || status === 'submitting') return;

    setStatus('submitting');
    
    try {
      await fetchApi('/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword })
      });
      
      setStatus('success');
      
      // Navigate to login gracefully after a short delay, to show success
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);

    } catch (err) {
      setStatus('error');
      if (err instanceof AuthApiError) {
        // Handle common backend codes for tokens
        if (err.code === 'TokenExpiredError' || err.code === 'InvalidTokenError') {
          setErrorMessage('الرابط غير صالح أو انتهت صلاحيته. يرجى طلب رابط جديد.');
        } else if (err.code === 'ValidationError') {
          setErrorMessage('كلمة المرور لا تستوفي شروط القوة المطلوبة.');
        } else {
          setErrorMessage('حدث خطأ أثناء محاولة تعيين كلمة المرور.');
        }
      } else {
        setErrorMessage('حدث خطأ في الاتصال بالخادم.');
      }
    }
  };

  if (!token) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">رابط غير صالح</h1>
          <div className="auth-error-alert">{errorMessage}</div>
          <Link to="/forgot-password" className="auth-button" style={{ display: 'block', textAlign: 'center' }}>طلب رابط جديد</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">إعادة تعيين كلمة المرور</h1>
        <p className="auth-subtitle">أدخل كلمة المرور الجديدة لحسابك</p>

        {status === 'success' ? (
          <>
            <div className="auth-success-alert">
              تم تعيين كلمة المرور بنجاح. سيتم توجيهك لشاشة الدخول...
            </div>
            <Link to="/login" className="auth-link">تسجيل الدخول الآن</Link>
          </>
        ) : (
          <>
            {status === 'error' && (
              <div className="auth-error-alert">{errorMessage}</div>
            )}
            
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="newPassword">كلمة المرور الجديدة</label>
                <input 
                  id="newPassword"
                  type="password" 
                  className="auth-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={status === 'submitting'}
                  dir="ltr"
                />
              </div>

              <button 
                type="submit" 
                className="auth-button"
                disabled={status === 'submitting' || !newPassword}
              >
                {status === 'submitting' ? 'جاري التعيين...' : 'تأكيد كلمة المرور'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
