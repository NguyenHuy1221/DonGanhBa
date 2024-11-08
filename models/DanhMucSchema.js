const mongoose = require("mongoose");
const { Schema } = mongoose;

const DanhMucConSchema = new Schema({
  IDDanhMucCon: { type: String, required: true }, // ID của danh mục con
  TenDanhMucCon: String,
  MieuTa: String
});
const DanhMucSchema = new Schema({
  IDDanhMuc: { type: String, required: true, unique: true }, // Nếu cần ID tùy chỉnh
  TenDanhMuc: { type: String, required: true },
  AnhDanhMuc: { type: String, required: true },
  DanhMucCon: [DanhMucConSchema] // Sử dụng reference nếu cần
});

module.exports = mongoose.model("DanhMuc", DanhMucSchema);