const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// Schema cho biến thể sản phẩm
const { convertToVietnamTimezone } = require('../middleware/index');
const KhuyenMaiSchema = new Schema({// Giả sử có một schema SanPham
  TenKhuyenMai: String,
  MoTa: String,

  GiaTriKhuyenMai: Number,
  TongSoLuongDuocTao: Number,
  GioiHanGiaTriDuocApDung: Number,
  GioiHanGiaTriGiamToiDa: Number, // nếu loại khuyến mãi là giảm giá theo % sản phẩm thì đây sẽ là số tiền tối da mà giảm giá đó cho phép giảm
  NgayBatDau: { type: Date },
  NgayKetThuc: Date,
  SoLuongHienTai: Number,
  IDLoaiKhuyenMai: { type: Schema.Types.ObjectId, ref: 'SanPham' },
  IDDanhMucCon: { type: Schema.Types.ObjectId, ref: 'DanhMuc.DanhMucCon' },
  TrangThai: Number,
  isDeleted: { type: Boolean, default: false }
});
convertToVietnamTimezone(KhuyenMaiSchema)
const KhuyenMai = mongoose.model('KhuyenMai', KhuyenMaiSchema);

module.exports = KhuyenMai; 