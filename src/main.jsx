import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { supabase } from '@/api/supabaseClient'
import { initOfflineSync } from '@/lib/offlineQueue'

// Start offline queue auto-flush (retries queued attendance when 3G reconnects)
initOfflineSync(supabase);

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
