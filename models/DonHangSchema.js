const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { convertToVietnamTimezone } = require('../middleware/index');

const DonHangSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    hoKinhDoanhId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    hoaDonId: { type: mongoose.Schema.Types.ObjectId, ref: "HoaDon" },
    TongTien: Number,
    TrangThai: Number, // 0đặt hàng ,1đóng gói , 2bắt đầu giao , 3hoàn thành đơn hàng , 4hủy
    GhiChu: String,
    chiTietDonHang: [
        {
            idBienThe: { type: mongoose.Schema.Types.ObjectId, ref: "BienThe" },
            soLuong: Number,
            donGia: Number,
        },
    ],
    diaChi: {
        tinhThanhPho: String,
        quanHuyen: String,
        phuongXa: String,
        duongThon: String,
        Name: { type: String },
        SoDienThoai: { type: String },
    },
    NgayTao: { type: Date, default: Date.now },
});
convertToVietnamTimezone(DonHangSchema);
const DonHang = mongoose.model('DonHang', DonHangSchema);
module.exports = DonHang;
