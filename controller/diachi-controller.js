const DiaChiModel = require("../models/DiaChiSchema");
const LoaiKhuyenMaiModel = require("../models/LoaiKhuyenMaiSchema")
// require("dotenv").config();

//trangthai 1 tat ca san pham , trang thai 0 chi 1 san pham
async function getDiaChiByUserId(req, res, next) {
    try {
        const { userId } = req.params;
        let diaChi = await DiaChiModel.findOne({
            IDUser: userId,
            'diaChiList.isDeleted': false
        });
        if (!diaChi) {
            diaChi = await DiaChiModel.findOneAndUpdate(
                { IDUser: userId },
                { $setOnInsert: { diaChiList: [] } },  // Chỉ tạo tài liệu mới nếu chưa tồn tại
                { new: true, upsert: true }
            );
        }
        res.status(200).json(diaChi);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách địa chỉ' });
    }
}
async function createDiaChi(req, res, next) {
    try {
        const { userId } = req.params;
        // const diaChiList = req.body;
        // console.log(diaChiList)
        const { tinhThanhPho, quanHuyen, phuongXa, duongThon, Name, SoDienThoai } = req.body;

        // Tạo đối tượng địa chỉ mới
        const newDiaChi = {
            tinhThanhPho,
            quanHuyen,
            phuongXa,
            duongThon,
            Name,
            SoDienThoai,
            isDeleted: false // hoặc giá trị mặc định khác nếu cần
        };
        const diaChi = await DiaChiModel.findOneAndUpdate(
            { IDUser: userId },
            { $push: { diaChiList: newDiaChi } },
            { new: true, upsert: true }
        );
        console.log(diaChi)
        res.status(201).json(diaChi);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi tạo địa chỉ mới' });
    }
}
async function updateDiaChi(req, res, next) {
    try {
        const { userId, diaChiId } = req.params;
        const { tinhThanhPho, quanHuyen, phuongXa, duongThon, Name, SoDienThoai } = req.body;

        // Tạo đối tượng địa chỉ mới
        const updatedDiaChi = {
            tinhThanhPho,
            quanHuyen,
            phuongXa,
            duongThon,
            Name,
            SoDienThoai,
            isDeleted: false // hoặc giá trị mặc định khác nếu cần
        };

        const diaChi = await DiaChiModel.findOneAndUpdate(
            { IDUser: userId, 'diaChiList._id': diaChiId },
            { $set: { 'diaChiList.$': updatedDiaChi } },
            { new: true }
        );
        if (!diaChi) {
            return res.status(404).json({ message: 'Không tìm thấy địa chỉ' });
        }

        res.status(200).json(diaChi);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi cập nhật địa chỉ' });
    }
}
async function deleteDiaChi(req, res, next) {
    try {
        const { userId, diaChiId } = req.params;

        const diaChi = await DiaChiModel.findOneAndUpdate(
            { IDUser: userId },
            { $pull: { diaChiList: { _id: diaChiId } } },
            { new: true }
        )
        //hamdoi trang thai
        // const diaChi = await DiaChiModel.findOneAndUpdate(
        //     { IDUser: userId, 'diaChiList._id': diaChiId },
        //     { $set: { 'diaChiList.$.isDeleted': true } },
        //     { new: true }
        // );
        if (!diaChi) {
            return res.status(404).json({ message: 'Không tìm thấy địa chỉ' });
        }

        res.status(200).json(diaChi);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi xóa địa chỉ' });
    }
}


module.exports = {
    getDiaChiByUserId,
    createDiaChi,
    updateDiaChi,
    deleteDiaChi
};
