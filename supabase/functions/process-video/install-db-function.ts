
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.2";

const supabaseUrl = 'https://weiagpwgfmyjdglfpbeu.supabase.co';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Create a database function to check if a column exists
async function createColumnCheckFunction() {
  const { error } = await supabase.rpc('create_column_check_function');
  
  if (error) {
    console.error('Error creating column check function:', error);
    return false;
  }
  
  console.log('Column check function created successfully');
  return true;
}

// Add the download_info column if it doesn't exist
async function addDownloadInfoColumn() {
  const { error } = await supabase.rpc('add_download_info_column');
  
  if (error) {
    console.error('Error adding download_info column:', error);
    return false;
  }
  
  console.log('download_info column added successfully');
  return true;
}

// Execute on start
export async function installDbFunctions() {
  try {
    // Create SQL functions
    await supabase.rpc('run_sql', { 
      sql_query: `
        CREATE OR REPLACE FUNCTION check_column_exists(table_name text, column_name text)
        RETURNS boolean
        LANGUAGE plpgsql
        AS $$
        DECLARE
          column_exists boolean;
        BEGIN
          SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = $1
              AND column_name = $2
          ) INTO column_exists;
          
          RETURN column_exists;
        END;
        $$;

        CREATE OR REPLACE FUNCTION add_download_info_column()
        RETURNS void
        LANGUAGE plpgsql
        AS $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'videos'
              AND column_name = 'download_info'
          ) THEN
            ALTER TABLE videos ADD COLUMN download_info jsonb;
          END IF;
        END;
        $$;
      `
    });

    console.log('Database functions installed successfully');
    
    // Add the column
    await addDownloadInfoColumn();
    
    return true;
  } catch (error) {
    console.error('Error setting up database functions:', error);
    return false;
  }
}

// Install functions when loaded
// installDbFunctions();
