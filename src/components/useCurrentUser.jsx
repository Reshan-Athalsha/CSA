import { useAuth } from '@/lib/AuthContext';

/**
 * Hook to get current user data and auth state.
 * Returns { user, loading, isAuthenticated, role, profile }
 */
export default function useCurrentUser() {
  const { user, isAuthenticated, isLoadingAuth, profile } = useAuth();

  return {
    user,
    loading: isLoadingAuth,
    isAuthenticated,
    role: profile?.role || null,
    profile
  };
}