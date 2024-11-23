const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const YeuCauRutTienSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tenNganHang: { type: String, required: true },
    soTaiKhoan: { type: String, required: true },
    soTien: { type: Number, required: true },
    ghiChu: { type: String },
    verificationToken: { type: String },
    isDeleted: { type: Boolean, default: false }, // Trạng thái xóa
    daXuLy: { type: Boolean, default: false }, // Trạng thái đã xử lý
    XacThuc: { type: Boolean, default: false }, // Trạng thái chờ xác thực
    ngayYeuCau: { type: Date, default: Date.now }, // Ngày yêu cầu
}, {
    timestamps: true
});

const YeuCauRutTien = mongoose.model('YeuCauRutTien', YeuCauRutTienSchema);

module.exports = YeuCauRutTien;
