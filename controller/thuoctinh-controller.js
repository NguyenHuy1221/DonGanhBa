const ThuocTinhModel = require("../models/ThuocTinhSchema");
const ThuocTinhGiaTriModel = require("../models/GiaTriThuocTinhSchema")
require("dotenv").config();


//ham lay danh sach thuoc tinh
async function getlistThuocTinh(req, res, next) {

    try {
        const thuocTinhs = await ThuocTinhModel.find();
        res.status(200).json(thuocTinhs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi tìm kiếm thuộc tính' });
    }
}


//hàm thêm thuộc tính
async function createThuocTinh(req, res, next) {
    const { ThuocTinhID, TenThuocTinh } = req.body;
    try {

        // Kiểm tra xem ThuocTinhID đã tồn tại chưa
        const existingThuocTinh = await ThuocTinhModel.findOne({ ThuocTinhID });

        if (existingThuocTinh) {
            return res.status(409).json({ message: 'Thuộc tính đã tồn tại' });
        }
        // Tạo một đối tượng thuộc tính mới dựa trên dữ liệu nhận được
        const newThuocTinh = new ThuocTinhModel({
            ThuocTinhID,
            TenThuocTinh
        });

        // Lưu đối tượng vào cơ sở dữ liệu
        const savedThuocTinh = await newThuocTinh.save();

        // Trả về kết quả cho client
        res.status(201).json(savedThuocTinh);
    } catch (error) {
        if (error.code === 11000) {
            console.error('ThuocTinhID đã tồn tại');
        } else {
            console.error('Lỗi khác:', error);
        }
    }
}


async function updateThuocTinh(req, res, next) {
    const { ThuocTinhID } = req.params;
    const { TenThuocTinh } = req.body;

    try {
        const updatedThuocTinh = await ThuocTinhModel.findByIdAndUpdate(
            { ThuocTinhID },
            { TenThuocTinh },
            { new: true }
        );

        if (!updatedThuocTinh) {
            return res.status(404).json({ message: 'Không tìm thấy thuộc tính' });
        }

        res.status(200).json(updatedThuocTinh);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi cập nhật thuộc tính' });
    }
}

async function deleteThuocTinh(req, res, next) {
    const { ThuocTinhID } = req.params;

    try {
        const updatedThuocTinh = await ThuocTinhModel.findByIdAndUpdate(
            ThuocTinhID,
            { isDeleted: true },
            { new: true }
        );
        if (!updatedThuocTinh) {
            return res.status(404).json({ message: 'Không tìm thấy thuộc tính' });
        }
        await ThuocTinhGiaTriModel.updateMany({ ThuocTinhID }, { isDeleted: true });

        res.status(200).json({ message: 'Xóa thuộc tính thành công' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi xóa thuộc tính' });
    }
}

async function findThuocTinh(req, res, next) {
    const { ThuocTinhID, TenThuocTinh } = req.body;

    let query = {};
    if (ThuocTinhID) {
        query.ThuocTinhID = ThuocTinhID;
    }
    if (TenThuocTinh) {
        query.TenThuocTinh = { $regex: TenThuocTinh, $options: 'i' }; // Tìm kiếm không phân biệt hoa thường
    }

    try {
        const thuocTinhs = await ThuocTinhModel.find(query);
        res.status(200).json(thuocTinhs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi tìm kiếm thuộc tính' });
    }
}



module.exports = {
    getlistThuocTinh,
    createThuocTinh,
    updateThuocTinh,
    deleteThuocTinh,
    findThuocTinh,
};
