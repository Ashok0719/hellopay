const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const WalletLog = require('../models/WalletLog');

// @desc    Transfer money between users
// @route   POST /api/transactions/transfer
// @access  Private
const transferMoney = async (req, res) => {
  const { receiverPhone, amount } = req.body;
  const transferAmount = Number(amount);

  if (transferAmount <= 0) {
    res.status(400);
    throw new Error('Invalid amount');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const sender = await User.findById(req.user._id).session(session);
    const receiver = await User.findOne({ phone: receiverPhone }).session(session);

    if (!receiver) {
      throw new Error('Receiver not found');
    }

    if (sender._id.equals(receiver._id)) {
      throw new Error('Cannot transfer to yourself');
    }

    if (sender.walletBalance < transferAmount) {
      throw new Error('Insufficient balance');
    }

    // Update balances
    sender.walletBalance -= transferAmount;
    receiver.walletBalance += transferAmount;

    await sender.save({ session });
    await receiver.save({ session });

    // Create Transaction Record
    const transaction = await Transaction.create([{
      senderId: sender._id,
      receiverId: receiver._id,
      type: 'transfer',
      amount: transferAmount,
      status: 'success',
      referenceId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    }], { session });

    // Create Wallet Logs
    await WalletLog.create([{
      userId: sender._id,
      action: 'debit',
      amount: transferAmount,
      balanceAfter: sender.walletBalance,
      description: `Transferred to ${receiver.name}`,
    }], { session });

    await WalletLog.create([{
      userId: receiver._id,
      action: 'credit',
      amount: transferAmount,
      balanceAfter: receiver.walletBalance,
      description: `Received from ${sender.name}`,
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: 'Transfer successful', transaction });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400);
    throw new Error(error.message);
  }
};

// @desc    Get user transaction history
// @route   GET /api/transactions/history
// @access  Private
const getTransactionHistory = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const transactions = await Transaction.find({
      $or: [{ senderId: req.user._id }, { receiverId: req.user._id }]
    })
    .populate('senderId', 'name phone')
    .populate('receiverId', 'name phone')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { transferMoney, getTransactionHistory };
