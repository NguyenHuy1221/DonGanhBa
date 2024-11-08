const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//việc lưu địa chỉ ở schema hóa đơn nhằm hiểu rỡ đơn đó từng được giao ở vị trí nào
const { convertToVietnamTimezone } = require('../middleware/index');
const getCurrentDate = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Đặt giờ, phút, giây và mili giây về 0
  // Điều chỉnh múi giờ
  const timezoneOffset = today.getTimezoneOffset() * 60000; // Chuyển đổi phút sang mili giây
  const localMidnight = new Date(today.getTime() - timezoneOffset);
  return localMidnight;
};
const HoaDonSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  khuyenmaiId: { type: mongoose.Schema.Types.ObjectId, ref: "KhuyenMai" },
  diaChi: {
    tinhThanhPho: String,
    quanHuyen: String,
    phuongXa: String,
    duongThon: String,
    Name: { type: String },
    SoDienThoai: { type: String },
  },
  TongTien: Number,
  DaThanhToan: { type: Boolean, default: false },
  SoTienKhuyenMai: { type: Number, default: 0 },
  TrangThai: Number, // 0đặt hàng ,1đóng gói , 2bắt đầug giao , 3hoàn thành đơn hàng , 4huy
  ThanhToan: { type: Boolean, default: false },
  transactionId: { type: Number, default: 0 },
  chiTietHoaDon: [
    {
      idBienThe: { type: mongoose.Schema.Types.ObjectId, ref: "BienThe" },
      soLuong: Number,
      donGia: Number,
    },
  ],
  GhiChu: String,
  payment_url: { type: String },
  redirect_url: { type: String },
  mrc_order_id: { type: String },
  order_id: { type: Number },
  expiresAt: { type: Date, required: true, default: () => new Date(Date.now() + 30 * 60 * 1000) },
  NgayTao: { type: Date, default: getCurrentDate },
});
convertToVietnamTimezone(HoaDonSchema)
const HoaDon = mongoose.model('HoaDon', HoaDonSchema);
module.exports = HoaDon; 