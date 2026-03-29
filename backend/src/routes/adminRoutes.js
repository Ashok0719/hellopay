const express = require('express');
const router = express.Router();
const { 
  getAnalytics, 
  getAllUsers, 
  toggleUserBlock, 
  getConfig, 
  updateConfig, 
  getAllTransactions, 
  reviewTransaction,
  updateUserBalance
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/analytics', protect, admin, getAnalytics);
router.get('/users', protect, admin, getAllUsers);
router.put('/user/:id/block', protect, admin, toggleUserBlock);
router.put('/user/:id/balance', protect, admin, updateUserBalance);
router.get('/config', protect, admin, getConfig);
router.put('/config', protect, admin, updateConfig);

// Transaction Monitoring
router.get('/transactions', protect, admin, getAllTransactions);
router.post('/transactions/:id/:action', protect, admin, reviewTransaction);

module.exports = router;
