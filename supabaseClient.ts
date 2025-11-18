
import { createClient } from '@supabase/supabase-js';

// We prioritize environment variables if they exist (e.g. from a .env file).
// If not found, we fall back to the hardcoded keys you provided.
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://dixxhwkgyzzyhigodyqr.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpeHhod2tneXp6eWhpZ29keXFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0ODY4NzAsImV4cCI6MjA3OTA2Mjg3MH0.uqv1Etuks6klo9Aq3yEgMz2wtynMXHI1zmci_TKlEK0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
