const ThuocTinhModel = require("../models/ThuocTinhSchema");
const ThuocTinhGiaTriModel = require("../models/GiaTriThuocTinhSchema")
const UserModel = require("../models/NguoiDungSchema")
require("dotenv").config();


//ham lay danh sach thuoc tinh
// async function getlistThuocTinh(req, res, next) {
//     const { userId } = req.params;
//     try {

//         let user = {}
//         let thuocTinhs = []
//         if (userId) {
//             user = await UserModel.findById(userId);
//             if (!user) {
//                 return res.status(200).json({
//                     message: "Không tìm thấy user bằng userid"
//                 });
//             }
//         }
//         else {
//             res.status(404).json({ message: 'Chưa có userId' });
//         }

//         if (user.role === "admin" || user.role === "nhanvien") {
//             thuocTinhs = await ThuocTinhModel.find();
//         } else if (user.role === "hokinhdoanh") {

//         } else {
//             return res.status(200).json({ message: "Không có quyền " });
//         }

//         res.status(200).json(thuocTinhs);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Lỗi khi tìm kiếm thuộc tính' });
//     }
// }

// Middleware để kiểm tra quyền truy cập
async function getlistThuocTinh(req, res, next) {
    const { userId } = req.params; // Giả sử bạn đã xác thực người dùng và có thông tin userId và role

    let user = {}
    let thuocTinhs = []
    let query = { isDeleted: false };
    try {
        if (userId) {
            user = await UserModel.findById(userId);
            if (!user) {
                return res.status(200).json({
                    message: "Không tìm thấy user bằng userid"
                });
            }
        }
        else {
            res.status(404).json({ message: 'Chưa có userId' });
        }

        if (user.role === "admin" || user.role === "nhanvien") {

        } else if (user.role === "hokinhdoanh") {
            query.userId = userId
        } else {
            return res.status(200).json({ message: "Không có quyền " });
        }


        thuocTinhs = await ThuocTinhModel.find(query);
        res.status(200).json(thuocTinhs);
    } catch (error) {
        console.error('Lỗi khi lấy thuộc tính:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy thuộc tính' });
    }
}



//hàm thêm thuộc tính
async function createThuocTinh(req, res, next) {
    const { ThuocTinhID, TenThuocTinh, userId } = req.body;
    try {

        // Kiểm tra xem ThuocTinhID đã tồn tại chưa
        const existingThuocTinh = await ThuocTinhModel.findOne({ ThuocTinhID });
        if (!userId) {
            return res.status(404).json({ message: 'thiếu userId' });

        }
        if (existingThuocTinh) {
            return res.status(409).json({ message: 'Thuộc tính đã tồn tại' });
        }
        // Tạo một đối tượng thuộc tính mới dựa trên dữ liệu nhận được
        const newThuocTinh = new ThuocTinhModel({
            ThuocTinhID,
            TenThuocTinh,
            userId,
        });

        // Lưu đối tượng vào cơ sở dữ liệu
        const savedThuocTinh = await newThuocTinh.save();
        // Trả về kết quả cho client
        return res.status(201).json(savedThuocTinh);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi khi cập Thêm thuộc tính' });
    }
}


async function updateThuocTinh(req, res, next) {
    const { ThuocTinhID } = req.params;
    const { TenThuocTinh, userId } = req.body;

    if (!userId) {
        return res.status(404).json({ message: 'chưa có userId' });
    }
    try {
        const updatedThuocTinh = await ThuocTinhModel.findByIdAndUpdate(
            { ThuocTinhID },
            { TenThuocTinh, userId },
            { new: true }
        );
        if (!updatedThuocTinh) {
            return res.status(404).json({ message: 'Không tìm thấy thuộc tính' });
        }
        return res.status(200).json(updatedThuocTinh);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi khi cập nhật thuộc tính' });
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

        return res.status(200).json({ message: 'Xóa thuộc tính thành công' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi khi xóa thuộc tính' });
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
        return res.status(200).json(thuocTinhs);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi khi tìm kiếm thuộc tính' });
    }
}



module.exports = {
    getlistThuocTinh,
    createThuocTinh,
    updateThuocTinh,
    deleteThuocTinh,
    findThuocTinh,
};
