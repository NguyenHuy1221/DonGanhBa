const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { convertToVietnamTimezone } = require('../middleware/index');
const DanhGiaSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  sanphamId: { type: mongoose.Schema.Types.ObjectId, ref: "SanPham" },
  HinhAnh: [String],
  XepHang: Number,
  BinhLuan: String,
  PhanHoi: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      BinhLuan: String,
      NgayTao: { type: Date, default: Date.now },
    },
  ],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  NgayTao: { type: Date, default: Date.now },
});

convertToVietnamTimezone(DanhGiaSchema)
const DanhGia = mongoose.model('DanhGia', DanhGiaSchema);
module.exports = DanhGia; 