# Server-Side Authentication with Supabase (PKCE Flow)

## Overview

This application uses **server-side authentication** with Supabase Auth and Google OAuth provider. All authentication logic runs on the server with secure HTTP-only cookies.

## Architecture

### Key Features
- ✅ **Server-Side Only**: No client-side auth state
- ✅ **PKCE Flow**: Secure OAuth with Proof Key for Code Exchange
- ✅ **HTTP-Only Cookies**: Sessions stored in secure cookies
- ✅ **Middleware Protection**: Routes protected at the server level
- ✅ **No Token Exposure**: Access tokens never sent to client

### Components

1. **Middleware** (`/app/middleware.js`)
   - Runs on every request
   - Refreshes auth session
   - Protects `/admin` routes
   - Redirects unauthenticated users to `/login`

2. **Supabase Server Client** (`/lib/supabase/server.js`)
   - For Server Components and Route Handlers
   - Reads/writes cookies
   - Used in pages and API routes

3. **Supabase Browser Client** (`/lib/supabase/client.js`)
   - Minimal client-side usage
   - Only for non-auth operations if needed

4. **Auth Routes**
   - `/auth/login` - Initiates Google OAuth
   - `/auth/callback` - Handles OAuth callback
   - `/auth/logout` - Signs user out

## Setup Instructions

### 1. Configure Supabase Dashboard

#### Enable Google Provider

1. Go to https://supabase.com/dashboard
2. Select project: `tjuiyhzhmubkybhsogqe`
3. Navigate to **Authentication → Providers**
4. Find **Google** and toggle it ON
5. Add your Google OAuth credentials:
   - **Client ID** from Google Cloud Console
   - **Client Secret** from Google Cloud Console

#### Configure URLs

1. Go to **Authentication → URL Configuration**
2. Set **Site URL**: `https://learnbook-admin.preview.emergentagent.com`
3. Add **Redirect URLs**:
   ```
   https://learnbook-admin.preview.emergentagent.com/auth/callback
   http://localhost:3000/auth/callback
   ```

### 2. Google Cloud Console Setup

1. Go to https://console.cloud.google.com/
2. Navigate to **APIs & Services → Credentials**
3. Create or select OAuth 2.0 Client ID
4. Add **Authorized JavaScript origins**:
   ```
   https://learnbook-admin.preview.emergentagent.com
   https://tjuiyhzhmubkybhsogqe.supabase.co
   ```
5. Add **Authorized redirect URIs**:
   ```
   https://tjuiyhzhmubkybhsogqe.supabase.co/auth/v1/callback
   ```
6. Save and copy Client ID and Secret to Supabase

### 3. Environment Variables

Already configured in `/app/.env`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tjuiyhzhmubkybhsogqe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_llOYj2To5P0SjF4C3Tzrow_aqjdqaEb
```

## Authentication Flow

### Login Flow (PKCE)

1. **User visits `/login`**
   - Server Component checks if user is already authenticated
   - If yes, redirect to `/admin`
   - If no, show login form

2. **User clicks "Sign in with Google"**
   - Form submits to `/auth/login` (POST)
   - Server generates PKCE code verifier and challenge
   - Redirects to Google OAuth with code_challenge
   - Callback URL: `/auth/callback`

3. **Google redirects back with code**
   - Request hits `/auth/callback?code=...`
   - Server exchanges code for session (validates PKCE)
   - Sets HTTP-only cookies with session
   - Redirects to `/admin`

4. **Middleware validates session**
   - On every request to `/admin/*`
   - Refreshes session if needed
   - Updates cookies
   - Allows access if valid, otherwise redirects to `/login`

### Logout Flow

1. **User clicks logout button**
   - Form submits to `/auth/logout` (POST)
   - Server calls `supabase.auth.signOut()`
   - Clears session cookies
   - Redirects to `/login`

## Protected Routes

Routes protected by middleware:
- `/admin` - Dashboard
- `/admin/setup` - Setup wizard
- `/admin/*` - All admin pages

Public routes:
- `/` - Redirects to `/admin`
- `/login` - Login page
- `/auth/*` - Auth callbacks

## Usage in Code

### Server Components (Recommended)

```javascript
import { createClient } from '@/lib/supabase/server'

export default async function MyPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // User is guaranteed to exist in protected routes
  return <div>Hello {user.email}</div>
}
```

### Route Handlers (API Routes)

```javascript
import { createClient } from '@/lib/supabase/server'

export async function GET(request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  // Handle request
}
```

### Client Components (Minimal)

```javascript
'use client'
import { createClient } from '@/lib/supabase/client'

export default function MyComponent() {
  const supabase = createClient()
  // Only use for database operations, not auth
}
```

## Security Features

### HTTP-Only Cookies
- Session tokens stored in HTTP-only cookies
- Not accessible via JavaScript
- Protected from XSS attacks

### PKCE Flow
- Code verifier never leaves the server
- Protects against authorization code interception
- No client secret exposed

### Middleware Validation
- Every request validated server-side
- Automatic session refresh
- No client-side auth checks needed

### No Token Exposure
- Access tokens never sent to browser
- All API calls authenticated server-side
- Secure by default

## Testing

### 1. Test Login
```bash
# Visit login page
curl -I http://localhost:3000/login

# Should show login form
```

### 2. Test Protection
```bash
# Try accessing admin without auth
curl -I http://localhost:3000/admin

# Should redirect to /login
```

### 3. Test Complete Flow
1. Open browser: http://localhost:3000
2. Should redirect to /login
3. Click "Sign in with Google"
4. Complete Google OAuth
5. Should redirect to /admin
6. See user info in header
7. Click logout
8. Should redirect to /login

## Troubleshooting

### "Invalid API key" error
- Check that `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set correctly
- It should be: `sb_publishable_llOYj2To5P0SjF4C3Tzrow_aqjdqaEb`
- Restart server after changing .env

### Redirect to wrong URL
- Check `NEXT_PUBLIC_BASE_URL` in .env
- Verify Supabase redirect URLs include your domain
- Clear cookies and try again

### Session not persisting
- Check that cookies are being set (Dev Tools → Application → Cookies)
- Verify middleware is running (should see cookies updating)
- Check for cookie domain mismatches

### Can't access admin pages
- Verify middleware is protecting routes correctly
- Check browser console for errors
- Try logging out and back in

## Production Deployment

When deploying:

1. **Update Environment Variables**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tjuiyhzhmubkybhsogqe.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_llOYj2To5P0SjF4C3Tzrow_aqjdqaEb
   NEXT_PUBLIC_BASE_URL=https://your-production-domain.com
   ```

2. **Update Supabase URLs**
   - Add production domain to redirect URLs
   - Add to Google OAuth authorized origins

3. **Test Complete Flow**
   - Login
   - Access protected pages
   - Logout
   - Session persistence

## Key Files

- `/app/middleware.js` - Route protection
- `/lib/supabase/server.js` - Server-side client
- `/lib/supabase/middleware.js` - Auth refresh logic
- `/app/login/page.js` - Login page
- `/app/auth/login/route.js` - OAuth initiation
- `/app/auth/callback/route.js` - OAuth callback
- `/app/auth/logout/route.js` - Logout handler
- `/components/UserNav.js` - User info display
- `/app/admin/layout.js` - Protected layout

## Benefits Over Client-Side Auth

1. **More Secure**: Tokens never exposed to client
2. **Simpler**: No client-side state management
3. **Better Performance**: No auth checks on client
4. **SEO Friendly**: Server renders with auth
5. **Reliable**: No race conditions or hydration issues

## Support

- Supabase Docs: https://supabase.com/docs/guides/auth/server-side
- Next.js Middleware: https://nextjs.org/docs/app/building-your-application/routing/middleware
- PKCE Flow: https://oauth.net/2/pkce/
