
require("dotenv").config();
const YeuCauDangKySchema = require("../models/YeuCauDangKy")
const fs = require('fs');
const path = require('path');
const NguoiDungModel = require("../models/NguoiDungSchema")
async function getListYeuCauDangKy(req, res, next) {
    try {
        const yeucaudangky = await YeuCauDangKySchema.find().populate("userId")
        if (!yeucaudangky) {
            res.status(404).json({ message: 'Không tìm thấy yêu cầu đăng ký nào' });
        }
        return res.status(200).json(yeucaudangky);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy Bài viết đánh giá' });
    }
}

async function getYeuCauDangKyByUserId(req, res, next) {
    const { userId } = req.params
    try {
        const baiviets = await YeuCauDangKySchema.find({ userId: userId })
            .populate("userId")
        return res.status(200).json(baiviets);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy Bài viết đánh giá' });
    }
}


async function createYeuCauDangKy(req, res) {
    try {
        const { userId, ghiChu, soluongloaisanpham, soluongsanpham, diaChi, hinhthucgiaohang } = req.body;
        const yeucaudangky = await YeuCauDangKySchema.findOne({ userId: userId })
        if (yeucaudangky) {
            if (yeucaudangky.trangThai === "cho" || yeucaudangky.trangThai === "xacnhan") {
                res.status(400).json({ message: 'Bạn đã tạo yêu cầu đăng ký rồi.' });
            }
        }
        const newYeuCauDangKy = new YeuCauDangKySchema({
            userId,
            ghiChu,
            soluongloaisanpham,
            soluongsanpham,
            diaChi,
            hinhthucgiaohang
        });
        const taoYeuCauDangKy = await newYeuCauDangKy.save();
        //const baiviet = await BaiVietSchema.findById(taobaiviet._id).populate("userId")
        res.status(201).json({ message: 'Tạo Yêu cầu đăng ký thành công', taoYeuCauDangKy });
    } catch (error) {
        console.error('Lỗi khi tạo Bài viết:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi tạo Tạo Yêu cầu đăng ký' });
    }
}
async function updateYeuCauDangKy(req, res, next) {
    const { yeuCauDangKyId } = req.params
    const { TrangThai } = req.body
    try {

        const yeuCauDangKy = await YeuCauDangKySchema.findById(yeuCauDangKyId)// Lấy thông tin đơn hàng từ DB
        if (!yeuCauDangKy) {
            return 'Yêu cầu đăng ký không tồn tại';
        }
        if (yeuCauDangKy.trangThai === TrangThai) {
            return res.status(400).json({ message: 'Ko thể thay đổi trạng thái giống nhau' });

        }
        // else if (yeuCauDangKy.trangThai === "xacnhan" && TrangThai === "xacnhan") {
        //     res.status(400).json({ message: 'Ko thể thay đổi trạng thái khi đã xác nhận ' });
        // }

        yeuCauDangKy.trangThai = TrangThai;
        await yeuCauDangKy.save();
        if (yeuCauDangKy.trangThai === "xacnhan") {
            const user = await NguoiDungModel.findById(yeuCauDangKy.userId);
            if (!user) {
                return res.status(400).json({ message: "Không tìm thấy người dùng" });
            }
            user.role = "hokinhdoanh";
            const updatedUser = await user.save();
        }
        res.status(200).json({ message: "Cập nhập trạng thái đăng ký thành công" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi cập nhật trang thái hủy Đăng ký' });
    }
}


module.exports = {
    createYeuCauDangKy,
    getListYeuCauDangKy,
    getYeuCauDangKyByUserId,
    updateYeuCauDangKy,
};
