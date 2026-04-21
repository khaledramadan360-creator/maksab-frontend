import { Link } from 'react-router-dom';
import '../components/layout/Shell.css';

export const NotFoundPage = () => (
  <div className="shell-error-page">
    <div className="shell-error-code">404</div>
    <h1 className="shell-error-title">الصفحة غير موجودة</h1>
    <p className="shell-error-sub">الرابط الذي وصلت إليه غير موجود أو تم نقله.</p>
    <Link to="/home" className="admin-btn admin-btn-primary" style={{ textDecoration: 'none' }}>
      العودة للرئيسية
    </Link>
  </div>
);
