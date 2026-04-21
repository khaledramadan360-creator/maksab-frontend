import { useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchApi } from '../../services/api/auth';
import './Auth.css';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'submitted'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === 'submitting') return;

    setStatus('submitting');
    
    try {
      await fetchApi('/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      // Important UX Rule: regardless of specific success message format, treat as success.
      setStatus('submitted');
    } catch (err: any) {
      // Security Rule: Even if it fails (e.g., user not found), we transition to submitted 
      // without exposing business logic errors showing "email not found".
      // We only catch real local validation or network errors if we wanted to show specific fallback.
      setStatus('submitted');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">نسيت كلمة المرور</h1>
        <p className="auth-subtitle">أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة التعيين</p>
        
        {status === 'submitted' ? (
          <>
            <div className="auth-success-alert">
              إذا كان البريد الإلكتروني مرتبطاً بحساب، ستصلك رسالة لإعادة تعيين كلمة المرور قريباً. يرجى مراجعة صندوق الوارد.
            </div>
            <Link to="/login" className="auth-link">العودة لتسجيل الدخول</Link>
          </>
        ) : (
          <>
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

              <button 
                type="submit" 
                className="auth-button"
                disabled={status === 'submitting' || !email}
              >
                {status === 'submitting' ? 'جاري الإرسال...' : 'إرسال الرابط'}
              </button>
            </form>
            <Link to="/login" className="auth-link">العودة لتسجيل الدخول</Link>
          </>
        )}
      </div>
    </div>
  );
};
