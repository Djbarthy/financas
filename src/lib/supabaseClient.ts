import { createClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

const supabaseUrl = 'https://meapctlgomzveguqtgho.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lYXBjdGxnb216dmVndXF0Z2hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NjI4MDYsImV4cCI6MjA2NjAzODgwNn0.vxGwPMa968UFzgb4zvk8I_L-dtPy9xnLmAIdB2jJKgg';

// Forçar o cliente a aceitar qualquer string como nome de tabela
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 