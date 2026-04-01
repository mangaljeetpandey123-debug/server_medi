const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');
const { 
  createUser, 
  getUsers, 
  getUser,
  getData, 
  getDashboardStats,
  editUser,
  deleteUser,
  getAllDataForExport
} = require('../controllers/adminController');

// All routes require authentication and admin role
router.use(authenticateToken, authorizeAdmin);

// User management routes
router.post('/create-user', createUser);
router.get('/users', getUsers);
router.get('/users/:userId', getUser);
router.put('/users/:userId', editUser);
router.delete('/users/:userId', deleteUser);

// Data and analytics routes
router.get('/data', getData);
router.get('/data/export', getAllDataForExport);  // Add this route
router.get('/dashboard-stats', getDashboardStats);

module.exports = router;