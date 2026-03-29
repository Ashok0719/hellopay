const Config = require('../models/Config');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// @desc    Get full config for admin
const getConfig = async (req, res) => {
  let config = await Config.findOne({ key: 'SYSTEM_CONFIG' });
  if (!config) {
    // Return a default blank config if nothing is in DB yet
    return res.json({
      key: 'SYSTEM_CONFIG',
      stockPlans: [],
      globalCashbackPercent: 4,
      adminProfitEnabled: true,
      depositEnabled: true,
      withdrawalEnabled: true
    });
  }
  res.json(config);
};

// @desc    Update system config
const updateConfig = async (req, res) => {
  const { stockPlans, globalCashbackPercent, adminExtraEnabled, adminProfitEnabled, depositEnabled, minDeposit, maxDeposit, withdrawalEnabled } = req.body;

  try {
    let config = await Config.findOne({ key: 'SYSTEM_CONFIG' });
    if (!config) {
      config = new Config({ key: 'SYSTEM_CONFIG' });
    }

    if (stockPlans) config.stockPlans = stockPlans;
    if (globalCashbackPercent !== undefined) config.globalCashbackPercent = globalCashbackPercent;
    if (adminExtraEnabled !== undefined) config.adminExtraEnabled = adminExtraEnabled;
    if (adminProfitEnabled !== undefined) config.adminProfitEnabled = adminProfitEnabled;
    if (depositEnabled !== undefined) config.depositEnabled = depositEnabled;
    if (minDeposit !== undefined) config.minDeposit = minDeposit;
    if (maxDeposit !== undefined) config.maxDeposit = maxDeposit;
    if (withdrawalEnabled !== undefined) config.withdrawalEnabled = withdrawalEnabled;

    await config.save();
    
    // Neural Signal: Emit the plain object version to avoid Mongoose serialization issues in Socket.io
    const syncData = {
      stockPlans: config.stockPlans,
      globalCashbackPercent: config.globalCashbackPercent,
      adminExtraEnabled: config.adminExtraEnabled,
      adminProfitEnabled: config.adminProfitEnabled,
      depositEnabled: config.depositEnabled,
      minDeposit: config.minDeposit,
      maxDeposit: config.maxDeposit,
      withdrawalEnabled: config.withdrawalEnabled
    };

    if (req.io) req.io.emit('configUpdated', syncData);
    res.json({ message: 'Configuration updated successfully', config: syncData });
  } catch (err) {
    console.error('Neural Sync Failure:', err);
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};

// @desc    Get system analytics
const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    
    // Aggregate Transaction Data with safety for missing fields
    const txStats = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          totalTransferred: { $sum: { $ifNull: ['$amount', 0] } },
          totalProfit: { $sum: { $ifNull: ['$split.adminExtra', 0] } },
          totalCashback: { $sum: { $ifNull: ['$cashback', 0] } },
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = txStats[0] || { totalTransferred: 0, totalProfit: 0, totalCashback: 0, count: 0 };

    res.json({
      totalUsers,
      totalTransactions: stats.count,
      totalTransferred: stats.totalTransferred,
      totalAdminProfit: stats.totalProfit,
      totalCashbackGiven: stats.totalCashback
    });
  } catch (err) {
    console.error('Analytics Fetch Error:', err);
    res.status(500).json({ message: 'Analytics fetch failed', error: err.message });
  }
};

// @desc    Get all users
const getAllUsers = async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json(users);
};

// @desc    Toggle user block
const toggleUserBlock = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.isBlocked = !user.isBlocked;
    await user.save();
    
    // Emit real-time Neural Signal to propagate lockdown
    if (req.io) {
      req.io.emit('userStatusChanged', { 
        userId: user._id, 
        isBlocked: user.isBlocked 
      });
    }

    res.json({ 
      message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} success`, 
      isBlocked: user.isBlocked,
      userId: user._id
    });
  } catch (err) {
    console.error('Lockdown Logic Failure (500 Error):', err);
    res.status(500).json({ 
      message: 'Internal Server Error during lockdown sequence', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// @desc    Manual user balance override
const updateUserBalance = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    
    if (amount === undefined || isNaN(Number(amount))) {
      return res.status(400).json({ message: 'Invalid Neural Amount provided' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User Node Not Found' });

    const oldBalance = user.walletBalance;
    user.walletBalance = Number(amount);
    await user.save();

    // Log the manual override
    const WalletLog = require('../models/WalletLog');
    await WalletLog.create({
      userId: user._id,
      action: user.walletBalance > oldBalance ? 'credit' : 'debit',
      amount: Math.abs(user.walletBalance - oldBalance),
      balanceAfter: user.walletBalance,
      description: `Administrative Adjustment: Neural Override`
    });

    // Neural Signal: Broadcast balance update
    if (req.io) {
      req.io.emit('userStatusChanged', { 
        userId: user._id, 
        walletBalance: user.walletBalance,
        isBlocked: user.isBlocked 
      });
    }

    res.json({ 
      message: 'Neural Balance Synchronized', 
      walletBalance: user.walletBalance 
    });
  } catch (err) {
    console.error('Balance Override Failure:', err);
    res.status(500).json({ message: 'Internal Server Error during balance sync' });
  }
};

// @desc    Get all transactions for monitoring
const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('senderId', 'name')
      .populate('receiverId', 'name')
      .sort({ createdAt: -1 });
    
    // Transform for UI expectations
    const formatted = transactions.map(tx => ({
      ...tx._doc,
      user: tx.senderId // Monitoring view expects tx.user.name
    }));
    
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Fetch transactions failed' });
  }
};

// @desc    Approve or reject a pending transaction
const reviewTransaction = async (req, res) => {
  try {
    const { id, action } = req.params;
    const transaction = await Transaction.findById(id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    if (transaction.status !== 'pending') return res.status(400).json({ message: 'Transaction already processed' });

    const user = await User.findById(transaction.senderId);
    if (!user) return res.status(404).json({ message: 'User owner not found' });

    if (action === 'approve') {
      user.walletBalance += transaction.amount;
      
      // Update historical aggregates
      if (transaction.type === 'add_money' || transaction.type === 'buy_stock') {
        user.totalDeposited = (user.totalDeposited || 0) + transaction.amount;
      } else if (transaction.type === 'withdrawal') {
        user.totalWithdrawn = (user.totalWithdrawn || 0) + transaction.amount;
      }
      
      // Apply default cashback if not already done by OCR
      const config = await Config.findOne({ key: 'SYSTEM_CONFIG' });
      const bonus = (transaction.amount * (config?.globalCashbackPercent || 0)) / 100;
      if (bonus > 0) {
        user.rewardBalance = (user.rewardBalance || 0) + bonus;
        user.totalRewards = (user.totalRewards || 0) + bonus;
      }
      
      transaction.status = 'success';
      await user.save();
    } else if (action === 'reject') {
      transaction.status = 'failed';
    }

    await transaction.save();
    res.json({ message: `Transaction ${action}d successfully`, status: transaction.status });
  } catch (err) {
    res.status(500).json({ message: 'Review action failed' });
  }
};

module.exports = { getConfig, updateConfig, getAnalytics, getAllUsers, toggleUserBlock, updateUserBalance, getAllTransactions, reviewTransaction };
