const BienTheModel = require("../models/BienTheSchema");
require("dotenv").config();


//ham lay danh sach bien the
async function getlistBienTheByID(req, res, next) {
    const IDSanPham = req.query.IDSanPham;
    try {
        const bienthes = await BienTheModel.find({ IDSanPham: IDSanPham });
        res.status(200).json(bienthes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi tìm kiếm bien the' });
    }
}

//ham code lay gia tri thuoc tinh ben trong san pham // ham nay quan trong đe sau nay lam
// async function getlistBienTheByID(req, res, next) {
//     const IDSanPham = req.query.IDSanPham;
//     try {
//         const bienthes = await BienTheModel.find({IDSanPham:IDSanPham});
//         res.status(200).json(bienthes);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Lỗi khi tìm kiếm bien the' });
//     }
// }



//hàm thêm bien the
async function createBienTheInSanPham(req, res, next) {
    const { IDSanPham, ListGiaTriThuocTinh, soLuong, gia, sku, } = req.body;
    try {

        // Kiểm tra xem ThuocTinhID đã tồn tại chưa
        const existingThuocTinh = await BienTheModel.findOne({ IDSanPham: IDSanPham, KetHopThuocTinh: ListGiaTriThuocTinh });

        if (existingThuocTinh) {
            return res.status(409).json({ message: 'Biến thể đã tồn tại' });
        }
        // Tạo một đối tượng thuộc tính mới dựa trên dữ liệu nhận được
        const newbienthe = new BienTheModel({
            IDSanPham,
            KetHopThuocTinh: ListGiaTriThuocTinh,
            soLuong,
            sku,
            gia,

        });
        // Lưu đối tượng vào cơ sở dữ liệu
        const savedBienTHe = await newbienthe.save();

        // Trả về kết quả cho client
        res.status(201).json(newbienthe);
    } catch (error) {
        if (error.code === 11000) {
            console.error('Lỗi thêm Biến thể đã tồn tại');
        } else {
            console.error('Lỗi khác:', error);
        }
    }
}
//hàm thêm update
async function updateBienTheInSanPham(req, res, next) {
    const { IDBienThe, ListGiaTriThuocTinh, soLuong, gia, sku, } = req.body;
    try {

        // Kiểm tra xem ThuocTinhID đã tồn tại chưa
        const existingThuocTinh = await BienTheModel.findOne({ IDSanPham: IDSanPham, KetHopThuocTinh: ListGiaTriThuocTinh });

        if (existingThuocTinh) {
            return res.status(409).json({ message: 'Biến thể đã tồn tại' });
        }
        // Tạo một đối tượng thuộc tính mới dựa trên dữ liệu nhận được
        const updatedBienThe = await BienTheModel.findOneAndUpdate(
            { _id: IDBienThe },
            { KetHopThuocTinh: ListGiaTriThuocTinh, soLuong, gia, sku },
            { new: true }
        );

        if (!updatedBienThe) {
            return res.status(404).json({ message: 'Không tìm thấy thuộc tính' });
        }

        // Trả về kết quả cho client
        res.status(201).json(updatedBienThe);
    } catch (error) {
        if (error.code === 11000) {
            console.error('Lỗi update Biến thể loi');
        } else {
            console.error('Lỗi khác:', error);
        }
    }
}

async function deleteBienTheInSanPham(req, res, next) {
    const { IDBienThe } = req.params;

    try {
        const deletedBienThe = await BienTheModel.findOneAndDelete(IDBienThe);

        if (!deletedBienThe) {
            return res.status(404).json({ message: 'Không tìm thấy Biến thể' });
        }

        res.status(200).json({ message: 'Xóa Biến thể thành công' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi xóa Biến thể' });
    }
}



async function findBienTheInSanPham(req, res, next) {
    const { sku } = req.params;

    let query = {};

    if (sku) {
        query.sku = { $regex: sku, $options: 'i' }; // Tìm kiếm không phân biệt hoa thường
    }

    try {
        const BienThes = await BienTheModel.find(query);
        res.status(200).json(BienThes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi tìm kiếm Biến thể' });
    }
}
async function findBienTheByIdSanPham(req, res, next) {
    const { id } = req.params;

    let query = {};

    // if (_id) {
    //     query._id = { $regex: _id, $options: 'i' }; // Tìm kiếm không phân biệt hoa thường
    // }

    try {
        const BienThes = await BienTheModel.findById(id);
        res.status(200).json(BienThes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi tìm kiếm Biến thể' });
    }
}



module.exports = {
    getlistBienTheByID,
    createBienTheInSanPham,
    updateBienTheInSanPham,
    deleteBienTheInSanPham,
    findBienTheInSanPham,
    findBienTheByIdSanPham,
};
