const mongoose = require("mongoose");
const { Schema } = mongoose;
const { convertToVietnamTimezone } = require('../middleware/index');
const NguoiDungSchema = new Schema({
  anhDaiDien: String,
  tenNguoiDung: String,
  GioiTinh: String,
  soDienThoai: String,
  gmail: String,
  matKhau: String,
  ngayTao: { type: Date, default: Date.now },
  ngaySinh: String,
  hoKinhDoanh: { type: Boolean, default: false },
  tinhTrang: { type: Number, default: 0 },
  IDYeuThich: { type: Schema.Types.ObjectId, ref: 'YeuThich' },
  phuongThucThanhToan: [
    { type: Schema.Types.ObjectId, ref: "PhuongThucThanhToan" },
  ],

  //phan quyen cho admin
  role: {
    type: String, enum: ['khachhang', 'hokinhdoanh', 'nhanvien', 'admin'], required: true,
    default: 'khachhang' // Thiết lập giá trị mặc định là 'khachhang'
  },
  // permissions: [{
  //   entity: { type: String, enum: ['sanpham', 'khuyenmai', 'hoadon'], required: true },
  //   actions: [{ type: String, enum: ['them', 'xoa', 'sua', 'update'] }]
  // }],
  permissions: [{
    entity: { type: String, enum: ['sanpham', 'khuyenmai', 'hoadon'], required: true },
    actions: [{ type: String, enum: ['them', 'xoa', 'sua', 'update'] }]
  }],
  otp: { type: String },
  otpExpiry: { type: Date },
  isVerified: { type: Boolean, default: false },
  googleId: { type: String, unique: true, sparse: true },
  facebookId: { type: String, unique: true, sparse: true },
}, {
  timestamps: true
});
convertToVietnamTimezone(NguoiDungSchema)
module.exports = mongoose.model("User", NguoiDungSchema);
