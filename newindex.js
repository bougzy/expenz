

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const cron = require('node-cron');

// Initialize app
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(express.json());
app.use(express.static('public'));  



// MongoDB connection
mongoose.connect('mongodb+srv://expenza:expenza@expenza.oygju.mongodb.net/expenza', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected successfully');
})
.catch(err => {
  console.error('MongoDB connection error:', err.message);
});


// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    balance: { type: Number, default: 0 },
    profits: { type: Number, default: 0 },
    currentPlan: { type: String, default: null },
    referralCount: { type: Number, default: 0 },
    referredBy: { type: String, default: null },
    blocked: { type: Boolean, default: false },
});

const User = mongoose.model('User', userSchema);

// Transaction Schema
const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['deposit', 'withdrawal'], required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    proof: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
});

const Transaction = mongoose.model('Transaction', transactionSchema);



// Middleware for authentication
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    jwt.verify(token, 'aHSCWvC3Ol', (err, user) => {
        if (err) return res.status(403).json({ message: 'Forbidden' });
        req.user = user;
        next();
    });
};

// User Registration
app.post('/api/users/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = new User({ email, password: hashedPassword, name });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// User Login
app.post('/api/users/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id }, 'aHSCWvC3Ol', { expiresIn: '1h' });
    res.json({ token });
});

// Get user details
app.get('/api/users/me', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ email: user.email, balance: user.balance, name: user.name });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});



// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Ensure this folder exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// Your route
app.post('/api/transactions/deposit', authenticate, upload.single('proofOfPayment'), async (req, res) => {
    const { amount } = req.body;

    // Validate the uploaded file
    if (!req.file) {
        return res.status(400).json({ message: 'Proof of payment is required.' });
    }

    // Validate the amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ message: 'Invalid amount.' });
    }

    try {
        const transaction = new Transaction({
            userId: req.user.id,
            amount: parsedAmount,
            proof: req.file.path,
            type: 'deposit',
            status: 'pending',
        });
        await transaction.save();

        // Update user balance
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        user.balance += parsedAmount;
        await user.save();

        res.status(201).json(transaction);
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// Withdraw transaction
app.post('/api/transactions/withdraw', authenticate, async (req, res) => {
    const { amount } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (user.balance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        const transaction = new Transaction({
            userId: req.user.id,
            amount: -parseFloat(amount),
            type: 'withdrawal',
            status: 'pending',
            createdAt: Date.now(),
        });
        await transaction.save();

        // Update user balance
        user.balance -= parseFloat(amount);
        await user.save();

        res.status(201).json(transaction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get user transactions
app.get('/api/transactions/:userId', authenticate, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.params.userId });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Approve Deposit
app.post('/api/transactions/approve/:id', authenticate, async (req, res) => {
    const transactionId = req.params.id;
    const transaction = await Transaction.findById(transactionId);

    if (transaction && transaction.type === 'deposit') {
        const user = await User.findById(transaction.userId);
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
app.post('/api/transactions/approve-withdraw/:id', authenticate, async (req, res) => {
    const transactionId = req.params.id;
    const transaction = await Transaction.findById(transactionId);

    if (transaction && transaction.type === 'withdrawal') {
        const user = await User.findById(transaction.userId);
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
app.post('/api/transactions/reject/:id', authenticate, async (req, res) => {
    const transactionId = req.params.id;
    const transaction = await Transaction.findById(transactionId);

    if (transaction) {
        await transaction.remove();
        res.json({ message: 'Transaction rejected' });
    } else {
        res.status(400).json({ message: 'Invalid transaction' });
    }
});

// Feedback submission
app.post('/api/feedback', authenticate, async (req, res) => {
    const { userEmail, feedback } = req.body;

    // Here you can save the feedback to a database or send it via email
    console.log(`Feedback from ${userEmail}: ${feedback}`);

    res.status(200).json({ message: 'Feedback submitted successfully' });
});

// Admin dashboard route
app.get('/api/admin/dashboard', authenticate, async (req, res) => {
    const users = await User.find({});
    res.json({ users });
});

// Manage user: block/unblock
app.post('/api/admin/users/:id/block', authenticate, async (req, res) => {
    const user = await User.findById(req.params.id);
    user.blocked = true;
    await user.save();
    res.json({ message: 'User blocked successfully' });
});

app.post('/api/admin/users/:id/unblock', authenticate, async (req, res) => {
    const user = await User.findById(req.params.id);
    user.blocked = false;
    await user.save();
    res.json({ message: 'User unblocked successfully' });
});

// View deposit requests
app.get('/api/admin/deposits', authenticate, async (req, res) => {
    const deposits = await Transaction.find({ status: 'pending', type: 'deposit' });
    res.json({ deposits });
});

// Approve deposit
app.post('/api/admin/deposits/:id/approve', authenticate, async (req, res) => {
    const deposit = await Transaction.findById(req.params.id);
    if (deposit) {
        deposit.status = 'approved';
        await deposit.save();
        res.json({ message: 'Deposit approved' });
    } else {
        res.status(404).json({ message: 'Deposit not found' });
    }
});

// Reject deposit
app.post('/api/admin/deposits/:id/reject', authenticate, async (req, res) => {
    const deposit = await Transaction.findById(req.params.id);
    if (deposit) {
        deposit.status = 'rejected';
        await deposit.save();
        res.json({ message: 'Deposit rejected' });
    } else {
        res.status(404).json({ message: 'Deposit not found' });
    }
});

// Get user dashboard data
app.get('/api/users/dashboard', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch transactions related to the user
        const transactions = await Transaction.find({ userId: req.user.id });

        // Prepare the response data
        const depositStatus = transactions.filter(trans => trans.type === 'deposit');
        const profits = user.profits;  // Adjust based on how profits are calculated

        // Prepare notifications
        const notifications = depositStatus.map(trans => {
            return {
                amount: trans.amount,
                status: trans.status,
                createdAt: trans.createdAt,
            };
        });

        res.json({
            user: {
                name: user.name,
                email: user.email,
                balance: user.balance,
                profits: profits,
            },
            notifications: notifications,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get user dashboard data
app.get('/api/users/dashboard', authenticate, async (req, res) => {
  try {
      const user = await User.findById(req.user.id);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Fetch transactions related to the user
      const transactions = await Transaction.find({ userId: req.user.id });
      const deposits = transactions.filter(trans => trans.type === 'deposit');
      const withdrawals = transactions.filter(trans => trans.type === 'withdrawal');

      // Prepare notifications for deposits and profits
      const notifications = deposits.map(trans => {
          return {
              amount: trans.amount,
              status: trans.status,
              createdAt: trans.createdAt,
              type: trans.type,
          };
      });

      // Check for profit increment (assuming you have a method to calculate this)
      const profits = user.profits; // Adjust this based on how profits are calculated

      res.json({
          user: {
              name: user.name,
              email: user.email,
              balance: user.balance,
              profits: profits,
          },
          notifications: notifications,
          depositStatus: deposits.map(deposit => ({
              amount: deposit.amount,
              status: deposit.status,
              createdAt: deposit.createdAt,
          })),
          withdrawalStatus: withdrawals.map(withdrawal => ({
              amount: withdrawal.amount,
              status: withdrawal.status,
              createdAt: withdrawal.createdAt,
          })),
      });
  } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});
app.get('/dashboard', (req, res) => {
  res.sendFile(__dirname + '/public/dashboard.html');
});
app.get('/admindashboard', (req, res) => {
  res.sendFile(__dirname + '/public/admindashboard.html');
});
app.get('/deposit', (req, res) => {
  res.sendFile(__dirname + '/public/deposit.html');
});
app.get('/feedback', (req, res) => {
  res.sendFile(__dirname + '/public/feedback.html');
});
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});
app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/public/register.html');
});
app.get('/withdrawal', (req, res) => {
  res.sendFile(__dirname + '/public/withdrawal.html');
});

// Socket.io for real-time notifications
io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Scheduled task for profit calculation
cron.schedule('0 0 * * *', async () => {
  const users = await User.find();
  users.forEach(user => {
    if (user.currentPlan) {
      // Calculate profits and update user balance based on their plan
      user.save();
      io.emit('profitUpdate', { userId: user._id, newBalance: user.balance });
    }
  });
});

// Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
