const ThuocTinhGiaTriModel = require("../models/GiaTriThuocTinhSchema");
const UserModel = require("../models/NguoiDungSchema")
const ThuocTinhModel = require("../models/ThuocTinhSchema")
require("dotenv").config();


//ham lay danh sach thuoc tinh
// async function getlistThuocTinhGiaTri(req, res, next) {

//     try {
//         const thuocTinhs = await ThuocTinhGiaTriModel.find().populate('ThuocTinhID')
//         res.status(200).json(thuocTinhs);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Lỗi khi tìm kiếm thuộc tính' });
//     }
// }

// async function getlistThuocTinhGiaTri(req, res, next) {
//     const { userId } = req.params;

//     try {
//         // Kiểm tra userId và tìm người dùng
//         if (!userId) {
//             return res.status(400).json({ message: 'Chưa có userId' });
//         }

//         const user = await UserModel.findById(userId);
//         if (!user) {
//             return res.status(404).json({ message: "Không tìm thấy user bằng userid" });
//         }

//         let query = {};
//         query.isDeleted = false
//         // Thiết lập điều kiện truy vấn dựa trên vai trò của người dùng
//         if (user.role === "admin" || user.role === "nhanvien") {
//             // Admin và nhân viên có thể xem tất cả các giá trị thuộc tính
//         } else if (user.role === "admin") {
//             // Người dùng chỉ xem các giá trị thuộc tính dựa vào thuộc tính mà họ có
//             const thuocTinhs = await ThuocTinhModel.find({ userId: user._id, isDeleted: false });

//             if (!thuocTinhs.length) {
//                 return res.status(404).json({ message: "Không có thuộc tính nào được tìm thấy" });
//             }

//             // Lấy danh sách các thuộc tính IDs
//             const thuocTinhIds = thuocTinhs.map(thuocTinh => thuocTinh._id);

//             // Thêm điều kiện lọc theo danh sách thuộc tính IDs
//             query.ThuocTinhID = { $in: thuocTinhIds };
//         } else {
//             return res.status(404).json({ message: "bạn không có quyền" });

//         }

//         // Tìm kiếm giá trị thuộc tính với hoặc không có bộ lọc
//         const thuocTinhGiaTris = await ThuocTinhGiaTriModel.find(query)
//             .populate('ThuocTinhID');

//         res.status(200).json(thuocTinhGiaTris);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Lỗi khi tìm kiếm giá trị thuộc tính' });
//     }
// }

async function getlistThuocTinhGiaTri(req, res, next) {
    const { userId } = req.params;

    try {
        // Kiểm tra userId và tìm người dùng
        if (!userId) {
            return res.status(400).json({ message: 'Chưa có userId' });
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy user bằng userid" });
        }

        let query = {};

        // Thiết lập điều kiện truy vấn dựa trên vai trò của người dùng
        if (user.role === "admin" || user.role === "nhanvien") {
            // Admin và nhân viên có thể xem tất cả các giá trị thuộc tính
            const thuocTinhs = await ThuocTinhModel.find({ isDeleted: false });
            console.log(thuocTinhs)
            if (!thuocTinhs.length) {
                return res.status(404).json({ message: "Không có thuộc tính nào được tìm thấy" });
            }

            // Lấy danh sách các thuộc tính IDs
            const thuocTinhIds = thuocTinhs.map(thuocTinh => thuocTinh._id);

            // Thêm điều kiện lọc theo danh sách thuộc tính IDs
            query.ThuocTinhID = { $in: thuocTinhIds };
            query.isDeleted = false;
        } else {
            // Người dùng chỉ xem các giá trị thuộc tính dựa vào thuộc tính mà họ có
            const thuocTinhs = await ThuocTinhModel.find({ userId: user._id, isDeleted: false });
            console.log(thuocTinhs)
            if (!thuocTinhs.length) {
                return res.status(404).json({ message: "Không có thuộc tính nào được tìm thấy" });
            }

            // Lấy danh sách các thuộc tính IDs
            const thuocTinhIds = thuocTinhs.map(thuocTinh => thuocTinh._id);

            // Thêm điều kiện lọc theo danh sách thuộc tính IDs
            query.ThuocTinhID = { $in: thuocTinhIds };
            query.isDeleted = false;
        }

        // Tìm kiếm giá trị thuộc tính với điều kiện isDeleted: false và populate ThuocTinhID với điều kiện isDeleted: false
        const thuocTinhGiaTris = await ThuocTinhGiaTriModel.find(query)
            .populate({
                path: 'ThuocTinhID',
                match: { isDeleted: false } // Chỉ populate các thuộc tính mà isDeleted là false
            });

        res.status(200).json(thuocTinhGiaTris);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi tìm kiếm giá trị thuộc tính' });
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

    let query = {
        isDeleted: false,
        ThuocTinhID: ThuocTinhID
    };
    try {

        const thuocTinhs = await ThuocTinhGiaTriModel.find(query).populate('ThuocTinhID');;
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
