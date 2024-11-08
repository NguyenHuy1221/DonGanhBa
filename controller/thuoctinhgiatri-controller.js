const ThuocTinhGiaTriModel = require("../models/GiaTriThuocTinhSchema");
require("dotenv").config();


//ham lay danh sach thuoc tinh
async function getlistThuocTinhGiaTri(req, res, next) {

    try {
        const thuocTinhs = await ThuocTinhGiaTriModel.find().populate('ThuocTinhID')
        res.status(200).json(thuocTinhs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi tìm kiếm thuộc tính' });
    }
}


//hàm thêm thuộc tính
async function createThuocTinhGiaTri(req, res, next) {
    const { IDGiaTriThuocTinh, ThuocTinhID, GiaTri } = req.body;
    try {

        // Kiểm tra xem ThuocTinhID đã tồn tại chưa
        const existingThuocTinh = await ThuocTinhGiaTriModel.findOne({ IDGiaTriThuocTinh });

        if (existingThuocTinh) {
            return res.status(409).json({ message: 'Thuộc tính đã tồn tại' });
        }
        // Tạo một đối tượng thuộc tính mới dựa trên dữ liệu nhận được
        const newThuocTinhGiaTri = new ThuocTinhGiaTriModel({
            IDGiaTriThuocTinh,
            ThuocTinhID,
            GiaTri
        });

        // Lưu đối tượng vào cơ sở dữ liệu
        const savedThuocTinhGiaTri = await newThuocTinhGiaTri.save();

        // Trả về kết quả cho client
        res.status(201).json(savedThuocTinhGiaTri);
    } catch (error) {
        if (error.code === 11000) {
            console.error('IDGiaTriThuocTinh đã tồn tại');
        } else {
            console.error('Lỗi khác:', error);
        }
    }
}


async function updateThuocTinhGiaTri(req, res, next) {
    // const { ThuocTinhID } = req.params;
    const { IDGiaTriThuocTinh, GiaTri } = req.body;

    try {
        const updatedThuocTinhGiaTri = await ThuocTinhGiaTriModel.findOneAndUpdate(
            { IDGiaTriThuocTinh },
            { GiaTri },
            { new: true }
        );

        if (!updatedThuocTinhGiaTri) {
            return res.status(404).json({ message: 'Không tìm thấy giá trị thuộc tính' });
        }

        res.status(200).json(updatedThuocTinhGiaTri);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi cập nhật giá trị thuộc tính' });
    }
}

async function deleteThuocTinhGiaTri(req, res, next) {
    const { IDGiaTriThuocTinh } = req.params;

    try {
        // Tìm và cập nhật trạng thái isDeleted thành true
        const updatedThuocTinhGiaTri = await ThuocTinhGiaTriModel.findByIdAndUpdate(
            IDGiaTriThuocTinh,
            { isDeleted: true },
            { new: true } // Để trả về bản ghi sau khi cập nhật
        );
        if (!updatedThuocTinhGiaTri) {
            return res.status(404).json({ message: 'Không tìm thấy giá trị thuộc tính' });
        }
        res.status(200).json({ message: 'Cập nhật trạng thái giá trị thuộc tính thành công' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi cập nhật giá trị thuộc tính' });
    }
}

async function findThuocTinhGiaTri(req, res, next) {
    const { ThuocTinhID } = req.params;


    try {
        const thuocTinhs = await ThuocTinhGiaTriModel.find({ ThuocTinhID: ThuocTinhID }).populate('ThuocTinhID');;
        res.status(200).json(thuocTinhs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi tìm kiếm giá trị thuộc tính' });
    }
}



module.exports = {
    getlistThuocTinhGiaTri,
    createThuocTinhGiaTri,
    updateThuocTinhGiaTri,
    deleteThuocTinhGiaTri,
    findThuocTinhGiaTri,
};
