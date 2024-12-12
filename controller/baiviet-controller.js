const DanhGiamodel = require("../models/DanhGiaSchema");
const LoaiKhuyenMaiModel = require("../models/LoaiKhuyenMaiSchema")
const BaiVietSchema = require("../models/baivietSchema")
const UserModel = require("../models/NguoiDungSchema")
require("dotenv").config();
const { upload } = require("../untils/index");
const { uploadFileToViettelCloud } = require("../untils/index")
const { createThongBaoNoreq } = require("../helpers/helpers")
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
//ham lay danh sach thuoc tinh
// async function getListDanhGiaInSanPhamById(req, res, next) {
//     const { IDSanPham } = req.params;
//     try {
//         const Danhgias = await DanhGiamodel.find({ sanphamId: IDSanPham }).populate("userId");
//         res.status(200).json(Danhgias);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Lỗi khi lấy danh sách đánh giá' });
//     }
// }
async function getListBaiViet(req, res, next) {
    const { userId } = req.params;
    try {
        const baiviets = await BaiVietSchema.find()
            .populate("userId")
            .populate({
                path: 'binhluan.userId', // Populate userId của binhluan 
                // select: 'name email' // Chỉ chọn các trường cần thiết 
            })
        if (userId) {
            const baivietsWithLikeInfo = baiviets.map(baiViet => {
                const isLiked = baiViet.likes.includes(userId);
                return { ...baiViet._doc, isLiked };
            });
            return res.status(200).json(baivietsWithLikeInfo);
        }
        return res.status(200).json(baiviets);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy Bài viết đánh giá' });
    }
}
async function getListBaiVietAdmin(req, res, next) {
    const { userId } = req.params;
    let user = {}
    let query = {};

    try {
        if (userId) {
            user = await UserModel.findById(userId);
            if (!user) {
                return res.status(200).json({
                    message: "Không tìm thấy user bằng userid"
                });
            }
        }
        else {
            return res.status(404).json({ message: 'Chưa có userId' });
        }

        if (user.role === "admin" || user.role === "nhanvien") {

        } else if (user.role === "hokinhdoanh") {
            query.userId = userId
        } else {
            return res.status(200).json({ message: "Không có quyền " });
        }
        const baiviets = await BaiVietSchema.find(query)
            .populate("userId")
            .populate({
                path: 'binhluan.userId', // Populate userId của binhluan 
                // select: 'name email' // Chỉ chọn các trường cần thiết 
            })

        if (userId) {
            const baivietsWithLikeInfo = baiviets.map(baiViet => {
                const isLiked = baiViet.likes.includes(userId);
                return { ...baiViet._doc, isLiked };
            });

            return res.status(200).json(baivietsWithLikeInfo);
        }
        return res.status(200).json(baiviets);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy Bài viết đánh giá' });
    }
}

async function getBaiVietById(req, res, next) {
    const { userId } = req.params;

    try {
        const baiviets = await BaiVietSchema.find({ userId: userId })
            .populate("userId")
            .populate({
                path: 'binhluan.userId', // Populate userId của binhluan 
                // select: 'name email' // Chỉ chọn các trường cần thiết 
            })
        // .populate('binhluan');
        if (userId) {
            const baivietsWithLikeInfo = baiviets.map(baiViet => {
                const isLiked = baiViet.likes.includes(userId);
                return { ...baiViet._doc, isLiked };
            });

            return res.status(200).json(baivietsWithLikeInfo);
        }
        return res.status(200).json(baiviets);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy Bài viết đánh giá' });
    }
}


async function createBaiViet(req, res) {
    const { userId, tieude, noidung } = req.body;
    try {
        // await upload.array('files')(req, res, async (err) => {
        //     if (err) {
        //         return res.status(400).json({ message: 'Error uploading image', error: err });
        //     }
        //     //code upload
        //     if (req.files) {
        //         req.files.forEach(file => {
        //             imagePaths.push(file.path.replace('public', process.env.URL_IMAGE));
        //         });
        //         newBaiViet.image = imagePaths
        //     }
        // });
        const bucketName = process.env.VIETTEL_BUCKET;
        const detailFiles = req.files && req.files.filter(file => file.fieldname === 'files');

        let detailUrls = []; // Upload ảnh đại diện nếu có 

        if (detailFiles && detailFiles.length > 0) {
            const uploadPromises = detailFiles.map(file => {
                let objectKey = ""
                if (file.mimetype.startsWith('image/')) {
                    objectKey = `images/${uuidv4()}-${file.originalname}`;
                } else {
                    return res.status(400).json({ message: 'Chỉ được upload image' });
                }
                return uploadFileToViettelCloud(file.buffer, bucketName, objectKey, file.mimetype);
            });
            try { detailUrls = await Promise.all(uploadPromises); } catch (error) {
                console.error('Lỗi khi tải lên ảnh chi tiết:', error);
                return res.status(500).json({ message: 'Đã xảy ra lỗi khi tải lên ảnh chi tiết' });
            }
        }
        // const hinhBoSungData = detailUrls.map((url) => ({
        //     url, // URL đã tải lên
        // }));
        console.log(detailUrls)
        const newBaiViet = new BaiVietSchema({
            userId,
            tieude,
            noidung,
            image: [],
            binhluan: []
        });

        if (detailUrls) {
            newBaiViet.image = detailUrls
        }

        const taobaiviet = await newBaiViet.save();
        //const baiviet = await BaiVietSchema.findById(taobaiviet._id).populate("userId")
        res.status(201).json({ message: 'Tạo bài viết thành công' });
    } catch (error) {
        console.error('Lỗi khi tạo Bài viết:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi tạo Bài viết' });
    }
}

// async function updateBaiViet(req, res) {
//     try {
//         await upload.array('files')(req, res, async (err) => {
//             if (err) {
//                 return res.status(400).json({ message: 'Error uploading image', error: err });
//             }
//             const { baivietId } = req.params;
//             const { tieude, tags, noidung, userId } = req.body;
//             let updatedBaiViet = await BaiVietSchema.findById(baivietId);
//             if (!updatedBaiViet) {
//                 return res.status(404).json({ message: 'Không tìm thấy Bài viết' });
//             } else if (userId != updatedBaiViet.userId) {
//                 return res.status(404).json({ message: 'Bạn không phải người viết bài viết này' });

//             }
//             if (tieude !== undefined) updatedBaiViet.tieude = tieude;
//             if (tags !== undefined) updatedBaiViet.tags = tags;
//             if (noidung !== undefined) updatedBaiViet.noidung = noidung;



//             updatedBaiViet.isUpdate = "true"
//             if (req.files) {
//                 console.log(req.files)
//                 // req.files.forEach(file => {
//                 //     imagePaths.push(file.path.replace('public', process.env.URL_IMAGE));
//                 // });
//                 // newBaiViet.image = imagePaths
//                 // Lấy hình ảnh cũ từ bài viết 
//                 const oldImages = updatedBaiViet.image || [];
//                 // Lấy danh sách đường dẫn hình ảnh mới 
//                 const newImages = req.files.map(file => file.path.replace('public', process.env.URL_IMAGE));
//                 console.log("kiem tra du lieu", newImages)
//                 // Kết hợp hình ảnh cũ và mới 
//                 const combinedImages = [...new Set([...oldImages, ...newImages])];
//                 // Xác định hình ảnh cũ cần xóa 
//                 const imagesToDelete = oldImages.filter(image => !newImages.includes(image));
//                 for (const image of imagesToDelete) {
//                     await deleteImage(image);
//                     // Hàm xóa hình ảnh 
//                 }
//                 // Cập nhật mảng hình ảnh của bài viết 
//                 updatedBaiViet.image = [...new Set([...combinedImages.filter(image => !imagesToDelete.includes(image)), ...newImages])];                // Lưu bài viết đã cập nhật 
//                 //await updatedBaiViet.save(); res.status(200).json(updatedBaiViet);
//             }

//             // Lưu đánh giá đã cập nhật
//             await updatedBaiViet.save();
//             //res.status(200).json(updatedDanhGia);
//             res.status(201).json({ message: 'cập nhập bài viết thành công' });
//         });
//     } catch (error) {
//         console.error('Lỗi khi cập nhật đánh giá:', error);
//         res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật đánh giá' });
//     }
// }

async function updateBaiViet(req, res) {
    try {
        const { baivietId } = req.params;
        const { tieude, tags, noidung, userId } = req.body;
        let updatedBaiViet = await BaiVietSchema.findById(baivietId);

        if (!updatedBaiViet) {
            return res.status(404).json({ message: 'Không tìm thấy Bài viết' });
        } else if (userId != updatedBaiViet.userId) {
            return res.status(403).json({ message: 'Bạn không phải người viết bài viết này' });
        }

        if (tieude !== undefined) updatedBaiViet.tieude = tieude;
        if (tags !== undefined) updatedBaiViet.tags = tags;
        if (noidung !== undefined) updatedBaiViet.noidung = noidung;

        updatedBaiViet.isUpdate = true;

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

            const oldImages = updatedBaiViet.image || [];
            const newImages = detailUrls;

            const combinedImages = [...new Set([...oldImages, ...newImages])];
            const imagesToDelete = oldImages.filter(image => !newImages.includes(image));

            // for (const image of imagesToDelete) {
            //     await deleteImage(image);
            // }

            updatedBaiViet.image = combinedImages.filter(image => !imagesToDelete.includes(image));
        }

        await updatedBaiViet.save();
        res.status(200).json({ message: 'Cập nhật bài viết thành công', updatedBaiViet });
    } catch (error) {
        console.error('Lỗi khi cập nhật bài viết:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật bài viết' });
    }
};


async function updateLike(req, res) {
    try {
        const { baivietId, userId } = req.params;
        const baiviet = await BaiVietSchema.findById(baivietId);
        if (!baiviet) {
            return res.status(404).json({ message: 'Không tìm thấy bài viết' });
        }
        let update;
        if (baiviet.likes.includes(userId)) {
            // Nếu userId đã tồn tại, xóa nó khỏi mảng likes
            update = { $pull: { likes: userId } };
        } else {
            // Nếu userId chưa tồn tại, thêm nó vào mảng likes
            update = { $addToSet: { likes: userId } };
        }
        const updatedBaiVietSchema = await BaiVietSchema.findOneAndUpdate(
            { _id: baivietId },
            update,
            { new: true }
        );
        res.status(200).json(updatedBaiVietSchema);
    } catch (error) {
        console.error('Lỗi khi cập nhật Bài viết:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật Bài viết' });
    }
}


async function deleteBaiViet(req, res) {
    try {
        const { baivietId } = req.params;
        const deletedDanhGia = await BaiVietSchema.findByIdAndDelete(baivietId);
        if (!deletedDanhGia) {
            return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
        }
        // if (deletedDanhGia.HinhAnh) {
        //     await deleteImage(deletedDanhGia.HinhAnh);
        // }
        res.status(200).json({ message: 'Xóa bài viết thành công' });
    } catch (error) {
        console.error('Lỗi khi xóa đánh giá:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi xóa đánh giá' });
    }
}
async function addBinhLuan(req, res) {
    try {
        const { baivietId } = req.params;
        const { userId, BinhLuan } = req.body;

        // Kiểm tra đầu vào
        if (!baivietId || !userId || !BinhLuan) {
            return res.status(400).json({ message: 'Thiếu thông tin yêu cầu' });
        }
        const baiViet = await BaiVietSchema.findById(baivietId);
        if (!baiViet) {
            return res.status(404).json({ message: 'Không tìm thấy Bài viết' });
        }
        // Thêm bình luận vào bài viết
        baiViet.binhluan.push({
            userId,
            BinhLuan,
            NgayTao: new Date()
        });
        await baiViet.save();
        // Populate các thông tin cần thiết
        const newbaiViet = await BaiVietSchema.findById(baivietId)
            .populate("userId")
            .populate({
                path: 'binhluan.userId'
                // select: 'name email' // Chỉ chọn các trường cần thiết nếu cần
            });

        // Gửi thông báo (bạn có thể bỏ comment này để sử dụng)
        await createThongBaoNoreq(baiViet.userId, "newCommentbaiviet");
        return res.status(200).json(newbaiViet.binhluan);
    } catch (error) {
        console.error('Lỗi khi thêm Bình luận:', error);
        return res.status(500).json({ message: 'Đã xảy ra lỗi khi thêm Bình luận' });
    }
}

async function updateBinhLuan(req, res) {
    try {
        const { baivietId, binhLuanId } = req.params;
        const { BinhLuan } = req.body;

        const baiViet = await BaiVietSchema.findById(baivietId);

        if (!baiViet) {
            return res.status(404).json({ message: 'Không tìm thấy Bài viết' });
        }

        const binhLuan = baiViet.binhluan.id(binhLuanId);
        if (!binhLuan) {
            return res.status(404).json({ message: 'Không tìm thấy bình luận' });
        }

        binhLuan.BinhLuan = BinhLuan;
        binhLuan.NgayTao = new Date();

        await baiViet.save();
        const newbaiViet = await BaiVietSchema.findById(baivietId).populate("userId")
            .populate({
                path: 'binhluan.userId', // Populate userId của binhluan 
                // select: 'name email' // Chỉ chọn các trường cần thiết 
            });
        res.status(201).json(newbaiViet.binhluan);
    } catch (error) {
        console.error('Lỗi khi cập nhật bình luận:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật Bình luận' });
    }
}

async function deleteBinhLuan(req, res) {
    try {
        const { baivietId, binhLuanId } = req.params;

        const baiViet = await BaiVietSchema.findById(baivietId);

        if (!baiViet) {
            return res.status(404).json({ message: 'Không tìm thấy bài viết' });
        }
        const binhLuan = baiViet.binhluan.id(binhLuanId);
        if (!binhLuan) {
            return res.status(404).json({ message: 'Không tìm bình luận' });
        }

        baiViet.binhluan.pull({ _id: binhLuanId });

        const updatebinhluan = await baiViet.save();


        res.status(200).json(updatebinhluan);
    } catch (error) {
        console.error('Lỗi khi xóa Bình luận:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi xóa Bình luận' });
    }
}
// async function deleteImage(imageUrl) {
//     try {
//         const parts = imageUrl.split('/');
//         const imageName = parts[parts.length - 1]; // Lấy tên file
//         const imagePath = path.join(__dirname, 'uploads', imageName);
//         fs.unlinkSync(imagePath);
//         console.log('Ảnh đã được xóa thành công.');
//     } catch (error) {
//         console.error('Lỗi khi xóa ảnh:', error);
//     }
// }



// async function deleteImage(imageUrl) {
//     try {
//         const parts = imageUrl.split('/');
//         const imageName = parts[parts.length - 1]; // Lấy tên file
//         const imagePath = path.join(__dirname, 'uploads', imageName);
//         fs.unlink(imagePath, (err) => {
//             if (err) {
//                 console.error('Lỗi khi xóa ảnh:', err);
//             } else {
//                 console.log('Ảnh đã được xóa thành công.');
//             }
//         });
//     } catch (error) {
//         console.error('Lỗi khi xóa ảnh:', error);
//     }
// }

// const fs = require('fs');
// const path = require('path');

async function deleteImage(imageUrl) {
    try {
        // Chuyển đổi tất cả dấu gạch chéo ngược (\) thành gạch chéo (/)
        let correctedUrl = imageUrl.replace(/\\/g, '/');
        console.log(imageUrl)
        // Loại bỏ phần 'https://trusty-koi-useful.ngrok-free.app/uploads/' từ URL
        const imageName = correctedUrl.replace('https://trusty-koi-useful.ngrok-free.app/uploads/', '');
        console.log("image", imageName)
        // Xây dựng đường dẫn đầy đủ đến file hình ảnh
        //const imagePath = path.join(__dirname, 'public', 'uploads', imageName);



        // Điều chỉnh lại đường dẫn tuyệt đối 
        const basePath = path.resolve(__dirname, '../public/uploads');
        const imagePath = path.join(basePath, imageName);
        console.log("Full Image Path:", imagePath);



        // Kiểm tra xem file có tồn tại không trước khi xóa
        fs.access(imagePath, fs.constants.F_OK, (err) => {
            if (err) {
                console.error('File không tồn tại tại đường dẫn:', imagePath);
                return;
            }

            // Xóa file nếu tồn tại
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error('Lỗi khi xóa ảnh:', err);
                } else {
                    console.log('Ảnh đã được xóa thành công.');
                }
            });
        });
    } catch (error) {
        console.error('Lỗi khi xóa ảnh:', error);
    }
}


// async function deleteImage(imageUrl) {
//     try {
//         // Loại bỏ phần 'https://trusty-koi-useful.ngrok-free.app/uploads/' từ URL
//         console.log(imageUrl)
//         const imageName = imageUrl.replace(/https:\/\/trusty-koi-useful\.ngrok-free\.app\/uploads\//, '');

//         // Xây dựng đường dẫn đầy đủ đến file hình ảnh
//         const imagePath = path.join(__dirname, 'public', 'uploads', imageName);

//         // Kiểm tra xem file có tồn tại không trước khi xóa
//         fs.access(imagePath, fs.constants.F_OK, (err) => {
//             if (err) {
//                 console.error('File không tồn tại tại đường dẫn:', imagePath);
//                 return;
//             }

//             // Xóa file nếu tồn tại
//             fs.unlink(imagePath, (err) => {
//                 if (err) {
//                     console.error('Lỗi khi xóa ảnh:', err);
//                 } else {
//                     console.log('Ảnh đã được xóa thành công.');
//                 }
//             });
//         });
//     } catch (error) {
//         console.error('Lỗi khi xóa ảnh:', error);
//     }
// }


module.exports = {
    getListBaiViet,
    createBaiViet,
    updateBaiViet,
    deleteBaiViet,
    addBinhLuan,
    updateBinhLuan,
    deleteBinhLuan,
    updateLike,
    getBaiVietById,
    getListBaiVietAdmin,
};
