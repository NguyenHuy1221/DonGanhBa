const DanhGiamodel = require("../models/DanhGiaSchema");
const LoaiKhuyenMaiModel = require("../models/LoaiKhuyenMaiSchema")
const BaiVietSchema = require("../models/baivietSchema")
require("dotenv").config();
const { upload } = require("../untils/index");
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
        // .populate('binhluan');
        if (userId) {
            const baivietsWithLikeInfo = baiviets.map(baiViet => {
                const isLiked = baiViet.likes.includes(userId);
                return { ...baiViet._doc, isLiked };
            });
            console.log(baivietsWithLikeInfo)
            return res.status(200).json(baivietsWithLikeInfo);
        }
        return res.status(200).json(baiviets);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy Bài viết đánh giá' });
    }
}



async function createBaiViet(req, res) {
    try {
        await upload.array('files')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ message: 'Error uploading image', error: err });
            }
            const { userId, tieude, noidung, tags } = req.body;

            const newBaiViet = new BaiVietSchema({
                userId,
                tieude,
                noidung,
                tags,
                image: [],
                binhluan: []
            });
            let imagePaths = [];

            if (req.files) {
                req.files.forEach(file => {
                    imagePaths.push(file.path.replace('public', process.env.URL_IMAGE));
                });
                newBaiViet.image = imagePaths
            }
            const taobaiviet = await newBaiViet.save();
            //const baiviet = await BaiVietSchema.findById(taobaiviet._id).populate("userId")
            res.status(201).json({ message: 'Tạo bài viết thành công' });
        });
    } catch (error) {
        console.error('Lỗi khi tạo Bài viết:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi tạo Bài viết' });
    }
}

async function updateBaiViet(req, res) {
    try {
        await upload.array('files')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ message: 'Error uploading image', error: err });
            }
            const { baivietId } = req.params;
            const { tieude, tags, noidung, userId } = req.body;
            let updatedBaiViet = await BaiVietSchema.findById(baivietId);
            if (!updatedBaiViet) {
                return res.status(404).json({ message: 'Không tìm thấy Bài viết' });
            } else if (userId != updatedBaiViet.userId) {
                return res.status(404).json({ message: 'Bạn không phải người viết bài viết này' });

            }
            if (tieude !== undefined) updatedBaiViet.tieude = tieude;
            if (tags !== undefined) updatedBaiViet.tags = tags;
            if (noidung !== undefined) updatedBaiViet.noidung = noidung;



            updatedBaiViet.isUpdate = "true"
            if (req.files) {
                // req.files.forEach(file => {
                //     imagePaths.push(file.path.replace('public', process.env.URL_IMAGE));
                // });
                // newBaiViet.image = imagePaths
                // Lấy hình ảnh cũ từ bài viết 
                const oldImages = updatedBaiViet.image || [];
                // Lấy danh sách đường dẫn hình ảnh mới 
                const newImages = req.files.map(file => file.path.replace('public', process.env.URL_IMAGE));
                // Kết hợp hình ảnh cũ và mới 
                const combinedImages = [...new Set([...oldImages, ...newImages])];
                // Xác định hình ảnh cũ cần xóa 
                const imagesToDelete = oldImages.filter(image => !newImages.includes(image));
                for (const image of imagesToDelete) {
                    await deleteImage(image);
                    // Hàm xóa hình ảnh 
                }
                // Cập nhật mảng hình ảnh của bài viết 
                updatedBaiViet.image = combinedImages;
                // Lưu bài viết đã cập nhật 
                //await updatedBaiViet.save(); res.status(200).json(updatedBaiViet);
            }

            // Lưu đánh giá đã cập nhật
            await updatedBaiViet.save();
            //res.status(200).json(updatedDanhGia);
            res.status(201).json({ message: 'cập nhập bài viết thành công' });
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật đánh giá:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật đánh giá' });
    }
}


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

        await danhGia.save();

        res.status(201).json(danhGia);
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

        phanHoi.remove();

        await danhGia.save();

        res.status(200).json(danhGia);
    } catch (error) {
        console.error('Lỗi khi xóa phản hồi:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi xóa phản hồi' });
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

async function deleteImage(imageUrl) {
    try {
        const parts = imageUrl.split('/');
        const imageName = parts[parts.length - 1]; // Lấy tên file
        const imagePath = path.join(__dirname, 'public', 'uploads', imageName);
        fs.unlink(imagePath, (err) => {
            if (err) {
                console.error('Lỗi khi xóa ảnh:', err);
            } else {
                console.log('Ảnh đã được xóa thành công.');
            }
        });
    } catch (error) {
        console.error('Lỗi khi xóa ảnh:', error);
    }
}

module.exports = {
    getListBaiViet,
    createBaiViet,
    updateBaiViet,
    deleteBaiViet,
    addPhanHoi,
    updatePhanHoi,
    deletePhanHoi,
    updateLike,
};
