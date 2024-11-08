const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {convertToVietnamTimezone} = require('../middleware/index');
// Schema cho loai khuyến mãi
const LoaiKhuyenMaiSchema = new Schema({
    //IDLoaiKhuyenMai: { type: String, required: true, unique: true }, // Giả sử có một schema SanPham
    TenLoaiKhuyenMai: String,
    LoaiKhuyenMai: { type: Number, required: true, unique: true },
    MoTa: String,
    NgayBatDau: { type: Date, default: Date.now },
  });

  
  convertToVietnamTimezone(LoaiKhuyenMaiSchema);
  const LoaiKhuyenMai = mongoose.model('LoaiKhuyenMai', LoaiKhuyenMaiSchema);

module.exports = LoaiKhuyenMai; 