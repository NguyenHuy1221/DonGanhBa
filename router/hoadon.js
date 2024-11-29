const express = require('express');
const hoadonRouter = express.Router();
const { getlistHoaDon,
    getHoaDonByUserId,
    getHoaDonByHoKinhDoanhId,
    getHoaDonByHoaDonId,
    getHoaDonByHoaDonForHoKinhDoanhId,
    createUserDiaChivaThongTinGiaoHang,
    updateTransactionHoaDon,
    updateTransactionlistHoaDon,
    updateTransactionHoaDonCOD,
    updateTransactionListHoaDonCOD,
    Checkdonhangbaokim,
    updatetrangthaihuydonhang,

    getHoaDonByHoaDonIdFullVersion,
    NhanThanhToanTuBaoKim,
    HuyDonHang,
    updateDiaChighichuHoaDon,
    updatetrangthaiHoaDOn,
} = require("../controller/HoaDon-controller")

hoadonRouter.get('/getlistHoaDon', async function (req, res) {
    return getlistHoaDon(req, res);
})


hoadonRouter.get("/getHoaDonByUserId/:userId", function (req, res) {
    return getHoaDonByUserId(req, res);
});
hoadonRouter.get("/getHoaDonByHoKinhDoanhId/:userId", function (req, res) {
    return getHoaDonByHoKinhDoanhId(req, res);
});

hoadonRouter.get("/getHoaDonByHoaDonId/:hoadonId", function (req, res) {
    return getHoaDonByHoaDonId(req, res);
});
hoadonRouter.get("/getHoaDonByHoaDonForHoKinhDoanhId/:hoadonId", function (req, res) {
    return getHoaDonByHoaDonForHoKinhDoanhId(req, res);
});

hoadonRouter.get("/getHoaDonByHoaDonIdFullVersion/:hoadonId", function (req, res) {
    return getHoaDonByHoaDonIdFullVersion(req, res);
});


hoadonRouter.post('/createUserDiaChivaThongTinGiaoHang', async function (req, res) {
    return createUserDiaChivaThongTinGiaoHang(req, res);
})
hoadonRouter.post('/updateTransactionHoaDon/:hoadonId', async function (req, res) {
    return updateTransactionHoaDon(req, res);
})
hoadonRouter.post('/updateTransactionlistHoaDon', async function (req, res) {
    return updateTransactionlistHoaDon(req, res);
})

hoadonRouter.get('/Checkdonhangbaokim/:orderId', async function (req, res) {
    return Checkdonhangbaokim(req, res);
})
hoadonRouter.put('/updatetrangthaihuydonhang/:hoadonId', async function (req, res) {
    return updatetrangthaihuydonhang(req, res);
})
hoadonRouter.put('/updateTransactionHoaDonCOD/:hoadonId', async function (req, res) {
    return updateTransactionHoaDonCOD(req, res);
})
hoadonRouter.put('/updateTransactionListHoaDonCOD', async function (req, res) {
    return updateTransactionListHoaDonCOD(req, res);
})

// hoadonRouter.delete('/updateTransactionHoaDonCOD/:hoadonId', async function (req, res) {
//     return updateTransactionHoaDonCOD(req, res);
// })

hoadonRouter.get('/NhanThanhToanTuBaoKim/:hoadonId', async function (req, res) {
    return NhanThanhToanTuBaoKim(req, res);
})
hoadonRouter.post('/HuyDonHang/:hoadonId', async function (req, res) {
    return HuyDonHang(req, res);
})
hoadonRouter.post('/updateDiaChighichuHoaDon/:hoadonId', async function (req, res) {
    return updateDiaChighichuHoaDon(req, res);
})
hoadonRouter.post('/updatetrangthaiHoaDOn/:hoadonId', async function (req, res) {
    return updatetrangthaiHoaDOn(req, res);
})

// hoadonRouter.get('/findThuocTinh', async function (req, res) {
//     return findThuocTinh(req, res);
// })

// hoadonRouter.post('/createThuocTinh', async function (req, res) {
//     return createThuocTinh(req, res);
// })

// hoadonRouter.put('/updateThuocTinh', async function (req, res) {
//     return updateThuocTinh(req, res);
// })
// hoadonRouter.delete('/deleteThuocTinh', async function (req, res) {
//     return deleteThuocTinh(req, res);
// })




module.exports = hoadonRouter;