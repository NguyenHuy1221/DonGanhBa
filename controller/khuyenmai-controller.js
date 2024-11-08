const KhuyenMaiModel = require("../models/KhuyenMaiSchema");
const LoaiKhuyenMaiModel = require("../models/LoaiKhuyenMaiSchema")
require("dotenv").config();

async function getlistKhuyenMai(req, res, next) {
    try {
        const { tongTien } = req.params;
        //IDDanhMucCon,
        // Kiểm tra tổng tiền
        if (tongTien <= 0) {
            return res.status(400).json({ message: 'Tổng tiền không hợp lệ' });
        }

        // Tìm tất cả khuyến mãi đang hoạt động
        // const activePromotions = await KhuyenMaiModel.find({
        //     SoLuongHienTai: { $gt: 0 },
        //     $or: [
        //         { TrangThai: 0 },
        //         // { IDDanhMucCon: IDDanhMucCon },
        //         // { IDDanhMucCon: { $exists: false } }
        //     ],
        //     // NgayBatDau: { $lte: new Date() },
        //     // NgayKetThuc: { $gte: new Date() }
        // });
        const activePromotions = await KhuyenMaiModel.find({
            SoLuongHienTai: { $gt: 0 },
            TrangThai: 0 // Chỉ lấy các khuyến mãi có trạng thái là 0 (đang hoạt động)
        });

        // Thêm thuộc tính isEligible cho từng khuyến mãi

        const eligiblePromotions = activePromotions.map(promotion => ({
            ...promotion._doc,
            isEligible: tongTien >= promotion.GioiHanGiaTriDuocApDung && promotion.GioiHanGiaTriDuocApDung > 0
        }));
        console.log(eligiblePromotions)
        eligiblePromotions.sort((a, b) => b.GiaTriKhuyenMai - a.GiaTriKhuyenMai);

        const promotionsWithDetails = eligiblePromotions.map(promotion => {
            const giaTriGiam = calculateDiscount(promotion.LoaiKhuyenMai, parseFloat(tongTien), promotion.GiaTriKhuyenMai, promotion.GioiHanGiaTriGiamToiDa);
            return {
                ...promotion,
                giaTriGiam,
            };
        });

        return res.status(200).json(promotionsWithDetails);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi khi lấy danh sách khuyến mãi' });
    }
}

function calculateDiscount(loaiKhuyenMai, tongTien, giaTriKhuyenMai, gioiHanGiamToiDa) {
    if (loaiKhuyenMai === '66e2679f1d94dd5e03e120f4') {
        return Math.min(tongTien * giaTriKhuyenMai / 100, gioiHanGiamToiDa);
    } else {
        return giaTriKhuyenMai;
    }
}

async function getlistKhuyenMaiforadmin(req, res, next) {
    try {
        const { IDDanhMucCon } = req.params;

        // Điều kiện tìm kiếm
        // const conditions = {
        //     SoLuongHienTai: { $gt: 0 },
        //     $or: [
        //         { TrangThai: 0 },
        //         { IDDanhMucCon: IDDanhMucCon }
        //     ]
        // };

        // // Tạo query
        // let query = KhuyenMaiModel.find(conditions);
        // const khuyenmais = await query.exec();
        res.status(200).json(khuyenmais);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi get list khuyến mãi' });
    }
}


async function createKhuyenMai(req, res, next) {
    const { TenKhuyenMai, MoTa, GiaTriKhuyenMai, TongSoLuongDuocTao, GioiHanGiaTriDuocApDung, NgayBatDau, NgayKetThuc, SoLuongHienTai, IDLoaiKhuyenMai, IDDanhMucCon, TrangThai, GioiHanGiaTriGiamToiDa } = req.body;
    try {
        // const newKhuyenMai = await KhuyenMaiModel.create({
        //     TenKhuyenMai,
        //     MoTa,
        //     GiaTriKhuyenMai,
        //     TongSoLuongDuocTao,
        //     GioiHanGiaTriDuocApDung,
        //     NgayBatDau,
        //     NgayKetThuc,
        //     SoLuongHienTai,
        //     IDLoaiKhuyenMai,
        //     TrangThai
        // });
        // if (IDLoaiKhuyenMai === "66e2679f1d94dd5e03e120f4") {
        //     newKhuyenMai.GioiHanGiaTriGiamToiDa = GioiHanGiaTriGiamToiDa
        //     await newKhuyenMai.save()
        // }
        // if (IDDanhMucCon) {
        //     newKhuyenMai.IDDanhMucCon = IDDanhMucCon
        //     await newKhuyenMai.save()
        // }
        const newKhuyenMai = new KhuyenMaiModel({
            TenKhuyenMai,
            MoTa,
            GiaTriKhuyenMai,
            TongSoLuongDuocTao,
            GioiHanGiaTriDuocApDung,
            NgayBatDau,
            NgayKetThuc,
            SoLuongHienTai,
            IDLoaiKhuyenMai,
            TrangThai,
            // Chỉ gán GioiHanGiaTriGiamToiDa khi cần thiết
            ...(IDLoaiKhuyenMai === "66e2679f1d94dd5e03e120f4" && { GioiHanGiaTriGiamToiDa }),
            // Chỉ gán IDDanhMucCon khi có giá trị
            ...(IDDanhMucCon && { IDDanhMucCon })
        });

        // Lưu đối tượng vào cơ sở dữ liệu
        const savedKhuyenMai = await newKhuyenMai.save();
        res.status(201).json(savedKhuyenMai);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi create khuyen mai' });
    }
}

async function updateKhuyenMai(req, res, next) {
    const { id } = req.params;
    const { TenKhuyenMai, MoTa, GiaTriKhuyenMai, TongSoLuongDuocTao, GioiHanGiaTriDuocApDung, NgayBatDau, NgayKetThuc, SoLuongHienTai, IDLoaiKhuyenMai, IDDanhMucCon, TrangThai, GioiHanGiaTriGiamToiDa } = req.body;
    try {
        const updateData = {
            TenKhuyenMai,
            MoTa,
            GiaTriKhuyenMai,
            TongSoLuongDuocTao,
            GioiHanGiaTriDuocApDung,
            NgayBatDau,
            NgayKetThuc,
            SoLuongHienTai,
            IDLoaiKhuyenMai,
            TrangThai,
        };
        // Nếu IDDanhMucCon là null, xóa trường này khỏi updateData
        if (IDDanhMucCon === null) {
            delete updateData.IDDanhMucCon;
        } else {
            updateData.IDDanhMucCon = IDDanhMucCon;
        }
        // Nếu IDLoaiKhuyenMai trùng khớp, cập nhật GioiHanGiaTriGiamToiDa
        if (IDLoaiKhuyenMai === "66e2679f1d94dd5e03e120f4") {
            updateData.GioiHanGiaTriGiamToiDa = GioiHanGiaTriGiamToiDa;
        }
        const updatedKhuyenMai = await KhuyenMaiModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi update khuyen mai' });
    }
}
async function deleteKhuyenMai(req, res, next) {
    const { id } = req.params;

    try {
        const deletedKhuyenMai = await KhuyenMaiModel.findByIdAndUpdate(
            id,
            { isDeleted: true },
            { new: true }
        );

        if (!deletedKhuyenMai) {
            return res.status(404).json({ message: 'Khuyến mãi không tồn tại' });
        }

        res.status(200).json({ message: 'Khuyến mãi đã được đánh dấu là đã xóa' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi xoa khuyen mai' });
    }
}

async function getActiveKhuyenMai(req, res, next) {
    try {
        const activeKhuyenMai = await KhuyenMaiModel.find({ isDeleted: false });
        res.status(200).json(activeKhuyenMai);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi tìm kiếm thuộc tính' });
    }
}





module.exports = {
    getlistKhuyenMai,
    createKhuyenMai,
    updateKhuyenMai,
    deleteKhuyenMai,
    getActiveKhuyenMai
};
