const DanhGiamodel = require("../models/DanhGiaSchema");
const LoaiKhuyenMaiModel = require("../models/LoaiKhuyenMaiSchema")
const UserModel = require("../models/NguoiDungSchema")
const HoaDonSchema = require("../models/HoaDonSchema")
const sanPhamModel = require("../models/SanPhamSchema")
require("dotenv").config();
const { uploadFileToViettelCloud } = require("../untils/index")
const { createThongBaoNoreq } = require("../helpers/helpers")
const { v4: uuidv4 } = require('uuid');
const { upload } = require("../untils/index");
const fs = require('fs');
const BienThe = require("../models/BienTheSchema");
//ham lay danh sach thuoc tinh
// async function getListDanhGiaAdmin(req, res, next) {
//     const { startDate, endDate } = req.query;
//     const { userId } = req.params;

//     try {
//         let query = {};

//         if (startDate && endDate) {
//             // Chuyển đổi các ngày từ query sang dạng Date object
//             const start = startDate ? new Date(startDate) : new Date('1970-01-01');
//             const end = endDate ? new Date(endDate) : new Date();

//             // Thiết lập bộ lọc ngày
//             query.NgayTao = {
//                 $gte: start,
//                 $lte: end
//             };
//         }
//         // Tìm kiếm đánh giá với hoặc không có bộ lọc ngày
//         const Danhgias = await DanhGiamodel.find(query)
//             .populate("userId")
//             .populate("sanphamId")
//             .populate({
//                 path: 'PhanHoi.userId',
//             });

//         res.status(200).json(Danhgias);
//     } catch (error) {
//         console.error('Lỗi khi lấy danh sách đánh giá:', error);
//         res.status(500).json({ message: 'Lỗi khi lấy danh sách đánh giá' });
//     }
// }


async function getListDanhGiaAdmin(req, res, next) {
    const { startDate, endDate } = req.query;
    const { userId } = req.params;

    try {
        let query = {};

        // Kiểm tra userId và tìm người dùng
        if (!userId) {
            return res.status(400).json({ message: 'Chưa có userId' });
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy user bằng userid" });
        }

        // Thiết lập điều kiện truy vấn dựa trên vai trò của người dùng
        if (user.role === "admin" || user.role === "nhanvien") {
            // Admin và nhân viên có thể xem tất cả các đánh giá
        } else if (user.role === "hokinhdoanh") {
            // Lấy tất cả sản phẩm của hộ kinh doanh
            const sanPhams = await sanPhamModel.find({ userId: user._id });

            if (!sanPhams.length) {
                return res.status(404).json({ message: "Không có sản phẩm nào được tìm thấy" });
            }

            // Lấy danh sách các sản phẩm IDs
            const sanPhamIds = sanPhams.map(sanPham => sanPham._id);

            // Thêm điều kiện lọc theo danh sách sản phẩm IDs
            query.sanphamId = { $in: sanPhamIds };
        } else {
            return res.status(403).json({ message: "Không có quyền truy cập" });
        }

        // Thiết lập bộ lọc ngày nếu có
        if (startDate && endDate) {
            const start = startDate ? new Date(startDate) : new Date('1970-01-01');
            const end = endDate ? new Date(endDate) : new Date();
            query.NgayTao = {
                $gte: start,
                $lte: end
            };
        }

        // Tìm kiếm đánh giá với hoặc không có bộ lọc ngày
        const Danhgias = await DanhGiamodel.find(query)
            .populate("userId")
            .populate("sanphamId")
            .populate({
                path: 'PhanHoi.userId',
            });

        res.status(200).json(Danhgias);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách đánh giá:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách đánh giá' });
    }
}





async function getListDanhGiaInSanPhamById(req, res, next) {
    const { IDSanPham, userId } = req.params;

    try {
        const Danhgias = await DanhGiamodel.find({ sanphamId: IDSanPham })
            .populate("userId")
            .populate({
                path: 'PhanHoi.userId',
            });
        // .populate("likes")

        // Thêm trường isLiked vào mỗi đối tượng đánh giá để chỉ ra người dùng đã like hay chưa
        // const danhGiasWithLikeInfo = Danhgias.map(danhGia => {
        //     const isLiked = danhGia.likes.some(like => like._id.toString() === userId.toString());
        //     return { ...danhGia._doc, isLiked };
        // });
        const danhGiasWithLikeInfo = Danhgias.map(danhGia => {
            const isLiked = danhGia.likes.includes(userId);
            return { ...danhGia._doc, isLiked };
        });
        // console.log(danhGiasWithLikeInfo)
        res.status(200).json(danhGiasWithLikeInfo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách đánh giá' });
    }
}

// async function createDanhGia(req, res) {
//     try {
//         await upload.array('files')(req, res, async (err) => {
//             if (err) {
//                 return res.status(400).json({ message: 'Error uploading image', error: err });
//             }
//             const { userId, sanphamId, XepHang, BinhLuan } = req.body;

//             // const hinhAnh = req.file ? req.file.path.replace('public', process.env.URL_IMAGE) : null;

//             const newDanhGia = new DanhGiamodel({
//                 userId,
//                 sanphamId,
//                 XepHang,
//                 BinhLuan,
//                 NgayTao: new Date()
//             });
//             // if (req.file) {

//             //     // Lưu đường dẫn ảnh vào cơ sở dữ liệu
//             //     newDanhGia.HinhAnh = req.file.path.replace('public', process.env.URL_IMAGE);
//             // }
//             let imagePaths = [];

//             if (req.files) {
//                 console.log(req.files)
//                 req.files.forEach(file => {
//                     imagePaths.push(file.path.replace('public', process.env.URL_IMAGE));
//                 });
//                 newDanhGia.HinhAnh = imagePaths
//             }
//             await newDanhGia.save();
//             res.status(201).json(newDanhGia);
//         });
//     } catch (error) {
//         console.error('Lỗi khi tạo đánh giá:', error);
//         res.status(500).json({ message: 'Đã xảy ra lỗi khi tạo đánh giá' });
//     }
// }

// async function createDanhGia(req, res) {
//     try {
//         const { userId, sanphamId, XepHang, BinhLuan } = req.body;

//         const newDanhGia = new DanhGiamodel({
//             userId,
//             sanphamId,
//             XepHang,
//             BinhLuan,
//             NgayTao: new Date()
//         });
//         // const newDanhGia = new DanhGiamodel({
//         //     userId: "671119c9d0d9827319590cbe",
//         //     sanphamId: "6723ad5b5a4b83ab35e6344b",
//         //     XepHang: 5,
//         //     BinhLuan: "kkkk",
//         //     NgayTao: new Date()
//         // });
//         if (req.files && req.files.length > 0) {
//             console.log(req.files)
//             const bucketName = process.env.VIETTEL_BUCKET;
//             const detailFiles = req.files.filter(file => file.fieldname === 'files');

//             let detailUrls = [];

//             if (detailFiles && detailFiles.length > 0) {
//                 const uploadPromises = detailFiles.map(file => {
//                     let objectKey = "";
//                     if (file.mimetype.startsWith('image/')) {
//                         objectKey = `images/${uuidv4()}-${file.originalname}`;
//                     } else {
//                         return Promise.reject(new Error('Chỉ được upload image'));
//                     }
//                     return uploadFileToViettelCloud(file.buffer, bucketName, objectKey, file.mimetype);
//                 });

//                 try {
//                     detailUrls = await Promise.all(uploadPromises);
//                 } catch (error) {
//                     console.error('Lỗi khi tải lên ảnh chi tiết:', error);
//                     return res.status(500).json({ message: 'Đã xảy ra lỗi khi tải lên ảnh chi tiết' });
//                 }
//             }

//             newDanhGia.HinhAnh = detailUrls;
//         }

//         await newDanhGia.save();
//         res.status(201).json(newDanhGia);
//     } catch (error) {
//         console.error('Lỗi khi tạo đánh giá:', error);
//         res.status(500).json({ message: 'Đã xảy ra lỗi khi tạo đánh giá' });
//     }
// }
async function createDanhGia(req, res) {
    try {
        const { userId, sanphamId, XepHang, BinhLuan } = req.body;
        const sanpham = await sanPhamModel.findById(sanphamId)
        if (!sanpham) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại.' });

        }
        // Kiểm tra xem người dùng đã mua sản phẩm chưa
        const hoaDons = await HoaDonSchema.find({
            userId,
            TrangThai: 3
        }).populate('chiTietHoaDon.idBienThe'); // Populate idBienThe để lấy thông tin sản phẩm

        let hasPurchased = false;

        for (const hoaDon of hoaDons) {
            for (const chiTiet of hoaDon.chiTietHoaDon) {
                const bienThe = await BienThe.findById(chiTiet.idBienThe).populate('IDSanPham');
                if (bienThe && bienThe.IDSanPham.toString() === sanphamId) {
                    hasPurchased = true;
                    break;
                }
            }
            if (hasPurchased) break;
        }

        if (!hasPurchased) {
            return res.status(400).json({ message: 'Bạn chưa mua sản phẩm này, không thể đánh giá.' });
        }

        // Kiểm tra xem người dùng đã đánh giá sản phẩm này chưa
        const existingDanhGia = await DanhGiamodel.findOne({ userId, sanphamId });
        if (existingDanhGia) {
            return res.status(400).json({ message: 'Bạn đã đánh giá sản phẩm này rồi.' });
        }

        // Tạo đánh giá mới
        const newDanhGia = new DanhGiamodel({
            userId,
            sanphamId,
            XepHang,
            BinhLuan,
            NgayTao: new Date(),
        });

        // Xử lý upload hình ảnh nếu có
        if (req.files && req.files.length > 0) {
            const bucketName = process.env.VIETTEL_BUCKET;
            const detailFiles = req.files.filter(file => file.fieldname === 'files');

            let detailUrls = [];

            if (detailFiles && detailFiles.length > 0) {
                const uploadPromises = detailFiles.map(file => {
                    let objectKey = "";
                    if (file.mimetype.startsWith('image/')) {
                        objectKey = `images/${uuidv4()}-${file.originalname}`;
                    } else {
                        return Promise.reject(new Error('Chỉ được upload image'));
                    }
                    return uploadFileToViettelCloud(file.buffer, bucketName, objectKey, file.mimetype);
                });

                try {
                    detailUrls = await Promise.all(uploadPromises);
                } catch (error) {
                    console.error('Lỗi khi tải lên ảnh chi tiết:', error);
                    return res.status(500).json({ message: 'Đã xảy ra lỗi khi tải lên ảnh chi tiết' });
                }
            }

            newDanhGia.HinhAnh = detailUrls;
        }
        await createThongBaoNoreq(sanpham.userId, "newCommentDanhGia")

        await newDanhGia.save();
        return res.status(201).json(newDanhGia);
    } catch (error) {
        console.error('Lỗi khi tạo đánh giá:', error);
        return res.status(500).json({ message: 'Đã xảy ra lỗi khi tạo đánh giá' });
    }
}


// async function updateDanhGia(req, res) {
//     try {
//         await upload.single('file')(req, res, async (err) => {
//             if (err) {
//                 return res.status(400).json({ message: 'Error uploading image', error: err });
//             }
//             const { danhGiaId } = req.params;
//             const { XepHang, BinhLuan } = req.body;
//             //const hinhAnh = req.file ? req.file.path.replace('public', process.env.URL_IMAGE) : null;
//             // Tìm đánh giá để cập nhật
//             console.log(danhGiaId, XepHang, BinhLuan)
//             let updatedDanhGia = await DanhGiamodel.findById(danhGiaId);
//             if (!updatedDanhGia) {
//                 return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
//             }

//             // Cập nhật đánh giá
//             updatedDanhGia.XepHang = XepHang;
//             updatedDanhGia.BinhLuan = BinhLuan;
//             updatedDanhGia.NgayTao = new Date();

//             if (req.file) {
//                 // Xóa ảnh cũ (nếu có)
//                 if (updatedDanhGia.HinhAnh) {
//                     await deleteImage(updatedDanhGia.HinhAnh);
//                 }
//                 // Cập nhật đường dẫn ảnh mới
//                 updatedDanhGia.HinhAnh = req.file.path.replace('public', process.env.URL_IMAGE);
//             }

//             // Lưu đánh giá đã cập nhật
//             await updatedDanhGia.save();
//             res.status(200).json(updatedDanhGia);
//         });
//     } catch (error) {
//         console.error('Lỗi khi cập nhật đánh giá:', error);
//         res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật đánh giá' });
//     }
// }

async function updateDanhGia(req, res) {
    try {
        const { danhGiaId } = req.params;
        const { XepHang, BinhLuan } = req.body;

        let updatedDanhGia = await DanhGiamodel.findById(danhGiaId);
        if (!updatedDanhGia) {
            return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
        }

        // Cập nhật đánh giá
        updatedDanhGia.XepHang = XepHang;
        updatedDanhGia.BinhLuan = BinhLuan;
        updatedDanhGia.NgayTao = new Date();

        if (req.files && req.files.length > 0) {
            const bucketName = process.env.VIETTEL_BUCKET;
            const detailFiles = req.files.filter(file => file.fieldname === 'files');

            let detailUrls = [];

            if (detailFiles && detailFiles.length > 0) {
                const uploadPromises = detailFiles.map(file => {
                    let objectKey = "";
                    if (file.mimetype.startsWith('image/')) {
                        objectKey = `images/${uuidv4()}-${file.originalname}`;
                    } else {
                        return Promise.reject(new Error('Chỉ được upload image'));
                    }
                    return uploadFileToViettelCloud(file.buffer, bucketName, objectKey, file.mimetype);
                });

                try {
                    detailUrls = await Promise.all(uploadPromises);
                } catch (error) {
                    console.error('Lỗi khi tải lên ảnh chi tiết:', error);
                    return res.status(500).json({ message: 'Đã xảy ra lỗi khi tải lên ảnh chi tiết' });
                }
            }

            const oldImages = updatedDanhGia.HinhAnh || [];
            const newImages = detailUrls;

            const combinedImages = [...new Set([...oldImages, ...newImages])];
            const imagesToDelete = oldImages.filter(image => !newImages.includes(image));

            for (const image of imagesToDelete) {
                await deleteImage(image);
            }

            updatedDanhGia.HinhAnh = combinedImages.filter(image => !imagesToDelete.includes(image));
        }

        await updatedDanhGia.save();
        res.status(200).json({ message: 'Cập nhật đánh giá thành công', updatedDanhGia });
    } catch (error) {
        console.error('Lỗi khi cập nhật đánh giá:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật đánh giá' });
    }
};



async function updateLike(req, res) {
    try {
        const { phanHoiId, userId } = req.params;

        // Tìm kiếm đánh giá để kiểm tra xem userId đã tồn tại trong mảng likes hay chưa
        const danhGia = await DanhGiamodel.findById(phanHoiId);
        if (!danhGia) {
            return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
        }

        let update;
        if (danhGia.likes.includes(userId)) {
            // Nếu userId đã tồn tại, xóa nó khỏi mảng likes
            update = { $pull: { likes: userId } };
        } else {
            // Nếu userId chưa tồn tại, thêm nó vào mảng likes
            update = { $addToSet: { likes: userId } };
        }

        const updatedDanhGia = await DanhGiamodel.findOneAndUpdate(
            { _id: phanHoiId },
            update,
            { new: true }
        );

        res.status(200).json(updatedDanhGia);
    } catch (error) {
        console.error('Lỗi khi cập nhật đánh giá:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật đánh giá' });
    }
}


async function deleteDanhGia(req, res) {
    try {
        const { sanphamId, danhGiaId } = req.params;

        const deletedDanhGia = await DanhGiamodel.findByIdAndDelete(danhGiaId);

        if (!deletedDanhGia) {
            return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
        }
        // if (deletedDanhGia.HinhAnh) {
        //     await deleteImage(deletedDanhGia.HinhAnh);
        // }
        const Danhgias = await DanhGiamodel.find({ sanphamId: sanphamId });
        res.status(200).json(Danhgias);
    } catch (error) {
        console.error('Lỗi khi xóa đánh giá:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi xóa đánh giá' });
    }
}
async function addPhanHoi(req, res) {
    try {
        const { danhGiaId } = req.params;
        const { userId, BinhLuan } = req.body;

        const danhGia = await DanhGiamodel.findById(danhGiaId);

        if (!danhGia) {
            return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
        }
        danhGia.PhanHoi.push({
            userId,
            BinhLuan,
            NgayTao: new Date()
        });
        await createThongBaoNoreq(danhGia.userId, "newCommentDanhGiaPhanHoi")

        await danhGia.save();
        res.status(200).json(danhGia);
    } catch (error) {
        console.error('Lỗi khi thêm phản hồi:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi thêm phản hồi' });
    }
}
async function updatePhanHoi(req, res) {
    try {
        const { danhGiaId, phanHoiId } = req.params;
        const { BinhLuan } = req.body;

        const danhGia = await DanhGiamodel.findById(danhGiaId);

        if (!danhGia) {
            return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
        }

        const phanHoi = danhGia.PhanHoi.id(phanHoiId);
        if (!phanHoi) {
            return res.status(404).json({ message: 'Không tìm thấy phản hồi' });
        }

        phanHoi.BinhLuan = BinhLuan;
        phanHoi.NgayTao = new Date();

        await danhGia.save();

        res.status(200).json(danhGia);
    } catch (error) {
        console.error('Lỗi khi cập nhật phản hồi:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật phản hồi' });
    }
}
async function deletePhanHoi(req, res) {
    try {
        const { danhGiaId, phanHoiId } = req.params;

        const danhGia = await DanhGiamodel.findById(danhGiaId);

        if (!danhGia) {
            return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
        }

        const phanHoi = danhGia.PhanHoi.id(phanHoiId);
        if (!phanHoi) {
            return res.status(404).json({ message: 'Không tìm thấy phản hồi' });
        }

        danhGia.PhanHoi.pull({ _id: phanHoiId });

        await danhGia.save();

        res.status(200).json(danhGia);
    } catch (error) {
        console.error('Lỗi khi xóa phản hồi:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi xóa phản hồi' });
    }
}
async function deleteImage(imageUrl) {
    try {
        const parts = imageUrl.split('/');
        const imageName = parts[parts.length - 1]; // Lấy tên file
        const imagePath = path.join(__dirname, 'uploads', imageName);
        fs.unlinkSync(imagePath);
        console.log('Ảnh đã được xóa thành công.');
    } catch (error) {
        console.error('Lỗi khi xóa ảnh:', error);
    }
}
module.exports = {
    getListDanhGiaAdmin,
    getListDanhGiaInSanPhamById,
    createDanhGia,
    updateDanhGia,
    deleteDanhGia,
    addPhanHoi,
    updatePhanHoi,
    deletePhanHoi,
    updateLike,
};
