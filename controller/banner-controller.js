const Banner = require("../models/BannerSchema");
const { uploadFileToViettelCloud } = require("../untils/index")
const { createThongBaoNoreq } = require("../helpers/helpers")
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
// async function addBanner(req, res) {
//   const { hinhAnh } = req.body;

//   if (!hinhAnh) {
//     return res.status(400).json({ message: "Chưa có hình ảnh" });
//   }

//   try {
//     const bannerCount = await Banner.countDocuments();

//     if (bannerCount >= 5) {
//       return res.status(400).json({ message: "Đã đạt số lượng banner tối đa" });
//     }

//     const newBanner = new Banner({ hinhAnh });
//     await newBanner.save();
//     res.status(201).json({ message: "Thêm banner thành công" });
//   } catch (error) {
//     console.error("Error :", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// }

// async function getAllBanners(req, res) {
//   try {
//     const banners = await Banner.find();
//     res.status(200).json(banners);
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// }
async function addBanner(req, res) {
  let { idbanner } = req.body;
  if (!idbanner) {
    idbanner = "slide"
  }
  try {
    const bucketName = process.env.VIETTEL_BUCKET;
    const file = req.file;

    let imageUrl = "";

    if (file) {
      let objectKey = "";
      if (file.mimetype.startsWith('image/')) {
        objectKey = `images/${uuidv4()}-${file.originalname}`;
      } else {
        return res.status(400).json({ message: 'Chỉ được upload image' });
      }
      try {
        imageUrl = await uploadFileToViettelCloud(file.buffer, bucketName, objectKey, file.mimetype);
      } catch (error) {
        console.error('Lỗi khi tải lên ảnh:', error);
        return res.status(500).json({ message: 'Đã xảy ra lỗi khi tải lên ảnh' });
      }

    }
    const newBanner = new Banner({ idbanner, hinhAnh: imageUrl });
    await newBanner.save();
    res.status(200).json({ message: "Banner added successfully", banner: newBanner });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding banner" });
  }
}

async function updateBanner(req, res) {
  const { id } = req.params;
  try {
    const bucketName = process.env.VIETTEL_BUCKET;
    const file = req.file;

    let imageUrl = "";

    if (file) {
      let objectKey = "";
      if (file.mimetype.startsWith('image/')) {
        objectKey = `images/${uuidv4()}-${file.originalname}`;
      } else {
        return res.status(400).json({ message: 'Chỉ được upload image' });
      }
      try {
        imageUrl = await uploadFileToViettelCloud(file.buffer, bucketName, objectKey, file.mimetype);
      } catch (error) {
        console.error('Lỗi khi tải lên ảnh:', error);
        return res.status(500).json({ message: 'Đã xảy ra lỗi khi tải lên ảnh' });
      }

    }
    if (imageUrl !== "") {
      const updatedBanner = await Banner.findOneAndUpdate(
        { _id: id },
        { hinhAnh: imageUrl },
        { new: true }
      );
      if (!updatedBanner) {
        return res.status(404).json({ message: "Banner not found" });
      }
      return res.status(200).json({ message: "Banner updated successfully", banner: updatedBanner });

    }

    return res.status(200).json({ message: "Banner updated successfully but nothing update" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating banner" });
  }
}


async function deleteBanner(req, res) {
  const { id } = req.params;
  try {
    const result = await Banner.findByIdAndUpdate({ id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Banner not found" });
    }
    res.status(200).json({ message: "Banner deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting banner" });
  }
}
async function getAllBanners(req, res) {
  let { idbanner } = req.params;
  if (!idbanner) {
    idbanner = "slide"
  }
  try {
    const banners = await Banner.find({ idbanner });
    if (banners.length === 0) {
      return res.status(404).json({ message: "No banners found" });
    }
    res.status(200).json({ message: "Banners retrieved successfully", banners });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving banners" });
  }
}

module.exports = { addBanner, getAllBanners, updateBanner, deleteBanner };
