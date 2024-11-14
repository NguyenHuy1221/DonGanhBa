const DiaChiModel = require("../models/DiaChiSchema");
const LoaiKhuyenMaiModel = require("../models/LoaiKhuyenMaiSchema")
const NguoiDungModel = require("../models/NguoiDungSchema")
const ThongBaoModel = require("../models/thongbaoSchema")
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




module.exports = {
    updateUserRoleAndPermissions,
    updateUserRoleAndPermissionsforuser,
    getListThongBaoAdmin,
    createThongBao,
};
