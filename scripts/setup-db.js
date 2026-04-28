/**
 * DATABASE SETUP SCRIPT
 * Run this to initialize your database tables via Node.js
 * Alternative to running SQL manually in Supabase dashboard
 * 
 * Usage: node scripts/setup-db.js
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables. Check .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  console.log('🚀 Starting database setup...')
  
  // Read the SQL file
  const sqlPath = path.join(__dirname, '../supabase/migrations/001_initial_schema.sql')
  const sql = fs.readFileSync(sqlPath, 'utf8')
  
  // Split SQL into individual statements (simple split, works for our case)
  const statements = sql
    .split(';')
    .filter(stmt => stmt.trim().length > 0)
    .map(stmt => stmt + ';')
  
  console.log(`📝 Found ${statements.length} SQL statements to execute`)
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i]
    console.log(`Executing statement ${i + 1}/${statements.length}...`)
    
    const { error } = await supabase.rpc('exec_sql', { sql: statement })
    
    if (error) {
      // Some errors are expected (table already exists, etc.)
      if (!error.message.includes('already exists')) {
        console.error(`❌ Error in statement ${i + 1}:`, error.message)
        console.error(`Statement: ${statement.substring(0, 100)}...`)
      } else {
        console.log(`⚠️  Statement ${i + 1} skipped (already exists)`)
      }
    }
  }
  
  console.log(' Database setup complete!')
  console.log('\n📋 Next steps:')
  console.log('1. Go to Supabase dashboard → Authentication → Users')
  console.log('2. Enable email auth (disable email confirm for development)')
  console.log('3. Add your Google/Facebook/MAL OAuth credentials')
}

setupDatabase().catch(console.error)