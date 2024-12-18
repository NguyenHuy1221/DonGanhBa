
require("dotenv").config();
const YeuCauDangKySchema = require("../models/YeuCauDangKy")
const fs = require('fs');
const path = require('path');
const NguoiDungModel = require("../models/NguoiDungSchema")
const { createThongBaoNoreq } = require("../helpers/helpers")
const transporter = require("./mailer");
const { uploadFileToViettelCloud } = require("../untils/index")
const { v4: uuidv4 } = require('uuid');

async function getListYeuCauDangKy(req, res, next) {
    try {
        const yeucaudangky = await YeuCauDangKySchema.find().populate("userId")
        if (!yeucaudangky) {
            res.status(404).json({ message: 'Không tìm thấy yêu cầu đăng ký nào' });
        }
        return res.status(200).json(yeucaudangky);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi khi lấy Bài viết đánh giá' });
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
        return res.status(500).json({ message: 'Lỗi khi lấy Bài viết đánh giá' });
    }
}


async function createYeuCauDangKy(req, res) {
    try {
        const { userId, ghiChu, soluongloaisanpham, soluongsanpham, diaChi, diachimoi, hinhthucgiaohang, gmail, maSoThue, name } = req.body;
        console.log("diachi", userId, ghiChu, soluongloaisanpham, soluongsanpham, diaChi, hinhthucgiaohang, gmail, maSoThue, name, diachimoi)
        if (!maSoThue || !diaChi || !req.file) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
        }
        const yeucaudangky = await YeuCauDangKySchema.findOne({ userId: userId })
        if (yeucaudangky) {
            if (yeucaudangky.trangThai === "cho" || yeucaudangky.trangThai === "xacnhan") {
                return res.status(400).json({ message: 'Bạn đã tạo yêu cầu đăng ký rồi.' });
            }
        }
        const diachisave = {
            Name: diaChi.Name,
            SoDienThoai: diaChi.SoDienThoai,
            tinhThanhPho: diaChi.tinhThanhPho,
            quanHuyen: diaChi.quanHuyen,
            phuongXa: diaChi.phuongXa,
            duongThon: diaChi.duongThon,
            kinhdo: "",
            vido: "",

        }
        // const diachisave = {
        //     Name: "diaChi.Name",
        //     SoDienThoai: "diaChi.SoDienThoai",
        //     tinhThanhPho: "diaChi.tinhThanhPho",
        //     quanHuyen: "diaChi.quanHuyen",
        //     phuongXa: "diaChi.phuongXa",
        //     duongThon: "diaChi.duongThon",
        //     kinhdo: "diaChi.kinhdo" || "",
        //     vido: "diaChi.vido" || "",

        // }
        const diaChiParsed = JSON.parse(diaChi);
        const diaChiToSave = {
            Name: diaChiParsed.Name,
            SoDienThoai: diaChiParsed.SoDienThoai,
            tinhThanhPho: diaChiParsed.tinhThanhPho,
            quanHuyen: diaChiParsed.quanHuyen,
            phuongXa: diaChiParsed.phuongXa,
            duongThon: diaChiParsed.duongThon,
            kinhdo: diaChiParsed.kinhdo || "",
            vido: diaChiParsed.vido || "",
        };
        const bucketName = process.env.VIETTEL_BUCKET;
        const file = req.file;

        let imageUrl = "";

        if (file) {
            let objectKey = "";
            if (file.mimetype.startsWith('image/')) {
                objectKey = `images/${uuidv4()}-${file.originalname}`;
            } else {
                return res.status(400).json({ message: 'Chỉ được upload image' });
            }
            try {
                imageUrl = await uploadFileToViettelCloud(file.buffer, bucketName, objectKey, file.mimetype);
            } catch (error) {
                console.error('Lỗi khi tải lên ảnh:', error);
                return res.status(500).json({ message: 'Đã xảy ra lỗi khi tải lên ảnh' });
            }

        }
        const user = await NguoiDungModel.findById(userId)
        const newYeuCauDangKy = new YeuCauDangKySchema({
            userId,
            ghiChu,
            gmail,
            name,
            soluongloaisanpham,
            soluongsanpham,
            diaChi: diaChiToSave,
            hinhthucgiaohang,
            maSoThue,
            anhGiayPhepHoKinhDoanh: imageUrl
        });
        const mailOptionForAdmin = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_ADMIN_TAMTHOI,
            subject: "Đơn đăng ký làm hộ kinh doanh",
            text: `Chào Admin,\n\nCó một đơn đăng ký làm hộ kinh doanh mới. của  ${user.tenNguoiDung} đã được đăng ký\n\nTrân trọng,\nĐội ngũ hỗ trợ`,
        };

        transporter.sendMail(mailOptionForAdmin, (error, info) => {
            if (error) {
                console.error("Lỗi khi gửi email admin:", error);
            } else {
                console.log("Email đã được gửi admin:", info.response);
            }
        });

        const taoYeuCauDangKy = await newYeuCauDangKy.save();
        return res.status(201).json({ message: 'Tạo Yêu cầu đăng ký thành công', taoYeuCauDangKy });
    } catch (error) {
        console.error('Lỗi khi tạo Bài viết:', error);
        return res.status(500).json({ message: 'Đã xảy ra lỗi khi tạo Tạo Yêu cầu đăng ký' });
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
        //    return res.status(400).json({ message: 'Ko thể thay đổi trạng thái khi đã xác nhận ' });
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
            await createThongBaoNoreq(yeuCauDangKy.userId, "UpdateTrangThaiYeuCauDangKy", "Chúc mừng bạn đã đăng ký thành công trở thành hộ kinh doanh")
        } else if (yeuCauDangKy.trangThai === "huy") {
            await createThongBaoNoreq(yeuCauDangKy.userId, "UpdateTrangThaiYeuCauDangKy", "Rất tiếc , yêu cầu đăng ký của bạn đã bị từ chối")

        }
        return res.status(200).json({ message: "Cập nhập trạng thái đăng ký thành công" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi khi cập nhật trang thái hủy Đăng ký' });
    }
}


async function getYeuCauDangKyDiaChiByUserId(req, res, next) {
    const { userId } = req.params;

    try {
        const yeuCauDangKy = await YeuCauDangKySchema.findOne({
            userId: userId,
            trangThai: 'xacnhan'
        });

        if (!yeuCauDangKy) {
            return res.status(404).json({ message: 'Không tìm thấy Yêu cầu đăng ký với trạng thái xác nhận' });
        }

        return res.status(200).json(yeuCauDangKy);
    } catch (error) {
        console.error('Lỗi khi lấy Yêu cầu đăng ký:', error);
        return res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy Yêu cầu đăng ký' });
    }
}


async function updateDiaChiHoKinhDoanh(req, res, next) {
    const { yeucaudangkyId } = req.params;
    const { diachimoi } = req.body;
    console.log("diachi", diachimoi)
    try {
        const yeucaudangky = await YeuCauDangKySchema.findById(yeucaudangkyId);

        if (!yeucaudangky) {
            return res.status(404).json({ message: 'Không tìm thấy Yêu cầu đăng ký' });
        }

        if (diachimoi) {
            yeucaudangky.diaChi = diachimoi;
        } else {
            return res.status(400).json({ message: 'Địa chỉ mới không hợp lệ' });
        }
        await yeucaudangky.save();
        // Trả về kết quả cho client
        return res.status(200).json(yeucaudangky);

    } catch (error) {
        console.error("Lỗi update địa chỉ :", error);
        return res.status(500).json({ message: 'Đã xảy ra lỗi khi lưu địa chỉ mới' });
    }
}


module.exports = {
    createYeuCauDangKy,
    getListYeuCauDangKy,
    getYeuCauDangKyByUserId,
    updateYeuCauDangKy,
    getYeuCauDangKyDiaChiByUserId,
    updateDiaChiHoKinhDoanh,
};
