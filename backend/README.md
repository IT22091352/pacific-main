# Ceylon Sang Backend API

Backend server for Ceylon Sang Tour Guide website with Node.js, Express, MongoDB, and JWT authentication.

## Features

- ✅ User registration and login
- ✅ JWT authentication
- ✅ Password hashing with bcrypt
- ✅ MongoDB database
- ✅ CORS enabled
- ✅ Rate limiting
- ✅ Security headers
- ✅ Error handling

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Configure `.env` file with your MongoDB URI

3. Start server:
```bash
npm run dev
```

Server runs on http://localhost:5000

## API Documentation

See [SETUP-GUIDE.md](./SETUP-GUIDE.md) for complete documentation.

### Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `GET /api/auth/logout` - Logout user (protected)

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Helmet for security
- CORS for cross-origin requests
- Express Rate Limit

## License

ISC
