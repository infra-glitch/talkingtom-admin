# Supabase Redirect URL Configuration

## Issue
After Google OAuth login, you're being redirected to `https://0.0.0.0:3000/admin` instead of your actual domain.

## Solution
You need to configure the correct redirect URLs in your Supabase dashboard.

## Steps to Fix

### 1. Go to Supabase Dashboard

1. Visit: https://supabase.com/dashboard
2. Select your project: `tjuiyhzhmubkybhsogqe`

### 2. Configure Redirect URLs

1. Navigate to **Authentication** → **URL Configuration**
2. Find the **Redirect URLs** section
3. Add the following URLs (click "+ Add URL" for each):

```
https://contentia-2.preview.emergentagent.com/admin
https://contentia-2.preview.emergentagent.com/auth/callback
http://localhost:3000/admin
http://localhost:3000/auth/callback
```

### 3. Set Site URL

1. In the same **URL Configuration** page
2. Set **Site URL** to: `https://contentia-2.preview.emergentagent.com`

### 4. Update Google OAuth Redirect URI

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, add:
   - `https://tjuiyhzhmubkybhsogqe.supabase.co/auth/v1/callback` (already exists)
5. Under **Authorized JavaScript origins**, add:
   - `https://contentia-2.preview.emergentagent.com`
6. Click **Save**

### 5. Test the Flow

1. Clear your browser cache/cookies
2. Visit: `https://contentia-2.preview.emergentagent.com/login`
3. Click "Sign in with Google"
4. After Google authentication, you should be redirected to:
   - `https://contentia-2.preview.emergentagent.com/admin#access_token=...`
5. The application will automatically extract the token and clean up the URL

## Why This Happens

- Supabase needs to know which URLs are allowed for OAuth redirects
- Without proper configuration, it may use fallback URLs or reject the redirect
- The `0.0.0.0` URL is the internal container address, not the public URL

## Current Configuration

**Your Domain**: `https://contentia-2.preview.emergentagent.com`
**Supabase Project**: `https://tjuiyhzhmubkybhsogqe.supabase.co`
**Environment Variable**: Already set correctly in `.env`

## Important Notes

1. **Wildcard URLs are NOT allowed** in Supabase redirect URLs
2. You must add each exact URL you want to use
3. Both HTTP and HTTPS URLs need to be added separately if you use both
4. Changes in Supabase take effect immediately (no cache)

## Verification

After configuration, the auth flow should be:

1. User clicks "Sign in with Google" on `/login`
2. Redirected to Google OAuth consent screen
3. After consent, redirected to: `https://contentia-2.preview.emergentagent.com/admin#access_token=...`
4. Application extracts token from URL hash
5. URL is cleaned to: `https://contentia-2.preview.emergentagent.com/admin`
6. User sees the admin dashboard

## Troubleshooting

### Still redirecting to 0.0.0.0?
- Double-check the redirect URLs in Supabase dashboard
- Make sure you saved the changes
- Clear browser cache and try in incognito mode

### "Invalid redirect URL" error?
- The URL you're redirecting to is not in the allowed list
- Add it to Supabase → Authentication → URL Configuration

### Stuck in redirect loop?
- Check browser console for errors
- Verify the `NEXT_PUBLIC_BASE_URL` in `.env` is correct
- Restart the Next.js server after changing `.env`

## Production Deployment

When deploying to a different domain:

1. Add the new domain to Supabase redirect URLs
2. Update `NEXT_PUBLIC_BASE_URL` in production environment
3. Add the domain to Google OAuth authorized origins
4. Test the complete auth flow
