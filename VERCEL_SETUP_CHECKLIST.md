# Vercel Backend Configuration Checklist

## ✅ What We Just Did

Updated all frontend files to use your Vercel backend:
- ✅ `js/auth.js` → Points to `https://ceylon-sang-tour-backend.vercel.app/api`
- ✅ `login.html` → Points to `https://ceylon-sang-tour-backend.vercel.app/api`
- ✅ `signup.html` → Points to `https://ceylon-sang-tour-backend.vercel.app/api`
- ✅ `forgot-password.html` → Points to `https://ceylon-sang-tour-backend.vercel.app/api`

## 🔧 What You Need to Do Now

### Step 1: Configure Backend Environment Variables

1. Go to Vercel Dashboard: https://vercel.com/ceylon-buddy
2. Click on **"ceylon-sang-tour-backend"** project
3. Go to **Settings** → **Environment Variables**
4. Add/verify these variables:

```
Variable Name          | Value
--------------------- | --------------------------------------------------------
FRONTEND_URL          | https://www.wanderlankatours.com
MONGODB_URI           | mongodb+srv://ceylon_sang:VMBj9oSPVHHHDm3j@cluster0.uaa4e5k.mongodb.net/ceylon_sang_db
JWT_SECRET            | ceylon_sang_super_secret_jwt_key_2026_change_in_production
JWT_EXPIRE            | 7d
SMTP_HOST             | smtp.gmail.com
SMTP_PORT             | 587
SMTP_EMAIL            | tourswanderlanka@gmail.com
SMTP_PASSWORD         | ukwe zoxv swro uejn
FROM_EMAIL            | tourswanderlanka@gmail.com
FROM_NAME             | Wander Lanka Tours
NODE_ENV              | production
```

5. **IMPORTANT**: After adding/updating variables, click **"Redeploy"** in the Deployments tab

### Step 2: Deploy Frontend Changes

Now deploy the updated frontend to Vercel:

```bash
# In your project root directory
git add .
git commit -m "Update API URL to use Vercel backend"
git push
```

Or if using Vercel CLI:
```bash
vercel --prod
```

### Step 3: Test on Production

1. Go to: https://www.wanderlankatours.com/forgot-password.html
2. Enter your email address
3. Click "Send Reset Link"
4. Check your email inbox
5. Verify the reset link contains `https://www.wanderlankatours.com`

## 🔍 Troubleshooting

### If you get CORS errors:

Update `backend/server.js` to allow requests from your domain:

```javascript
const cors = require('cors');

app.use(cors({
    origin: [
        'http://localhost:5500',
        'http://127.0.0.1:5500',
        'https://www.wanderlankatours.com',
        'https://ceylon-sang-tour.vercel.app'
    ],
    credentials: true
}));
```

Then redeploy the backend.

### If emails still don't send:

1. Check Vercel backend logs:
   - Go to backend project → Deployments → Click latest deployment → View Function Logs
2. Look for errors related to SMTP or email sending
3. Verify SMTP_PASSWORD is correct (it's a Gmail App Password, not your regular password)

### If you get "Network Error":

1. Open browser DevTools (F12)
2. Go to Network tab
3. Try forgot password again
4. Check if the request goes to `https://ceylon-sang-tour-backend.vercel.app/api/auth/forgotpassword`
5. Check the response for error details

## 📊 Verification Checklist

After deployment, verify:

- [ ] Backend environment variables are set in Vercel
- [ ] Backend has been redeployed after adding variables
- [ ] Frontend changes are deployed
- [ ] Forgot password page loads without errors
- [ ] Email is sent successfully
- [ ] Email contains production URL (www.wanderlankatours.com)
- [ ] Reset link works and opens production site
- [ ] Password can be reset successfully

## 🎯 Expected Flow

```
User visits: www.wanderlankatours.com/forgot-password.html
    ↓
Enters email and clicks "Send Reset Link"
    ↓
Frontend calls: https://ceylon-sang-tour-backend.vercel.app/api/auth/forgotpassword
    ↓
Backend generates reset token
    ↓
Backend creates reset URL: https://www.wanderlankatours.com/reset-password.html?token=xxx
    ↓
Backend sends email via Gmail SMTP
    ↓
User receives email with reset link
    ↓
User clicks link → Opens production website
    ↓
User resets password ✅
```

## 🚀 Next Steps

1. **Configure backend environment variables** (most important!)
2. **Redeploy backend** after adding variables
3. **Deploy frontend** changes (git push or vercel --prod)
4. **Test** forgot password on production
5. **Monitor** Vercel logs for any errors

Good luck! 🎉
