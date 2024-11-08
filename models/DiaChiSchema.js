const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { convertToVietnamTimezone } = require('../middleware/index');

const DiaChiSchema = new Schema({
    IDUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    
    diaChiList: [{
        Name: { type: String},
        SoDienThoai: { type: String },
        tinhThanhPho: { type: String},
        quanHuyen: { type: String },
        phuongXa: { type: String },
        duongThon: { type: String },
        isDeleted: { type: Boolean, default: false }
    }],
});

convertToVietnamTimezone(DiaChiSchema);

const DiaChi = mongoose.model('DiaChi', DiaChiSchema);

module.exports = DiaChi;
