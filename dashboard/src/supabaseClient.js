import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gihuscbvgrugzaxowmur.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpaHVzY2J2Z3J1Z3pheG93bXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1MDgxNzMsImV4cCI6MjEwMTA4NDE3M30.MDuMn4b3RS_t65ConuoJJ75w4i2EXTvxvdHxTSayFyY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
