const Banner = require("../models/BannerSchema");

async function addBanner(req, res) {
  const { hinhAnh } = req.body;

  if (!hinhAnh) {
    return res.status(400).json({ message: "Chưa có hình ảnh" });
  }

  try {
    const bannerCount = await Banner.countDocuments();

    if (bannerCount >= 5) {
      return res.status(400).json({ message: "Đã đạt số lượng banner tối đa" });
    }

    const newBanner = new Banner({ hinhAnh });
    await newBanner.save();
    res.status(201).json({ message: "Thêm banner thành công" });
  } catch (error) {
    console.error("Error :", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function getAllBanners(req, res) {
  try {
    const banners = await Banner.find();
    res.status(200).json(banners);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = { addBanner, getAllBanners };
