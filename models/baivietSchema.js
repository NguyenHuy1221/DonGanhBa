const mongoose = require('mongoose');
const { Schema } = mongoose;

const BaiVietSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    image: [String],
    tieude: { type: String, required: true },
    noidung: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    binhluan: [{ type: Schema.Types.ObjectId, ref: 'binhluanbaiviet' }],
    tags: [{ type: String }],
    trangthai: { type: Boolean, default: false },
    isUpdate: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const BaiViet = mongoose.model('BaiViet', BaiVietSchema);
module.exports = BaiViet;
