const mongoose = require("mongoose");
const { Schema } = mongoose;

const SlideSchema = new Schema({
    hinhAnh: { type: String, required: true },
    tieuDe: { type: String, required: true },
    moTa: { type: String }
});

const ImageSchema = new Schema({
    id: { type: Schema.Types.ObjectId, auto: true },
    tenAnh: { type: String, required: true },
    hinhAnh: { type: String, required: true }
});

const BannerSchema = new Schema({
    hinhAnh: { type: String, required: true },
    slides: [SlideSchema],
    images: [ImageSchema]
});

module.exports = mongoose.model("giaodien", BannerSchema);
