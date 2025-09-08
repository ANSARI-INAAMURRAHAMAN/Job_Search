# Google OAuth Setup Instructions

## Current Error: `redirect_uri_mismatch`

### Problem:
The Google OAuth app is not configured with the correct redirect URI for production.

### Solution:

#### 1. Google Cloud Console Configuration
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**  
3. Find your OAuth 2.0 client (check your .env file for the client ID)
4. Edit the client
5. In **Authorized redirect URIs**, add:
   ```
   https://job-search-ypji.onrender.com/api/v1/auth/google/callback
   ```
6. Save the configuration

#### 2. Current Environment Variables (Already Correct):
```env
GOOGLE_CLIENT_ID=your_google_client_id_from_env_file
GOOGLE_CLIENT_SECRET=your_google_client_secret_from_env_file
GOOGLE_CALLBACK_URL=https://job-search-ypji.onrender.com/api/v1/auth/google/callback
FRONTEND_URL=https://job-search-2-qkat.onrender.com
```

#### 3. URLs That Need to be Authorized in Google Cloud Console:
- **Production Callback:** `https://job-search-ypji.onrender.com/api/v1/auth/google/callback`
- **Local Development:** `http://localhost:4000/api/v1/auth/google/callback` (for testing)

#### 4. Test the OAuth Flow After Configuration:
1. Go to: https://job-search-2-qkat.onrender.com/login
2. Select role (Job Seeker/Employer)  
3. Click "Continue with Google"
4. Should work without redirect_uri_mismatch error

#### 5. Debug Information:
- Auth Status: https://job-search-ypji.onrender.com/api/v1/auth/status
- Backend Logs: Check Render dashboard for detailed OAuth flow logs

## Important Notes:
- The redirect URI in Google Cloud Console must EXACTLY match what your app uses
- No trailing slashes, exact protocol (https), exact domain
- Changes in Google Cloud Console can take a few minutes to propagate
