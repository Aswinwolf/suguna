# Suguna Home Appliances — MERN E-Commerce Platform

A production-grade **MERN stack** e-commerce application for home appliances, featuring JWT authentication, role-based authorization (user / admin), product, category & subcategory management, a shopping cart, and order management.

---

## Tech Stack

| Layer      | Technology                                             |
| ---------- | ------------------------------------------------------ |
| Frontend   | React (Vite), React Router DOM, Axios, Tailwind CSS, Context API |
| Backend    | Node.js, Express.js (MVC)                              |
| Database   | MongoDB Atlas + Mongoose                               |
| Auth       | JWT, bcryptjs, role-based middleware                   |
| Deployment | Backend: Render | Frontend: Vercel                     |

---

## Deployment Configuration

### 1. Backend (Render)
- **Environment Variables**:
  - `PORT`: `5000`
  - `NODE_ENV`: `production`
  - `MONGODB_URI`: `<your-mongodb-atlas-connection-string>`
  - `JWT_SECRET`: `<your-secure-jwt-secret>`
  - `JWT_EXPIRES_IN`: `7d`
  - `CLIENT_URL`: `https://client-alpha-livid-25.vercel.app` *(or comma-separated URLs)*

### 2. Frontend (Vercel)
- **Environment Variables**:
  - `VITE_API_URL`: `https://suguna-1.onrender.com/api`
- **Build Settings**:
  - Framework Preset: `Vite`
  - Root Directory: `client`
  - Build Command: `npm run build`
  - Output Directory: `dist`

---

## Demo Accounts (after seeding)

| Role  | Email                   | Password      |
| ----- | ----------------------- | ------------- |
| Admin | aswinadmin@suguna.com   | aswinadmin123 |
| User  | aswinuser@suguna.com    | aswinuser123  |

---

## Local Development Setup

### 1. Backend
```bash
cd server
npm install
npm run seed   # Seeds categories, subcategories, products, and demo accounts
npm run dev    # Runs at http://localhost:5000
```

### 2. Frontend
```bash
cd client
npm install
npm run dev    # Runs at http://localhost:5173
```
