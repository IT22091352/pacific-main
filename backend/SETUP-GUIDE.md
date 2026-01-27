# Ceylon Sang Backend - Setup Guide

## 🚀 Quick Start

### Step 1: MongoDB Atlas Setup

1. **Create MongoDB Atlas Account:**
   - Go to https://www.mongodb.com/cloud/atlas
   - Click "Try Free" and create an account
   - Create a new cluster (free tier M0)

2. **Get Connection String:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://username:password@cluster.mongodb.net/`

3. **Create Database User:**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Create username and password
   - Give "Read and write to any database" permission

4. **Whitelist IP Address:**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Or add your specific IP

### Step 2: Configure Backend

1. **Update `.env` file:**
   ```env
   MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/ceylon-sang?retryWrites=true&w=majority
   ```
   
   Replace:
   - `YOUR_USERNAME` with your MongoDB username
   - `YOUR_PASSWORD` with your MongoDB password
   - `YOUR_CLUSTER` with your cluster name

2. **Generate JWT Secret:**
   ```bash
   # In Node.js console or online
   require('crypto').randomBytes(64).toString('hex')
   ```
   
   Update in `.env`:
   ```env
   JWT_SECRET=your_generated_secret_here
   ```

### Step 3: Install Dependencies

```bash
cd backend
npm install
```

### Step 4: Start Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will start on: `http://localhost:5000`

---

## 📡 API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65abc123...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65abc123...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2026-01-27T...",
    "updatedAt": "2026-01-27T..."
  }
}
```

---

## 🧪 Testing with cURL

### Register a new user:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"test123456\"}"
```

### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"test123456\"}"
```

### Get current user (replace TOKEN):
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔒 Security Features

✅ **Password Hashing** - Bcrypt with salt rounds  
✅ **JWT Authentication** - Secure token-based auth  
✅ **Rate Limiting** - 100 requests per 10 minutes  
✅ **CORS Protection** - Only frontend domain allowed  
✅ **Helmet Security Headers** - XSS, clickjacking protection  
✅ **Input Validation** - Email format, password length  
✅ **Error Handling** - No sensitive data in errors  

---

## 📁 Project Structure

```
backend/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   └── authController.js     # Auth logic
├── middleware/
│   ├── auth.js               # JWT verification
│   └── errorHandler.js       # Error handling
├── models/
│   └── User.js               # User schema
├── routes/
│   └── auth.js               # Auth routes
├── .env                      # Environment variables
├── .env.example              # Example env file
├── .gitignore                # Git ignore
├── package.json              # Dependencies
└── server.js                 # Main server
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: MongooseServerSelectionError
```
**Solution:**
- Check MongoDB URI in `.env`
- Verify username/password are correct
- Check IP whitelist in MongoDB Atlas
- Ensure network allows MongoDB port (27017)

### JWT Error
```
Error: jwt malformed
```
**Solution:**
- Check JWT_SECRET is set in `.env`
- Verify token format: `Bearer <token>`
- Token may have expired (7 days default)

### CORS Error
```
Access to fetch blocked by CORS policy
```
**Solution:**
- Update `FRONTEND_URL` in `.env`
- Ensure frontend is running on correct port
- Check browser console for exact origin

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change PORT in .env
PORT=5001
```

---

## 🔄 Next Steps

1. ✅ User authentication system complete
2. ⏳ Review management system (Phase 2)
3. ⏳ Gallery management with Cloudinary (Phase 3)
4. ⏳ Contact form backend (Phase 4)
5. ⏳ Production deployment (Phase 5)

---

## 📝 Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ceylon-sang

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d

# Frontend
FRONTEND_URL=http://127.0.0.1:5500
```

---

## 🚀 Ready to Test!

1. Start backend: `npm run dev`
2. Server running on: http://localhost:5000
3. Test API: http://localhost:5000/
4. Use Postman or cURL to test endpoints
5. Check MongoDB Atlas for created users

**Backend is ready for frontend integration!** 🎉
