import { useAuthUser } from './hooks/useAttendance';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  const { user, authLoading } = useAuthUser();

  if (authLoading) return null;
  return user ? <Dashboard /> : <Login />;
}

export default App;
