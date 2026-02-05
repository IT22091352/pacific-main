# Forgot Password Implementation Plan

## Overview
This plan outlines the steps to add a "Forgot Password" feature to the Ceylon Sang application. This includes backend updates to handle token generation and emailing, and frontend changes to allow users to request resets and enter new passwords.

## 1. Backend Dependencies
- **Action**: Install `nodemailer` for sending emails.
- **Command**: `npm install nodemailer` (in `backend/` directory).

## 2. Backend - Database Schema (`models/User.js`)
- **Update**: Add fields to store the reset token and expiration time.
- **New Fields**:
  - `resetPasswordToken`: String
  - `resetPasswordExpire`: Date
- **New Method**: `getResetPasswordToken()`
  - Generates a crypto-based random token.
  - Hashes the token and stores it in `resetPasswordToken`.
  - Sets `resetPasswordExpire` to 10 minutes from now.
  - Returns the unhashed token.

## 3. Backend - Email Utility (`utils/sendEmail.js`)
- **New File**: Create `backend/utils/sendEmail.js`.
- **Functionality**:
  - Configures a Nodemailer transporter using SMTP settings (Host, Port, User, Pass) from `.env`.
  - Exports a `sendEmail` function to send mails.

## 4. Backend - Auth Controller (`controllers/authController.js`)
- **New Method**: `forgotPassword`
  - Receives `email`.
  - Finds user; returns error if not found.
  - Generates reset token.
  - Saves user (bypassing validation for other fields if necessary).
  - Sends email with reset URL: `http://<frontend-url>/reset-password.html?token=<token>`.
- **New Method**: `resetPassword`
  - Receives `token` (via URL param) and `password` (body).
  - Hashes the received token and searches for a user with matching `resetPasswordToken` and valid `resetPasswordExpire`.
  - If found: updates password, clears reset fields, saves user.
  - Returns success token (logs user in immediately) or success message.

## 5. Backend - Routes (`routes/auth.js`)
- **Update**: Add new routes.
  - `POST /forgotpassword` -> `authController.forgotPassword`
  - `PUT /resetpassword/:resettoken` -> `authController.resetPassword`

## 6. Frontend - Login & Request Reset (`index.html`)
- **Update**:
  - Add a "Forgot Password?" link to the existing Login Modal.
  - Add a **Forgot Password Modal** containing:
    - Email Input
    - "Send Reset Link" Button
    - Back to Login link.

## 7. Frontend - Reset Page (`reset-password.html`)
- **New File**: Create `reset-password.html` (or separate standalone page).
- **Content**:
  - Form with "New Password" and "Confirm Password".
- **Logic**:
  - On load, parse `token` from URL query parameters.
  - On submit, send PUT request to `/api/auth/resetpassword/<token>`.
  - On success, redirect to `index.html` and open Login Modal or auto-login.

## 8. Frontend - Logic (`js/auth.js`)
- **Update**:
  - Add event listener for "Forgot Password" form submission.
  - Add logic to handle the API call and show success/error messages.

## 9. Environment Variables (`.env`)
- **Update**: Add SMTP configuration.
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_EMAIL`, `SMTP_PASSWORD`, `FROM_EMAIL`, `FROM_NAME`.
