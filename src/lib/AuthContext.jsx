import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { auth } from '@/api/authService';

const AuthContext = createContext(undefined);

// Sign out after 30 minutes of inactivity or 30 minutes with the tab hidden
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const initializedRef = useRef(false);

  // Safety net: always stop loading after 10 seconds no matter what
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingAuth(prev => {
        if (prev) {
          console.warn('Auth loading timed out — forcing stop');
          return false;
        }
        return prev;
      });
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  const loadUserProfile = useCallback(async (authUser) => {
    try {
      let userProfile = await auth.getUserProfile(authUser.id);

      if (!userProfile) {
        // Profile row is missing — try to recreate it
        try {
          userProfile = await auth.recreateProfile(authUser);
        } catch (recreateErr) {
          console.error('Failed to recreate profile:', recreateErr);
          setUser(null);
          setProfile(null);
          setIsAuthenticated(false);
          setAuthError({ type: 'no_profile', message: 'Profile not found. Please contact support.' });
          return;
        }
      }

      if (userProfile.status === 'approved') {
        setUser(authUser);
        setProfile(userProfile);
        setIsAuthenticated(true);
        setAuthError(null);
      } else if (userProfile.status === 'pending') {
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
        setAuthError({ type: 'pending_approval', message: 'Your account is pending approval from an administrator.' });
      } else if (userProfile.status === 'rejected') {
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
        setAuthError({ type: 'rejected', message: 'Your account has been rejected. Please contact the administrator.' });
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
      setAuthError({ type: 'profile_error', message: 'Failed to load user profile. Please try again.' });
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {

      if (event === 'INITIAL_SESSION') {
        initializedRef.current = true;
        if (session?.user) {
          await loadUserProfile(session.user);
        } else {
          setIsLoadingAuth(false);
          setIsAuthenticated(false);
        }
      } else if (event === 'SIGNED_IN') {
        // Only handle SIGNED_IN after INITIAL_SESSION has already resolved
        // This avoids double-loading on page mount
        if (initializedRef.current) {
          await loadUserProfile(session.user);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
        setAuthError(null);
        setIsLoadingAuth(false);
        initializedRef.current = false;
      }
      // TOKEN_REFRESHED — no action needed
    });

    return () => subscription?.unsubscribe();
  }, [loadUserProfile]);

  // ── Auto sign-out on inactivity or hidden tab ────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    let idleTimer = null;
    let hiddenTimer = null;

    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        console.info('[CSA] Signed out due to inactivity');
        auth.signOut().catch(() => {});
        window.location.href = '/Login';
      }, IDLE_TIMEOUT_MS);
    };

    // Throttle activity events — no need to reset timer more than once per 30s
    let lastActivity = 0;
    const THROTTLE_MS = 30_000;
    const throttledReset = () => {
      const now = Date.now();
      if (now - lastActivity < THROTTLE_MS) return;
      lastActivity = now;
      resetIdleTimer();
    };

    const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    ACTIVITY_EVENTS.forEach(e => window.addEventListener(e, throttledReset, { passive: true }));
    resetIdleTimer(); // start the clock immediately

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        // Start a separate timer; if they don't return within IDLE_TIMEOUT_MS, sign out
        hiddenTimer = setTimeout(() => {
          console.info('[CSA] Signed out — tab was hidden too long');
          auth.signOut().catch(() => {});
          // Can't redirect here (tab may be backgrounded), store flag for next focus
          sessionStorage.setItem('csa_signout_reason', 'idle');
        }, IDLE_TIMEOUT_MS);
      } else {
        clearTimeout(hiddenTimer);
        // If signout happened while hidden, redirect now that the tab is visible
        if (sessionStorage.getItem('csa_signout_reason') === 'idle') {
          sessionStorage.removeItem('csa_signout_reason');
          window.location.href = '/Login';
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearTimeout(idleTimer);
      clearTimeout(hiddenTimer);
      ACTIVITY_EVENTS.forEach(e => window.removeEventListener(e, throttledReset));
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isAuthenticated]);
  // ─────────────────────────────────────────────────────────────────────────────

  const logout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
      setAuthError(null);
      window.location.href = '/';
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/Login';
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isAuthenticated,
      isLoadingAuth,
      authError,
      logout,
      navigateToLogin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
