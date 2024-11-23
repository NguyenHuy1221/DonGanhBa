
require("dotenv").config();
const YeuCauDangKySchema = require("../models/YeuCauDangKy")
const fs = require('fs');
const path = require('path');

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

async function getYeuCauDangKyById(req, res, next) {
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
            res.status(400).json({ message: 'Bạn đã tạo yêu cầu đăng ký rồi.' });
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
        res.status(201).json({ message: 'Tạo bài viết thành công', taoYeuCauDangKy });
    } catch (error) {
        console.error('Lỗi khi tạo Bài viết:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi tạo Bài viết' });
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
            res.status(200).json({ message: 'Ko thể thay đổi trạng thái giống nhau' });
        }
        yeuCauDangKy.trangThai = TrangThai;

        await hoadon.save();
        res.status(200).json("Huy don hang thanh cong");
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi cập nhật trang thái hủy hoa don' });
    }
}


module.exports = {
    createYeuCauDangKy
};
