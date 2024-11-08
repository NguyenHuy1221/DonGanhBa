const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const gioHangSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  chiTietGioHang: [
    {
      idBienThe: { type: mongoose.Schema.Types.ObjectId, ref: "BienThe" },
      soLuong: Number,
      donGia: Number,
    },
  ],
});

const GioHang = mongoose.model("GioHang", gioHangSchema);

module.exports = GioHang;
