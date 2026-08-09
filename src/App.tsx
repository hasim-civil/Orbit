import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/store/authStore';
import { useThemeSync } from '@/hooks/useThemeSync';
import { AppLayout } from '@/layouts/AppLayout';
import { RequireAuth, RequireAdmin, RedirectIfAuthed } from '@/layouts/RequireAuth';
import { PageLoadingFallback } from '@/components/PageLoadingFallback';
import { OfflineBanner } from '@/components/OfflineBanner';
import Login from '@/pages/Login';

// Every other page is code-split — Login is the only route guaranteed to
// be needed on first load for a signed-out visitor, so it stays eager.
// Reports (recharts) and the Admin pages are the heaviest, and most people
// never visit Admin at all, so this meaningfully shrinks the initial bundle.
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Attendance = lazy(() => import('@/pages/Attendance'));
const CalendarPage = lazy(() => import('@/pages/Calendar'));
const Reports = lazy(() => import('@/pages/Reports'));
const Profile = lazy(() => import('@/pages/Profile'));
const Leave = lazy(() => import('@/pages/Leave'));
const Holidays = lazy(() => import('@/pages/Holidays'));
const Admin = lazy(() => import('@/pages/Admin'));
const AdminUsers = lazy(() => import('@/pages/AdminUsers'));
const AdminUserDetail = lazy(() => import('@/pages/AdminUserDetail'));

function App() {
  const init = useAuthStore((s) => s.init);
  useThemeSync();

  // Single Firebase Auth subscription for the whole app, established once.
  useEffect(() => {
    const unsubscribe = init();
    return unsubscribe;
  }, [init]);

  return (
    <QueryClientProvider client={queryClient}>
      <OfflineBanner />
      <BrowserRouter>
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            <Route element={<RedirectIfAuthed />}>
              <Route path="/login" element={<Login />} />
            </Route>

            <Route element={<RequireAuth />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/leave" element={<Leave />} />
                <Route path="/holidays" element={<Holidays />} />

                <Route element={<RequireAdmin />}>
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/users/:uid" element={<AdminUserDetail />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
