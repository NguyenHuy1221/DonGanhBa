const DiaChiModel = require("../models/DiaChiSchema");
const LoaiKhuyenMaiModel = require("../models/LoaiKhuyenMaiSchema")
const NguoiDungModel = require("../models/NguoiDungSchema")
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
                // const updatedUser = await user.save()
                // res.status(200).json(updatedUser);
            }
            else if (role === "hokinhdoanh") {
                user.role = role;
                // const updatedUser = await user.save()
                // res.status(200).json(updatedUser);
            }
            else if (role === "khachhang") {
                user.role = role;
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


module.exports = {
    updateUserRoleAndPermissions
};
