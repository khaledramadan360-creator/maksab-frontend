import { Link } from 'react-router-dom';
import '../components/layout/Shell.css';

export const ForbiddenPage = () => (
  <div className="shell-error-page">
    <div className="shell-error-code">403</div>
    <h1 className="shell-error-title">غير مصرح بالدخول</h1>
    <p className="shell-error-sub">ليس لديك صلاحية الوصول إلى هذه الصفحة.</p>
    <Link to="/home" className="admin-btn admin-btn-primary" style={{ textDecoration: 'none' }}>
      العودة للرئيسية
    </Link>
  </div>
);
