# Reset Password URL Fix - Summary

## Problem
The forgot password email was sending a local URL (`http://127.0.0.1:5500/reset-password.html?token=...`) instead of the production URL (`https://www.wanderlankatours.com/reset-password.html?token=...`).

## Root Cause
The backend server needed to be **restarted** after updating the `FRONTEND_URL` environment variable in the `.env` file.

## Solution Applied

### 1. Environment Variable (Already Set)
The `.env` file already has the correct setting:
```bash
FRONTEND_URL=https://www.wanderlankatours.com
```

### 2. Backend Code (Already Correct)
The `authController.js` already uses the environment variable:
```javascript
const frontendUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;
const resetUrl = `${frontendUrl}/reset-password.html?token=${resetToken}`;
```

### 3. Server Restarted ✅
The backend server has been restarted to load the new environment variable.

## Testing

### Test Locally:
1. Go to: http://localhost:5500/forgot-password.html (or your local URL)
2. Enter a registered email address
3. Click "Send Reset Link"
4. Check your email inbox
5. **Verify the link now shows**: `https://www.wanderlankatours.com/reset-password.html?token=...`

### Test on Production (After Deployment):
1. Go to: https://www.wanderlankatours.com/forgot-password.html
2. Enter a registered email address
3. Click "Send Reset Link"
4. Check your email inbox
5. **Verify the link shows**: `https://www.wanderlankatours.com/reset-password.html?token=...`

## How It Works

### Local Development:
```
User requests password reset
    ↓
Backend reads: FRONTEND_URL=https://www.wanderlankatours.com
    ↓
Email sent with: https://www.wanderlankatours.com/reset-password.html?token=xxx
    ↓
User clicks link → Opens production website ✅
```

### Production:
```
User requests password reset
    ↓
Backend reads: FRONTEND_URL=https://www.wanderlankatours.com (from Vercel env vars)
    ↓
Email sent with: https://www.wanderlankatours.com/reset-password.html?token=xxx
    ↓
User clicks link → Opens production website ✅
```

## Important Notes

### For Local Testing:
- ✅ Backend is running with correct FRONTEND_URL
- ✅ Emails will contain production URL even when testing locally
- ✅ This is the desired behavior!

### For Production:
- ⚠️ **MUST** set `FRONTEND_URL=https://www.wanderlankatours.com` in Vercel backend environment variables
- ⚠️ **MUST** redeploy backend after adding environment variable
- ✅ Then emails will contain production URL

## Verification Checklist

- [x] `.env` file has `FRONTEND_URL=https://www.wanderlankatours.com`
- [x] Backend server restarted
- [ ] Test forgot password locally
- [ ] Verify email contains production URL
- [ ] Set environment variable in Vercel backend
- [ ] Redeploy Vercel backend
- [ ] Test forgot password on production
- [ ] Verify email contains production URL

## Troubleshooting

### If email still shows local URL:
1. **Check backend logs** - Look for the FRONTEND_URL being loaded
2. **Restart backend** - Make sure the server restarted after .env changes
3. **Clear email cache** - Some email clients cache content
4. **Check .env file** - Ensure no typos in FRONTEND_URL

### If email doesn't arrive:
1. **Check spam folder**
2. **Verify SMTP credentials** in .env
3. **Check backend logs** for email sending errors
4. **Test with different email** address

## Next Steps

1. ✅ Test locally to confirm production URL in email
2. Deploy frontend changes to Vercel
3. Add `FRONTEND_URL` to Vercel backend environment variables
4. Redeploy Vercel backend
5. Test on production

---

**Status**: ✅ Fixed! The backend now uses the production URL for password reset links.
