import { useEffect, useState } from 'react';
import { getTeamClientsOverview } from '../../../services/api/clients';
import { AuthApiError } from '../../../services/api/auth';
import { usePermissions } from '../../../store/authStore';
import { TeamAnalysisOverviewSection } from '../../analysis/components/TeamAnalysisOverviewSection';
import type { TeamClientsOverviewItem } from '../../../types/clients';
import '../styles/clients.css';

type LoadState = 'loading' | 'ok' | 'error';

export const TeamClientsOverviewPage = () => {
  const { isReadOnlyUser, hasRole } = usePermissions();
  const isManagerOrAdmin = hasRole(['admin', 'manager']);
  const canViewTeamOverviewData = isManagerOrAdmin || isReadOnlyUser;
  const [items, setItems] = useState<TeamClientsOverviewItem[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const load = async () => {
    if (!canViewTeamOverviewData) {
      setItems([]);
      setLoadState('ok');
      setErrorMessage('');
      return;
    }

    if (isReadOnlyUser) {
      setItems([]);
      setLoadState('ok');
      setErrorMessage('');
      return;
    }

    setLoadState('loading');
    setErrorMessage('');
    try {
      const response = await getTeamClientsOverview();
      setItems(response.data ?? []);
      setLoadState('ok');
    } catch (error) {
      setItems([]);
      setLoadState('error');
      setErrorMessage(error instanceof AuthApiError ? error.message : 'تعذر تحميل نظرة الفريق');
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReadOnlyUser, canViewTeamOverviewData]);

  return (
    <div className="clients-page">
      <div className="clients-header">
        <div>
          <h2 className="clients-title">نظرة عامة على عملاء الفريق</h2>
          <p className="clients-muted">عدد العملاء لكل موظف داخل الفريق.</p>
        </div>
      </div>

      {loadState === 'loading' && <div className="clients-card clients-state">جاري التحميل...</div>}

      {loadState === 'error' && (
        <div className="clients-card clients-state">
          <p>{errorMessage}</p>
          <button className="clients-btn clients-btn-primary" onClick={load}>
            إعادة المحاولة
          </button>
        </div>
      )}

      {loadState === 'ok' && (
        <div className="clients-card clients-table-wrap">
          <table className="clients-table">
            <thead>
              <tr>
                <th>الموظف</th>
                <th>عدد العملاء</th>
              </tr>
            </thead>
            <tbody>
              {isReadOnlyUser ? (
                [1, 2, 3].map((idx) => (
                  <tr key={`preview-${idx}`}>
                    <td>
                      <span className="clients-preview-line" />
                    </td>
                    <td>
                      <span className="clients-preview-line short" />
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td className="clients-empty-cell" colSpan={2}>
                    لا توجد بيانات متاحة
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.employeeId}>
                    <td>{item.employeeName}</td>
                    <td>{item.clientsCount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {canViewTeamOverviewData ? (
        <TeamAnalysisOverviewSection isPreviewMode={isReadOnlyUser} />
      ) : (
        <div className="clients-card clients-state">
          <p>ليس لديك صلاحية لعرض تحليل الفريق.</p>
        </div>
      )}
    </div>
  );
};
