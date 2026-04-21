import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { AppRouter } from './AppRouter';
import './index.css';
import './components/admin/Admin.css';

function App() {
  const { bootstrapSession } = useAuthStore();

  useEffect(() => {
    // On first mount: check localStorage, attempt refresh if needed,
    // then resolve to 'authenticated' or 'unauthenticated'.
    // Guards will not render routes until this resolves.
    bootstrapSession();
  }, [bootstrapSession]);

  // Note: The AppRouter itself handles 'bootstrapping' status via Guards —
  // they render the loading spinner while status === 'bootstrapping'.
  // No need to block the full tree here.
  return <AppRouter />;
}

export default App;
