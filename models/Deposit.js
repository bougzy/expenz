const mongoose = require('mongoose');

// Define the Deposit schema
const depositSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    proofOfPayment: {
        type: String,
        required: true
    },
    approvedAt: {
        type: Date
    },
    rejectedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Define a method to mark the deposit as approved
depositSchema.methods.approve = function () {
    this.status = 'approved';
    this.approvedAt = new Date();
};

// Define a method to mark the deposit as rejected
depositSchema.methods.reject = function () {
    this.status = 'rejected';
    this.rejectedAt = new Date();
};

// Export the Deposit model
const Deposit = mongoose.model('Deposit', depositSchema);
module.exports = Deposit;
