const mongoose = require("mongoose");
const { Schema } = mongoose;
const { convertToVietnamTimezone } = require('../middleware/index');
const MessageSchema = new Schema({
  text: { type: String, required: false },
  imageUrl: { type: String, required: false },
  videoUrl: { type: String, required: false },
  IDSanPham: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SanPham' // Reference to the Product model
  },
  seen: { type: Boolean, default: false },
  msgByUserId: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'User'
  }
}, {
  timestamps: true
});
convertToVietnamTimezone(MessageSchema)
module.exports = mongoose.model("Message", MessageSchema);