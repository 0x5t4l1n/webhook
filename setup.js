#!/usr/bin/env node

/**
 * Setup script using Supabase JS client
 * Run: node setup.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env file');
    process.exit(1);
}

console.log('🔧 Initializing Supabase setup...');
console.log('📍 URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function setup() {
    try {
        console.log('\n📝 Creating webhook_logs table and policies...\n');

        // Check if table exists first
        const { data: existingTable, error: checkError } = await supabase
            .from('webhook_logs')
            .select('id')
            .limit(1);

        if (!checkError || checkError.code !== 'PGRST116') {
            // Table exists
            if (!checkError) {
                console.log('✅ Table webhook_logs already exists!');
            }
        }

        // Note: Supabase JS client cannot create tables/policies directly
        // We need to use the SQL editor or pg client
        console.log('⚠️  Supabase JS client cannot create tables directly.');
        console.log('Please use one of these methods:');
        console.log('\n1️⃣  Manual SQL Setup (Recommended):');
        console.log('   - Go to: https://app.supabase.com');
        console.log('   - Select your project → SQL Editor');
        console.log('   - Click "New Query" and paste the SQL from SUPABASE_SETUP.md');
        console.log('\n2️⃣  Using psql (if you have PostgreSQL tools):');
        console.log('   - See SUPABASE_SETUP.md for the connection string');

        console.log('\n✅ After setup, test by:');
        console.log('   1. Visit: https://webhook.nexulean.info');
        console.log('   2. Generate a webhook endpoint');
        console.log('   3. Check the console (F12) for detailed logs');

    } catch (error) {
        console.error('❌ Error during setup:', error.message);
        process.exit(1);
    }
}

setup();
