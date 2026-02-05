/**
 * Database connection test script
 * Run with: pnpm test:db
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

async function testDatabaseConnection() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
    console.error('Please create a Supabase project and update your .env file');
    process.exit(1);
  }

  console.log('Testing Supabase connection...');
  console.log(`URL: ${supabaseUrl}`);

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Test basic connection by querying the user_profiles table
    const { error } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        console.error('Tables not found. Please run the migrations first.');
        console.error('See: packages/backend/supabase/migrations/');
      } else {
        console.error('Database query error:', error.message);
      }
      process.exit(1);
    }

    console.log('Database connection successful!');
    console.log('Tables are accessible.');

    // Test entries table
    const { error: entriesError } = await supabase
      .from('entries')
      .select('id')
      .limit(1);

    if (entriesError) {
      console.error('Entries table error:', entriesError.message);
      process.exit(1);
    }

    console.log('Entries table accessible.');

    // Test analytics_events table
    const { error: analyticsError } = await supabase
      .from('analytics_events')
      .select('id')
      .limit(1);

    if (analyticsError) {
      console.error('Analytics events table error:', analyticsError.message);
      process.exit(1);
    }

    console.log('Analytics events table accessible.');
    console.log('All database tests passed!');

  } catch (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  }
}

testDatabaseConnection();
