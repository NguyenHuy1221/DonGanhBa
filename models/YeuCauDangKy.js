const mongoose = require("mongoose");
const { Schema } = mongoose;
const { convertToVietnamTimezone } = require('../middleware/index');

const YeuCauDangKySchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    soluongloaisanpham: { type: Number },
    soluongsanpham: { type: Number },
    gmail: { type: String },
    ghiChu: { type: String },
    maSoThue: { type: String },
    anhGiayPhepHoKinhDoanh: { type: String },
    diaChi: {
        tinhThanhPho: String,
        quanHuyen: String,
        phuongXa: String,
        duongThon: String,
        Name: { type: String },
        SoDienThoai: { type: String },
        kinhdo: { type: String },
        vido: { type: String }
    },
    hinhthucgiaohang: { type: String, enum: ['tugiao', 'denlay'], default: 'tugiao' },
    trangThai: { type: String, enum: ['cho', 'xacnhan', 'huy'], default: 'cho' },
    ngayTao: { type: Date, default: Date.now },
}, {
    timestamps: true
});

convertToVietnamTimezone(YeuCauDangKySchema);
module.exports = mongoose.model("YeuCauDangKy", YeuCauDangKySchema);
