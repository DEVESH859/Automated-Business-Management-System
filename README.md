# ABMS - Automated Business Management System

A comprehensive business management platform built with React, Node.js, Express, and MongoDB.

## Features

- **Dashboard**: Real-time overview of business metrics, revenue trends, and alerts
- **Inventory Management**: Full CRUD operations for products with stock tracking
- **Point of Sale (POS)**: Fast checkout interface with cart management
- **Customer Management**: Track customers and their purchase history
- **Employee Management**: Role-based access control (Admin, Manager, Staff)
- **Reports & Analytics**: Revenue analysis, top products, and order statistics

## Tech Stack

- **Frontend**: React 18, Vite, React Router, Zustand, Recharts
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcrypt password hashing

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas connection)

### Installation

1. Clone the repository
2. Install root dependencies:
   ```bash
   npm install
   ```

3. Install server dependencies:
   ```bash
   cd server && npm install
   ```

4. Install client dependencies:
   ```bash
   cd ../client && npm install
   ```

### Configuration

1. Create a `.env` file in the `server/` directory:
   ```
   MONGODB_URI=mongodb://localhost:27017/business_management
   JWT_SECRET=your-secret-key
   PORT=5000
   ```

### Running the Application

1. Start MongoDB:
   ```bash
   mongod
   ```

2. Seed the database with sample data:
   ```bash
   cd server && node seed.js
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

   This starts both the backend (port 5000) and frontend (port 3000).

### Demo Login

After seeding the database, you can login with:
- **Email**: admin@business.com
- **Password**: admin123

## Project Structure

```
business-management/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── stores/        # Zustand stores
│   │   ├── services/      # API service layer
│   │   └── styles/         # Global styles
│   └── package.json
├── server/                 # Express backend
│   ├── controllers/       # Route handlers
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   ├── middleware/        # Auth middleware
│   ├── seed.js            # Database seeder
│   └── server.js
├── SPEC.md               # Project specification
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Employee login
- `POST /api/auth/register` - Register new employee
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Customers
- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Orders
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order
- `PUT /api/orders/:id/status` - Update status

### Dashboard
- `GET /api/dashboard/stats` - Get statistics
- `GET /api/dashboard/chart` - Get chart data
- `GET /api/dashboard/top-products` - Top selling products

## License

MIT
