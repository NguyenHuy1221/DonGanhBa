
require("dotenv").config();

const createOrder = async (userId, diaChi, chiTietHoaDon, TongTien, GhiChu) => {
    try {
        const hoaDon = new HoaDon({
            userId,
            diaChi,
            chiTietHoaDon,
            TongTien,
            GhiChu,
            expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 phút
        });

        await hoaDon.save();

        const hoKinhDoanhMap = new Map();

        chiTietHoaDon.forEach(item => {
            const { idBienThe, soLuong, donGia } = item;
            // Assuming you have a method to get hoKinhDoanhId by idBienThe
            const hoKinhDoanhId = getHoKinhDoanhIdByIdBienThe(idBienThe);

            if (!hoKinhDoanhMap.has(hoKinhDoanhId)) {
                hoKinhDoanhMap.set(hoKinhDoanhId, []);
            }
            hoKinhDoanhMap.get(hoKinhDoanhId).push({ idBienThe, soLuong, donGia });
        });

        for (const [hoKinhDoanhId, chiTietDonHang] of hoKinhDoanhMap) {
            const donHang = new DonHang({
                userId,
                hoKinhDoanhId,
                hoaDonId: hoaDon._id,
                chiTietDonHang,
                TongTien: chiTietDonHang.reduce((sum, item) => sum + item.soLuong * item.donGia, 0),
                GhiChu,
            });
            await donHang.save();
        }

        return { message: 'Order created successfully', hoaDon };
    } catch (error) {
        console.error('Error creating order:', error);
        throw new Error('Could not create order');
    }
};
const HoaDon = require('../models/HoaDon');
const DonHang = require('../models/DonHang');

const updateInvoiceStatus = async (hoaDonId) => {
    try {
        const donHangList = await DonHang.find({ hoaDonId });

        const allCompleted = donHangList.every(donHang => donHang.TrangThai === 3); // 3 là trạng thái hoàn thành đơn hàng

        if (allCompleted) {
            await HoaDon.findByIdAndUpdate(hoaDonId, { TrangThai: 3 }); // Cập nhật hóa đơn sang trạng thái hoàn thành
            console.log(`Hóa đơn ${hoaDonId} đã hoàn thành.`);
        }
    } catch (error) {
        console.error(`Lỗi khi cập nhật trạng thái hóa đơn ${hoaDonId}:`, error);
    }
};

const updateOrderStatus = async (donHangId, newStatus) => {
    try {
        const donHang = await DonHang.findByIdAndUpdate(donHangId, { TrangThai: newStatus }, { new: true });

        if (!donHang) {
            return console.error(`Không tìm thấy đơn hàng với id ${donHangId}`);
        }

        console.log(`Đơn hàng ${donHangId} đã cập nhật trạng thái sang ${newStatus}.`);

        // Kiểm tra và cập nhật trạng thái hóa đơn nếu cần
        await updateInvoiceStatus(donHang.hoaDonId);
    } catch (error) {
        console.error(`Lỗi khi cập nhật trạng thái đơn hàng ${donHangId}:`, error);
    }
};




// Giả sử có một endpoint để cập nhật trạng thái đơn hàng
router.post('/donhang/:donHangId/status', async (req, res) => {
    const { donHangId } = req.params;
    const { newStatus } = req.body;

    try {
        await updateOrderStatus(donHangId, newStatus);
        res.status(200).json({ message: 'Trạng thái đơn hàng đã được cập nhật' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái đơn hàng' });
    }
});



module.exports = {

};
