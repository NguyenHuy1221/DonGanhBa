const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GiaTriThuocTinhSchema = new Schema({
  IDGiaTriThuocTinh: { type: String, required: true, unique: true }, // Khóa chính, duy nhất
  ThuocTinhID: { type: Schema.Types.ObjectId, ref: 'ThuocTinh' }, // Tham chiếu đến thuộc tính
  GiaTri: { type: String, required: true },
  isDeleted: { type: Boolean, default: false },

});

const GiaTriThuocTinh = mongoose.model('GiaTriThuocTinh', GiaTriThuocTinhSchema);
module.exports = GiaTriThuocTinh; 