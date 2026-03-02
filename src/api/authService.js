import { supabase } from './supabaseClient';

/**
 * Authentication service using Supabase Auth
 */
export const auth = {
  // Sign up new user
  signUp: async ({ email, password, fullName, role = 'Parent' }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        }
      }
    });
    
    if (error) throw error;
    return data;
  },

  // Sign in user
  signIn: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // Get current session
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  // Get user profile with approval status
  // Uses RPC function to bypass RLS recursive policy issue
  getUserProfile: async () => {
    const { data, error } = await supabase.rpc('get_my_profile');
    if (error) throw error;
    if (!data) return null;
    return data;
  },

  // Re-create a missing user_profiles row (e.g. after accidental deletion)
  recreateProfile: async (authUser) => {
    const fullName = authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User';
    const role = authUser.user_metadata?.role || 'Parent';
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        id: authUser.id,
        email: authUser.email,
        full_name: fullName,
        role,
        status: 'approved',
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Check if user is authenticated and approved
  isAuthenticatedAndApproved: async () => {
    try {
      const user = await auth.getCurrentUser();
      if (!user) return { authenticated: false, approved: false, profile: null };
      
      const profile = await auth.getUserProfile();
      return {
        authenticated: true,
        approved: profile.status === 'approved',
        profile: profile,
        user: user
      };
    } catch (error) {
      return { authenticated: false, approved: false, profile: null };
    }
  },

  // Admin: Get all pending users
  getPendingUsers: async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Admin: Approve user
  approveUser: async (userId) => {
    const currentUser = await auth.getCurrentUser();
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        status: 'approved',
        approved_by: currentUser.id,
        approved_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Admin: Reject user
  rejectUser: async (userId) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ status: 'rejected' })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Listen to auth state changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

export default auth;
