const express = require("express");
const adminRouter = express.Router();
const UserModel = require("../models/NguoiDungSchema");
const { uploadFileToViettelCloud, uploadmemory } = require("../untils/index")
const {
    updateUserRoleAndPermissions,
    updateUserRoleAndPermissionsforuser,
    getListThongBaoAdmin,
    createThongBao,
    getAdminYeuCauRutTien,
    updateYeuCauRutTien,
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

adminRouter.get("/getAdminYeuCauRutTien", function (req, res) {
    return getAdminYeuCauRutTien(req, res);
});
adminRouter.put("/updateYeuCauRutTien/:requestId", function (req, res) {
    return updateYeuCauRutTien(req, res);
});


// Route xử lý upload file
const { v4: uuidv4 } = require('uuid');




// các hàm dưới đây đều là hàm thử nghiệm . không sử dụng
adminRouter.post('/upload', uploadmemory.single('file'), async (req, res) => {
    const file = req.file;
    const bucketName = process.env.VIETTEL_BUCKET;
    if (!file) { return res.status(400).json({ error: 'No file uploaded' }); }
    console.log("file", file)
    try {
        const objectKey = file.mimetype.startsWith('image/') ? `images/${uuidv4()}-${file.originalname}` : `videos/${uuidv4()}-${file.originalname}`;

        // const result = await uploadFileToViettelCloud(file.buffer, bucketName, objectKey, file.mimetype);
        // const fileUrl = `${process.env.VIETTEL_BASE_URL}${bucketName}/${objectKey}`;
        const data = await uploadFileToViettelCloud(file.buffer, bucketName, objectKey, file.mimetype);
        console.log("file", data)
        res.status(200).json({ message: 'File uploaded successfully', data });
    } catch (error) {
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
});

adminRouter.post('/upload-multiple', uploadmemory.array('files'), async (req, res) => {
    const files = req.files;
    const bucketName = process.env.VIETTEL_BUCKET;

    if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
    }

    try {
        const uploadPromises = files.map(file => {
            const objectKey = file.mimetype.startsWith('image/') ? `images/${uuidv4()}-${file.originalname}` : `videos/${uuidv4()}-${file.originalname}`;
            return uploadFileToViettelCloud(file.buffer, bucketName, objectKey, file.mimetype);
        });

        const fileUrls = await Promise.all(uploadPromises);
        console.log('files', fileUrls);

        // Lưu đường link vào cơ sở dữ liệu
        // const newRecords = fileUrls.map(url => new DatabaseModel({
        //     fileUrl: url,
        //     mimeType: file.mimetype,
        //     originalName: file.originalname,
        //     uploadDate: new Date(),
        // }));
        // await DatabaseModel.insertMany(newRecords);

        res.status(200).json({ message: 'Files uploaded successfully', fileUrls });
    } catch (error) {
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
});

adminRouter.post('/upload-max-4', uploadmemory.array('files', 4), async (req, res) => {
    const files = req.files;
    const bucketName = process.env.VIETTEL_BUCKET;

    if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
    }

    try {
        const uploadPromises = files.map(file => {
            const objectKey = file.mimetype.startsWith('image/') ? `images/${uuidv4()}-${file.originalname}` : `videos/${uuidv4()}-${file.originalname}`;
            return uploadFileToViettelCloud(file.buffer, bucketName, objectKey, file.mimetype);
        });

        const fileUrls = await Promise.all(uploadPromises);
        console.log('files', fileUrls);

        // Lưu đường link vào cơ sở dữ liệu
        // const newRecords = fileUrls.map(url => new DatabaseModel({
        //     fileUrl: url,
        //     mimeType: file.mimetype,
        //     originalName: file.originalname,
        //     uploadDate: new Date(),
        // }));
        // await DatabaseModel.insertMany(newRecords);

        res.status(200).json({ message: 'Files uploaded successfully', fileUrls });
    } catch (error) {
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
});

adminRouter.post('/upload-mixed', uploadmemory.any(), async (req, res) => {
    const files = req.files;
    const bucketName = process.env.VIETTEL_BUCKET;

    if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
    }

    try {
        const uploadPromises = files.map(file => {
            const objectKey = file.mimetype.startsWith('image/') ? `images/${uuidv4()}-${file.originalname}` : `videos/${uuidv4()}-${file.originalname}`;
            return uploadFileToViettelCloud(file.buffer, bucketName, objectKey, file.mimetype);
        });

        const fileUrls = await Promise.all(uploadPromises);
        console.log('files', fileUrls);

        // Lưu đường link vào cơ sở dữ liệu
        // const newRecords = fileUrls.map(url => new DatabaseModel({
        //     fileUrl: url,
        //     mimeType: file.mimetype,
        //     originalName: file.originalname,
        //     uploadDate: new Date(),
        // }));
        // await DatabaseModel.insertMany(newRecords);

        res.status(200).json({ message: 'Files uploaded successfully', fileUrls });
    } catch (error) {
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
});


module.exports = adminRouter;
