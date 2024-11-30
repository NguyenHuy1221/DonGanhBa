const mongoose = require('mongoose');
const HoaDonSchema = require("../models/HoaDonSchema");
const LoaiKhuyenMaiModel = require("../models/LoaiKhuyenMaiSchema")
const NguoiDungModel = require("../models/NguoiDungSchema")
const sanphamModel = require("../models/SanPhamSchema")
const bientheModel = require("../models/BienTheSchema")
const danhmucModel = require("../models/DanhMucSchema")
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
    const { userId } = req.params;
    let user = {};
    let query = {};
    try {
        // let query = {};

        // // Kiểm tra và xử lý ngày bắt đầu và ngày kết thúc
        // const startDate = fromDate ? new Date(fromDate) : new Date('1970-01-01');  // Đảm bảo startDate đã được khai báo
        // const endDate = toDate ? new Date(toDate) : new Date();

        // if (fromDate && toDate) {
        //     query.NgayTao = {
        //         $gte: startDate,
        //         $lte: endDate
        //     };
        // }

        // Kiểm tra userId và tìm người dùng 
        if (userId) {
            user = await NguoiDungModel.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "Không tìm thấy user bằng userid" });
            }
        }
        else {
            return res.status(400).json({ message: 'Chưa có userId' });
        } // Thiết lập điều kiện truy vấn dựa trên vai trò của người dùng 
        if (user.role === "admin" || user.role === "nhanvien") { // Admin và nhân viên có thể xem tất cả các hóa đơn 
        } else if (user.role === "hokinhdoanh") { query.hoKinhDoanhId = userId; }
        else {
            return res.status(403).json({ message: "Không có quyền truy cập" });
        } // Kiểm tra và xử lý ngày bắt đầu và ngày kết thúc 
        const startDate = fromDate ? new Date(fromDate) : new Date('1970-01-01');
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
    const { userId } = req.params;
    let user = {};
    let query = {};
    try {
        // Kiểm tra và xử lý ngày bắt đầu và ngày kết thúc
        // const startDate = fromDate ? new Date(fromDate) : new Date('1970-01-01');
        // const endDate = toDate ? new Date(toDate) : new Date();

        // if (fromDate && toDate) {
        //     query.NgayTao = {
        //         $gte: startDate,
        //         $lte: endDate
        //     };
        // }
        if (userId) {
            user = await NguoiDungModel.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "Không tìm thấy user bằng userid" });
            }
        }
        else {
            return res.status(400).json({ message: 'Chưa có userId' });
        } // Thiết lập điều kiện truy vấn dựa trên vai trò của người dùng 
        if (user.role === "admin" || user.role === "nhanvien") { // Admin và nhân viên có thể xem tất cả các hóa đơn 
        } else if (user.role === "hokinhdoanh") { query.hoKinhDoanhId = userId; }
        else {
            return res.status(403).json({ message: "Không có quyền truy cập" });
        } // Kiểm tra và xử lý ngày bắt đầu và ngày kết thúc 
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
            TongKhuyenMaidasudung: 0,
            TongDangCho: 0,
            TongKhuyenMaisapsudung: 0,
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
                    TongKhuyenMaidasudung: 0,
                    TongDangCho: 0,
                    TongKhuyenMaisapsudung: 0,
                    TongHuy: 0,
                    TongHoaDon: 0,
                    TongBienTheBan: 0,
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
                if (TrangThai === 0 || TrangThai === 1 || TrangThai === 2) {
                    acc[key].TongKhuyenMaisapsudung += SoTienKhuyenMai;
                }
                if (TrangThai === 3) {
                    acc[key].TongKhuyenMaidasudung += SoTienKhuyenMai;
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
                if (TrangThai === 0 || TrangThai === 1 || TrangThai === 2) {
                    totalData.TongKhuyenMaidasudung += SoTienKhuyenMai;
                }
                if (TrangThai === 3) {
                    totalData.TongKhuyenMaisapsudung += SoTienKhuyenMai;
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


// const SanPham = require('../models/SanPham');
// const BienThe = require('../models/BienThe');
// const HoaDon = require('../models/HoaDon');

async function getProductStatistics(req, res) {
    const { fromDate, toDate } = req.query;

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

        // Lấy danh sách các sản phẩm đang được bán
        const sanPhams = await sanphamModel.find({ TinhTrang: 'Còn hàng', SanPhamMoi: false }).populate("IDDanhMuc");

        // Tính toán số lượng sản phẩm theo từng danh mục
        const categorySales = {};

        sanPhams.forEach(sp => {
            if (!categorySales[sp.IDDanhMuc._id]) {
                categorySales[sp.IDDanhMuc._id] = { soLuong: 0, TenDanhMuc: '' };
            }
            categorySales[sp.IDDanhMuc._id].soLuong += 1;
            categorySales[sp.IDDanhMuc._id].TenDanhMuc = sp.IDDanhMuc.TenDanhMuc;
        });

        // Lấy hóa đơn trong khoảng thời gian
        const hoaDons = await HoaDonSchema.find(query)
            .populate({
                path: 'chiTietHoaDon.idBienThe',
                populate: {
                    path: 'IDSanPham',
                }
            });

        let productSales = {};

        hoaDons.forEach(hoaDon => {
            hoaDon.chiTietHoaDon.forEach(item => {
                const { idBienThe, soLuong } = item;

                if (!productSales[idBienThe.IDSanPham._id]) {
                    productSales[idBienThe.IDSanPham._id] = {
                        soLuong: 0,
                        TenSanPham: idBienThe.IDSanPham.TenSanPham
                    };
                }
                productSales[idBienThe.IDSanPham._id].soLuong += soLuong;
            });
        });

        // Biến đổi productSales thành mảng và sắp xếp theo số lượng bán ra
        let productCounts = Object.entries(productSales).map(([id, { soLuong, TenSanPham }]) => ({ id, soLuong, TenSanPham }));
        productCounts.sort((a, b) => b.soLuong - a.soLuong);

        const totalProductSales = productCounts.reduce((sum, product) => sum + product.soLuong, 0);
        const topSellingProducts = productCounts.slice(0, 10); // Lấy top 10 sản phẩm bán chạy nhất

        res.status(200).json({
            totalProductSales,
            productCounts,
            topSellingProducts,
            categorySales
        });
    } catch (error) {
        console.error('Error: ', error);
        res.status(500).json({ message: 'Lỗi khi lấy thông tin thống kê sản phẩm', error: error.message });
    }
}







module.exports = {
    GetDoanhThu,
    GetDoanhThu12,
    getData,
    getProductStatistics,
};
