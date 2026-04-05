import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zmimsvyxooweqefwlzyg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptaW1zdnl4b293ZXFlZndsenlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMzc0NTUsImV4cCI6MjA5MDcxMzQ1NX0.bgzxGe8stTToUYTPui-qN_jDMr7w08RRgmeNsY4KTSY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
