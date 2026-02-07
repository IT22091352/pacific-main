# Production Email Issue - Troubleshooting Guide

## Problem

The forgot password email is **NOT working on production** (www.wanderlankatours.com) but works on localhost.

## Root Cause

Your production website (www.wanderlankatours.com) is trying to send API requests to a backend that is either:
1. **Not deployed** to production
2. **Not configured correctly** in production
3. **Missing environment variables** in the production environment

## Current Setup

### Local Development ✅
- Frontend: http://localhost:5500 or http://127.0.0.1:5500
- Backend: http://localhost:5000
- Status: **WORKING** (backend is running locally)

### Production ❌
- Frontend: https://www.wanderlankatours.com
- Backend: **NEEDS TO BE DEPLOYED**
- Status: **NOT WORKING** (no backend deployed)

## Solution Steps

### Step 1: Deploy Backend to Vercel

You need to deploy your backend to Vercel or another hosting service.

#### Option A: Deploy Backend to Vercel (Recommended)

1. **Create a separate Vercel project for the backend**:
   ```bash
   cd backend
   vercel
   ```

2. **Set environment variables in Vercel**:
   - Go to Vercel Dashboard → Your Backend Project → Settings → Environment Variables
   - Add ALL variables from your `.env` file:
     - `MONGODB_URI`
     - `JWT_SECRET`
     - `JWT_EXPIRE`
     - `FRONTEND_URL=https://www.wanderlankatours.com`
     - `SMTP_HOST`
     - `SMTP_PORT`
     - `SMTP_EMAIL`
     - `SMTP_PASSWORD`
     - `FROM_EMAIL`
     - `FROM_NAME`

3. **Update frontend to use production API**:
   The `auth.js` file already has the logic to use `/api` for production.

#### Option B: Deploy Backend to Render/Railway/Heroku

If you prefer another service:

1. Create account on Render.com (free tier available)
2. Create new Web Service
3. Connect your GitHub repository
4. Set build command: `cd backend && npm install`
5. Set start command: `cd backend && npm start`
6. Add all environment variables
7. Deploy

### Step 2: Update Frontend API Configuration

If your backend is deployed to a different domain (e.g., `api.wanderlankatours.com`), update `js/auth.js`:

```javascript
const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000/api'
    : 'https://your-backend-url.vercel.app/api'; // Update this
```

### Step 3: Verify Environment Variables in Production

**CRITICAL**: Make sure these environment variables are set in your production backend:

```bash
FRONTEND_URL=https://www.wanderlankatours.com
SMTP_EMAIL=tourswanderlanka@gmail.com
SMTP_PASSWORD=ukwe zoxv swro uejn
FROM_EMAIL=tourswanderlanka@gmail.com
FROM_NAME=Wander Lanka Tours
```

### Step 4: Test the Deployment

1. Go to https://www.wanderlankatours.com/forgot-password.html
2. Enter a registered email
3. Click "Send Reset Link"
4. Check the email inbox
5. Verify the reset link contains `https://www.wanderlankatours.com`

## Quick Fix for Testing

If you want to test the production URL **right now** without deploying:

### Option 1: Use ngrok (Temporary)

1. Install ngrok: https://ngrok.com/download
2. Run your local backend: `npm run dev`
3. In another terminal: `ngrok http 5000`
4. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
5. Update `js/auth.js` temporarily:
   ```javascript
   const API_URL = 'https://abc123.ngrok.io/api';
   ```
6. Test on production

**Note**: This is temporary and only for testing!

### Option 2: Update CORS on Local Backend

If your production frontend is trying to connect to localhost:

1. Update `backend/server.js` CORS configuration:
   ```javascript
   app.use(cors({
       origin: ['http://localhost:5500', 'https://www.wanderlankatours.com'],
       credentials: true
   }));
   ```

2. Keep your local backend running
3. Test on production

**Note**: This won't work if your production site is on a different server!

## Recommended Production Architecture

```
┌─────────────────────────────────────────────────────────┐
│           Production Setup (Recommended)                 │
└─────────────────────────────────────────────────────────┘

Frontend (Vercel/Netlify):
  https://www.wanderlankatours.com
         │
         │ API Calls
         ▼
Backend (Vercel/Render/Railway):
  https://api.wanderlankatours.com
  or
  https://wanderlanka-backend.vercel.app
         │
         │ Sends Email
         ▼
SMTP Server (Gmail):
  tourswanderlanka@gmail.com
```

## Environment Variables Checklist

### Production Backend Environment Variables:

- [ ] `PORT=5000`
- [ ] `NODE_ENV=production`
- [ ] `MONGODB_URI=mongodb+srv://...`
- [ ] `JWT_SECRET=...`
- [ ] `JWT_EXPIRE=7d`
- [ ] `FRONTEND_URL=https://www.wanderlankatours.com`
- [ ] `SMTP_HOST=smtp.gmail.com`
- [ ] `SMTP_PORT=587`
- [ ] `SMTP_EMAIL=tourswanderlanka@gmail.com`
- [ ] `SMTP_PASSWORD=ukwe zoxv swro uejn`
- [ ] `FROM_EMAIL=tourswanderlanka@gmail.com`
- [ ] `FROM_NAME=Wander Lanka Tours`

## Common Issues and Solutions

### Issue 1: "Network Error" on Production
**Cause**: Backend not deployed or wrong API URL  
**Solution**: Deploy backend and verify API_URL in auth.js

### Issue 2: "CORS Error"
**Cause**: Backend not allowing requests from production domain  
**Solution**: Update CORS configuration in backend

### Issue 3: "Email could not be sent"
**Cause**: Missing SMTP credentials in production  
**Solution**: Add all SMTP environment variables to production

### Issue 4: Email sent but wrong URL
**Cause**: FRONTEND_URL not set correctly  
**Solution**: Set `FRONTEND_URL=https://www.wanderlankatours.com` in production

## Next Steps

1. **Deploy your backend** to Vercel, Render, or another service
2. **Set all environment variables** in the hosting platform
3. **Update frontend API URL** if needed
4. **Test the forgot password flow** on production
5. **Monitor logs** for any errors

## Testing Checklist

After deployment, test these scenarios:

- [ ] Forgot password on production sends email
- [ ] Email contains production URL (www.wanderlankatours.com)
- [ ] Reset link works and opens production site
- [ ] Password can be reset successfully
- [ ] Login works after password reset

## Support

If you need help deploying:
1. Check Vercel documentation: https://vercel.com/docs
2. Check Render documentation: https://render.com/docs
3. Or use ngrok for temporary testing

---

**Remember**: The local backend (localhost:5000) cannot be accessed by the production website (www.wanderlankatours.com). You MUST deploy the backend to a public URL for production to work!
