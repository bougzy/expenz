const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: { type: String, required: true },
  minDeposit: { type: Number, required: true },
  maxDeposit: { type: Number, required: true },
  profitRate: { type: Number, required: true }, // percentage
});

module.exports = mongoose.model('Plan', planSchema);
