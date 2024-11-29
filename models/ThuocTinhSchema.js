const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ThuocTinhSchema = new Schema({
  IDUser: { type: Schema.Types.ObjectId, ref: 'User' },
  ThuocTinhID: { type: String, required: true, unique: true },
  TenThuocTinh: { type: String, required: true },
  isDeleted: { type: Boolean, default: false }

});

const ThuocTinh = mongoose.model('ThuocTinh', ThuocTinhSchema);

module.exports = ThuocTinh;