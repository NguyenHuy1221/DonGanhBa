const HoaDonSchema = require("../models/HoaDonSchema");
const LoaiKhuyenMaiModel = require("../models/LoaiKhuyenMaiSchema")
const NguoiDungModel = require("../models/NguoiDungSchema")


async function GetDoanhThu(req, res, next) {
    const { fromDate, toDate, filter } = req.query;
    try {

        let query = {};

        if (fromDate && toDate) {
            // Chuyển đổi các ngày từ query sang dạng Date object
            const start = startDate ? new Date(startDate) : new Date('1970-01-01');
            const end = endDate ? new Date(endDate) : new Date();

            // Thiết lập bộ lọc ngày
            query.NgayTao = {
                $gte: start,
                $lte: end
            };
        }

        const hoaDons = await HoaDonSchema.find(query);

        const result = hoaDons.reduce((acc, hoaDon) => {
            const { TongTien, DaThanhToan, TrangThai, NgayTao } = hoaDon;

            let key;
            const date = new Date(NgayTao);
            switch (filter) {
                case 'tuan':
                    const startOfWeek = new Date(date.setDate(date.getDate() - date.getDay())); // Lấy ngày bắt đầu tuần
                    key = `Tuần này ${startOfWeek.toLocaleDateString()}`;
                    break;
                case 'thang':
                    key = `Tháng ${date.getMonth() + 1}`;
                    break;
                default:
                    key = date.toLocaleDateString();
            }

            if (!acc[key]) {
                acc[key] = { totalRevenue: 0, totalPending: 0, totalCanceled: 0 };
            }

            if (DaThanhToan || TrangThai === 3) {
                acc[key].totalRevenue += TongTien;
            } else if (TrangThai === 4) {
                acc[key].totalCanceled += TongTien;
            } else {
                acc[key].totalPending += TongTien;
            }

            return acc;
        }, {});
        res.status(200).json(result);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Lỗi khi Lấy thông tin doanh thu', error });
    }
}


module.exports = {
    GetDoanhThu
};
