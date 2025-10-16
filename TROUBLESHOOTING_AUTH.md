# Troubleshooting Authentication

## Error: callback_failed

If you're seeing `http://localhost:3000/login?error=callback_failed` after Google sign-in, here's what's happening and how to fix it.

## Root Cause

The OAuth callback is failing because the **redirect URL doesn't match** what's configured in Supabase.

### What's Happening

1. User clicks "Sign in with Google"
2. App redirects to: `https://contentia-2.preview.emergentagent.com/auth/callback`
3. Google authenticates user
4. Google redirects back to: `http://localhost:3000/auth/callback` (wrong!)
5. Callback fails because URL mismatch or code exchange fails

## Solution: Configure Supabase Redirect URLs

### Step 1: Add Your Domain to Supabase

1. Go to https://supabase.com/dashboard
2. Select your project: `tjuiyhzhmubkybhsogqe`
3. Navigate to **Authentication → URL Configuration**

### Step 2: Add Redirect URLs

In the **Redirect URLs** section, add these EXACT URLs:

```
https://contentia-2.preview.emergentagent.com/auth/callback
http://localhost:3000/auth/callback
```

**Important:**
- No trailing slashes
- Include both HTTP and HTTPS if needed
- Include both localhost AND your production domain

### Step 3: Set Site URL

Set the **Site URL** to your main domain:
```
https://contentia-2.preview.emergentagent.com
```

### Step 4: Save Changes

Click **Save** - changes take effect immediately.

## Verify Environment Variables

Check `/app/.env` has the correct base URL:

```env
NEXT_PUBLIC_BASE_URL=https://contentia-2.preview.emergentagent.com
```

If you changed this, restart the server:
```bash
sudo supervisorctl restart nextjs
```

## Debug Logs

The app now logs detailed information. Check the server logs:

```bash
tail -f /var/log/supervisor/nextjs.out.log
```

You should see:
```
Initiating OAuth login: { baseUrl: '...', redirectTo: '...' }
Auth callback received: { code: 'present', origin: '...' }
Session created successfully for user: user@example.com
```

## Common Errors & Solutions

### Error: "no_code"
**Meaning**: The callback URL didn't include the authorization code.

**Fix:**
- Check that redirect URL in Supabase matches exactly
- Verify Google OAuth redirect URI is set correctly
- Make sure the OAuth flow completes without interruption

### Error: "Invalid redirect URL"
**Meaning**: The redirect URL is not in Supabase's allowed list.

**Fix:**
- Add your domain to Supabase redirect URLs (see above)
- Restart your server after adding

### Error: "pkce_verifier_invalid"
**Meaning**: The PKCE code verifier doesn't match the challenge.

**Fix:**
- This usually means the session was lost between request and callback
- Clear your browser cookies and try again
- Check that cookies are being set (Dev Tools → Application → Cookies)

### Error: "Invalid code"
**Meaning**: The authorization code has expired or been used.

**Fix:**
- Authorization codes are single-use and expire quickly
- Don't refresh the callback page
- Start the OAuth flow fresh from /login

## Testing the Flow

### 1. Start Fresh
- Clear all cookies for your domain
- Open an incognito/private window

### 2. Check Each Step

**Step 1 - Visit login page:**
```
URL: https://contentia-2.preview.emergentagent.com/login
Expected: See "Sign in with Google" button
```

**Step 2 - Click sign in:**
```
URL: https://contentia-2.preview.emergentagent.com/auth/login
Expected: Redirect to Supabase OAuth
```

**Step 3 - Supabase redirects to Google:**
```
URL: https://accounts.google.com/...
Expected: Google sign-in page
```

**Step 4 - Google redirects back:**
```
URL: https://contentia-2.preview.emergentagent.com/auth/callback?code=...
Expected: Server logs show "Session created successfully"
```

**Step 5 - Final redirect:**
```
URL: https://contentia-2.preview.emergentagent.com/admin
Expected: See admin dashboard with your name/email in header
```

## Check Browser Developer Tools

### Console Tab
Look for any JavaScript errors

### Network Tab
1. Filter by "auth"
2. Check the request to `/auth/login`
3. Check the callback to `/auth/callback`
4. Verify the response codes (307 redirects are normal)

### Application Tab → Cookies
After successful login, you should see cookies like:
- `sb-<project>-auth-token`
- `sb-<project>-auth-token.0`
- etc.

These should be:
- **HttpOnly**: Yes
- **Secure**: Yes (on HTTPS)
- **SameSite**: Lax

## Still Not Working?

### Verify Google OAuth Configuration

1. Go to https://console.cloud.google.com/
2. Navigate to APIs & Services → Credentials
3. Check your OAuth 2.0 Client ID

**Authorized JavaScript origins should include:**
```
https://contentia-2.preview.emergentagent.com
https://tjuiyhzhmubkybhsogqe.supabase.co
```

**Authorized redirect URIs should include:**
```
https://tjuiyhzhmubkybhsogqe.supabase.co/auth/v1/callback
```

### Check Middleware

The middleware should be running on every request. Check that `/middleware.js` exists and is configured correctly.

### Restart Everything

Sometimes caches need to be cleared:

```bash
# Clear Next.js cache
rm -rf /app/.next

# Restart server
sudo supervisorctl restart nextjs

# Clear browser cache or use incognito mode
```

## Success Indicators

When everything works, you'll see:

1. **Server logs:**
   ```
   Initiating OAuth login: { baseUrl: 'https://...', redirectTo: 'https://.../auth/callback' }
   Auth callback received: { code: 'present', ... }
   Session created successfully for user: user@example.com
   ```

2. **Browser:**
   - Smooth redirect to Google
   - Smooth redirect back to /admin
   - See your name/email in header
   - No error messages

3. **Cookies:**
   - Multiple `sb-*` cookies set
   - HttpOnly flag enabled
   - Secure flag enabled (on HTTPS)

## Need Help?

If you're still seeing errors:

1. Copy the exact error message
2. Check server logs for detailed error
3. Verify all URLs match exactly (no typos)
4. Make sure Supabase project settings are saved
5. Try in a completely fresh browser/incognito window

## Quick Checklist

- [ ] Supabase redirect URLs include your domain
- [ ] Site URL in Supabase is set correctly
- [ ] NEXT_PUBLIC_BASE_URL in .env matches your domain
- [ ] Server restarted after .env changes
- [ ] Google OAuth redirect URI includes Supabase callback
- [ ] Using HTTPS (not HTTP) for production
- [ ] Cookies are enabled in browser
- [ ] No ad blockers or privacy extensions blocking cookies
- [ ] Tested in incognito/private window
