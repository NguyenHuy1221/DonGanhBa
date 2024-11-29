const DiaChiModel = require("../models/DiaChiSchema");
const LoaiKhuyenMaiModel = require("../models/LoaiKhuyenMaiSchema")
const NguoiDungModel = require("../models/NguoiDungSchema")
const ThongBaoModel = require("../models/thongbaoSchema")
const YeuCauRutTienSchema = require('../models/YeuCauRutTienSchema');
const ThuocTinh = require('../models/ThuocTinhSchema'); // Đảm bảo đường dẫn đúng tới model của bạn

async function UpdateRole(req, res, next) {
    const { userId } = req.params;
    const { role } = req.body
    try {

        if (!['khachhang', 'hokinhdoanh', 'nhanvien', 'admin'].includes(role)) {
            return res.status(400).json({ message: "Quyền không tồn tại" });
        }
        const user = await NguoiDungModel.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "Không tìm thấy người dùng" });
        }
        user.role = role;
        const userPre = await user.save()
        res.status(200).json(userPre);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi thêm người dùng chỉ mới' });
    }
}


async function Updatepermissions(req, res, next) {
    const { userId } = req.params;
    const { role } = req.body
    const validEntities = ['sanpham', 'khuyenmai', 'hoadon'];
    const validActions = ['them', 'xoa', 'sua', 'update'];
    if (!validEntities.includes(entity) || !actions.every(action => validActions.includes(action))) {
        return res.status(400).json({ message: "Quyền không tồn tại" });
    }
    try {

        const user = await NguoiDungModel.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "Không tìm thấy người dùng" });
        }

        const existingPermission = user.permissions.find(permission => permission.entity === entity);
        if (existingPermission) { existingPermission.actions = [...new Set([...existingPermission.actions, ...actions])]; }
        else { user.permissions.push({ entity, actions }); }
        const userPre = await user.save()
        res.status(200).json(userPre);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi thêm người dùng chỉ mới' });
    }
}

async function updateUserRoleAndPermissions(req, res, next) {
    const { userId } = req.params;
    const { role, permissions } = req.body; // Nhận role và permissions từ body request

    const validRoles = ['khachhang', 'hokinhdoanh', 'nhanvien', 'admin'];
    const validEntities = ['sanpham', 'khuyenmai', 'hoadon'];
    const validActions = ['them', 'xoa', 'sua', 'update'];

    try {
        // Kiểm tra role hợp lệ
        if (role && !validRoles.includes(role)) {
            return res.status(400).json({ message: "Vai trò không hợp lệ" });
        }

        const user = await NguoiDungModel.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "Không tìm thấy người dùng" });
        }

        // Cập nhật role nếu có
        if (role) {
            if (!['khachhang', 'hokinhdoanh', 'nhanvien', 'admin'].includes(role)) {
                return res.status(400).json({ message: "Quyền không tồn tại" });
            }
            user.role = role;
            if (role === "nhanvien") {
                // Cập nhật hoặc thay thế permissions nếu có
                if (permissions && Array.isArray(permissions)) {
                    // Thay thế toàn bộ permissions
                    user.permissions = [];

                    for (const { entity, actions } of permissions) {
                        // Kiểm tra thực thể hợp lệ
                        if (!validEntities.includes(entity)) {
                            return res.status(400).json({ message: `Thực thể không hợp lệ: ${entity}` });
                        }
                        user.role = role;
                        // Kiểm tra các hành động hợp lệ
                        if (!actions.every(action => validActions.includes(action))) {
                            return res.status(400).json({ message: `Một hoặc nhiều hành động không hợp lệ cho thực thể ${entity}` });
                        }

                        // Thêm mới quyền hạn
                        user.permissions.push({ entity, actions });
                    }
                } else if (permissions && !Array.isArray(permissions)) {
                    return res.status(400).json({ message: "Permissions phải là một mảng" });
                }
            }
            else if (role === "admin") {
                user.role = role;
                if (user.permissions) {
                    user.permissions = [];
                }
                // const updatedUser = await user.save()
                // res.status(200).json(updatedUser);
            }
            else if (role === "hokinhdoanh") {
                user.role = role;
                if (user.permissions) {
                    user.permissions = [];
                }
                // const updatedUser = await user.save()
                // res.status(200).json(updatedUser);
            }
            else if (role === "khachhang") {
                user.role = role;
                if (user.permissions) {
                    user.permissions = [];
                }
                // const updatedUser = await user.save()
                // res.status(200).json(updatedUser);
            }
        }

        const updatedUser = await user.save();
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Lỗi khi cập nhật vai trò và quyền hạn của người dùng:', error);
        res.status(500).json({ message: 'Lỗi khi cập nhật vai trò và quyền hạn của người dùng' });
    }
}


async function updateUserRoleAndPermissionsforuser(req, res, next) {
    const { userId } = req.params;
    const { role } = req.body; // Nhận role và permissions từ body request

    const validRoles = ['khachhang', 'hokinhdoanh'];


    try {
        // Kiểm tra role hợp lệ
        if (role && !validRoles.includes(role)) {
            return res.status(400).json({ message: "Vai trò không hợp lệ" });
        }

        const user = await NguoiDungModel.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "Không tìm thấy người dùng" });
        }

        // Cập nhật role nếu có
        if (role) {

            user.role = role;
            if (role === "hokinhdoanh") {
                user.role = role;
                if (user.permissions) {
                    user.permissions = [];
                }
                // const updatedUser = await user.save()
                // res.status(200).json(updatedUser);
            }
            else if (role === "khachhang") {
                user.role = role;
                if (user.permissions) {
                    user.permissions = [];
                }
                // const updatedUser = await user.save()
                // res.status(200).json(updatedUser);
            }
        }

        const updatedUser = await user.save();
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Lỗi khi cập nhật vai trò và quyền hạn của người dùng:', error);
        res.status(500).json({ message: 'Lỗi khi cập nhật vai trò và quyền hạn của người dùng' });
    }
}

// async function updateUserRoleAndPermissions(req, res, next) {
//     const { userId } = req.params;
//     const { role, entity, actions, permissions } = req.body;

//     const validRoles = ['khachhang', 'hokinhdoanh', 'nhanvien', 'admin'];
//     const validEntities = ['sanpham', 'khuyenmai', 'hoadon'];
//     const validActions = ['them', 'xoa', 'sua', 'update'];

//     try {
//         // Kiểm tra role hợp lệ
//         if (role && !validRoles.includes(role)) {
//             return res.status(400).json({ message: "Vai trò không tồn tại" });
//         }

//         // Kiểm tra entity và actions hợp lệ nếu chúng được cung cấp
//         if (entity && !validEntities.includes(entity)) {
//             return res.status(400).json({ message: "Thực thể không tồn tại" });
//         }
//         if (actions && !actions.every(action => validActions.includes(action))) {
//             return res.status(400).json({ message: "Hành động không tồn tại" });
//         }

//         const user = await NguoiDungModel.findById(userId);
//         if (!user) {
//             return res.status(400).json({ message: "Không tìm thấy người dùng" });
//         }

//         // Cập nhật role nếu có
//         if (role) {
//             user.role = role;
//         }

//         // Cập nhật permissions nếu có
//         if (entity && actions) {
//             const existingPermission = user.permissions.find(permission => permission.entity === entity);
//             if (existingPermission) {
//                 existingPermission.actions = [...new Set([...existingPermission.actions, ...actions])];
//             } else {
//                 user.permissions.push({ entity, actions });
//             }
//         }

//         if (permissions && Array.isArray(permissions)) {
//             permissions.forEach(({ entity, actions }) => {
//                 if (!validEntities.includes(entity) || !actions.every(action => validActions.includes(action))) {
//                     return res.status(400).json({ message: `Quyền không hợp lệ cho thực thể ${entity}` });
//                 }
//                 const existingPermission = user.permissions.find(permission => permission.entity === entity);
//                 if (existingPermission) { existingPermission.actions = [...new Set([...existingPermission.actions, ...actions])]; }
//                 else { user.permissions.push({ entity, actions }); }
//             });
//         }
//         const updatedUser = await user.save();
//         res.status(200).json(updatedUser);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Lỗi khi cập nhật vai trò và quyền hạn của người dùng' });
//     }
// }


async function getListThongBao(req, res) {
    const { userId } = req.params;
    try {
        const thongBaos = await ThongBaoModel.find({ userId: userId }).sort({ ngayTao: -1 });

        return res.status(200).json(thongBaos);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách thông báo:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách thông báo' });
    }
}
async function getListThongBaoAdmin(req, res) {
    try {
        const thongBaos = await ThongBaoModel.find().sort({ ngayTao: -1 }).populate("userId");

        return res.status(200).json(thongBaos);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách thông báo:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách thông báo' });
    }
}
async function createThongBao(req, res) {
    const { userId, tieude, noidung } = req.body;
    try {
        const newThongBao = new ThongBaoModel({
            userId,
            tieude,
            noidung,
        });

        await newThongBao.save();
        res.status(201).json({ message: 'Tạo thông báo thành công', thongBao: newThongBao });
    } catch (error) {
        console.error('Lỗi khi tạo thông báo:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi tạo thông báo' });
    }
}

async function createThongBaoNoreq(userId, tieude, noidung) {
    try {
        const newThongBao = new ThongBaoModel({
            userId,
            tieude,
            noidung,
        });

        await newThongBao.save();
        return { success: true, message: 'Tạo thông báo thành công', thongBao: newThongBao };
    } catch (error) {
        console.error('Lỗi khi tạo thông báo:', error);
        return { success: false, message: 'Đã xảy ra lỗi khi tạo thông báo' };
    }
}


async function updateDaDoc(req, res) {
    const { thongBaoId } = req.params;
    try {
        const thongBao = await ThongBaoModel.findById(thongBaoId);
        if (!thongBao) {
            return res.status(404).json({ message: 'Không tìm thấy thông báo' });
        }

        thongBao.daDoc = true;
        await thongBao.save();

        res.status(200).json({ message: 'Đã cập nhật trạng thái đọc của thông báo', thongBao });
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái đọc của thông báo:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật trạng thái đọc của thông báo' });
    }
}

// Lấy danh sách yêu cầu rút tiền của người dùng theo userId
async function getUserWithdrawalRequests(req, res) {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ message: 'Thiếu thông tin userId' });
    }

    try {
        const requests = await YeuCauRutTienSchema.find({ userId, isDeleted: false });

        return res.status(200).json({ requests });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách yêu cầu rút tiền của người dùng:', error);
        return res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách yêu cầu rút tiền của người dùng' });
    }
}

// Lấy danh sách yêu cầu rút tiền cho admin với các điều kiện lọc
async function getAdminYeuCauRutTien(req, res) {
    const { isDeleted, daXuLy, choXacThuc, thatBai } = req.query;

    const filter = {};

    // if (isDeleted !== undefined) filter.isDeleted = isDeleted === 'false';
    // if (daXuLy !== undefined) filter.daXuLy = daXuLy === 'false';
    // if (choXacThuc !== undefined) filter.XacThuc = choXacThuc === 'false';
    // if (thatBai !== undefined) filter.thatBai = thatBai === 'false';
    // Mặc định chỉ lấy những yêu cầu chưa xử lý nếu không có điều kiện lọc nào được gửi
    //if (Object.keys(filter).length === 0) filter.daXuLy = false;

    try {
        const requests = await YeuCauRutTienSchema.find(filter).populate('userId');

        return res.status(200).json({ requests });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách yêu cầu rút tiền cho admin:', error);
        return res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách yêu cầu rút tiền cho admin' });
    }
}
async function updateYeuCauRutTien(req, res) {
    const { requestId } = req.params;
    const { trangThai } = req.body
    if (!requestId) {
        return res.status(400).json({ message: 'Thiếu thông tin requestId' });
    }

    try {
        const checkrequest = await YeuCauRutTienSchema.findById(requestId)

        if (!checkrequest.XacThuc) {
            return res.status(400).json({ message: 'Yêu cầu chưa được xác thực' });
        }
        if (trangThai === "xacnhan") {
            const request = await YeuCauRutTienSchema.findByIdAndUpdate(
                requestId,
                { daXuLy: true },
                { new: true }
            );
            if (!request) {
                return res.status(404).json({ message: 'Không tìm thấy yêu cầu rút tiền' });
            }
            return res.status(200).json({ message: 'Yêu cầu rút tiền đã được cập nhật', request });

        } else if (trangThai === "huy") {
            const request = await YeuCauRutTienSchema.findByIdAndUpdate(
                requestId,
                {
                    daXuLy: true,
                    thatBai: true,
                },
                { new: true }
            );
            if (!request) {
                return res.status(404).json({ message: 'Không tìm thấy yêu cầu rút tiền' });
            }
            return res.status(200).json({ message: 'Yêu cầu rút tiền đã được cập nhật', request });

        } else {
            return res.status(200).json({ message: 'Trạng thái không chính xác' });

        }


    } catch (error) {
        console.error('Lỗi khi cập nhật yêu cầu rút tiền:', error);
        return res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật yêu cầu rút tiền' });
    }
}



async function deleteManyWithdrawalRequests(req, res) {
    try {
        // Cập nhật tất cả yêu cầu có daXuLy là true và isDeleted là false thành isDeleted = true
        const result = await YeuCauRutTienSchema.updateMany(
            { daXuLy: true, isDeleted: false, XacThuc: true },
            { $set: { isDeleted: true } }
        );

        return res.status(200).json({ message: 'Đã cập nhật trạng thái xóa cho các yêu cầu rút tiền', result });
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái xóa cho các yêu cầu rút tiền:', error);
        return res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật trạng thái xóa cho các yêu cầu rút tiền' });
    }
}

//đây là hàm thử nhiệm ko sử dụng
async function demoUploadimageviettel(req, res) {
    const { userId, tieude, noidung } = req.body;

    // Kiểm tra xem có file upload hay không
    const file = req.file;
    let fileUrl = '';

    if (file) {
        const bucketName = process.env.VIETTEL_BUCKET;
        const objectKey = file.mimetype.startsWith('image/') ? `images/${uuidv4()}-${file.originalname}` : `videos/${uuidv4()}-${file.originalname}`;

        try {
            fileUrl = await uploadFileToViettelCloud(file.buffer, bucketName, objectKey, file.mimetype);
        } catch (error) {
            console.error('Lỗi khi tải lên ảnh:', error);
            return res.status(500).json({ message: 'Đã xảy ra lỗi khi tải lên ảnh' });
        }
    }

    try {
        const newThongBao = new ThongBaoModel({
            userId,
            tieude,
            noidung,
            imageUrl: fileUrl // Lưu đường dẫn ảnh vào thông báo
        });

        await newThongBao.save();
        res.status(201).json({ message: 'Tạo thông báo thành công', thongBao: newThongBao });
    } catch (error) {
        console.error('Lỗi khi tạo thông báo:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi tạo thông báo' });
    }
}



async function FixadminupdateThuocTinhIsDeleted(req, res) {
    try {
        // Tìm tất cả các thuộc tính không có trường `isDeleted`
        const thuocTinhs = await ThuocTinh.find({ isDeleted: { $exists: false } });

        // Cập nhật trường `isDeleted` với giá trị `false`
        const updatePromises = thuocTinhs.map(thuocTinh =>
            ThuocTinh.updateOne({ _id: thuocTinh._id }, { $set: { isDeleted: false } })
        );

        // Đợi tất cả các cập nhật hoàn thành
        await Promise.all(updatePromises);

        res.status(201).json({ message: 'update thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Đã xảy ra lỗi ' });
    }
}


module.exports = {
    updateUserRoleAndPermissions,
    updateUserRoleAndPermissionsforuser,
    getListThongBaoAdmin,
    createThongBao,
    getUserWithdrawalRequests,
    getAdminYeuCauRutTien,
    updateYeuCauRutTien,
    deleteManyWithdrawalRequests,
    FixadminupdateThuocTinhIsDeleted,

};
