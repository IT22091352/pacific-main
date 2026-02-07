# Environment Configuration Guide

## Overview
This project uses environment variables to configure different settings for local development and production deployment.

## Environment Files

### `.env` (Production)
This is the main environment file used for **production deployment** (www.wanderlankatours.com).
- `FRONTEND_URL=https://www.wanderlankatours.com`

### `.env.local` (Local Development)
This file is for **local development** on your computer.
- `FRONTEND_URL=http://localhost:5000`

### `.env.example`
Template file showing all required environment variables.

## How to Use

### For Local Development:
1. Rename `.env.local` to `.env` when working locally
2. Or manually change `FRONTEND_URL` in `.env` to `http://localhost:5000`
3. Restart the backend server: `npm run dev`

### For Production Deployment:
1. Ensure `.env` has `FRONTEND_URL=https://www.wanderlankatours.com`
2. Deploy to your hosting service (Vercel, Heroku, etc.)
3. Make sure to set environment variables in your hosting platform

## Important Notes

### Forgot Password Emails
The `FRONTEND_URL` variable is used to generate the password reset link in emails:
- **Local**: Reset link will be `http://localhost:5000/reset-password.html?token=...`
- **Production**: Reset link will be `https://www.wanderlankatours.com/reset-password.html?token=...`

### Switching Environments
When you switch from local to production (or vice versa):
1. Update the `FRONTEND_URL` in `.env`
2. Restart the backend server
3. Test the forgot password functionality to ensure emails contain the correct URL

## Quick Commands

```bash
# Local Development
cd backend
npm run dev

# Production Build
npm start
```

## Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT tokens | `your_secret_key` |
| `JWT_EXPIRE` | JWT token expiration | `7d` |
| `FRONTEND_URL` | Frontend URL for emails | `https://www.wanderlankatours.com` |
| `SMTP_EMAIL` | Email address for sending | `yourmail@gmail.com` |
| `SMTP_PASSWORD` | App password for Gmail | `xxxx xxxx xxxx xxxx` |

## Troubleshooting

### Forgot Password Email Shows Wrong URL
- Check `FRONTEND_URL` in `.env`
- Restart the backend server after changing `.env`
- Clear browser cache and test again

### Email Not Sending
- Verify `SMTP_EMAIL` and `SMTP_PASSWORD` are correct
- Ensure Gmail "App Password" is used (not regular password)
- Check Gmail "Less secure app access" settings
