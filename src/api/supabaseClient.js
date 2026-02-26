import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
  console.error('Make sure you have .env.local file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// Create Supabase client
// Custom lock override to prevent Web Locks API timeout errors in multi-tab scenarios.
// Supabase JS v2 uses navigator.locks to coordinate auth token refreshes across tabs,
// which can time out (10 s) if another tab holds the lock. This replaces it with a
// lightweight promise-based mutex so token refreshes still serialize per-tab without
// relying on the browser's LockManager.
const _locks = {};
const customLock = async (name, acquireTimeout, fn) => {
  if (!_locks[name]) {
    _locks[name] = Promise.resolve();
  }
  let release = /** @type {(value?: unknown) => void} */ ((_v) => {});
  const acquire = new Promise((resolve) => { release = resolve; });
  const previous = _locks[name];
  _locks[name] = previous.then(() => acquire);
  await previous;
  try {
    return await fn();
  } finally {
    release();
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    lock: customLock,
  },
});

// Collection helpers with the same interface as mockDatabase
export const collections = {
  swimmers: {
    create: async (data) => {
      const { data: result, error } = await supabase
        .from('swimmers')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    
    findAll: async (filters = {}) => {
      let query = supabase.from('swimmers').select('*');
      
      // Apply filters
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          query = query.eq(key, filters[key]);
        }
      });
      
      const { data, error } = await query.order('first_name', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    
    findById: async (id) => {
      const { data, error } = await supabase
        .from('swimmers')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    
    update: async (id, updates) => {
      const { error } = await supabase
        .from('swimmers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      return { id, ...updates };
    },
    
    delete: async (id) => {
      const { error } = await supabase
        .from('swimmers')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { success: true };
    },
  },
  
  attendance: {
    create: async (data) => {
      const { data: result, error } = await supabase
        .from('attendance')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    
    findAll: async (filters = {}) => {
      let query = supabase.from('attendance').select('*, swimmers(*)');
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          query = query.eq(key, filters[key]);
        }
      });
      
      const { data, error } = await query.order('date', { ascending: false });
      if (error) throw error;
      return data || [];
    },

    /** Fetch attendance for multiple swimmer IDs in a single query */
    findBySwimmerIds: async (ids) => {
      if (!ids.length) return [];
      const { data, error } = await supabase
        .from('attendance')
        .select('*, swimmers(*)')
        .in('swimmer_id', ids)
        .order('date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    
    findById: async (id) => {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    
    update: async (id, updates) => {
      const { error } = await supabase
        .from('attendance')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      return { id, ...updates };
    },
    
    delete: async (id) => {
      const { error } = await supabase
        .from('attendance')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { success: true };
    },
  },
  
  meets: {
    create: async (data) => {
      const { data: result, error } = await supabase
        .from('meets')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    
    findAll: async (filters = {}) => {
      let query = supabase.from('meets').select('*');
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          query = query.eq(key, filters[key]);
        }
      });
      
      const { data, error } = await query.order('date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    
    findById: async (id) => {
      const { data, error } = await supabase
        .from('meets')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    
    update: async (id, updates) => {
      const { error } = await supabase
        .from('meets')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      return { id, ...updates };
    },
    
    delete: async (id) => {
      const { error } = await supabase
        .from('meets')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { success: true };
    },
  },
  
  racetimes: {
    create: async (data) => {
      const { data: result, error } = await supabase
        .from('racetimes')
        .insert(data)
        .select('*, swimmers(*), meets(*)')
        .single();
      if (error) throw error;
      return result;
    },
    
    findAll: async (filters = {}) => {
      let query = supabase.from('racetimes').select('*, swimmers(*), meets(*)');
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          query = query.eq(key, filters[key]);
        }
      });
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },

    /** Fetch race times for multiple swimmer IDs in a single query */
    findBySwimmerIds: async (ids) => {
      if (!ids.length) return [];
      const { data, error } = await supabase
        .from('racetimes')
        .select('*, swimmers(*), meets(*)')
        .in('swimmer_id', ids)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    
    findById: async (id) => {
      const { data, error } = await supabase
        .from('racetimes')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    
    update: async (id, updates) => {
      const { error } = await supabase
        .from('racetimes')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      return { id, ...updates };
    },
    
    delete: async (id) => {
      const { error } = await supabase
        .from('racetimes')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { success: true };
    },
  },
  
  notices: {
    create: async (data) => {
      const { data: result, error } = await supabase
        .from('notices')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    
    findAll: async (filters = {}) => {
      let query = supabase.from('notices').select('*');
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          query = query.eq(key, filters[key]);
        }
      });
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    
    findById: async (id) => {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    
    update: async (id, updates) => {
      const { error } = await supabase
        .from('notices')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      return { id, ...updates };
    },
    
    delete: async (id) => {
      const { error } = await supabase
        .from('notices')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { success: true };
    },
  },
  
  trialrequests: {
    create: async (data) => {
      const { data: result, error } = await supabase
        .from('trialrequests')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    
    findAll: async (filters = {}) => {
      let query = supabase.from('trialrequests').select('*');
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          query = query.eq(key, filters[key]);
        }
      });
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    
    findById: async (id) => {
      const { data, error } = await supabase
        .from('trialrequests')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    
    update: async (id, updates) => {
      const { error } = await supabase
        .from('trialrequests')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      return { id, ...updates };
    },
    
    delete: async (id) => {
      const { error } = await supabase
        .from('trialrequests')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { success: true };
    },
  }
};

export default collections;
