const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// Schema cho biến thể sản phẩm
const NhomSanPhamDuocKhuyenMaiSchema = new Schema({
    IDNhomSanPhamDuocKhuyenMai: { type: String, required: true, unique: true }, // Giả sử có một schema SanPham
    IDDanhMucCon: { type: String, ref: 'DanhMucCon' } 
  });

  const NhomSanPhamDuocKhuyenMai = mongoose.model('NhomSanPhamDuocKhuyenMai', NhomSanPhamDuocKhuyenMaiSchema);

module.exports = NhomSanPhamDuocKhuyenMai; 