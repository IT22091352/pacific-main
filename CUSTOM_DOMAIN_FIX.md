# Custom Domain (www.wanderlankatours.com) Reset Password Fix

## Problem
- ✅ `ceylon-sang-tour.vercel.app/forgot-password.html` → Works correctly
- ❌ `www.wanderlankatours.com/forgot-password.html` → Still shows localhost URL

## Root Cause
The custom domain (www.wanderlankatours.com) is serving **cached/old files** while the Vercel domain has the updated code.

---

## Solution 1: Clear Vercel Cache (Recommended)

### Step 1: Redeploy Frontend with Cache Purge

1. Go to: https://vercel.com/ceylon-buddy/ceylon-sang-tour
2. Click **Deployments** tab
3. Click the **⋯** (three dots) on the latest deployment
4. Click **"Redeploy"**
5. ✅ Check **"Use existing Build Cache"** → **UNCHECK THIS** (force fresh build)
6. Click **"Redeploy"**
7. Wait for deployment to complete

### Step 2: Purge CDN Cache

After redeployment:
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. ✅ Check **"Disable cache"**
4. Visit: https://www.wanderlankatours.com/forgot-password.html
5. Hard refresh: **Ctrl + Shift + R** (Windows) or **Cmd + Shift + R** (Mac)

---

## Solution 2: Verify Domain Configuration

### Check if both domains point to the same deployment:

1. Go to Vercel Dashboard → **ceylon-sang-tour** project
2. Click **Settings** → **Domains**
3. Verify both domains are listed:
   - `ceylon-sang-tour.vercel.app` (Vercel domain)
   - `www.wanderlankatours.com` (Custom domain)
4. Both should show **"Valid Configuration"** status

If `www.wanderlankatours.com` is not listed or shows errors:
- Click **"Add Domain"**
- Enter: `www.wanderlankatours.com`
- Follow Vercel's DNS configuration instructions

---

## Solution 3: Force Browser Cache Clear

### For Users:

**Chrome/Edge:**
1. Press **Ctrl + Shift + Delete**
2. Select **"Cached images and files"**
3. Time range: **"All time"**
4. Click **"Clear data"**
5. Visit site again

**Firefox:**
1. Press **Ctrl + Shift + Delete**
2. Select **"Cache"**
3. Click **"Clear Now"**
4. Visit site again

**Or use Incognito/Private mode:**
- Chrome: **Ctrl + Shift + N**
- Firefox: **Ctrl + Shift + P**
- Test in incognito window

---

## Solution 4: Add Cache Control Headers

Update `vercel.json` to prevent caching of JavaScript files:

```json
{
    "version": 2,
    "rewrites": [
        {
            "source": "/api/(.*)",
            "destination": "/api/index.js"
        }
    ],
    "headers": [
        {
            "source": "/js/(.*)",
            "headers": [
                {
                    "key": "Cache-Control",
                    "value": "public, max-age=0, must-revalidate"
                }
            ]
        },
        {
            "source": "/(.*).html",
            "headers": [
                {
                    "key": "Cache-Control",
                    "value": "public, max-age=0, must-revalidate"
                }
            ]
        }
    ]
}
```

Then redeploy.

---

## Solution 5: Check API URL in Deployed Files

### Verify the deployed code has the correct API URL:

1. Visit: https://www.wanderlankatours.com/js/auth.js
2. Press **Ctrl + F** and search for: `API_URL`
3. Verify it shows:
   ```javascript
   const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
       ? 'http://localhost:5000/api'
       : 'https://ceylon-sang-tour-backend.vercel.app/api';
   ```

If it still shows `: '/api'`, then the deployment didn't include your latest changes.

**Fix:**
```bash
# In your project directory
git add .
git commit -m "Update API URL for production"
git push origin main
```

Vercel will auto-deploy from Git.

---

## Quick Diagnostic Test

### Test 1: Check Network Request

1. Open: https://www.wanderlankatours.com/forgot-password.html
2. Open DevTools (F12) → **Network** tab
3. Enter email and click "Send Reset Link"
4. Look for the API request
5. Check the **Request URL**:
   - ✅ Should be: `https://ceylon-sang-tour-backend.vercel.app/api/auth/forgotpassword`
   - ❌ If it's: `http://localhost:5000/api/auth/forgotpassword` → Old cached code

### Test 2: Check Console

1. Open: https://www.wanderlankatours.com/forgot-password.html
2. Open DevTools (F12) → **Console** tab
3. Type: `API_URL`
4. Press Enter
5. Check the output:
   - ✅ Should be: `https://ceylon-sang-tour-backend.vercel.app/api`
   - ❌ If it's: `/api` or `http://localhost:5000/api` → Old code

---

## Most Likely Solution

Based on your symptoms, the issue is **cached JavaScript files**. Here's what to do:

### Quick Fix (Do this now):

1. **Hard refresh the page:**
   - Windows: **Ctrl + Shift + R**
   - Mac: **Cmd + Shift + R**

2. **Or use Incognito mode:**
   - Open incognito window
   - Visit: https://www.wanderlankatours.com/forgot-password.html
   - Test forgot password

3. **If still not working, redeploy:**
   ```bash
   # In project directory
   git add .
   git commit -m "Force redeploy" --allow-empty
   git push
   ```

---

## Verification Steps

After applying the fix:

1. [ ] Clear browser cache
2. [ ] Hard refresh (Ctrl + Shift + R)
3. [ ] Open DevTools → Network tab
4. [ ] Visit www.wanderlankatours.com/forgot-password.html
5. [ ] Check API request goes to Vercel backend
6. [ ] Send test email
7. [ ] Verify reset link is: `https://www.wanderlankatours.com/reset-password.html?token=...`

---

## Expected Behavior

Both domains should work identically:

✅ `ceylon-sang-tour.vercel.app` → Production URL in email  
✅ `www.wanderlankatours.com` → Production URL in email  

Both should call: `https://ceylon-sang-tour-backend.vercel.app/api`

---

**Try the hard refresh first (Ctrl + Shift + R) - this solves 90% of caching issues!** 🚀
