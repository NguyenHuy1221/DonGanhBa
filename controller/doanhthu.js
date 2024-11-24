const mongoose = require('mongoose');
const HoaDonSchema = require("../models/HoaDonSchema");
const LoaiKhuyenMaiModel = require("../models/LoaiKhuyenMaiSchema")
const NguoiDungModel = require("../models/NguoiDungSchema")

async function GetDoanhThu(req, res, next) {
    const { fromDate, toDate, filter } = req.query;
    try {

        let query = {};

        if (fromDate && toDate) {
            // Chuyển đổi các ngày từ query sang dạng Date object
            const start = fromDate ? new Date(fromDate) : new Date('1970-01-01');
            const end = toDate ? new Date(toDate) : new Date();

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

async function GetDoanhThu12(req, res, next) {
    const { fromDate, toDate, filter } = req.query;
    try {
        let query = {};

        // Kiểm tra và xử lý ngày bắt đầu và ngày kết thúc
        const startDate = fromDate ? new Date(fromDate) : new Date('1970-01-01');  // Đảm bảo startDate đã được khai báo
        const endDate = toDate ? new Date(toDate) : new Date();

        if (fromDate && toDate) {
            query.NgayTao = {
                $gte: startDate,
                $lte: endDate
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
        console.log("Error: ", error); // Log lỗi chi tiết
        res.status(500).json({ message: 'Lỗi khi Lấy thông tin doanh thu', error: error.message });
    }
}

async function getData(req, res) {
    const { fromDate, toDate, filter } = req.query;

    try {
        let query = {};

        // Kiểm tra và xử lý ngày bắt đầu và ngày kết thúc
        const startDate = fromDate ? new Date(fromDate) : new Date('1970-01-01');
        const endDate = toDate ? new Date(toDate) : new Date();

        if (fromDate && toDate) {
            query.NgayTao = {
                $gte: startDate,
                $lte: endDate
            };
        }

        const hoaDons = await HoaDonSchema.find(query);

        let totalData = {
            TongDoanhThu: 0,
            TongDangCho: 0,
            TongHuy: 0,
            TongHoaDon: 0,
            TongBienTheBan: 0,
            TongKhuyenMai: 0,
            DonHangCho: 0,
            DonHangXacNhan: 0,
            DonHangHuy: 0
        };

        const result = hoaDons.reduce((acc, hoaDon) => {
            const { TongTien, DaThanhToan, TrangThai, NgayTao, chiTietHoaDon, SoTienKhuyenMai, khuyenmaiId } = hoaDon;

            let key;
            const date = new Date(NgayTao);
            switch (filter) {
                case 'tuan':
                    const startOfWeek = new Date(date.setDate(date.getDate() - date.getDay()));
                    key = `Tuần ${startOfWeek.toLocaleDateString()}`;
                    break;
                case 'thang':
                    key = `Tháng ${date.getMonth() + 1}`;
                    break;
                default:
                    key = date.toLocaleDateString();
            }

            if (!acc[key]) {
                acc[key] = {
                    TongDoanhThu: 0,
                    TongDangCho: 0,
                    TongHuy: 0,
                    TongHoaDon: 0,
                    TongBienTheBan: 0,
                    TongKhuyenMai: 0,
                    DonHangCho: 0,
                    DonHangXacNhan: 0,
                    DonHangHuy: 0
                };
            }

            acc[key].TongHoaDon += 1;
            acc[key].TongBienTheBan += chiTietHoaDon.reduce((count, item) => count + item.soLuong, 0);

            if (DaThanhToan || TrangThai === 3) {
                acc[key].TongDoanhThu += TongTien;
                acc[key].DonHangXacNhan += 1;
            } else if (TrangThai === 4) {
                acc[key].TongHuy += TongTien;
                acc[key].DonHangHuy += 1;
            } else {
                acc[key].TongDangCho += TongTien;
                acc[key].DonHangCho += 1;
            }

            if (SoTienKhuyenMai > 0 && khuyenmaiId) {
                if (TrangThai === 0 || TrangThai === 1) {
                    acc[key].TongKhuyenMai += SoTienKhuyenMai;
                }
            }

            // Cập nhật tổng số liệu
            totalData.TongHoaDon += 1;
            totalData.TongBienTheBan += chiTietHoaDon.reduce((count, item) => count + item.soLuong, 0);

            if (DaThanhToan || TrangThai === 3) {
                totalData.TongDoanhThu += TongTien;
                totalData.DonHangXacNhan += 1;
            } else if (TrangThai === 4) {
                totalData.TongHuy += TongTien;
                totalData.DonHangHuy += 1;
            } else {
                totalData.TongDangCho += TongTien;
                totalData.DonHangCho += 1;
            }

            if (SoTienKhuyenMai > 0 && khuyenmaiId) {
                if (TrangThai === 0 || TrangThai === 1) {
                    totalData.TongKhuyenMai += SoTienKhuyenMai;
                }
            }

            return acc;
        }, {});

        res.status(200).json({ result, totalData });
    } catch (error) {
        console.error('Error: ', error);
        res.status(500).json({ message: 'Lỗi khi lấy thông tin dữ liệu', error: error.message });
    }
}






module.exports = {
    GetDoanhThu,
    GetDoanhThu12,
    getData,
};
