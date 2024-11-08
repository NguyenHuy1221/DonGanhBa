const mongoose = require('mongoose');
const { Schema } = mongoose;

const BinhLuanBaiVietSchema = new Schema({
    blogId: { type: Schema.Types.ObjectId, ref: 'BaiViet', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    likes: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const BinhLuanBaiViet = mongoose.model('BinhLuanBaiViet', BinhLuanBaiVietSchema);
module.exports = BinhLuanBaiViet;
