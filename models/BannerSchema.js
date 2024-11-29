const mongoose = require("mongoose");
const { Schema } = mongoose;

const BannerSchema = new Schema({
  tenanh: { type: String, required: true },
  hinhAnh: { type: String, required: true },
});
module.exports = mongoose.model("Banner", BannerSchema);



