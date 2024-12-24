const express = require("express");
const bannerRouter = express.Router();
const { addBanner, getAllBanners, updateBanner, deleteBanner } = require("../controller/banner-controller");
const { checkPermissions, authenticateUser } = require("../middleware/index")
const { uploadmemory } = require("../untils/index")

bannerRouter.post("/addBanners", uploadmemory.single("file"), async function (req, res) {
  return addBanner(req, res);
});
bannerRouter.put("/updateBanner/:id", uploadmemory.single("file"), async function (req, res) {
  return updateBanner(req, res);
});
bannerRouter.delete("/deleteBanner/:id", async function (req, res) {
  return deleteBanner(req, res);
});
bannerRouter.get("/banners", async function (req, res) {
  return getAllBanners(req, res);
});

module.exports = bannerRouter;
