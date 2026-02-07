# Forgot Password Email Flow

## Current Configuration

```
┌─────────────────────────────────────────────────────────────┐
│                     PRODUCTION SETUP                         │
│                 (www.wanderlankatours.com)                   │
└─────────────────────────────────────────────────────────────┘

1. User visits: https://www.wanderlankatours.com/about.html
2. Clicks "Login" → "Forgot Password?"
3. Enters email: user@example.com
4. Frontend sends request to: /api/auth/forgotpassword
                              │
                              ▼
5. Backend reads .env:  FRONTEND_URL=https://www.wanderlankatours.com
                              │
                              ▼
6. Backend generates reset link:
   https://www.wanderlankatours.com/reset-password.html?token=abc123
                              │
                              ▼
7. Email sent to: user@example.com
   ┌────────────────────────────────────────────────┐
   │ Subject: Password Reset Token                  │
   │                                                 │
   │ You are receiving this email because you       │
   │ requested a password reset.                    │
   │                                                 │
   │ Click here to reset:                           │
   │ https://www.wanderlankatours.com/reset-...     │
   │                                                 │
   │ If you didn't request this, ignore this email. │
   └────────────────────────────────────────────────┘
                              │
                              ▼
8. User clicks link → Opens production website
9. User enters new password
10. Password updated ✅


┌─────────────────────────────────────────────────────────────┐
│                   LOCAL DEVELOPMENT SETUP                    │
│                     (localhost:5000)                         │
└─────────────────────────────────────────────────────────────┘

1. User visits: http://localhost:5000/about.html
2. Clicks "Login" → "Forgot Password?"
3. Enters email: user@example.com
4. Frontend sends request to: /api/auth/forgotpassword
                              │
                              ▼
5. Backend reads .env:  FRONTEND_URL=http://localhost:5000
                              │
                              ▼
6. Backend generates reset link:
   http://localhost:5000/reset-password.html?token=abc123
                              │
                              ▼
7. Email sent to: user@example.com
   ┌────────────────────────────────────────────────┐
   │ Subject: Password Reset Token                  │
   │                                                 │
   │ You are receiving this email because you       │
   │ requested a password reset.                    │
   │                                                 │
   │ Click here to reset:                           │
   │ http://localhost:5000/reset-...                │
   │                                                 │
   │ If you didn't request this, ignore this email. │
   └────────────────────────────────────────────────┘
                              │
                              ▼
8. User clicks link → Opens localhost
9. User enters new password
10. Password updated ✅


┌─────────────────────────────────────────────────────────────┐
│                    ENVIRONMENT VARIABLES                     │
└─────────────────────────────────────────────────────────────┘

Production (.env):
  FRONTEND_URL=https://www.wanderlankatours.com

Local Development (.env.local):
  FRONTEND_URL=http://localhost:5000

The backend automatically uses the correct URL based on the 
environment variable, ensuring emails always contain the right 
reset link for the current environment!
