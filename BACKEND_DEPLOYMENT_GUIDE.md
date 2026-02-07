# Backend Deployment Guide - Vercel

## Quick Deployment Steps

### 1. Install Vercel CLI (if not already installed)

```bash
npm install -g vercel
```

### 2. Deploy Backend to Vercel

```bash
cd backend
vercel
```

Follow the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No
- **Project name?** → `wanderlanka-backend` (or your choice)
- **Directory?** → `./` (current directory)
- **Override settings?** → No

### 3. Set Environment Variables in Vercel

After deployment, you need to add environment variables:

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Click on your backend project (`wanderlanka-backend`)
3. Go to **Settings** → **Environment Variables**
4. Add each variable:

```
MONGODB_URI = mongodb+srv://ceylon_sang:VMBj9oSPVHHHDm3j@cluster0.uaa4e5k.mongodb.net/ceylon_sang_db
JWT_SECRET = ceylon_sang_super_secret_jwt_key_2026_change_in_production
JWT_EXPIRE = 7d
FRONTEND_URL = https://www.wanderlankatours.com
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_EMAIL = tourswanderlanka@gmail.com
SMTP_PASSWORD = ukwe zoxv swro uejn
FROM_EMAIL = tourswanderlanka@gmail.com
FROM_NAME = Wander Lanka Tours
NODE_ENV = production
```

5. Click **Save** for each variable
6. **Redeploy** the project to apply changes

#### Option B: Via CLI

```bash
vercel env add MONGODB_URI
# Paste the value when prompted
# Select "Production" environment

vercel env add JWT_SECRET
# Paste the value when prompted

# Repeat for all variables...
```

### 4. Get Your Backend URL

After deployment, Vercel will give you a URL like:
```
https://wanderlanka-backend.vercel.app
```

Or you can find it in the Vercel dashboard.

### 5. Update Frontend API Configuration

Update `js/auth.js` to use your deployed backend:

```javascript
const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000/api'
    : 'https://wanderlanka-backend.vercel.app/api'; // Your Vercel backend URL
```

### 6. Deploy Frontend Changes

```bash
# In the root directory (not backend)
vercel --prod
```

### 7. Test on Production

1. Go to https://www.wanderlankatours.com/forgot-password.html
2. Enter your email
3. Click "Send Reset Link"
4. Check your email inbox
5. Verify the reset link contains `https://www.wanderlankatours.com`

## Alternative: Deploy Backend to Render.com (Free Tier)

If you prefer Render (easier for Node.js backends):

### 1. Create Render Account

Go to https://render.com and sign up

### 2. Create New Web Service

1. Click **New** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `wanderlanka-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

### 3. Add Environment Variables

In the Render dashboard, add all environment variables:

```
MONGODB_URI = mongodb+srv://ceylon_sang:VMBj9oSPVHHHDm3j@cluster0.uaa4e5k.mongodb.net/ceylon_sang_db
JWT_SECRET = ceylon_sang_super_secret_jwt_key_2026_change_in_production
JWT_EXPIRE = 7d
FRONTEND_URL = https://www.wanderlankatours.com
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_EMAIL = tourswanderlanka@gmail.com
SMTP_PASSWORD = ukwe zoxv swro uejn
FROM_EMAIL = tourswanderlanka@gmail.com
FROM_NAME = Wander Lanka Tours
NODE_ENV = production
```

### 4. Deploy

Click **Create Web Service** and wait for deployment.

Your backend will be available at:
```
https://wanderlanka-backend.onrender.com
```

### 5. Update Frontend

Update `js/auth.js`:

```javascript
const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000/api'
    : 'https://wanderlanka-backend.onrender.com/api';
```

## Troubleshooting

### Issue: "Cannot find module"
**Solution**: Make sure `package.json` is in the backend directory

### Issue: "Environment variables not working"
**Solution**: 
1. Check they're added in the hosting dashboard
2. Redeploy after adding variables
3. Check for typos in variable names

### Issue: "CORS error"
**Solution**: Update `backend/server.js`:

```javascript
const cors = require('cors');

app.use(cors({
    origin: [
        'http://localhost:5500',
        'http://127.0.0.1:5500',
        'https://www.wanderlankatours.com'
    ],
    credentials: true
}));
```

### Issue: "MongoDB connection failed"
**Solution**: 
1. Check MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
2. Verify MONGODB_URI is correct in environment variables

## Verification Checklist

After deployment, verify:

- [ ] Backend URL is accessible (visit it in browser)
- [ ] All environment variables are set
- [ ] Frontend API_URL points to deployed backend
- [ ] CORS allows requests from production domain
- [ ] MongoDB connection works
- [ ] Forgot password sends email
- [ ] Email contains production URL
- [ ] Reset link works

## Cost

### Vercel
- **Free tier**: Suitable for small projects
- **Limitations**: 100GB bandwidth, serverless functions

### Render
- **Free tier**: 750 hours/month (enough for one service)
- **Limitations**: Spins down after inactivity (cold starts)

## Recommended Setup

For production, I recommend:

1. **Backend**: Render.com (free, always-on option available)
2. **Frontend**: Vercel (already deployed)
3. **Database**: MongoDB Atlas (free tier)

This gives you a fully functional production setup at no cost!

## Next Steps

1. Choose your hosting platform (Vercel or Render)
2. Deploy the backend
3. Set all environment variables
4. Update frontend API URL
5. Test forgot password on production
6. Monitor for any errors

Good luck with your deployment! 🚀
