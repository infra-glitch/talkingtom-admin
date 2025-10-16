# Row Level Security (RLS) Setup

## Overview

All database operations now use the **authenticated server client** to properly support Supabase Row Level Security (RLS) policies.

## What Changed

### Before (Incorrect for RLS)
```javascript
// Used unauthenticated client
import { supabase } from '@/lib/supabase'
const { data } = await supabase.from('school').select('*')
```

### After (Correct for RLS)
```javascript
// Uses authenticated server client
import { db } from '@/lib/db'
const schools = await db.getSchools()
```

## How It Works

### 1. Server Client with Auth Context

The new `/lib/db.js` file uses the authenticated server client:

```javascript
import { createClient } from '@/lib/supabase/server'

export const db = {
  async getSchools() {
    const supabase = createClient() // This has auth context!
    const { data, error } = await supabase
      .from('school')
      .select('*')
    // ...
  }
}
```

### 2. Auth Token Automatically Included

The `@supabase/ssr` package automatically:
- Reads the session from HTTP-only cookies
- Extracts the access token
- Includes it in the `Authorization` header
- Sets the user context for RLS policies

This is equivalent to:
```javascript
const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    global: {
      headers: {
        Authorization: `Bearer ${serverSession.access_token}`,
      },
    },
  }
);
```

## Updated Files

### Core Changes

1. **New File**: `/lib/db.js`
   - All database helpers with authenticated client
   - Used by all API routes
   - Creates fresh authenticated client for each request

2. **Updated**: `/lib/supabase.js`
   - Marked as deprecated
   - Kept for backward compatibility
   - All new code uses `/lib/db.js`

3. **Updated**: All API routes
   - Changed from `import { db } from '@/lib/supabase'`
   - To `import { db } from '@/lib/db'`

### API Routes Updated

- `/app/api/schools/route.js`
- `/app/api/curriculums/route.js`
- `/app/api/grades/route.js`
- `/app/api/subjects/route.js`
- `/app/api/books/route.js`
- `/app/api/lessons/route.js`
- `/app/api/lessons/upload/route.js`
- `/app/api/lessons/process/route.js`

## RLS Policies

With authenticated requests, you can now use RLS policies like:

### Example: User-Specific Access

```sql
-- Only show schools created by the current user
CREATE POLICY "Users can view their own schools"
ON school FOR SELECT
TO authenticated
USING (auth.uid() = created_by);

-- Only allow users to create schools
CREATE POLICY "Authenticated users can create schools"
ON school FOR INSERT
TO authenticated
WITH CHECK (true);
```

### Example: Role-Based Access

```sql
-- Only admins can modify schools
CREATE POLICY "Admins can update schools"
ON school FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);
```

## Current RLS Status

By default, your tables likely have:

1. **RLS Enabled**: Tables have RLS turned on
2. **Default Policies**: May allow all operations or be restrictive
3. **Auth Context**: Now properly passed with every request

## Testing RLS

### 1. Check Current Policies

Go to Supabase Dashboard → Authentication → Policies

### 2. Test with Different Users

```javascript
// User 1 creates a school
const school1 = await db.createSchool({ name: 'School A' })

// User 2 tries to access
const schools = await db.getSchools()
// Should only see schools they have access to based on RLS
```

### 3. View Auth Context

Add logging to see what user is making requests:

```javascript
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  console.log('Request from user:', user.email)
  // Now make database queries with proper RLS context
}
```

## Benefits

### Security
- ✅ Database enforces access control
- ✅ Can't bypass with modified client code
- ✅ User context available in all policies

### Flexibility
- ✅ Change permissions without code changes
- ✅ Complex access rules in SQL
- ✅ Audit trail with user IDs

### Performance
- ✅ Policies evaluated in database
- ✅ No extra round trips
- ✅ Efficient filtering

## Common RLS Patterns

### 1. Public Read, Authenticated Write

```sql
-- Anyone can read
CREATE POLICY "Public read access"
ON school FOR SELECT
TO anon, authenticated
USING (true);

-- Only authenticated can write
CREATE POLICY "Authenticated write access"
ON school FOR INSERT
TO authenticated
WITH CHECK (true);
```

### 2. Owner-Based Access

```sql
-- Users see only their data
CREATE POLICY "Users see own data"
ON lesson FOR SELECT
TO authenticated
USING (created_by = auth.uid());
```

### 3. Role-Based Access

```sql
-- Admins see everything
CREATE POLICY "Admins see all"
ON school FOR SELECT
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'admin'
  OR created_by = auth.uid()
);
```

## Troubleshooting

### "row level security policy" Error

**Symptom**: Database queries fail with RLS error

**Solution**: 
1. Check if RLS policies exist for the table
2. Verify user is authenticated
3. Add appropriate RLS policies

### "new row violates row-level security policy"

**Symptom**: Insert/Update fails

**Solution**:
1. Check `WITH CHECK` clause in policy
2. Verify user has permission
3. Add missing fields (like `created_by`)

### No Data Returned (But Should Have)

**Symptom**: Query returns empty when data exists

**Solution**:
1. Check `USING` clause in policy
2. Verify auth context is correct
3. Check if user has access to that data

## Disable RLS (Development Only)

If you want to disable RLS temporarily for testing:

```sql
-- Disable RLS on a table
ALTER TABLE school DISABLE ROW LEVEL SECURITY;

-- Re-enable when done
ALTER TABLE school ENABLE ROW LEVEL SECURITY;
```

**Warning**: Never disable RLS in production!

## Migration Checklist

If you have existing RLS policies:

- [ ] All API routes use `/lib/db.js`
- [ ] Authenticated client has access token
- [ ] RLS policies allow authenticated users
- [ ] Test with different user accounts
- [ ] Verify data isolation
- [ ] Check error handling for permission denied

## Additional Resources

- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Docs](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side)

## Summary

✅ **All database operations now use authenticated client**
✅ **RLS policies will be properly enforced**
✅ **User context available in all queries**
✅ **Secure by default with proper auth**

Your application is now fully compatible with Row Level Security!
