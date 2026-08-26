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

---

## Project Structure

```
SUGUNA/
├── server/                     # Backend (Express API)
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/            # Route logic (auth, product, category, subCategory, cart, order)
│   ├── middleware/             # auth, error, validation
│   ├── models/                 # Mongoose schemas (User, Category, SubCategory, Product, Cart, Order)
│   ├── routes/                 # Express routers
│   ├── utils/                  # generateToken, asyncHandler, seed, test_endpoints
│   ├── .env                    # Environment variables (not committed)
│   ├── .env.example
│   └── server.js               # App entry point
│
└── client/                     # Frontend (React + Vite)
    ├── src/
    │   ├── components/          # Reusable UI (Navbar, Footer, ProductCard, ...)
    │   ├── context/            # AuthContext, CartContext
    │   ├── layouts/            # MainLayout, AdminLayout
    │   ├── pages/              # Public/user pages + pages/admin/*
    │   ├── routes/             # ProtectedRoute
    │   ├── services/          # axios instance + API endpoints
    │   ├── App.jsx            # Route definitions
    │   └── main.jsx
    ├── .env
    └── vite.config.js
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- A MongoDB Atlas connection string

### 1. Backend

```bash
cd server
npm install
```

Create a `.env` file (copy from `.env.example`):

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.yc282.mongodb.net/suguna?appName=Cluster0
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Seed the database with categories, subcategories, **30 products**, and demo accounts:

```bash
npm run seed
```

Start the API:

```bash
npm run dev
```

API runs at **http://localhost:5000**.

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

App runs at **http://localhost:5173**.

---

## Demo Accounts (after seeding)

| Role  | Email                   | Password      |
| ----- | ----------------------- | ------------- |
| Admin | aswinadmin@suguna.com   | aswinadmin123 |
| User  | aswinuser@suguna.com    | aswinuser123  |

- Admin portal: **http://localhost:5173/admin/login**
- Store: **http://localhost:5173/**

---

## API Endpoints

### Auth — `/api/auth`
| Method | Endpoint      | Access  | Description             |
| ------ | ------------- | ------- | ----------------------- |
| POST   | `/register`   | Public  | Register a new user     |
| POST   | `/login`      | Public  | Login, returns JWT      |
| GET    | `/profile`    | Private | Get current user        |

### Categories — `/api/categories`
| Method | Endpoint | Access | Description       |
| ------ | -------- | ------ | ----------------- |
| GET    | `/`      | Public | List categories   |
| POST   | `/`      | Admin  | Create category   |
| PUT    | `/:id`   | Admin  | Update category   |
| DELETE | `/:id`   | Admin  | Delete category   |

### SubCategories — `/api/subcategories`
| Method | Endpoint | Access | Description                          |
| ------ | -------- | ------ | ------------------------------------ |
| GET    | `/`      | Public | List subcategories (`?categoryId=`)  |
| POST   | `/`      | Admin  | Create subcategory                   |
| PUT    | `/:id`   | Admin  | Update subcategory                   |
| DELETE | `/:id`   | Admin  | Delete subcategory                   |

### Products — `/api/products`
| Method | Endpoint | Access | Description                                      |
| ------ | -------- | ------ | ------------------------------------------------ |
| GET    | `/`      | Public | List products (`?category=&subCategory=&search=`) |
| GET    | `/:id`   | Public | Product details                                  |
| POST   | `/`      | Admin  | Create product                                   |
| PUT    | `/:id`   | Admin  | Update product                                   |
| DELETE | `/:id`   | Admin  | Delete product                                   |

### Cart — `/api/cart` (all Private)
| Method | Endpoint       | Description         |
| ------ | -------------- | ------------------- |
| GET    | `/`            | Get cart            |
| POST   | `/`            | Add to cart         |
| PUT    | `/:productId`  | Update quantity     |
| DELETE | `/:productId`  | Remove item         |
| DELETE | `/`            | Clear cart          |

### Orders — `/api/orders`
| Method | Endpoint       | Access  | Description             |
| ------ | -------------- | ------- | ----------------------- |
| POST   | `/`            | Private | Place order from cart   |
| GET    | `/my`          | Private | Current user's orders   |
| GET    | `/`            | Admin   | All orders              |
| PUT    | `/:id/status`  | Admin   | Update order status     |

---

## Security Features

- Passwords hashed with **bcrypt** (pre-save hook, `select: false`)
- **JWT** authentication with Bearer tokens
- **Protected routes** on both API and client
- **Role-based authorization** middleware (`adminOnly`)
- **Input validation** via express-validator
- Centralized **error-handling middleware**
- Foreign key integrity rules preventing orphan child records
- Secrets kept in **environment variables**

---

## Features

**User:** register, login/logout, browse products by category & subcategory, search, product details, cart (add / update / remove / total), place order, view my orders with status.

**Admin:** dashboard, category CRUD, subcategory CRUD, product CRUD with dynamic subcategory selection, view all orders, update order status (Pending -> Processing -> Shipped -> Delivered).

---

## Notes

- The provided `.env` contains a shared demo MongoDB URI. For production, rotate the credentials and the `JWT_SECRET`, and never commit `.env`.
- The Vite dev server proxies `/api` to `http://localhost:5000`, so the frontend works even if `VITE_API_URL` is unset.
