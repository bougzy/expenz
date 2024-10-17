// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');
// const Deposit = require('../models/Deposit');
// const multer = require('multer');

// // Multer setup for file uploads
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/');
//     },
//     filename: function (req, file, cb) {
//         cb(null, Date.now() + '-' + file.originalname);
//     }
// });
// const upload = multer({ storage });

// // Admin dashboard route
// router.get('/dashboard', async (req, res) => {
//     const users = await User.find({});
//     res.json({ users });
// });

// // Manage user: block/unblock
// router.post('/users/:id/block', async (req, res) => {
//     const user = await User.findById(req.params.id);
//     user.isBlocked = true;
//     await user.save();
//     res.json({ message: 'User blocked successfully' });
// });

// router.post('/users/:id/unblock', async (req, res) => {
//     const user = await User.findById(req.params.id);
//     user.isBlocked = false;
//     await user.save();
//     res.json({ message: 'User unblocked successfully' });
// });

// // View deposit requests
// router.get('/deposits', async (req, res) => {
//     const deposits = await Deposit.find({ status: 'Pending' });
//     res.json({ deposits });
// });

// // Approve deposit
// router.post('/deposits/:id/approve', async (req, res) => {
//     const deposit = await Deposit.findById(req.params.id);
//     deposit.status = 'Approved';
//     deposit.approvedAt = new Date();
//     await deposit.save();

//     // Logic to update user balance can be added here

//     res.json({ message: 'Deposit approved successfully' });
// });

// // Reject deposit
// router.post('/deposits/:id/reject', async (req, res) => {
//     const deposit = await Deposit.findById(req.params.id);
//     deposit.status = 'Rejected';
//     await deposit.save();
//     res.json({ message: 'Deposit rejected successfully' });
// });

// // View payment proof uploaded by users
// router.post('/deposits/:id/upload-proof', upload.single('proofOfPayment'), async (req, res) => {
//     const deposit = await Deposit.findById(req.params.id);
//     deposit.proofOfPayment = req.file.path;
//     await deposit.save();
//     res.json({ message: 'Proof of payment uploaded successfully' });
// });

// module.exports = router;



const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Deposit = require('../models/Deposit');
const multer = require('multer');

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// Admin dashboard route
router.get('/dashboard', async (req, res) => {
    const users = await User.find({});
    res.json({ users });
});

// Manage user: block/unblock
router.post('/users/:id/block', async (req, res) => {
    const user = await User.findById(req.params.id);
    user.isBlocked = true;
    await user.save();
    res.json({ message: 'User blocked successfully' });
});

router.post('/users/:id/unblock', async (req, res) => {
    const user = await User.findById(req.params.id);
    user.isBlocked = false;
    await user.save();
    res.json({ message: 'User unblocked successfully' });
});

// View deposit requests
router.get('/deposits', async (req, res) => {
    const deposits = await Deposit.find({ status: 'Pending' });
    res.json({ deposits });
});

// Approve deposit
router.post('/deposits/:id/approve', async (req, res) => {
    const deposit = await Deposit.findById(req.params.id);
    deposit.status = 'Approved';
    deposit.approvedAt = new Date();
    await deposit.save();
    res.json({ message: 'Deposit approved successfully' });
});

// Reject deposit
router.post('/deposits/:id/reject', async (req, res) => {
    const deposit = await Deposit.findById(req.params.id);
    deposit.status = 'Rejected';
    await deposit.save();
    res.json({ message: 'Deposit rejected successfully' });
});

// Upload proof of payment
router.post('/deposits/:id/upload-proof', upload.single('proofOfPayment'), async (req, res) => {
    const deposit = await Deposit.findById(req.params.id);
    deposit.proofOfPayment = req.file.path;
    await deposit.save();
    res.json({ message: 'Proof of payment uploaded successfully' });
});

module.exports = router;
