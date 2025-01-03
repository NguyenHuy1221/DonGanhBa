process.env.TZ = 'Asia/Ho_Chi_Minh';
const express = require("express");
const apiRoute = express.Router();
const thuoctinhRouter = require("../router/thuoctinh");
const thuoctinhgiatriRouter = require("../router/thuoctinhgiatri");
const sanphamRouter = require("../router/sanpham");
const danhmucRoute = require("../router/danhmuc");
const userRoute = require("../router/user");
const gioHangRoute = require("../router/gioHang");
const bannerRoutes = require("../router/banner");
const bientheRoute = require("../router/bienthe");
const hoadonRoute = require("../router/hoadon");
const khuyenmaiRoute = require("../router/khuyenmai");
const khuyenmaimanageRoute = require("../router/khuyenmai-manage");
const diachiRoute = require("../router/diachi");
const chatsocket = require("../router/chatsoccket");
const danhgiaRoute = require("../router/danhgia")
const yeuthichRoute = require("../router/yeuthich")
const adminRoute = require("../router/admin")
const baivietRoute = require("../router/baiviet")
const doanhthuRoute = require("../router/doanhthu")
const yeucaudangkyRoute = require("../router/yeucaudangky")
const vnpayRoute = require("../router/vnpay")
const { authenticateUser } = require("../middleware/index")
// const phuongthucthanhtoanRoute = require("../router/phuongthucthanhtoan")
// apiRoute.use("/vnpay", vnpayRoute, authenticateUser);
apiRoute.use("/yeucaudangky", authenticateUser, yeucaudangkyRoute);
apiRoute.use("/doanhthu", authenticateUser, doanhthuRoute);
apiRoute.use("/baiviet", authenticateUser, baivietRoute);
apiRoute.use("/admin", authenticateUser, adminRoute);
apiRoute.use("/user", userRoute);
apiRoute.use("/cart", authenticateUser, gioHangRoute);
apiRoute.use("/banner", authenticateUser, bannerRoutes);
apiRoute.use("/danhgia", authenticateUser, danhgiaRoute);
apiRoute.use(
  "/sanpham",
  (req, res, next) => {
    console.log("call san pham api router");
    next();
  }
  , authenticateUser,
  sanphamRouter
);

apiRoute.use(
  "/thuoctinh",
  (req, res, next) => {
    console.log("call thuoc tinh api router");
    next();
  }
  , authenticateUser,
  thuoctinhRouter
);

apiRoute.use(
  "/thuoctinhgiatri",
  (req, res, next) => {
    console.log("call thuoc tinh gia tri api router");
    next();
  }
  , authenticateUser,
  thuoctinhgiatriRouter
);

apiRoute.use(
  "/danhmuc",
  (req, res, next) => {
    console.log("call danh muc  api router");
    next();
  }
  , authenticateUser,
  danhmucRoute
);
apiRoute.use(
  "/bienthe",
  (req, res, next) => {
    console.log("call bien the api router");
    next();
  }
  , authenticateUser,
  bientheRoute
);
apiRoute.use(
  "/hoadon",
  (req, res, next) => {
    console.log("call hoadon api router");
    next();
  }
  , authenticateUser,
  hoadonRoute
);
apiRoute.use(
  "/khuyenmai",
  (req, res, next) => {
    console.log("call khuyenmai api router");
    next();
  }
  , authenticateUser,
  khuyenmaiRoute
);
apiRoute.use(
  "/khuyenmaimanage",
  (req, res, next) => {
    console.log("call khuyenmaimanage api router");
    next();
  }
  , authenticateUser,
  khuyenmaimanageRoute
);
apiRoute.use(
  "/diachi",
  (req, res, next) => {
    console.log("call diachi api router");
    next();
  }
  , authenticateUser,
  diachiRoute
);
apiRoute.use(
  "/chatsocket",
  (req, res, next) => {
    console.log("call chat socket api router");
    next();
  }
  , authenticateUser,
  chatsocket
);
apiRoute.use(
  "/yeuthich",
  (req, res, next) => {
    console.log("call yeu thich api router");
    next();
  }
  , authenticateUser,
  yeuthichRoute
);

module.exports = apiRoute;
