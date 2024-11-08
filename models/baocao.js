const mongoose = require('mongoose');
const { Schema } = mongoose;

const BaoCaoSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // ID của người báo cáo
    muctieuId: { type: Schema.Types.ObjectId, required: true }, // ID của đối tượng bị báo cáo (sản phẩm, bình luận, bài viết, etc.)
    muctieuType: { type: String, enum: ['sanpham', 'binhluan', 'baiviet', 'binhluanbaiviet'], required: true }, // Loại đối tượng
    lydo: { type: String, required: true }, // Lý do báo cáo
    mota: { type: String }, // Chi tiết báo cáo (tùy chọn)
    trangthai: { type: String, enum: ['pending', 'resolved', 'dismissed'], default: 'pending' }, // Trạng thái báo cáo
    createdAt: { type: Date, default: Date.now }, // Thời gian tạo báo cáo
});

const BaoCao = mongoose.model('BaoCao', BaoCaoSchema);
module.exports = BaoCao;
