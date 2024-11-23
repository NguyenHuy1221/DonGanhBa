const express = require("express");
const adminRouter = express.Router();
const UserModel = require("../models/NguoiDungSchema");
const { uploadFileToViettelCloud, uploadmemory } = require("../untils/index")
const {
    updateUserRoleAndPermissions,
    updateUserRoleAndPermissionsforuser,
    getListThongBaoAdmin,
    createThongBao,
} = require("../controller/admin");

adminRouter.post("/updateUserRoleAndPermissions/:userId", function (req, res) {
    return updateUserRoleAndPermissions(req, res);
});
adminRouter.post("/updateUserRoleAndPermissionsforuser/:userId", function (req, res) {
    return updateUserRoleAndPermissionsforuser(req, res);
});

adminRouter.get("/getListThongBaoAdmin", function (req, res) {
    return getListThongBaoAdmin(req, res);
});
adminRouter.post("/createThongBao", function (req, res) {
    return createThongBao(req, res);
});
// Route xử lý upload file
const { v4: uuidv4 } = require('uuid');
adminRouter.post('/upload', uploadmemory.single('file'), async (req, res) => {
    const file = req.file;
    const bucketName = 'file';
    const objectKey = file.mimetype.startsWith('image/') ? `images/${uuidv4()}-${file.originalname}` : `videos/${uuidv4()}-${file.originalname}`;

    try {
        const result = await uploadFileToViettelCloud(file.buffer, bucketName, objectKey, file.mimetype);
        res.status(200).json({ message: 'File uploaded successfully', data: result });
    } catch (error) {
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
});
module.exports = adminRouter;
