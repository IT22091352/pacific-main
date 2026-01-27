# Testing Guide - Ceylon Sang Authentication System

## 🧪 Quick Test Steps

### Step 1: Setup MongoDB Atlas

1. Go to https://mongodb.com/cloud/atlas
2. Create free account and cluster
3. Get connection string
4. Update `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/ceylon-sang
   ```

### Step 2: Start Backend Server

```bash
cd backend
npm run dev
```

Expected output:
```
Server running in development mode on port 5000
MongoDB Connected: cluster0-xxxxx.mongodb.net
```

### Step 3: Test Backend API

**Test 1: Check server is running**
```bash
curl http://localhost:5000
```

**Test 2: Register a new user**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"test123456\"}"
```

Expected: JWT token and user data returned

**Test 3: Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"test123456\"}"
```

Expected: JWT token and user data returned

### Step 4: Test Frontend

1. Open `index.html` in browser (use Live Server)
2. Click "Login" button in navigation
3. Click "Sign up here" link
4. Fill signup form:
   - Name: John Doe
   - Email: john@example.com
   - Password: password123
   - Confirm Password: password123
5. Click "Create Account"
6. Check:
   - ✅ Success message appears
   - ✅ Navigation shows "Welcome, John Doe" and "Logout" button
   - ✅ Modal closes automatically
7. Refresh page
8. Check:
   - ✅ User stays logged in
   - ✅ Navigation still shows user name
9. Click "Logout"
10. Check:
    - ✅ Navigation shows "Login" button again
    - ✅ Success message appears

### Step 5: Test Login

1. Click "Login" button
2. Enter credentials:
   - Email: john@example.com
   - Password: password123
3. Click "Login"
4. Check:
   - ✅ Success message appears
   - ✅ User is logged in
   - ✅ Navigation updated

## ✅ Success Criteria

- [ ] Backend server starts without errors
- [ ] MongoDB connection successful
- [ ] User registration works
- [ ] User login works
- [ ] JWT token stored in localStorage
- [ ] Login modal opens and closes
- [ ] Signup modal opens and closes
- [ ] Navigation updates after login
- [ ] User stays logged in after page refresh
- [ ] Logout works correctly
- [ ] Error messages display for invalid inputs

## 🐛 Common Issues

### Backend won't start
- Check MongoDB URI in `.env`
- Run `npm install` in backend folder
- Check port 5000 is not in use

### CORS error
- Ensure `FRONTEND_URL` in `.env` matches your frontend URL
- Default: `http://127.0.0.1:5500`

### Login/Signup not working
- Check backend is running
- Check browser console for errors
- Verify API_URL in `js/auth.js` is correct

## 📊 Check MongoDB

1. Go to MongoDB Atlas dashboard
2. Click "Browse Collections"
3. Find `ceylon-sang` database
4. Check `users` collection
5. Verify:
   - User documents exist
   - Passwords are hashed (not plain text)
   - Email addresses are correct

## 🎉 Next Steps

Once testing is complete:
1. ✅ Phase 1: User Authentication - COMPLETE
2. ⏳ Phase 2: Review Management System
3. ⏳ Phase 3: Gallery with Cloudinary
4. ⏳ Phase 4: Contact Form Backend
5. ⏳ Phase 5: Production Deployment
