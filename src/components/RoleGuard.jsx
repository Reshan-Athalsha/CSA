import { useAuth } from '@/lib/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * RoleGuard - wraps content and only renders if user has an allowed role.
 * If allowPublic is true, unauthenticated users can also see the content.
 * Provides user data to children via render prop or context.
 */
export default function RoleGuard({ allowedRoles = [], allowPublic = false, children, fallback = null }) {
  const { isAuthenticated, user, profile, isLoadingAuth, authError } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  // If not authenticated
  if (!isAuthenticated) {
    if (allowPublic) {
      return children;
    }

    if (fallback) return fallback;

    // Show different messages based on auth error
    const errorMessage = authError?.type === 'pending_approval'
      ? 'Your account is pending approval from an administrator.'
      : authError?.type === 'rejected'
      ? 'Your account has been rejected. Please contact the administrator.'
      : 'You need to sign in to view this page.';

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-header)' }}>
            Access Denied
          </h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-text-main)' }}>
            {errorMessage}
          </p>
          <a href="/Login" className="mt-4 inline-block px-4 py-2 rounded-xl text-white text-sm font-semibold transition" style={{ backgroundColor: 'var(--color-primary)' }}>
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // Check role-based access
  const userRole = profile?.role || 'Parent';
  const hasAccess = allowedRoles.length === 0 || allowedRoles.includes(userRole);

  if (!hasAccess) {
    if (fallback) return fallback;
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-header)' }}>
            Access Denied
          </h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-text-main)' }}>
            You don't have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  // Pass user to children if it's a function (render prop)
  if (typeof children === 'function') {
    return children({ ...user, role: userRole, profile });
  }

  return children;
}