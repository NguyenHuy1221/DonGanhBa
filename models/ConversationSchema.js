const mongoose = require("mongoose");
const { Schema } = mongoose;
const { convertToVietnamTimezone } = require('../middleware/index');
const ConversationSchema = new Schema({

  sender_id: { type: mongoose.Schema.Types.ObjectId, require: true, ref: "User" },
  receiver_id: { type: mongoose.Schema.Types.ObjectId, require: true, ref: "User" },
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }]

}, {
  timestamps: true
});
convertToVietnamTimezone(ConversationSchema)
module.exports = mongoose.model("Conversation", ConversationSchema);