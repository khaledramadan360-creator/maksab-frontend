import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthApiError, fetchApi } from '../../services/api/auth';
import './Auth.css';

interface ForgotPasswordResponse {
  data?: {
    message?: string;
  };
}

const GENERIC_SUCCESS_MESSAGE =
  'إذا كان البريد الإلكتروني مرتبطًا بحساب، ستصلك رسالة لإعادة تعيين كلمة المرور قريبًا. يرجى مراجعة صندوق الوارد.';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'submitted'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(GENERIC_SUCCESS_MESSAGE);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const normalizedEmail = email.trim();
    if (!normalizedEmail || status === 'submitting') return;

    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetchApi<ForgotPasswordResponse>('/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: normalizedEmail }),
      });

      setSuccessMessage(response?.data?.message?.trim() || GENERIC_SUCCESS_MESSAGE);
      setStatus('submitted');
    } catch (error) {
      if (error instanceof AuthApiError && error.httpStatus === 422) {
        setErrorMessage('صيغة البريد الإلكتروني غير صحيحة.');
      } else if (error instanceof AuthApiError && error.httpStatus) {
        setErrorMessage(error.message || 'تعذر إرسال طلب إعادة التعيين. حاول مرة أخرى.');
      } else {
        setErrorMessage('تعذر الاتصال بالخادم. تأكد من إعدادات API_BASE_URL ثم حاول مرة أخرى.');
      }
      setStatus('idle');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">نسيت كلمة المرور</h1>
        <p className="auth-subtitle">أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة التعيين.</p>

        {status === 'submitted' ? (
          <>
            <div className="auth-success-alert">{successMessage}</div>
            <Link to="/login" className="auth-link">
              العودة لتسجيل الدخول
            </Link>
          </>
        ) : (
          <>
            {errorMessage && <div className="auth-error-alert">{errorMessage}</div>}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="email">
                  البريد الإلكتروني
                </label>
                <input
                  id="email"
                  type="email"
                  className="auth-input"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  required
                  disabled={status === 'submitting'}
                  dir="ltr"
                />
              </div>

              <button
                type="submit"
                className="auth-button"
                disabled={status === 'submitting' || email.trim().length === 0}
              >
                {status === 'submitting' ? 'جاري الإرسال...' : 'إرسال الرابط'}
              </button>
            </form>

            <Link to="/login" className="auth-link">
              العودة لتسجيل الدخول
            </Link>
          </>
        )}
      </div>
    </div>
  );
};
