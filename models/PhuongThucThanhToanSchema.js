const mongoose = require("mongoose");
const { Schema } = mongoose;
const QRCode = require("qrcode");
const {convertToVietnamTimezone} = require('../middleware/index');
const phuongThucThanhToanSchema = new Schema({
  ten: { type: String, required: true },
  loai: {
    type: String,
    enum: ["the_tin_dung", "chuyen_khoan", "tien_mat"],
    required: true,
  },
  chiTiet: { type: Schema.Types.Mixed },
  qrCode: { type: String },
  trangThai: { type: Boolean, default: true },
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now },
});

phuongThucThanhToanSchema.pre("save", async function (next) {
  if (this.loai === "chuyen_khoan") {
    try {
      const qrCodeData = this.chiTiet; // Using chiTiet as QR code data
      const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(qrCodeData));
      this.qrCode = qrCodeUrl;
    } catch (error) {
      return next(error);
    }
  }
  next();
});
convertToVietnamTimezone(phuongThucThanhToanSchema)
module.exports = mongoose.model(
  "PhuongThucThanhToan",
  phuongThucThanhToanSchema
);
