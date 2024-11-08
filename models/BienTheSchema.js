const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// Schema cho biến thể sản phẩm
const BienTheSchema = new Schema({
  IDSanPham: { type: Schema.Types.ObjectId, ref: 'SanPham' }, // Giả sử có một schema SanPham
  sku: String,
  gia: Number,
  soLuong: Number,
  KetHopThuocTinh: [{
    IDGiaTriThuocTinh: { type: Schema.Types.ObjectId, ref: 'GiaTriThuocTinh' }
  }],
  isDeleted: { type: Boolean, default: false }
});

const BienThe = mongoose.model('BienThe', BienTheSchema);

module.exports = BienThe; 