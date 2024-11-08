const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { convertToVietnamTimezone } = require('../middleware/index');
const SanPhamSchema = new Schema({
  IDSanPham: { type: String, unique: true }, // Khóa chính, duy nhất
  TenSanPham: { type: String },
  HinhSanPham: { type: String }, // Giả sử lưu đường dẫn hoặc ID hình ảnh
  DonGiaNhap: { type: Number },
  DonGiaBan: { type: Number },
  SoLuongNhap: { type: Number, default: 0 },
  SoLuongHienTai: { type: Number, default: 0 },
  PhanTramGiamGia: { type: Number },
  NgayTao: { type: Date, default: Date.now },
  TinhTrang: { type: String }, // Ví dụ: 'Còn hàng', 'Hết hàng'
  SanPhamMoi: { type: Boolean, default: false },// sản phẩm vừa tạo sẽ không được bán luôn , phải tự tay xác nhận mới được bán
  //  TinhTrang: { type: String, enum: ['Còn hàng', 'Hết hàng', 'Ngừng kinh doanh'] },
  MoTa: { type: String },
  Unit: { type: String, default: "1" }, // Đơn vị tính
  HinhBoSung: [{
    TenAnh: { type: String },
    UrlAnh: { type: String },
  }],
  DanhSachThuocTinh: [{
    thuocTinh: { type: Schema.Types.ObjectId, ref: 'ThuocTinh' },
    giaTriThuocTinh: [{ type: Schema.Types.ObjectId, ref: 'GiaTriThuocTinh' }]
  }],

  IDDanhMuc: { type: String, ref: 'DanhMuc' }, // Tham chiếu đến danh mục cha
  IDDanhMucCon: { type: String, ref: 'DanhMucCon' } // Tham chiếu đến danh mục con
});
convertToVietnamTimezone(SanPhamSchema)
const SanPham = mongoose.model('SanPham', SanPhamSchema);

module.exports = SanPham;
