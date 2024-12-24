const express = require("express");
const bannerRouter = express.Router();
const { addBanner, getAllBanners } = require("../controller/banner-controller");
const { checkPermissions, authenticateUser } = require("../middleware/index")

bannerRouter.post("/addBanners", async function (req, res) {
  return addBanner(req, res);
});

bannerRouter.get("/banners", async function (req, res) {
  return getAllBanners(req, res);
});

module.exports = bannerRouter;
