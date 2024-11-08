const mongoose = require("mongoose");
const {convertToVietnamTimezone} = require('../middleware/index');
const TransactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
  },
  orderId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["success", "failed", "pending"],
  },
  method: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});
convertToVietnamTimezone(TransactionSchema)
module.exports = mongoose.model("Transaction", TransactionSchema);
