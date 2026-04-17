# Automated Business Management System - SPEC.md

## Concept & Vision

A sleek, professional business management platform that feels like enterprise software from 2024 — clean data visualization, intuitive navigation, and powerful automation. The system exudes competence through thoughtful micro-interactions, real-time updates, and a dark professional aesthetic that reduces eye strain during long work sessions.

## Design Language

### Aesthetic Direction
Dark mode enterprise dashboard with subtle gradients, glass-morphism cards, and vibrant accent colors for data visualization. Inspired by modern SaaS platforms like Linear and Vercel.

### Color Palette
- **Background Primary**: `#0a0a0f` (deep dark)
- **Background Secondary**: `#12121a` (card backgrounds)
- **Background Tertiary**: `#1a1a24` (elevated surfaces)
- **Border**: `#2a2a3a` (subtle borders)
- **Text Primary**: `#f0f0f5` (headings, important text)
- **Text Secondary**: `#8888a0` (body text, labels)
- **Accent Blue**: `#3b82f6` (primary actions, links)
- **Accent Green**: `#22c55e` (success, positive metrics)
- **Accent Red**: `#ef4444` (danger, negative metrics)
- **Accent Amber**: `#f59e0b` (warnings, pending)
- **Accent Purple**: `#a855f7` (special features)

### Typography
- **Headings**: Inter (700, 600 weights)
- **Body**: Inter (400, 500 weights)
- **Monospace/Data**: JetBrains Mono (for numbers, codes)

### Motion Philosophy
- Card hover: subtle lift with `translateY(-2px)` and shadow expansion
- Page transitions: fade-in with slight upward movement (300ms ease-out)
- Data updates: pulse animation on changed values
- Charts: smooth drawing animation on load
- Buttons: scale(0.98) on press, color transition on hover

## Architecture

### Tech Stack
- **Frontend**: React 18 with Vite, React Router, Zustand (state), Recharts
- **Backend**: Node.js + Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt password hashing

### Project Structure
```
business-management/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── stores/        # Zustand stores
│   │   ├── services/      # API service layer
│   │   ├── utils/         # Helper functions
│   │   └── styles/        # Global styles
│   └── package.json
├── server/                # Express backend
│   ├── controllers/       # Route handlers
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   ├── middleware/        # Auth, validation
│   └── server.js
└── package.json           # Root scripts
```

## Features & Modules

### 1. Dashboard
- Key metrics cards: Revenue, Orders, Customers, Inventory Value
- Revenue trend chart (last 30 days)
- Recent orders list
- Low stock alerts
- Quick action buttons

### 2. Inventory Management
- Product list with search, filter, sort
- Add/Edit/Delete products
- Stock quantity tracking
- Category management
- Low stock warnings (threshold-based)

### 3. Sales & POS
- Point of Sale interface with product grid
- Cart management
- Order creation and processing
- Order history
- Sales by date range

### 4. Customer Management (CRM)
- Customer list with search
- Customer details: contact info, purchase history
- Total lifetime value calculation
- Customer segmentation by purchase frequency

### 5. Employee Management
- Employee roster
- Role-based access (Admin, Manager, Staff)
- Basic employee info (name, email, role)

### 6. Financial Overview
- Total revenue (daily, weekly, monthly, yearly)
- Profit margin calculations
- Top selling products
- Sales breakdown by category

## Data Models

### Product
```javascript
{
  name: String,
  sku: String,
  description: String,
  price: Number,
  cost: Number,
  quantity: Number,
  category: ObjectId (ref: Category),
  lowStockThreshold: Number,
  imageUrl: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Category
```javascript
{
  name: String,
  description: String,
  color: String
}
```

### Customer
```javascript
{
  name: String,
  email: String,
  phone: String,
  address: String,
  totalPurchases: Number,
  createdAt: Date
}
```

### Order
```javascript
{
  orderNumber: String,
  customer: ObjectId (ref: Customer),
  items: [{
    product: ObjectId,
    name: String,
    quantity: Number,
    price: Number
  }],
  subtotal: Number,
  tax: Number,
  total: Number,
  status: Enum ['pending', 'completed', 'cancelled'],
  paymentMethod: String,
  createdAt: Date
}
```

### Employee
```javascript
{
  name: String,
  email: String,
  password: String (hashed),
  role: Enum ['admin', 'manager', 'staff'],
  createdAt: Date
}
```

## API Endpoints

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get single product
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
- `GET /api/customers/:id` - Get customer details

### Orders
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status

### Auth
- `POST /api/auth/login` - Employee login
- `GET /api/auth/me` - Get current user

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/chart` - Get chart data

## Component Inventory

### Layout Components
- **Sidebar**: Fixed left navigation with icons, collapsible
- **Header**: Top bar with search, notifications, user menu
- **PageContainer**: Consistent padding and max-width wrapper

### Data Display
- **StatCard**: Metric display with icon, value, label, trend indicator
- **DataTable**: Sortable, searchable table with pagination
- **Chart**: Recharts-based line/bar charts with consistent styling

### Forms
- **Input**: Styled text input with label, error state
- **Select**: Dropdown with custom styling
- **Button**: Primary, secondary, danger variants with loading state

### Feedback
- **Modal**: Centered overlay dialog
- **Toast**: Success/error notifications (top-right)
- **LoadingSpinner**: Animated spinner

## Page Routes

- `/` - Dashboard
- `/inventory` - Product management
- `/inventory/new` - Add new product
- `/inventory/:id/edit` - Edit product
- `/pos` - Point of Sale
- `/customers` - Customer list
- `/customers/:id` - Customer details
- `/employees` - Employee management
- `/reports` - Financial reports
- `/login` - Authentication

## Polish Details

- Custom scrollbar (thin, matches theme)
- Selection color: accent blue
- Smooth scroll behavior
- Focus-visible states with accent ring
- Skeleton loading states for data tables
- Responsive sidebar (hamburger menu on mobile)
- Empty state illustrations with helpful CTAs
- Number formatting with locale (1,000.00)
