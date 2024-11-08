const express = require("express");
const userRoute = express.Router();
const UserModel = require("../models/NguoiDungSchema");
const bodyParser = require('body-parser');

userRoute.use(bodyParser.json());
userRoute.use(bodyParser.urlencoded({ extended: true }));
userRoute.use(express.static('public'));
const path = require('path')
const multer = require('multer');
const { uploadFiles } = require("../untils/index.js")
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/images'));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '-' + file.originalname;
    cb(null, name)
  }
})

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
} = require("../controller/user-controller");

userRoute.get("/showAllUser", function (req, res) {
  return getAllUsers(req, res);
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
userRoute.post("/createAnhDaiDien/:IDNguoiDung", async function (req, res) {
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

userRoute.post('/upload_ImageOrVideo', uploadFiles, (req, res) => {
  try {
    if (!req.files || (!req.files['image'] && !req.files['video'])) {
      return res.status(400).json({ message: 'File is required, thieu image hoac video' });
    }
    console.log("dulieu upload", req.files)
    let imageUrl = null;
    let videoUrl = null;

    if (req.files['image'] && req.files['image'][0].path) {
      imageUrl = req.files['image'][0].path.replace("public", process.env.URL_IMAGE);
    }
    if (req.files['video'] && req.files['video'][0].path) {
      videoUrl = req.files['video'][0].path.replace("public", process.env.URL_IMAGE);
    }

    // const imageUrl = req.files['image'] ? req.files['image'][0].path.replace("public", process.env.URL_IMAGE) : null;
    // const videoUrl = req.files['video'] ? req.files['video'][0].path.replace("public", process.env.URL_VIDEO) : null;
    console.log("link url", imageUrl, videoUrl)
    res.status(200).json({ imageUrl, videoUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'An error occurred while uploading the file' });
  }
})
userRoute.post("/RegisterUserGG", async function (req, res) {
  return RegisterUserGG(req, res);
});

//update image user
userRoute.post("/LoginUserGG/", async function (req, res) {
  return LoginUserGG(req, res);
});

module.exports = userRoute;
