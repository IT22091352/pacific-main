# Deploying Ceylon Sang to Vercel

This guide explains how to deploy both the Frontend and Backend of Ceylon Sang to Vercel.

## 1. Prerequisites

*   A [GitHub](https://github.com/) account.
*   A [Vercel](https://vercel.com/) account (sign up with GitHub).
*   Your project code pushed to a GitHub repository.

## 2. Configuration Changes (Already Done for You)

I have already made the necessary code changes for Vercel compatibility:
1.  **Shared URL**: Updated frontend code (`js/auth.js`, `js/reviews.js`) to use relative `/api` paths.
2.  **Serverless Ready**: Updated `backend/server.js` to export the app for Vercel.
3.  **Vercel Config**: Created `vercel.json` to route `/api` requests to the backend.

## 3. Deployment Steps

### Step A: Push to GitHub
1.  Open your terminal/command prompt.
2.  Commit all changes:
    ```bash
    git add .
    git commit -m "Prepare for Vercel deployment"
    git push origin main
    ```

### Step B: Import to Vercel
1.  Log in to your **Vercel Dashboard**.
2.  Click **"Add New..."** -> **"Project"**.
3.  Import the **`pacific-main`** (or whatever you named it) repository from Git.

### Step C: Configure Project
1.  **Framework Preset**: Select **"Other"** (since we have a custom setup).
2.  **Root Directory**: Leave it as `./` (default).
3.  **Environment Variables**:
    *   Expand the **"Environment Variables"** section.
    *   Add the following variables (copy values from your `backend/.env` file):
        *   `MONGODB_URI`: `mongodb+srv://ceylon_sang:VMBj9oSPVHHHDm3j@cluster0.uaa4e5k.mongodb.net/ceylon_sang_db`
        *   `JWT_SECRET`: `ceylon_sang_super_secret_jwt_key_2026_change_in_production`
        *   `NODE_ENV`: `production`

### Step D: Deploy
1.  Click **"Deploy"**.
2.  Vercel will build your project. Wait for the success screen! 🚀

## 4. Verification

Once deployed, click the **Domain** link provided by Vercel.
1.  **Frontend**: The website should load perfectly.
2.  **Backend**: Go to `https://your-project.vercel.app/api/auth` (should show 404 or auth error, expected).
3.  **Test**: Try creating an account or logging in.

## Troubleshooting

*   **Database Error**: If login fails, check your `MONGODB_URI` in Vercel settings under **Settings > Environment Variables**.
*   **404 on API**: Double-check `vercel.json` exists in the root of your repo.
