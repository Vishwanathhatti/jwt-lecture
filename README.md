# JWT Authentication API 🔐

A simple backend built with **Node.js**, **Express** and **MongoDB** to understand how JWT authentication works. This project is made for learning purpose so each file is well commented and easy to follow.

We cover two main concepts here — **Access Tokens** (short lived session tokens) and **Refresh Tokens** (long lived tokens stored in database). By the end of this you will have a clear idea of how modern authentication systems actually works.

---

## What is JWT?

JWT stands for **JSON Web Token**. It's basically a secure way to send information between two parties (like your frontend and backend) in form of a JSON object. The token itself has three parts:

```
HEADER.PAYLOAD.SIGNATURE
```

- **Header** — tells which algorithm was used to sign the token
- **Payload** — the actual data (like userId, email). Note: this is just base64 encoded, NOT encrypted — so don't put sensitive stuff here!
- **Signature** — created using a secret key, this is what makes the token trustworthy

---

## Access Token vs Refresh Token

This is the most important concept in this project.

| | Access Token | Refresh Token |
|---|---|---|
| Lifetime | 15 minutes | 7 days |
| Stored in | Client memory | HTTP-only Cookie + MongoDB |
| Purpose | Authenticate every request | Get a new access token |
| Can be revoked? | ❌ No (stateless) | ✅ Yes (delete from DB) |

**Why two tokens?**

If we make the access token live for a long time, its a security risk — if someone steals it, they have access for a long time. So we keep it short (15 min). But we don't want users to login every 15 minutes either, thats annoying. So we use the refresh token to silently get a new access token in the background.

---

## Prerequisites

Make sure you have these installed before starting:

- [Node.js](https://nodejs.org/) (v18 or above)
- [MongoDB](https://www.mongodb.com/) running locally on port `27017`
- [Postman](https://www.postman.com/) or Thunder Client (VS Code extension) for testing

---

## Getting Started

### 1. Clone or download the project

```bash
git clone <your-repo-url>
cd jwt-lecture
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup your environment file

Create a `.env` file in the root folder (or update the existing one):

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/jwt-lecture
ACCESS_TOKEN_SECRET=access_super_secret_key_change_in_production
REFRESH_TOKEN_SECRET=refresh_super_secret_key_change_in_production
```

> ⚠️ **Important:** Never commit your `.env` file to GitHub. It contains secret keys!

### 4. Run the server

```bash
npm run dev
```

You should see something like this in the terminal:

```
✅ MongoDB Connected: localhost
─────────────────────────────────────────
🚀 Server running at: http://localhost:5000
```

---

## API Endpoints

### Auth Routes (no token required)

#### Register a new user
```http
POST /auth/register
Content-Type: application/json

{
  "name": "Alice",
  "email": "alice@test.com",
  "password": "123456"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "alice@test.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOi...",
  "expiresIn": "15 minutes",
  "user": { "id": "...", "name": "Alice", "email": "alice@test.com" }
}
```
> The `refreshToken` is automatically set as a **HTTP-only cookie**. You won't see it in the response body.

#### Refresh your access token
```http
POST /auth/refresh
```
> No body needed — the refresh token cookie is sent automatically by the browser.

#### Logout
```http
POST /auth/logout
```

---

### Protected Routes (access token required)

Add this header to all protected requests:
```
Authorization: Bearer <your_access_token>
```

#### Get current user
```http
GET /auth/me
Authorization: Bearer <accessToken>
```

#### Dashboard
```http
GET /api/dashboard
Authorization: Bearer <accessToken>
```

#### Posts
```http
GET /api/posts
Authorization: Bearer <accessToken>
```

---

## How The Full Auth Flow Works

```
1. User registers          → POST /auth/register
2. User logs in            → POST /auth/login
                             ← gets accessToken (body) + refreshToken (cookie)
3. User calls API          → GET /api/dashboard
                             (sends: Authorization: Bearer <accessToken>)
                             ← server verifies token → returns data
4. Access token expires    → 401 Unauthorized
5. Client refreshes        → POST /auth/refresh (cookie sent automatically)
                             ← gets new accessToken
6. User logs out           → POST /auth/logout
                             ← refreshToken deleted from DB + cookie cleared
```

---

## Project Structure

```
jwt-lecture/
├── .env                         # Environment variables (dont commit!)
├── .gitignore
├── package.json
└── src/
    ├── server.js                # Starts the server
    ├── app.js                   # Express app setup
    ├── config/
    │   └── db.js                # MongoDB connection
    ├── models/
    │   ├── User.js              # User schema (password is hashed with bcrypt)
    │   └── RefreshToken.js      # Stores refresh tokens in DB
    ├── utils/
    │   └── jwt.js               # Helper functions for generating & verifying JWTs
    ├── middleware/
    │   └── auth.js              # Protects routes by checking access token
    ├── controllers/
    │   └── authController.js    # Main auth logic
    └── routes/
        ├── authRoutes.js        # /auth/* endpoints
        └── protectedRoutes.js   # /api/* endpoints
```

---

## Tech Stack

- **Node.js** — JavaScript runtime
- **Express.js** — Web framework
- **MongoDB** — NoSQL database
- **Mongoose** — MongoDB object modeling
- **jsonwebtoken** — For signing and verifying JWTs
- **bcryptjs** — For hashing passwords (never store plain text!)
- **cookie-parser** — To read cookies from requests
- **morgan** — HTTP request logger (great for debugging)
- **dotenv** — Loads `.env` variables into `process.env`

---

## Key Security Notes

1. **Passwords are never stored as plain text** — bcrypt hashes them before saving
2. **Refresh token is in a HTTP-only cookie** — JavaScript can't read it, protecting against XSS attacks
3. **Two different secrets** — Access and refresh tokens use separate secret keys
4. **Refresh tokens are stored in DB** — So they can be revoked on logout
5. **Access tokens are stateless** — Even after logout, the access token is technically valid until it expires (this is a known JWT trade-off)

---

## License

ISC — Free to use for learning and teaching.
