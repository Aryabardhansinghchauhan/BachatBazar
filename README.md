# Bachat Bazar 🛒
**Smart Product Price Comparison & Tracking Platform for Indian Shoppers**

> *"Bachat Bazar" = "Savings Market" in Hindi. The mission is to save users time and money by finding the true cheapest deal across Flipkart, Amazon India, and other retailers, backed by 6-month historical price graphs and real-time drop alerts.*

---

## 🌟 Key Features

- **Side-by-Side Live Comparison:** Compare real-time prices, MRP, discounts, ratings, and delivery times for the same product on Flipkart & Amazon.
- **"Cheapest Right Now" Badge:** Automatically calculates and highlights the store with the lowest price.
- **6-Month Price History Graphs:** Interactive timeline powered by Recharts with 1M, 3M, 6M, and All filters to expose fake discounts vs true all-time lows.
- **Target Price Drop Email Alerts:** Set custom target prices (e.g. 10% below current price). Nodemailer background cron notifies you automatically via email when price drops.
- **User Wishlist / Product Tracker:** Bookmark and monitor price shifts across your personal gadget watchlist.
- **FastAPI Scraping & Normalization Microservice:** Python service with Flipkart Affiliate API + resilient Amazon/Flipkart scraping fallbacks.
- **Clean Mobile-First UI:** Responsive Tailwind CSS design customized for Indian shoppers with Indian Rupee (₹) formatting.

---

## 🛠️ Architecture & Tech Stack

```
                               ┌────────────────────────┐
                               │     React Frontend     │
                               │  (Vite + Tailwind CSS) │
                               └───────────┬────────────┘
                                           │ (HTTP / JWT)
                                           ▼
                               ┌────────────────────────┐
                               │   Node.js / Express    │
                               │      (Main API)        │
                               └──────┬──────────┬──────┘
                                      │          │
                     ┌────────────────┘          └────────────────┐
                     ▼                                            ▼
        ┌─────────────────────────┐                  ┌─────────────────────────┐
        │     MongoDB Database    │                  │  Python FastAPI Service │
        │ (Catalog & PriceHistory)│                  │ (Flipkart/Amazon Scrape)│
        └─────────────────────────┘                  └─────────────────────────┘
```

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, Recharts, React Router DOM, Axios.
- **Backend (Main API):** Node.js, Express.js, Mongoose, JWT, bcryptjs, Nodemailer, node-cron.
- **Data & Scraping Service:** Python 3.11, FastAPI, BeautifulSoup4, Requests, Pydantic, APScheduler.
- **Database:** MongoDB (Catalog, PriceHistory, Users, Wishlists, Alerts).

---

## 📁 Project Structure

```
bachat-bazar/
├── client/                     # React frontend (Vite + Tailwind)
│   ├── src/
│   │   ├── api/                # API client with JWT interceptor
│   │   ├── components/         # Navbar, ProductCard, PriceChart, PriceAlertModal, etc.
│   │   ├── context/            # AuthContext, WishlistContext
│   │   ├── pages/              # Home, Search, ProductDetail, Wishlist, Alerts, Auth
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── server/                     # Node.js Express API
│   ├── config/                 # DB connection
│   ├── controllers/            # auth, product, wishlist, alert controllers
│   ├── models/                 # Product, PriceHistory, User, Alert schemas
│   ├── routes/                 # Express API routes
│   ├── utils/                  # seedData.js, emailService.js, priceTrackerCron.js
│   ├── server.js
│   └── package.json
├── data-service/               # Python FastAPI scraping service
│   ├── scrapers/               # Flipkart (Affiliate API + HTML) & Amazon scrapers
│   ├── schemas/                # Pydantic data schemas
│   ├── jobs/                   # Scheduled price refresh & seeder
│   ├── main.py
│   └── requirements.txt
├── docker-compose.yml          # Optional container runner
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- MongoDB (Running locally or MongoDB Atlas connection URI)

---

### 2. Setting Up the Server (Node.js API)

```bash
cd server
npm install

# Seed the database with popular products & 6-month historical price data
npm run seed

# Start server (runs on http://localhost:5000)
npm start
```

Default demo account seeded:
- **Email:** `shopper@bachatbazar.in`
- **Password:** `password123`

---

### 3. Setting Up the Data Service (Python FastAPI)

```bash
cd data-service
pip install -r requirements.txt

# Run the FastAPI scraper service (runs on http://localhost:8000)
python main.py
```

API docs will be available at `http://localhost:8000/docs`.

---

### 4. Setting Up the Client (React Frontend)

```bash
cd client
npm install

# Start Vite dev server (runs on http://localhost:5173)
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🔑 Environment Variables

### `server/.env`
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/bachat_bazar
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5173
DATA_SERVICE_URL=http://localhost:8000

# Optional SMTP Settings (falls back to console email logger if not set)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
```

### `data-service/.env`
```env
PORT=8000
MONGODB_URI=mongodb://127.0.0.1:27017/bachat_bazar
FLIPKART_AFFILIATE_ID=your_id_here
FLIPKART_AFFILIATE_TOKEN=your_token_here
```

### `client/.env`
```env
VITE_API_BASE_URL=http://localhost:5000
```

---

## 📡 Key API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new shopper account | No |
| `POST` | `/api/auth/login` | Login and receive JWT token | No |
| `GET` | `/api/products` | Get products with filter/sort | No |
| `GET` | `/api/products/search?q=...` | Search catalog by title & specs | No |
| `GET` | `/api/products/:id` | Get single product & multi-store prices | No |
| `GET` | `/api/products/:id/history` | Get 6-month historical price chart points | No |
| `GET` | `/api/wishlist` | Get user's tracked products | Yes (JWT) |
| `POST` | `/api/wishlist/:productId` | Add product to wishlist | Yes (JWT) |
| `POST` | `/api/alerts` | Set target price drop alert | Yes (JWT) |
| `POST` | `/api/alerts/:id/test-trigger` | Simulate price drop & email trigger | Yes (JWT) |

---

## 📄 License
MIT License. Built for Indian consumers to promote transparent e-commerce shopping.
