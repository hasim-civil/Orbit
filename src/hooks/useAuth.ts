import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const userData = useAuthStore((s) => s.userData);
  const isLoading = useAuthStore((s) => s.isLoading);
  return { user, userData, isLoading };
}
