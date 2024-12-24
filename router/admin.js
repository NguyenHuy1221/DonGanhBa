const express = require("express");
const adminRouter = express.Router();
const UserModel = require("../models/NguoiDungSchema");
const admin = require('firebase-admin');
const { checkPermissions } = require("../middleware/index")
// const serviceAccount = require('../don-ganh-firebase-adminsdk-2ldcw-efac841716 (1).json'); // Đường dẫn tới file JSON đã tải về
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
// });

const { uploadFileToViettelCloud, uploadmemory } = require("../untils/index")
const {
    updateUserRoleAndPermissions,
    updateUserRoleAndPermissionsforuser,
    getListThongBaoAdmin,
    createThongBao,
    getAdminYeuCauRutTien,
    updateYeuCauRutTien,
    FixadminupdateThuocTinhIsDeleted,
} = require("../controller/admin");



adminRouter.post("/updateUserRoleAndPermissions/:userId", checkPermissions("admin", ""), function (req, res) {
    return updateUserRoleAndPermissions(req, res);
});
adminRouter.post("/updateUserRoleAndPermissionsforuser/:userId", checkPermissions("admin", ""), function (req, res) {
    return updateUserRoleAndPermissionsforuser(req, res);
});

adminRouter.get("/getListThongBaoAdmin", checkPermissions("admin", ""), function (req, res) {
    return getListThongBaoAdmin(req, res);
});
adminRouter.post("/createThongBao", function (req, res) {
    return createThongBao(req, res);
});

adminRouter.get("/getAdminYeuCauRutTien", checkPermissions("admin", ""), function (req, res) {
    return getAdminYeuCauRutTien(req, res);
});
adminRouter.put("/updateYeuCauRutTien/:requestId", checkPermissions("admin", ""), function (req, res) {
    return updateYeuCauRutTien(req, res);
});
adminRouter.post("/FixadminupdateThuocTinhIsDeleted", function (req, res) {
    return FixadminupdateThuocTinhIsDeleted(req, res);
});

// adminRouter.post('/send-notification', async (req, res) => {
//     const { title, body, token } = req.body;

//     if (!title || !body || !token) {
//         return res.status(400).json({ message: 'Thiếu thông tin cần thiết' });
//     }

//     const message = {
//         notification: {
//             title,
//             body,
//         },
//         token, // Token của thiết bị nhận
//     };

//     try {
//         const response = await admin.messaging().send(message);
//         res.status(200).json({ message: 'Thông báo đã được gửi', response });
//     } catch (error) {
//         console.error('Lỗi khi gửi thông báo:', error);
//         res.status(500).json({ message: 'Lỗi khi gửi thông báo', error });
//     }
// });
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
