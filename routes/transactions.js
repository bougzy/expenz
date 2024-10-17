// const express = require('express');
// const multer = require('multer');
// const Transaction = require('../models/Transaction');
// const User = require('../models/User');
// const router = express.Router();

// // Set up multer for file uploads
// const upload = multer({ dest: 'uploads/' });

// // Make a deposit request
// router.post('/deposit', upload.single('proof'), async (req, res) => {
//   const { userId, amount } = req.body;
//   const transaction = new Transaction({ user: userId, amount, type: 'deposit', proof: req.file.path });
  
//   await transaction.save();
//   res.json({ message: 'Deposit request submitted', transaction });
// });

// // Request a withdrawal
// router.post('/withdraw', async (req, res) => {
//   const { userId, amount } = req.body;
//   const transaction = new Transaction({ user: userId, amount, type: 'withdrawal' });
  
//   await transaction.save();
//   res.json({ message: 'Withdrawal request submitted', transaction });
// });

// // Get user transactions
// router.get('/:userId/transactions', async (req, res) => {
//   const transactions = await Transaction.find({ user: req.params.userId });
//   res.json(transactions);
// });

// // Approve Deposit
// router.post('/approve/:id', async (req, res) => {
//   const transactionId = req.params.id;
//   const transaction = await Transaction.findById(transactionId);

//   if (transaction && transaction.type === 'deposit') {
//     const user = await User.findById(transaction.user);
//     user.balance += transaction.amount;
//     await user.save();
//     transaction.status = 'approved';
//     await transaction.save();
//     res.json({ message: 'Deposit approved' });
//   } else {
//     res.status(400).json({ message: 'Invalid transaction' });
//   }
// });

// // Approve Withdrawal
// router.post('/approve-withdraw/:id', async (req, res) => {
//   const transactionId = req.params.id;
//   const transaction = await Transaction.findById(transactionId);

//   if (transaction && transaction.type === 'withdrawal') {
//     const user = await User.findById(transaction.user);
//     user.balance -= transaction.amount;
//     await user.save();
//     transaction.status = 'approved';
//     await transaction.save();
//     res.json({ message: 'Withdrawal approved' });
//   } else {
//     res.status(400).json({ message: 'Invalid transaction' });
//   }
// });

// // Reject Deposit or Withdrawal Request
// router.post('/reject/:id', async (req, res) => {
//   const transactionId = req.params.id;
//   const transaction = await Transaction.findById(transactionId);

//   if (transaction) {
//     await transaction.remove();
//     res.json({ message: 'Transaction rejected' });
//   } else {
//     res.status(400).json({ message: 'Invalid transaction' });
//   }
// });

// module.exports = router;




const express = require('express');
const multer = require('multer');
const router = express.Router();
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Make a deposit request
router.post('/deposit', upload.single('proof'), async (req, res) => {
  const { userId, amount } = req.body;
  const transaction = new Transaction({ user: userId, amount, type: 'deposit', proof: req.file.path });
  
  await transaction.save();
  res.json({ message: 'Deposit request submitted', transaction });
});

// Request a withdrawal
router.post('/withdraw', async (req, res) => {
  const { userId, amount } = req.body;
  const transaction = new Transaction({ user: userId, amount, type: 'withdrawal' });
  
  await transaction.save();
  res.json({ message: 'Withdrawal request submitted', transaction });
});

// Get user transactions
router.get('/:userId/transactions', async (req, res) => {
  const transactions = await Transaction.find({ user: req.params.userId });
  res.json(transactions);
});

// Approve Deposit
router.post('/approve/:id', async (req, res) => {
  const transactionId = req.params.id;
  const transaction = await Transaction.findById(transactionId);

  if (transaction && transaction.type === 'deposit') {
    const user = await User.findById(transaction.user);
    user.balance += transaction.amount;
    await user.save();
    transaction.status = 'approved';
    await transaction.save();
    res.json({ message: 'Deposit approved' });
  } else {
    res.status(400).json({ message: 'Invalid transaction' });
  }
});

// Approve Withdrawal
router.post('/approve-withdraw/:id', async (req, res) => {
  const transactionId = req.params.id;
  const transaction = await Transaction.findById(transactionId);

  if (transaction && transaction.type === 'withdrawal') {
    const user = await User.findById(transaction.user);
    user.balance -= transaction.amount;
    await user.save();
    transaction.status = 'approved';
    await transaction.save();
    res.json({ message: 'Withdrawal approved' });
  } else {
    res.status(400).json({ message: 'Invalid transaction' });
  }
});

// Reject Deposit or Withdrawal Request
router.post('/reject/:id', async (req, res) => {
  const transactionId = req.params.id;
  const transaction = await Transaction.findById(transactionId);

  if (transaction) {
    await transaction.remove();
    res.json({ message: 'Transaction rejected' });
  } else {
    res.status(400).json({ message: 'Invalid transaction' });
  }
});

module.exports = router;
