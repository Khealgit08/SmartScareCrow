import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xhlboqkuxfyduppuzrzx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhobGJvcWt1eGZ5ZHVwcHV6cnp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMzU5NTYsImV4cCI6MjA4MTcxMTk1Nn0.6rhxG3Dk9ZAEK-EK12dEpmy12MKjBPaxL9H0laSQtqQ';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: AsyncStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
