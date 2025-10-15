# Google OAuth Setup Guide for Supabase

## Prerequisites
- Supabase project created: `https://tjuiyhzhmubkybhsogqe.supabase.co`
- Google Cloud Console access

## Step 1: Configure Google OAuth in Google Cloud Console

### 1.1 Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. If prompted, configure the OAuth consent screen first

### 1.2 Configure OAuth Consent Screen

1. Choose **External** user type (or Internal if using Google Workspace)
2. Fill in the required fields:
   - **App name**: Lesson Digitization Admin
   - **User support email**: Your email
   - **Developer contact email**: Your email
3. Click **Save and Continue**
4. Add scopes (optional for now)
5. Add test users if needed
6. Click **Save and Continue**

### 1.3 Create OAuth Client ID

1. Back to **Credentials** → **Create Credentials** → **OAuth client ID**
2. Choose **Web application**
3. Name: `Lesson Admin OAuth`
4. **Authorized JavaScript origins**:
   - `http://localhost:3000` (for development)
   - Your production URL (when deploying)

5. **Authorized redirect URIs**:
   - `https://tjuiyhzhmubkybhsogqe.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for development)

6. Click **Create**
7. **Copy the Client ID and Client Secret** - you'll need these!

## Step 2: Configure Google OAuth in Supabase

### 2.1 Enable Google Provider

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `tjuiyhzhmubkybhsogqe`
3. Navigate to **Authentication** → **Providers**
4. Find **Google** in the list
5. Toggle it **ON**

### 2.2 Add Google Credentials

1. In the Google provider settings:
   - **Client ID**: Paste the Client ID from Google Cloud Console
   - **Client Secret**: Paste the Client Secret from Google Cloud Console
2. Click **Save**

### 2.3 Configure Site URL and Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**: `http://localhost:3000` (or your production URL)
3. Add **Redirect URLs** (IMPORTANT - Add all of these):
   - `http://localhost:3000/admin`
   - `http://localhost:3000/auth/callback`
   - `http://0.0.0.0:3000/admin`
   - Your production URLs when deploying

**Note**: The OAuth flow will redirect to `/admin` with tokens in the URL hash. The application will automatically extract and store these tokens.

## Step 3: Test the Authentication Flow

1. Visit: `http://localhost:3000`
2. You should be redirected to `/login`
3. Click **Sign in with Google**
4. You'll be redirected to Google's OAuth consent screen
5. After approval, you'll be redirected back to `/admin`

## Step 4: Verify Setup

### Check if it's working:

1. **Home page** (`/`) → Should redirect to `/login` if not authenticated
2. **Login page** (`/login`) → Should show "Sign in with Google" button
3. **Click Sign in** → Should redirect to Google OAuth
4. **After Google auth** → Should redirect to `/admin` dashboard
5. **Admin pages** → Should show user menu with avatar in top-right
6. **Sign out** → Should redirect back to `/login`

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Check that your redirect URI in Google Cloud Console matches exactly:
  `https://tjuiyhzhmubkybhsogqe.supabase.co/auth/v1/callback`

### Error: "Access blocked: This app's request is invalid"
- Make sure you've configured the OAuth consent screen
- Add yourself as a test user if the app is in testing mode

### Error: "Invalid client"
- Verify Client ID and Client Secret in Supabase are correct
- Check that you copied them correctly from Google Cloud Console

### User not redirected after login
- Check browser console for errors
- Verify the callback route exists at `/app/auth/callback/route.js`
- Check that Site URL in Supabase matches your application URL

## Security Notes

1. **Never commit credentials** to version control
2. The Client Secret should only be in Supabase, not in your code
3. For production, use HTTPS for all URLs
4. Regularly rotate your Client Secret for security

## Production Deployment

When deploying to production:

1. Update **Authorized JavaScript origins** in Google Cloud Console
2. Update **Authorized redirect URIs** with production URL
3. Update **Site URL** in Supabase with production URL
4. Update **NEXT_PUBLIC_BASE_URL** in your `.env` file

## Current Configuration

**Supabase Project**: `https://tjuiyhzhmubkybhsogqe.supabase.co`
**Local Dev URL**: `http://localhost:3000`
**Google Redirect URI**: `https://tjuiyhzhmubkybhsogqe.supabase.co/auth/v1/callback`

## Support

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs
2. Check browser console for JavaScript errors
3. Verify all URLs match exactly (no trailing slashes)
4. Test the OAuth flow in an incognito window
