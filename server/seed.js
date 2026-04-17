const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/business_management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected')).catch(err => console.log(err));

const Category = require('./models/Category');
const Product = require('./models/Product');
const Customer = require('./models/Customer');
const Order = require('./models/Order');
const Employee = require('./models/Employee');

async function seed() {
  try {
    await Employee.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Customer.deleteMany({});
    await Order.deleteMany({});

    const admin = await Employee.create({
      name: 'Admin User',
      email: 'admin@business.com',
      password: 'admin123',
      role: 'admin'
    });

    const devesh = await Employee.create({
      name: 'Devesh Raj',
      email: 'deveshraj002@gmail.com',
      password: 'devesh123',
      role: 'admin'
    });

    const manager = await Employee.create({
      name: 'Sarah Johnson',
      email: 'sarah@business.com',
      password: 'manager123',
      role: 'manager'
    });

    const staff = await Employee.create({
      name: 'Mike Wilson',
      email: 'mike@business.com',
      password: 'staff123',
      role: 'staff'
    });

    const categories = await Category.insertMany([
      { name: 'Electronics', description: 'Electronic devices and accessories', color: '#3b82f6' },
      { name: 'Clothing', description: 'Apparel and fashion items', color: '#22c55e' },
      { name: 'Home & Garden', description: 'Home decor and garden supplies', color: '#f59e0b' },
      { name: 'Sports', description: 'Sports equipment and gear', color: '#ef4444' },
      { name: 'Books', description: 'Books and educational materials', color: '#a855f7' }
    ]);

    const products = await Product.insertMany([
      { name: 'Wireless Bluetooth Headphones', sku: 'ELEC-001', description: 'High-quality wireless headphones with noise cancellation', price: 149.99, cost: 75, quantity: 45, category: categories[0]._id, lowStockThreshold: 10 },
      { name: 'Smartphone Case', sku: 'ELEC-002', description: 'Durable protective case for smartphones', price: 24.99, cost: 8, quantity: 120, category: categories[0]._id, lowStockThreshold: 20 },
      { name: 'USB-C Charging Cable', sku: 'ELEC-003', description: 'Fast charging USB-C cable, 6ft', price: 14.99, cost: 4, quantity: 8, category: categories[0]._id, lowStockThreshold: 15 },
      { name: 'Portable Power Bank', sku: 'ELEC-004', description: '20000mAh portable charger', price: 49.99, cost: 22, quantity: 35, category: categories[0]._id, lowStockThreshold: 10 },
      { name: 'Cotton T-Shirt', sku: 'CLTH-001', description: 'Comfortable 100% cotton t-shirt', price: 29.99, cost: 12, quantity: 85, category: categories[1]._id, lowStockThreshold: 15 },
      { name: 'Denim Jeans', sku: 'CLTH-002', description: 'Classic fit denim jeans', price: 59.99, cost: 28, quantity: 42, category: categories[1]._id, lowStockThreshold: 10 },
      { name: 'Winter Jacket', sku: 'CLTH-003', description: 'Warm winter jacket with hood', price: 129.99, cost: 55, quantity: 18, category: categories[1]._id, lowStockThreshold: 5 },
      { name: 'Running Shoes', sku: 'SPRT-001', description: 'Lightweight running shoes', price: 89.99, cost: 40, quantity: 28, category: categories[3]._id, lowStockThreshold: 8 },
      { name: 'Yoga Mat', sku: 'SPRT-002', description: 'Non-slip yoga mat', price: 34.99, cost: 15, quantity: 55, category: categories[3]._id, lowStockThreshold: 10 },
      { name: 'Water Bottle', sku: 'SPRT-003', description: 'Insulated stainless steel bottle', price: 24.99, cost: 10, quantity: 6, category: categories[3]._id, lowStockThreshold: 12 },
      { name: 'LED Desk Lamp', sku: 'HOME-001', description: 'Adjustable LED desk lamp', price: 44.99, cost: 20, quantity: 38, category: categories[2]._id, lowStockThreshold: 8 },
      { name: 'Throw Pillow Set', sku: 'HOME-002', description: 'Set of 2 decorative pillows', price: 39.99, cost: 16, quantity: 50, category: categories[2]._id, lowStockThreshold: 10 },
      { name: 'Programming Book', sku: 'BOOK-001', description: 'Learn JavaScript fundamentals', price: 49.99, cost: 20, quantity: 25, category: categories[4]._id, lowStockThreshold: 5 },
      { name: 'Business Novel', sku: 'BOOK-002', description: 'The Art of Business Success', price: 19.99, cost: 8, quantity: 40, category: categories[4]._id, lowStockThreshold: 8 },
      { name: 'Bluetooth Speaker', sku: 'ELEC-005', description: 'Portable waterproof speaker', price: 79.99, cost: 35, quantity: 22, category: categories[0]._id, lowStockThreshold: 8 }
    ]);

    const customers = await Customer.insertMany([
      { name: 'John Smith', email: 'john.smith@email.com', phone: '+1 (555) 123-4567', address: '123 Main St, New York, NY 10001', totalPurchases: 5 },
      { name: 'Emily Davis', email: 'emily.davis@email.com', phone: '+1 (555) 234-5678', address: '456 Oak Ave, Los Angeles, CA 90001', totalPurchases: 3 },
      { name: 'Michael Brown', email: 'michael.brown@email.com', phone: '+1 (555) 345-6789', address: '789 Pine Rd, Chicago, IL 60601', totalPurchases: 7 },
      { name: 'Jessica Wilson', email: 'jessica.wilson@email.com', phone: '+1 (555) 456-7890', address: '321 Elm St, Houston, TX 77001', totalPurchases: 2 },
      { name: 'David Martinez', email: 'david.martinez@email.com', phone: '+1 (555) 567-8901', address: '654 Maple Dr, Phoenix, AZ 85001', totalPurchases: 4 }
    ]);

    const now = new Date();
    const orders = await Order.insertMany([
      {
        orderNumber: 'ORD-000001',
        customer: customers[0]._id,
        items: [
          { product: products[0]._id, name: products[0].name, quantity: 1, price: products[0].price },
          { product: products[1]._id, name: products[1].name, quantity: 2, price: products[1].price }
        ],
        subtotal: 199.97,
        tax: 16.00,
        total: 215.97,
        status: 'completed',
        paymentMethod: 'card',
        createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000)
      },
      {
        orderNumber: 'ORD-000002',
        customer: customers[1]._id,
        items: [
          { product: products[4]._id, name: products[4].name, quantity: 3, price: products[4].price },
          { product: products[5]._id, name: products[5].name, quantity: 1, price: products[5].price }
        ],
        subtotal: 149.96,
        tax: 12.00,
        total: 161.96,
        status: 'completed',
        paymentMethod: 'cash',
        createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000)
      },
      {
        orderNumber: 'ORD-000003',
        customer: customers[2]._id,
        items: [
          { product: products[7]._id, name: products[7].name, quantity: 1, price: products[7].price },
          { product: products[8]._id, name: products[8].name, quantity: 2, price: products[8].price }
        ],
        subtotal: 159.97,
        tax: 12.80,
        total: 172.77,
        status: 'completed',
        paymentMethod: 'card',
        createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000)
      },
      {
        orderNumber: 'ORD-000004',
        customer: customers[0]._id,
        items: [
          { product: products[12]._id, name: products[12].name, quantity: 1, price: products[12].price }
        ],
        subtotal: 49.99,
        tax: 4.00,
        total: 53.99,
        status: 'completed',
        paymentMethod: 'card',
        createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000)
      },
      {
        orderNumber: 'ORD-000005',
        customer: customers[3]._id,
        items: [
          { product: products[3]._id, name: products[3].name, quantity: 1, price: products[3].price },
          { product: products[6]._id, name: products[6].name, quantity: 1, price: products[6].price }
        ],
        subtotal: 179.98,
        tax: 14.40,
        total: 194.38,
        status: 'pending',
        paymentMethod: 'cash',
        createdAt: new Date()
      }
    ]);

    console.log('Seed completed successfully!');
    console.log('Created:');
    console.log(`  - ${admin.role}: ${admin.email} / admin123`);
    console.log(`  - ${manager.role}: ${manager.email} / manager123`);
    console.log(`  - ${staff.role}: ${staff.email} / staff123`);
    console.log(`  - ${categories.length} categories`);
    console.log(`  - ${products.length} products`);
    console.log(`  - ${customers.length} customers`);
    console.log(`  - ${orders.length} orders`);

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
