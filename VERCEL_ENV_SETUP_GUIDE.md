# Vercel Backend Environment Variables Setup

## Step-by-Step Guide to Fix Production Reset Password URLs

### Problem
Reset password emails from production (www.wanderlankatours.com) contain localhost URLs instead of production URLs.

### Solution
Add environment variables to your Vercel backend deployment.

---

## Step 1: Access Vercel Dashboard

1. Go to: https://vercel.com/ceylon-buddy
2. You should see your projects:
   - `ceylon-sang-tour` (frontend)
   - `ceylon-sang-tour-backend` (backend) ← **Click this one**

---

## Step 2: Navigate to Environment Variables

1. Click on **"ceylon-sang-tour-backend"** project
2. In the top navigation, click **"Settings"**
3. In the left sidebar, click **"Environment Variables"**

---

## Step 3: Add Environment Variables

Click **"Add New"** button and add each of these variables:

### Variable 1: FRONTEND_URL (MOST IMPORTANT!)
```
Name: FRONTEND_URL
Value: https://www.wanderlankatours.com
Environments: ✅ Production ✅ Preview ✅ Development
```

### Variable 2: MONGODB_URI
```
Name: MONGODB_URI
Value: mongodb+srv://ceylon_sang:VMBj9oSPVHHHDm3j@cluster0.uaa4e5k.mongodb.net/ceylon_sang_db
Environments: ✅ Production ✅ Preview ✅ Development
```

### Variable 3: JWT_SECRET
```
Name: JWT_SECRET
Value: ceylon_sang_super_secret_jwt_key_2026_change_in_production
Environments: ✅ Production ✅ Preview ✅ Development
```

### Variable 4: JWT_EXPIRE
```
Name: JWT_EXPIRE
Value: 7d
Environments: ✅ Production ✅ Preview ✅ Development
```

### Variable 5: SMTP_HOST
```
Name: SMTP_HOST
Value: smtp.gmail.com
Environments: ✅ Production ✅ Preview ✅ Development
```

### Variable 6: SMTP_PORT
```
Name: SMTP_PORT
Value: 587
Environments: ✅ Production ✅ Preview ✅ Development
```

### Variable 7: SMTP_EMAIL
```
Name: SMTP_EMAIL
Value: tourswanderlanka@gmail.com
Environments: ✅ Production ✅ Preview ✅ Development
```

### Variable 8: SMTP_PASSWORD
```
Name: SMTP_PASSWORD
Value: ukwe zoxv swro uejn
Environments: ✅ Production ✅ Preview ✅ Development
```

### Variable 9: FROM_EMAIL
```
Name: FROM_EMAIL
Value: tourswanderlanka@gmail.com
Environments: ✅ Production ✅ Preview ✅ Development
```

### Variable 10: FROM_NAME
```
Name: FROM_NAME
Value: Wander Lanka Tours
Environments: ✅ Production ✅ Preview ✅ Development
```

### Variable 11: NODE_ENV
```
Name: NODE_ENV
Value: production
Environments: ✅ Production only
```

---

## Step 4: Save All Variables

After adding each variable, click **"Save"** or **"Add"**.

---

## Step 5: Redeploy Backend

**CRITICAL:** Environment variables only take effect after redeployment!

1. Go to **"Deployments"** tab (top navigation)
2. Find the latest deployment (top of the list)
3. Click the **⋯** (three dots) button on the right
4. Click **"Redeploy"**
5. In the popup, click **"Redeploy"** again to confirm
6. Wait 1-2 minutes for deployment to complete

---

## Step 6: Verify Deployment

1. Wait for the deployment status to show **"Ready"** (green checkmark)
2. Click on the deployment to view details
3. Check the **"Build Logs"** to ensure no errors

---

## Step 7: Test Forgot Password

1. Go to: https://www.wanderlankatours.com/forgot-password.html
2. Enter a registered email address
3. Click **"Send Reset Link"**
4. Check your email inbox
5. **Verify the reset link now shows:**
   ```
   https://www.wanderlankatours.com/reset-password.html?token=...
   ```
   ✅ NOT `http://127.0.0.1:5500/...`

---

## Troubleshooting

### If variables don't appear to work:

1. **Check you redeployed** - Variables only work after redeployment
2. **Check spelling** - Variable names are case-sensitive
3. **Check environments** - Make sure "Production" is selected
4. **Clear browser cache** - Hard refresh (Ctrl+Shift+R)
5. **Check deployment logs** - Look for errors in build/runtime logs

### If email still shows localhost URL:

1. Go back to Environment Variables
2. Verify `FRONTEND_URL` is exactly: `https://www.wanderlankatours.com`
3. No trailing slash!
4. Redeploy again
5. Wait 2 minutes
6. Test again

### If email doesn't arrive:

1. Check spam folder
2. Verify SMTP variables are correct
3. Check Vercel function logs for errors:
   - Deployments → Click deployment → Functions tab
   - Look for `/api/auth/forgotpassword` errors

---

## Quick Checklist

Before testing, verify:

- [ ] All 11 environment variables added
- [ ] `FRONTEND_URL` is `https://www.wanderlankatours.com` (no trailing slash)
- [ ] All variables have "Production" environment selected
- [ ] Backend has been redeployed
- [ ] Deployment shows "Ready" status
- [ ] Waited at least 1-2 minutes after redeployment

---

## Expected Result

### Before Fix:
```
Email reset link: http://127.0.0.1:5500/reset-password.html?token=xxx
❌ Cannot access from production
```

### After Fix:
```
Email reset link: https://www.wanderlankatours.com/reset-password.html?token=xxx
✅ Works perfectly!
```

---

## Important Notes

1. **FRONTEND_URL is the most critical variable** - This fixes the reset password URL issue
2. **Always redeploy after adding variables** - They don't take effect until redeployment
3. **Test thoroughly** - Send a test email after deployment
4. **Keep SMTP credentials secure** - Never commit them to Git

---

## Next Steps After Setup

1. ✅ Add all environment variables to Vercel
2. ✅ Redeploy backend
3. ✅ Test forgot password on production
4. ✅ Verify email contains production URL
5. ✅ Test password reset flow end-to-end
6. ✅ Deploy frontend changes (already done)

---

## Support

If you encounter issues:
- Check Vercel documentation: https://vercel.com/docs/concepts/projects/environment-variables
- View function logs in Vercel dashboard
- Check backend server logs for errors

---

**Status**: Ready to configure! Follow the steps above to fix the production reset password URLs. 🚀
