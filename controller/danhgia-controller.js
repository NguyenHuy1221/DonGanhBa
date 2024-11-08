const DanhGiamodel = require("../models/DanhGiaSchema");
const LoaiKhuyenMaiModel = require("../models/LoaiKhuyenMaiSchema")
require("dotenv").config();
const { upload } = require("../untils/index");
const fs = require('fs');
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

async function getListDanhGiaInSanPhamById(req, res, next) {
    const { IDSanPham, userId } = req.params;

    try {
        const Danhgias = await DanhGiamodel.find({ sanphamId: IDSanPham })
            .populate("userId")
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
        console.log(danhGiasWithLikeInfo)
        res.status(200).json(danhGiasWithLikeInfo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách đánh giá' });
    }
}

async function createDanhGia(req, res) {
    try {
        await upload.array('files')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ message: 'Error uploading image', error: err });
            }
            const { userId, sanphamId, XepHang, BinhLuan } = req.body;

            // const hinhAnh = req.file ? req.file.path.replace('public', process.env.URL_IMAGE) : null;

            const newDanhGia = new DanhGiamodel({
                userId,
                sanphamId,
                XepHang,
                BinhLuan,
                NgayTao: new Date()
            });
            // if (req.file) {

            //     // Lưu đường dẫn ảnh vào cơ sở dữ liệu
            //     newDanhGia.HinhAnh = req.file.path.replace('public', process.env.URL_IMAGE);
            // }
            let imagePaths = [];

            if (req.files) {
                console.log(req.files)
                req.files.forEach(file => {
                    imagePaths.push(file.path.replace('public', process.env.URL_IMAGE));
                });
                newDanhGia.HinhAnh = imagePaths
            }
            await newDanhGia.save();
            res.status(201).json(newDanhGia);
        });
    } catch (error) {
        console.error('Lỗi khi tạo đánh giá:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi tạo đánh giá' });
    }
}

async function updateDanhGia(req, res) {
    try {
        await upload.single('file')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ message: 'Error uploading image', error: err });
            }
            const { danhGiaId } = req.params;
            const { XepHang, BinhLuan } = req.body;
            //const hinhAnh = req.file ? req.file.path.replace('public', process.env.URL_IMAGE) : null;
            // Tìm đánh giá để cập nhật
            console.log(danhGiaId, XepHang, BinhLuan)
            let updatedDanhGia = await DanhGiamodel.findById(danhGiaId);
            if (!updatedDanhGia) {
                return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
            }

            // Cập nhật đánh giá
            updatedDanhGia.XepHang = XepHang;
            updatedDanhGia.BinhLuan = BinhLuan;
            updatedDanhGia.NgayTao = new Date();

            if (req.file) {
                // Xóa ảnh cũ (nếu có)
                if (updatedDanhGia.HinhAnh) {
                    await deleteImage(updatedDanhGia.HinhAnh);
                }
                // Cập nhật đường dẫn ảnh mới
                updatedDanhGia.HinhAnh = req.file.path.replace('public', process.env.URL_IMAGE);
            }

            // Lưu đánh giá đã cập nhật
            await updatedDanhGia.save();
            res.status(200).json(updatedDanhGia);
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật đánh giá:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật đánh giá' });
    }
}


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
    getListDanhGiaInSanPhamById,
    createDanhGia,
    updateDanhGia,
    deleteDanhGia,
    addPhanHoi,
    updatePhanHoi,
    deletePhanHoi,
    updateLike,
};
