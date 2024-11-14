const mongoose = require('mongoose');
const { Schema } = mongoose;

const ThongBaoSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tieude: { type: String, required: true },
    noidung: { type: String, required: true },
    daDoc: { type: Boolean, default: false },
    ngayTao: { type: Date, default: Date.now }
});

const ThongBao = mongoose.model('ThongBao', ThongBaoSchema);

module.exports = ThongBao;
