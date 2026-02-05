# How to Host Wander Lanka Tours

This guide will walk you through hosting your website on **Vercel** (for the best speed and security) and connecting your **Namecheap** domain.

## Prerequisites

1.  **GitHub Account:** You need to put your code on GitHub.
2.  **Vercel Account:** Sign up at [vercel.com](https://vercel.com) (free).
3.  **Namecheap Account:** To buy your domain.

---

## Step 1: Push Code to GitHub

1.  Go to [GitHub.com](https://github.com) and create a new repository named `wander-lanka-tours`.
2.  Open your project folder in your terminal and run these commands:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/wander-lanka-tours.git
    git push -u origin main
    ```
    *(Replace `YOUR_USERNAME` with your actual GitHub username)*

---

## Step 2: Deploy to Vercel

1.  Log in to your **Vercel Dashboard**.
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your `wander-lanka-tours` repository from GitHub.
4.  **Configure Project:**
    *   **Framework Preset:** Select "Other" (or leave as default).
    *   **Root Directory:** Leave as `./`.
    *   **Environment Variables:** This is CRITICAL for security. You must add all the keys from your `backend/.env` file here. Click the "Environment Variables" section and add them one by one:
        *   `MONGODB_URI`: (Your specific MongoDB connection string)
        *   `JWT_SECRET`: (Your secret key)
        *   `EMAILJS_SERVICE_ID`: `service_wqsxhgt`
        *   `EMAILJS_TEMPLATE_ID`: `template_w6ai859`
        *   `EMAILJS_PUBLIC_KEY`: `h7w-Q5zjUS-UTyves`
        *   `EMAILJS_AUTO_REPLY_TEMPLATE_ID`: `template_omemxha`
        *   `SMTP_HOST`: `smtp.gmail.com`
        *   `SMTP_PORT`: `587`
        *   `SMTP_EMAIL`: `tourswanderlanka@gmail.com`
        *   `SMTP_PASSWORD`: (Your 16-character Gmail App Password)
        *   `FROM_EMAIL`: `tourswanderlanka@gmail.com`
        *   `FROM_NAME`: `Wander Lanka Tours`
5.  Click **"Deploy"**.

Vercel will now build your site. Since we configured `vercel.json`, it will serve your HTML files via their fast CDN and your API via serverless functions.

---

## Step 3: Buy Domain on Namecheap

1.  Go to [Namecheap.com](https://www.namecheap.com).
2.  Search for `wanderlankatours.com`.
3.  Add to cart and complete the purchase.

---

## Step 4: Connect Domain to Vercel

1.  Go back to your **Vercel Project Dashboard**.
2.  Click on **Settings** -> **Domains**.
3.  Enter `wanderlankatours.com` in the box and click **Add**.
4.  Vercel will give you two options. The recommended one is **Nameservers**.
    *   Vercel will show you two nameservers (e.g., `ns1.vercel-dns.com` and `ns2.vercel-dns.com`).
5.  Go to your **Namecheap Dashboard**.
6.  Find your domain and click **Manage**.
7.  Look for the **Nameservers** section.
8.  Change it from "Namecheap BasicDNS" to **"Custom DNS"**.
9.  Enter the nameservers Vercel gave you (e.g., `ns1.vercel-dns.com` separate line `ns2.vercel-dns.com`).
10. Click the **green checkmark** to save.

---

## Step 5: Wait & verify

DNS changes can take up to 24-48 hours, but usually happen within minutes.
*   Vercel will automatically generate an **SSL Certificate** for you (HTTPS), making your site "Privacy Safe" and secure.
*   Once the green checkmarks appear in Vercel, your site is live at `https://wanderlankatours.com`!

## Performance Note
Vercel automatically optimizes your static assets (HTML, CSS, Images) and serves them from servers closest to your users, ensuring the "speedy load" you requested.
