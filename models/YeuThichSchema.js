const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const YeuThichSchema = new Schema({
    sanphams: [{
        IDSanPham: { type: Schema.Types.ObjectId, ref: 'SanPham' },
    }],
});

const YeuThich = mongoose.model('YeuThich', YeuThichSchema);

module.exports = YeuThich;
