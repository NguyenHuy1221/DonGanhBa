const express = require("express");
const gioHangRouter = express.Router();

const {
  createGioHang,
  getGioHangById,
  updateGioHang,
  deleteGioHang,
  zaloPay,
  zaloPayWebhook,
  getGioHangByUserId,
} = require("../controller/GioHang-controller");

gioHangRouter.post("/gioHang", async function (req, res) {
  return createGioHang(req, res);
});

gioHangRouter.get("/gioHang/:id", async function (req, res) {
  return getGioHangById(req, res);
});


//dang su dung cai nay
gioHangRouter.get("/giohang/user/:userId", async function (req, res) {
  return getGioHangByUserId(req, res);
});

gioHangRouter.put("/gioHang/:id", async function (req, res) {
  return updateGioHang(req, res);
});

gioHangRouter.delete("/gioHang/:id", async function (req, res) {
  return deleteGioHang(req, res);
});

gioHangRouter.post("/zaloPay/:id", async function (req, res) {
  return zaloPay(req, res);
});

gioHangRouter.post("/zaloPay/webhook", async function (req, res) {
  return zaloPayWebhook(req, res);
});

module.exports = gioHangRouter;
