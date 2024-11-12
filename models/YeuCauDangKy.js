const mongoose = require("mongoose");
const { Schema } = mongoose;
const { convertToVietnamTimezone } = require('../middleware/index');

const YeuCauDangKySchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    trangThai: { type: String, enum: ['cho', 'xacnhan', 'huy'], default: 'pending' },
    ngayTao: { type: Date, default: Date.now },
    ghiChu: String, // Ghi chú của người dùng gửi yêu cầu hoặc của admin khi xét duyệt
}, {
    timestamps: true
});

convertToVietnamTimezone(YeuCauDangKySchema);
module.exports = mongoose.model("YeuCauDangKy", YeuCauDangKySchema);
