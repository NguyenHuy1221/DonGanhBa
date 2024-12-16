const express = require("express");
const userRoute = express.Router();
const UserModel = require("../models/NguoiDungSchema");
const bodyParser = require('body-parser');
const YeuCauRutTienSchema = require("../models/YeuCauRutTienSchema.js")
userRoute.use(bodyParser.json());
userRoute.use(bodyParser.urlencoded({ extended: true }));
userRoute.use(express.static('public'));
const path = require('path')
const multer = require('multer');
const { uploadFiles } = require("../untils/index.js")
const { uploadmemory, uploadFileToViettelCloud } = require("../untils/index")
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/images'));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '-' + file.originalname;
    cb(null, name)
  }
})
const { checkPermissions } = require("../middleware/index")

const upload = multer({ storage: storage })
const {
  RegisterUser,
  loginUser,
  VerifyOTP,
  SendOtpForgotPassword,
  CheckOtpForgotPassword,
  SendPassword,
  ResetPassword,
  createAnhDaiDien,
  showUserById,
  updateUser,
  updateUserDiaChi,
  ResendOTP,
  saveChat,
  RegisterUserGG,
  LoginUserGG,
  getAllUsers,
  updateUser12,
  toggleFollowUser,
  findUserById,
  getListThongBao,
  updateDaDoc,
  updateDaDocAll,
  deleteThongBao,
  deleteAllThongBao,
  getUserFollowers,
  createYeuCauRutTien,
  resendYeuCauRutTien,
  getListYeuCauRutTienByuserId,
  deleteYeuCauRutTienCoDieuKien,
  saveFcmTokenFireBase,
  loginXacMinh,
  getHoKinhDoanhInFoNumberById,
} = require("../controller/user-controller");

userRoute.get("/showAllUser/:userId", checkPermissions("nguoidung", ""), function (req, res) {
  return getAllUsers(req, res);
});
userRoute.get("/getHoKinhDoanhInFoNumberById/:userId", function (req, res) {
  return getHoKinhDoanhInFoNumberById(req, res);
});

// show user
userRoute.get("/showUserID/:userId", function (req, res) {
  return showUserById(req, res);
});

// register user
userRoute.post("/register", async function (req, res) {
  return RegisterUser(req, res);
});

userRoute.post("/resendOTP", async function (req, res) {
  return ResendOTP(req, res);
});

// otp
userRoute.post("/verifyOtp", async function (req, res) {
  return VerifyOTP(req, res);
});

// register user
userRoute.post("/login", async function (req, res) {
  return loginUser(req, res);
});

// forgot password
userRoute.post("/SendOtpForgotPassword", async function (req, res) {
  return SendOtpForgotPassword(req, res);
});

userRoute.post("/CheckOtpForgotPassword", async function (req, res) {
  return CheckOtpForgotPassword(req, res);
});

// reset password
userRoute.post("/SendPassword", async function (req, res) {
  return SendPassword(req, res);
});
userRoute.post("/ResetPassword", async function (req, res) {
  return ResetPassword(req, res);
});

//update image user
userRoute.post("/createAnhDaiDien/:IDNguoiDung", uploadmemory.single("file", 1), async function (req, res) {
  return createAnhDaiDien(req, res);
});

userRoute.put("/updateUser", async function (req, res) {
  return updateUser(req, res);
});

userRoute.put("/updateUser12/:id", async function (req, res) {
  return updateUser12(req, res);
});

// });
userRoute.put("/updateUserDiaChi", async function (req, res) {
  return updateUserDiaChi(req, res);
});
userRoute.post("/saveChat", async function (req, res) {
  return saveChat(req, res);
});

// userRoute.post('/upload_ImageOrVideo', uploadFiles, (req, res) => {
//   try {
//     if (!req.files || (!req.files['image'] && !req.files['video'])) {
//       return res.status(400).json({ message: 'File is required, thieu image hoac video' });
//     }
//     console.log("dulieu upload", req.files)
//     let imageUrl = null;
//     let videoUrl = null;

//     if (req.files['image'] && req.files['image'][0].path) {
//       imageUrl = req.files['image'][0].path.replace("public", process.env.URL_IMAGE);
//     }
//     if (req.files['video'] && req.files['video'][0].path) {
//       videoUrl = req.files['video'][0].path.replace("public", process.env.URL_IMAGE);
//     }

//     // const imageUrl = req.files['image'] ? req.files['image'][0].path.replace("public", process.env.URL_IMAGE) : null;
//     // const videoUrl = req.files['video'] ? req.files['video'][0].path.replace("public", process.env.URL_VIDEO) : null;
//     console.log("link url", imageUrl, videoUrl)
//     res.status(200).json({ imageUrl, videoUrl });
//   } catch (error) {
//     console.error('Error uploading file:', error);
//     res.status(500).json({ message: 'An error occurred while uploading the file' });
//   }
// })


const uploadFile = uploadmemory.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]);

userRoute.post('/upload_ImageOrVideo', uploadFile, async (req, res) => {
  try {
    if (!req.files || (!req.files['image'] && !req.files['video'])) {
      return res.status(400).json({ message: 'File is required, thiếu image hoặc video' });
    }
    console.log("dulieu upload", req.files);
    let imageUrl = null;
    let videoUrl = null;

    const bucketName = process.env.VIETTEL_BUCKET;

    // Upload ảnh nếu có
    if (req.files['image'] && req.files['image'][0]) {
      const imageFile = req.files['image'][0];
      if (imageFile.mimetype.startsWith('image/')) {
        const objectKey = `images/${uuidv4()}-${imageFile.originalname}`;
        try {
          imageUrl = await uploadFileToViettelCloud(imageFile.buffer, bucketName, objectKey, imageFile.mimetype);
        } catch (error) {
          console.error('Lỗi khi tải lên ảnh:', error);
          return res.status(500).json({ message: 'Đã xảy ra lỗi khi tải lên ảnh' });
        }
      } else {
        return res.status(400).json({ message: 'Chỉ được upload image' });
      }
    }

    // Upload video nếu có
    if (req.files['video'] && req.files['video'][0]) {
      const videoFile = req.files['video'][0];
      if (videoFile.mimetype.startsWith('video/')) {
        const objectKey = `videos/${uuidv4()}-${videoFile.originalname}`;
        try {
          videoUrl = await uploadFileToViettelCloud(videoFile.buffer, bucketName, objectKey, videoFile.mimetype);
        } catch (error) {
          console.error('Lỗi khi tải lên video:', error);
          return res.status(500).json({ message: 'Đã xảy ra lỗi khi tải lên video' });
        }
      } else {
        return res.status(400).json({ message: 'Chỉ được upload video' });
      }
    }

    console.log("link url", imageUrl, videoUrl);
    res.status(200).json({ imageUrl, videoUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'lỗi sever khi upload' });
  }
});

userRoute.post("/RegisterUserGG", async function (req, res) {
  return RegisterUserGG(req, res);
});

//update image user
userRoute.post("/LoginUserGG/", async function (req, res) {
  return LoginUserGG(req, res);
});
userRoute.post("/toggleFollowUser", async function (req, res) {
  return toggleFollowUser(req, res);
});
userRoute.get("/findUserById/:userId/:me", async function (req, res) {
  return findUserById(req, res);
});
userRoute.get("/getUserFollowers/:userId", async function (req, res) {
  return getUserFollowers(req, res);
});


userRoute.get("/getListThongBao/:userId", async function (req, res) {
  return getListThongBao(req, res);
});
userRoute.put("/updateDaDoc/:thongBaoId", async function (req, res) {
  return updateDaDoc(req, res);
});
userRoute.put("/updateDaDocAll/:userId", async function (req, res) {
  return updateDaDocAll(req, res);
});

userRoute.delete("/deleteThongBao/:thongBaoId", async function (req, res) {
  return deleteThongBao(req, res);
});
userRoute.delete("/deleteAllThongBao/:userId", async function (req, res) {
  return deleteAllThongBao(req, res);
});
userRoute.post("/createYeuCauRutTien", async function (req, res) {
  return createYeuCauRutTien(req, res);
});
userRoute.post("/resendYeuCauRutTien/:yeuCauId", async function (req, res) {
  return resendYeuCauRutTien(req, res);
});

userRoute.get("/getListYeuCauRutTienByuserId/:userId", async function (req, res) {
  return getListYeuCauRutTienByuserId(req, res);
});
userRoute.delete("/deleteYeuCauRutTienCoDieuKien/:yeuCauId", async function (req, res) {
  return deleteYeuCauRutTienCoDieuKien(req, res);
});

userRoute.post("/saveFcmTokenFireBase", async function (req, res) {
  return saveFcmTokenFireBase(req, res);
});


userRoute.get("/verify/:token", async function (req, res) {
  const { token } = req.params;
  try {
    const yeucaurutien = await YeuCauRutTienSchema.findOne({ verificationToken: token });
    if (!yeucaurutien) {
      //return res.status(400).json({ message: "Bạn đã xác thực rồi" });
      return res.render('dashboard/thankyou', { message: "Xác thực thất bại.", icon: "fa-times", info: "Rất tiếc! Yêu cầu rút tiền của bạn xác thực thất bại , vui lòng thử lại hoặc liên hệ với bên chăm sóc khách hàng của Đòn Gánh." });
    }
    yeucaurutien.XacThuc = true
    // user.isVerified = true;
    yeucaurutien.verificationToken = undefined; // Xóa mã sau khi xác nhận
    await yeucaurutien.save();
    return res.render('dashboard/thankyou', { message: "Xác thực thành công.", icon: "fa-check", info: "Xin chúc mừng! . Yêu cầu rút tiền của bạn đã thành công, vui lòng chờ nhân viên của chúng tôi gửi tiền , có thể mất 1 đến 2 ngày." });
  } catch (error) {
    console.error("Lỗi khi xác nhận tài khoản:", error);
    return res.render('dashboard/thankyou', { message: "Lỗi xác thực.", icon: "fa-times", info: "Rất tiếc! Yêu cầu rút tiền của bạn xác thực thất bại , vui lòng thử lại hoặc liên hệ với bên chăm sóc khách hàng của Đòn Gánh." });
  }
});

userRoute.post("/loginXacMinh/:userId", async function (req, res) {
  return loginXacMinh(req, res);
});


module.exports = userRoute;
