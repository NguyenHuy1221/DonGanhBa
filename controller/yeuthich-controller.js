const NguoiDungschema = require('../models/NguoiDungSchema');
const SanPhamSchema = require('../models/SanPhamSchema');
const YeuThichSchema = require("../models/YeuThichSchema");
//dung cho viec hien thi danh sach yeu thich
async function getListYeuThich(req, res) {
    const { userId } = req.params;
    try {
        const user = await NguoiDungschema.findById(userId).populate({
            path: 'IDYeuThich', populate: {
                path: 'sanphams.IDSanPham', model: 'SanPham' // Tên model của schema sản phẩm 
            }
        });
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách người dùng' });
    }
}
//dung cho viec check xem san pham nao da yeu thich
async function getListYeuThichNopopulate(req, res) {
    const { userId } = req.params;
    try {
        const user = await NguoiDungschema.findById(userId).populate("IDYeuThich");
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách người dùng' });
    }
}

async function addToFavorites(req, res) {
    const { userId, productId } = req.params;

    try {
        // Tìm người dùng theo ID
        const user = await NguoiDungschema.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
        }

        // Nếu IDYeuThich không tồn tại, tạo mới
        let yeuThich;
        if (!user.IDYeuThich) {
            yeuThich = new YeuThichSchema({ sanphams: [{ IDSanPham: productId }] });
            await yeuThich.save();

            // Cập nhật IDYeuThich của người dùng
            user.IDYeuThich = yeuThich._id;
            await user.save();
        } else {
            // Nếu IDYeuThich tồn tại, tìm và cập nhật YeuThich
            yeuThich = await YeuThichSchema.findById(user.IDYeuThich);
            if (!yeuThich) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy danh sách yêu thích' });
            }

            // Kiểm tra xem sản phẩm đã tồn tại trong danh sách yêu thích chưa 
            const existingProductIndex = yeuThich.sanphams.findIndex(sanpham => sanpham.IDSanPham.equals(productId)); if (existingProductIndex === -1) { // Nếu sản phẩm chưa tồn tại, thêm vào danh sách yêu thích 
                await YeuThichSchema.findOneAndUpdate({ _id: user.IDYeuThich }, { $push: { sanphams: { IDSanPham: productId } } }, { new: true, runValidators: true }); return res.status(200).json({ success: true, message: 'Đã thêm sản phẩm vào danh sách yêu thích' });
            } else { // Nếu sản phẩm đã tồn tại, xóa khỏi danh sách yêu thích 
                await YeuThichSchema.findOneAndUpdate({ _id: user.IDYeuThich }, { $pull: { sanphams: { IDSanPham: productId } } }, { new: true, runValidators: true }); return res.status(200).json({ success: true, message: 'Đã xóa sản phẩm khỏi danh sách yêu thích' });

            }
        }
        return res.status(200).json({ success: true, message: 'Đã thêm sản phẩm vào danh sách yêu thích', yeuThich });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Lỗi khi thêm sản phẩm vào danh sách yêu thích' });
    }
}


module.exports = {
    getListYeuThich,
    addToFavorites,
    getListYeuThichNopopulate,
};
