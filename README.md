# 🚗 DriveX Backend

Node.js/Express backend for the DriveX Car Dealership Management System.

## Features
- JWT authentication with role-based access (Admin & Customer)
- Car inventory CRUD (admin)
- Image upload (Multer)
- Request management (test drives, bookings)
- Admin approval workflow
- Real-time status tracking
- MongoDB with Mongoose ODM

## Tech Stack
- Node.js, Express.js
- MongoDB, Mongoose
- JWT, bcryptjs, Multer, CORS

## Setup
1. Navigate to backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   ```
4. (Optional) Seed the database:
   ```bash
   npm run seed
   ```
5. Start the server:
   ```bash
   npm run dev
   ```
   Runs at http://localhost:5000

## API Endpoints
- **Auth:**
  - POST /api/auth/register — Register
  - POST /api/auth/login — Login
  - GET /api/auth/me — Current user
- **Cars:**
  - GET /api/cars — List cars
  - GET /api/cars/:id — Car details
  - POST /api/cars — Create (admin)
  - PUT /api/cars/:id — Update (admin)
  - DELETE /api/cars/:id — Delete (admin)
  - GET /api/cars/admin/all — All cars (admin)
- **Requests:**
  - POST /api/requests — Create request
  - GET /api/requests/my-requests — My requests
  - GET /api/requests/admin/all — All requests (admin)
  - PUT /api/requests/:id/status — Update status (admin)
  - DELETE /api/requests/:id — Delete request
  - GET /api/requests/admin/stats — Request stats (admin)

## Environment Variables (.env)
```
MONGODB_URI=mongodb://localhost:27017/drivex
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
PORT=5000
NODE_ENV=development
```

## Testing
- Run tests: `npm test`

## License
MIT License. See root LICENSE file.

## Support
Email: support@drivex.com