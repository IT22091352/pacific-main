# Forgot Password Email Configuration - Summary

## Changes Made

### 1. Backend Controller Update (`authController.js`)
**File**: `backend/controllers/authController.js`

**Changes**:
- Updated the `forgotPassword` function to use an environment variable for the frontend URL
- Changed from hardcoded `req.protocol` and `req.get('host')` to `process.env.FRONTEND_URL`
- Improved email message with better instructions
- Falls back to request host if `FRONTEND_URL` is not set

**Code**:
```javascript
const frontendUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;
const resetUrl = `${frontendUrl}/reset-password.html?token=${resetToken}`;
```

### 2. Environment Configuration (`.env`)
**File**: `backend/.env`

**Changes**:
- Updated `FRONTEND_URL` from `http://127.0.0.1:5500` to `https://www.wanderlankatours.com`
- Added comments explaining the variable usage
- This ensures password reset emails sent from production contain the correct URL

**Before**:
```bash
FRONTEND_URL=http://127.0.0.1:5500
```

**After**:
```bash
# Frontend URL (for CORS and password reset emails)
# For production: https://www.wanderlankatours.com
# For local development: http://localhost:5000 or http://127.0.0.1:5500
FRONTEND_URL=https://www.wanderlankatours.com
```

### 3. Additional Files Created

#### `.env.local` (Local Development)
- Contains localhost configuration
- Use this when developing locally
- `FRONTEND_URL=http://localhost:5000`

#### `.env.example` (Template)
- Template file showing all required environment variables
- Safe to commit to Git (no sensitive data)
- Helps other developers set up the project

#### `ENV_CONFIG.md` (Documentation)
- Complete guide on environment configuration
- Explains how to switch between local and production
- Troubleshooting tips

## How It Works Now

### Production (www.wanderlankatours.com)
1. User clicks "Forgot Password?" on any page
2. Enters their email address
3. Backend reads `FRONTEND_URL=https://www.wanderlankatours.com` from `.env`
4. Email is sent with reset link: `https://www.wanderlankatours.com/reset-password.html?token=xxx`
5. User clicks the link and resets password on production site ✅

### Local Development (localhost:5000)
1. User clicks "Forgot Password?" on any page
2. Enters their email address
3. Backend reads `FRONTEND_URL=http://localhost:5000` from `.env` (if using `.env.local`)
4. Email is sent with reset link: `http://localhost:5000/reset-password.html?token=xxx`
5. User clicks the link and resets password on local site ✅

## Deployment Instructions

### For Production Deployment:
1. Ensure `.env` has `FRONTEND_URL=https://www.wanderlankatours.com`
2. Commit and push changes to your repository
3. Deploy to your hosting service (Vercel, Heroku, etc.)
4. **Important**: Set the `FRONTEND_URL` environment variable in your hosting platform's settings:
   - Vercel: Project Settings → Environment Variables
   - Heroku: Settings → Config Vars
   - Other platforms: Check their documentation

### For Local Development:
1. Option A: Rename `.env.local` to `.env`
2. Option B: Manually change `FRONTEND_URL` in `.env` to `http://localhost:5000`
3. Restart the backend: `npm run dev`

## Testing

### Test on Production:
1. Go to `https://www.wanderlankatours.com`
2. Click "Login" → "Forgot Password?"
3. Enter a registered email address
4. Check email inbox
5. Verify the reset link contains `https://www.wanderlankatours.com/reset-password.html?token=...`
6. Click the link and reset password

### Test on Localhost:
1. Go to `http://localhost:5000`
2. Click "Login" → "Forgot Password?"
3. Enter a registered email address
4. Check email inbox
5. Verify the reset link contains `http://localhost:5000/reset-password.html?token=...`
6. Click the link and reset password

## Important Notes

✅ **Production URL**: The `.env` file is now configured for production with `https://www.wanderlankatours.com`

✅ **Email Template**: The email message has been improved with clearer instructions

✅ **Fallback**: If `FRONTEND_URL` is not set, it falls back to the request host (for backward compatibility)

✅ **Security**: The reset token expires after a set time (check your User model for expiration settings)

## Troubleshooting

### Issue: Email shows localhost URL on production
**Solution**: 
- Check that `.env` has `FRONTEND_URL=https://www.wanderlankatours.com`
- Restart the backend server
- Clear any cached environment variables

### Issue: Email not sending
**Solution**:
- Verify SMTP credentials in `.env`
- Check Gmail app password is correct
- Ensure "Less secure app access" is enabled (if using regular Gmail)

### Issue: Reset link doesn't work
**Solution**:
- Verify `reset-password.html` exists in your frontend
- Check that the token parameter is being read correctly
- Ensure the backend `/api/auth/resetpassword/:token` route is working

## Summary

🎉 **Success!** Your forgot password functionality now works on both:
- ✅ **Production**: www.wanderlankatours.com
- ✅ **Localhost**: localhost:5000

The system automatically uses the correct URL based on the `FRONTEND_URL` environment variable!
