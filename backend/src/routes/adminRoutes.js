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
const { protect } = require('../middleware/authMiddleware');

router.get('/analytics', getAnalytics);
router.get('/users', getAllUsers);
router.put('/user/:id/block', toggleUserBlock);
router.put('/user/:id/balance', updateUserBalance);
router.get('/config', getConfig);
router.put('/config', updateConfig);

// Transaction Monitoring
router.get('/transactions', getAllTransactions);
router.post('/transactions/:id/:action', reviewTransaction);

module.exports = router;
