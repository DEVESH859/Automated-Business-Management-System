const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const { getJwtSecret } = require('../authConfig');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ msg: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const employee = await Employee.findOne({ email: normalizedEmail });
    if (!employee) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await employee.comparePassword(password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const jwtSecret = getJwtSecret();
    if (!jwtSecret) {
      return res.status(503).json({ msg: 'Authentication is not configured on the server' });
    }
    const token = jwt.sign({ id: employee._id, role: employee.role }, jwtSecret, { expiresIn: '24h' });

    res.json({
      token,
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role
      }
    });
  } catch (err) {
    console.error('Login failed:', err.message);
    res.status(500).json({ msg: 'Unable to sign in right now' });
  }
});

router.get('/me', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token' });

    const jwtSecret = getJwtSecret();
    if (!jwtSecret) {
      return res.status(503).json({ msg: 'Authentication is not configured on the server' });
    }
    const decoded = jwt.verify(token, jwtSecret);
    const employee = await Employee.findById(decoded.id).select('-password');
    if (!employee) return res.status(404).json({ msg: 'Employee not found' });

    res.json(employee);
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ msg: 'Your session is invalid or has expired' });
    }
    console.error('User lookup failed:', err.message);
    res.status(500).json({ msg: 'Unable to load the current user' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ msg: 'Name, email, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ msg: 'Password must be at least 6 characters' });
    }
    const jwtSecret = getJwtSecret();
    if (!jwtSecret) {
      return res.status(503).json({ msg: 'Authentication is not configured on the server' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    let employee = await Employee.findOne({ email: normalizedEmail });
    if (employee) return res.status(400).json({ msg: 'Employee already exists' });

    employee = new Employee({ name: name.trim(), email: normalizedEmail, password, role: role || 'staff' });
    await employee.save();

    const token = jwt.sign({ id: employee._id, role: employee.role }, jwtSecret, { expiresIn: '24h' });

    res.status(201).json({
      token,
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role
      }
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ msg: 'Please check the registration details' });
    }
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'Employee already exists' });
    }
    console.error('Registration failed:', err.message);
    res.status(500).json({ msg: 'Unable to create the account right now' });
  }
});

module.exports = router;
