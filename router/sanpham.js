const express = require("express");
const sanphamRouter = express.Router();
const {
  getlistSanPham,
  toggleSanPhamMoi,
  getSanPhamListNew_Old,
  createSanPham,
  updateHinhBoSung,
  createThuocTinhSanPham,
  createSanPhamVoiBienThe,
  getlistBienThe,
  createBienTheThuCong,
  updateBienTheThuCong,
  deleteBienTheThuCong,
  updateSanPham,
  deleteSanPham,
  updateTinhTrangSanPham,
  findSanPham,
  getlistPageSanPham,
  findSanPhambyID,
  getlistBienTheInSanPham,
  findSanPhamByDanhMuc,
  sapXepSanPhamTheoGia,
  sapXepSanPhamTheoGiaGiamDan,
  sapXepSanPhamTheoNgayTao,
  sapXepSanPhamNgayTaoGiamDan,
  sapXepSanPhamBanChayNhat,
  sapXepSanPhamCoGiamGia,
  createSanPhamtest,
  getDanhSachThuocTinhTrongSanPham,
  searchSanPham,
  checkNumberProductvaBienthe,
  searchSanPhamtest,
} = require("../controller/sanpham-controller");
sanphamRouter.post("/createSanPhamtest", async function (req, res) {
  return createSanPhamtest(req, res);
});
sanphamRouter.get("/getlistSanPham", async function (req, res) {
  return getlistSanPham(req, res);
});
sanphamRouter.get("/getSanPhamListNew_Old", async function (req, res) {
  return getSanPhamListNew_Old(req, res);
});
sanphamRouter.post("/toggleSanPhamMoi/:IDSanPham", async function (req, res) {
  return toggleSanPhamMoi(req, res);
});
sanphamRouter.post("/createSanPham", async function (req, res) {
  return createSanPham(req, res);
});
sanphamRouter.post("/updateHinhBoSung/:IDSanPham", async function (req, res) {
  return updateHinhBoSung(req, res);
});
sanphamRouter.post("/createThuocTinhSanPham/:IDSanPham", async function (req, res) {
  return createThuocTinhSanPham(req, res);
});
// sanphamRouter.post("/createbienthesanpham", async function (req, res) {return createbienthesanpham(req, res);
// });
sanphamRouter.post("/createSanPhamVoiBienThe/:IDSanPham", async function (req, res) {
  return createSanPhamVoiBienThe(req, res);
});
sanphamRouter.put("/updateSanPham/:id", async function (req, res) {
  return updateSanPham(req, res);
});
sanphamRouter.put("/deleteSanPham/:IDSanPham", async function (req, res) {
  return deleteSanPham(req, res);
});
sanphamRouter.put("/updateTinhTrangSanPham/:IDSanPham", async function (req, res) {
  return updateTinhTrangSanPham(req, res);
});


sanphamRouter.get("/getDanhSachThuocTinhTrongSanPham/:IDSanPham", async function (req, res) {
  return getDanhSachThuocTinhTrongSanPham(req, res);
});
sanphamRouter.get("/getlistBienThe/:IDSanPham", async function (req, res) {
  return getlistBienThe(req, res);
});
sanphamRouter.post("/createBienTheThuCong/:IDSanPham", async function (req, res) {
  return createBienTheThuCong(req, res);
});

sanphamRouter.put("/updateBienTheThuCong/:IDBienThe", async function (req, res) {
  return updateBienTheThuCong(req, res);
});
sanphamRouter.delete("/deleteBienTheThuCong/:IDBienThe", async function (req, res) {
  return deleteBienTheThuCong(req, res);
});

sanphamRouter.put("/updateReview", async function (req, res) {
  return updateReview(req, res);
});
sanphamRouter.delete("/deleteReview", async function (req, res) {
  return DeleteReview(req, res);
});

sanphamRouter.get("/getlistPageSanPham/:page", async function (req, res) {
  return getlistPageSanPham(req, res);
});

// sanphamRouter.put("/createimageSanPham", async function (req, res) {
//   return createimageSanPham(req, res);
// });
// sanphamRouter.put("/updateimageSanPham", async function (req, res) {
//   return updateimageSanPham(req, res);
// });
// sanphamRouter.delete("/deleteImageSanPham", async function (req, res) {
//   return deleteImageSanPham(req, res);
// });
// sanphamRouter.get("/findSanPhambyID:IDSanPham", async function (req, res) {
//   return findSanPhambyID(req, res);
// });
sanphamRouter.get(
  "/getlistBienTheInSanPham/:IDSanPham",
  async function (req, res) {
    return getlistBienTheInSanPham(req, res);
  }
);
sanphamRouter.get("/getlistPageSanPham", async function (req, res) {
  return getlistPageSanPham(req, res);
});

// sanphamRouter.put("/createimageSanPham", async function (req, res) {
//   return createimageSanPham(req, res);
// });
// sanphamRouter.put("/updateimageSanPham", async function (req, res) {
//   return updateimageSanPham(req, res);
// });
// sanphamRouter.delete("/deleteImageSanPham", async function (req, res) {
//   return deleteImageSanPham(req, res);
// });

// sanphamRouter.get("/findSanPhambyID", async function (req, res) {
//   return findSanPhambyID(req, res);
// });
sanphamRouter.put("/createimageSanPham", async function (req, res) {
  return createimageSanPham(req, res);
});
sanphamRouter.put("/updateimageSanPham", async function (req, res) {
  return updateimageSanPham(req, res);
});
sanphamRouter.delete("/deleteImageSanPham", async function (req, res) {
  return deleteImageSanPham(req, res);
});
//dang su dung
sanphamRouter.get("/findSanPhambyID/:IDSanPham", async function (req, res) {
  return findSanPhambyID(req, res);
});
sanphamRouter.get("/findSanPham/:IDDanhMuc", async function (req, res) {
  return findSanPhamByDanhMuc(req, res);
});



//xap xep san pham
sanphamRouter.get("/sapXepSanPhamTheoGia", async function (req, res) {
  return sapXepSanPhamTheoGia(req, res);
});
sanphamRouter.get("/sapXepSanPhamTheoGiaGiamDan", async function (req, res) {
  return sapXepSanPhamTheoGiaGiamDan(req, res);
});
sanphamRouter.get("/sapXepSanPhamTheoNgayTao", async function (req, res) {
  return sapXepSanPhamTheoNgayTao(req, res);
});
sanphamRouter.get("/sapXepSanPhamNgayTaoGiamDan", async function (req, res) {
  return sapXepSanPhamNgayTaoGiamDan(req, res);
});
sanphamRouter.get("/sapXepSanPhamBanChayNhat", async function (req, res) {
  return sapXepSanPhamBanChayNhat(req, res);
});
sanphamRouter.get("/sapXepSanPhamCoGiamGia", async function (req, res) {
  return sapXepSanPhamCoGiamGia(req, res);
});
sanphamRouter.get("/searchSanPham", async function (req, res) {
  return searchSanPham(req, res);
});
sanphamRouter.get("/searchSanPhamtest", async function (req, res) {
  return searchSanPhamtest(req, res);
});

sanphamRouter.get("/checkNumberProductvaBienthe/:IDSanPham", async function (req, res) {
  return checkNumberProductvaBienthe(req, res);
});

module.exports = sanphamRouter;
