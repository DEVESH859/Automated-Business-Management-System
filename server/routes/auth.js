const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const employee = await Employee.findOne({ email });
    if (!employee) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await employee.comparePassword(password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: employee._id, role: employee.role }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '24h' });

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
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    const employee = await Employee.findById(decoded.id).select('-password');
    if (!employee) return res.status(404).json({ msg: 'Employee not found' });

    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    let employee = await Employee.findOne({ email });
    if (employee) return res.status(400).json({ msg: 'Employee already exists' });

    employee = new Employee({ name, email, password, role: role || 'staff' });
    await employee.save();

    const token = jwt.sign({ id: employee._id, role: employee.role }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '24h' });

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
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
