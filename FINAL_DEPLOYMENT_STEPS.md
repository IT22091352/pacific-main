# Final Deployment Steps

Since you have already pushed your code to GitHub, follow these exact steps to make your site live at `wanderlankatours.com`:

## 1. Deploy on Vercel (The Hosting)

1.  Log in to [Vercel.com](https://vercel.com).
2.  Click **"Add New..."** button -> Select **"Project"**.
3.  You should see your `wander-lanka-tours` repository from GitHub. Click **"Import"**.
4.  **Configure Project:**
    *   **Framework Preset:** Leave as "Other".
    *   **Root Directory:** `pacific-main` (or `./` if your package.json is in the root). *Important: Check where your `package.json` is. If it's inside `pacific-main`, select that folder.*
    *   **Build Command:** `npm install && cd backend && npm install` (Vercel mostly detects this, but since we have a backend folder, ensuring dependencies are installed is key). *Actually, with `vercel.json`, standard settings often work. Try default first.*
5.  **Environment Variables (Crucial):**
    Click the "Environment Variables" dropdown. Copy-paste these from your `backend/.env` file:
    *   `MONGODB_URI`
    *   `JWT_SECRET`
    *   `EMAILJS_SERVICE_ID`
    *   `EMAILJS_TEMPLATE_ID`
    *   `EMAILJS_AUTO_REPLY_TEMPLATE_ID`
    *   `EMAILJS_PUBLIC_KEY`
    *   `SMTP_HOST`, `SMTP_PORT`, `SMTP_EMAIL`, `SMTP_PASSWORD`
    *   `FROM_EMAIL`, `FROM_NAME`
6.  Click **"Deploy"**.

## 2. Connect Your Domain (wanderlankatours.com)

1.  Once deployed, go to the project dashboard on Vercel.
2.  Click **Settings** -> **Domains**.
3.  Type `wanderlankatours.com` and click **Add**.
4.  Vercel will show an "Invalid Configuration" error because you haven't bought/configured it yet. It will give you two **Nameservers** (e.g., `ns1.vercel-dns.com`, `ns2.vercel-dns.com`). **Copy these.**

## 3. Configure Namecheap

1.  Log in to [Namecheap](https://www.namecheap.com).
2.  Go to **Domain List** -> Click **Manage** next to `wanderlankatours.com`.
3.  Find the **Nameservers** section.
4.  Select **Custom DNS** from the dropdown.
5.  Paste the two nameservers you copied from Vercel.
6.  Click the **green checkmark** to save.

## 4. Verification

*   Go back to Vercel. It might take a few minutes to a few hours for the "Invalid Configuration" error to turn into a valid checkmark.
*   Once it turns green, Vercel automatically issues an SSL certificate. Your site is now fast, secure, and live!
