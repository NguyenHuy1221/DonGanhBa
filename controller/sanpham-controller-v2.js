const SanPhamModel = require("../models/SanPhamSchema");
const ThuocTinhModel = require("../models/ThuocTinhSchema");
const ThuocTinhGiaTriModel = require("../models/GiaTriThuocTinhSchema");
const BienTheSchema = require("../models/BienTheSchema");
const GiaTriThuocTinhModel = require("../models/GiaTriThuocTinhSchema")
const mongoose = require("mongoose");
const tiengviet = require('tiengviet');
const fs = require('fs');
const path = require('path');
const HoadonModel = require("../models/HoaDonSchema")
const YeuThichModel = require("../models/YeuThichSchema")
const GiohangModel = require("../models/GioHangSchema")
const UserModel = require("../models/NguoiDungSchema")
//thu vien tim ket qua gan dung
const fuzzysearch = require('fuzzysearch');

require("dotenv").config();
const multer = require("multer");
const util = require('util');
const { v4: uid } = require('uuid');
const HoaDon = require("../models/HoaDonSchema");


const { uploadFileToViettelCloud, uploadmemory } = require("../untils/index")
const { checkDuplicateGiaTriThuocTinh } = require("../helpers/helpers")
const { v4: uuidv4 } = require('uuid');
// const { upload } = require("../untils/index");
//ham lay danh sach thuoc tinh


async function addThuocTinhForSanPham(req, res, next) {
    const { IDSanPham } = req.params;
    const { thuocTinhId, giaTriThuocTinhIds } = req.body;

    try {
        const sanPham = await SanPhamModel.findById(IDSanPham);
        if (!sanPham) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }

        // Tìm thuộc tính theo thuocTinhId
        const existingThuocTinhIndex = sanPham.DanhSachThuocTinh.findIndex(
            (tt) => tt.thuocTinh.toString() === thuocTinhId.toString()
        );

        if (existingThuocTinhIndex !== -1) {
            // Nếu thuộc tính đã tồn tại, thêm các giá trị thuộc tính mới vào
            giaTriThuocTinhIds.forEach(giaTri => {
                if (!sanPham.DanhSachThuocTinh[existingThuocTinhIndex].giaTriThuocTinh.includes(giaTri)) {
                    sanPham.DanhSachThuocTinh[existingThuocTinhIndex].giaTriThuocTinh.push(giaTri);
                }
            });
        } else {
            // Nếu thuộc tính chưa tồn tại, thêm thuộc tính mới vào danh sách
            const newThuocTinh = {
                thuocTinh: thuocTinhId,
                giaTriThuocTinh: giaTriThuocTinhIds,
            };

            sanPham.DanhSachThuocTinh.push(newThuocTinh);
        }

        await sanPham.save();

        res.status(200).json({ message: 'Thêm thuộc tính thành công', sanPham });
    } catch (error) {
        console.error("Lỗi khi thêm thuộc tính:", error);
        res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}


async function updateGiaTriThuocTinhForSanPham(req, res) {
    const { IDSanPham, thuocTinhId } = req.params;
    const { giaTriThuocTinhIds } = req.body;

    try {
        const sanPham = await SanPhamModel.findById(IDSanPham);
        if (!sanPham) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }

        const thuocTinh = sanPham.DanhSachThuocTinh.find(
            (tt) => tt.thuocTinh.toString() === thuocTinhId.toString()
        );

        if (!thuocTinh) {
            return res.status(404).json({ message: 'Thuộc tính không tồn tại' });
        }

        thuocTinh.giaTriThuocTinh = giaTriThuocTinhIds;
        await sanPham.save();

        res.status(200).json({ message: 'Cập nhật giá trị thuộc tính thành công', sanPham });
    } catch (error) {
        console.error("Lỗi khi cập nhật giá trị thuộc tính:", error);
        res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}


// async function deleteThuocTinhForSanPham(req, res) {
//     const { IDSanPham, thuocTinhId, giaTriThuocTinhId } = req.params;

//     try {
//         const sanPham = await SanPhamModel.findById(IDSanPham);
//         if (!sanPham) {
//             return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
//         }

//         // Tìm thuộc tính trong DanhSachThuocTinh
//         const thuocTinhIndex = sanPham.DanhSachThuocTinh.findIndex(
//             (tt) => tt.thuocTinh.toString() === thuocTinhId.toString()
//         );

//         if (thuocTinhIndex === -1) {
//             return res.status(404).json({ message: 'Thuộc tính không tồn tại trong sản phẩm' });
//         }

//         // Lọc ra các giá trị thuộc tính không khớp với giaTriThuocTinhId
//         sanPham.DanhSachThuocTinh[thuocTinhIndex].giaTriThuocTinh = sanPham.DanhSachThuocTinh[thuocTinhIndex].giaTriThuocTinh.filter(
//             (giaTri) => giaTri.toString() !== giaTriThuocTinhId.toString()
//         );

//         // Nếu không còn giá trị thuộc tính nào, xóa luôn thuộc tính
//         if (sanPham.DanhSachThuocTinh[thuocTinhIndex].giaTriThuocTinh.length === 0) {
//             sanPham.DanhSachThuocTinh.splice(thuocTinhIndex, 1);
//         }

//         // Lưu sản phẩm sau khi xóa giá trị thuộc tính hoặc thuộc tính
//         await sanPham.save();

//         res.status(200).json({ message: 'Xóa giá trị thuộc tính thành công', sanPham });
//     } catch (error) {
//         console.error("Lỗi khi xóa giá trị thuộc tính:", error);
//         res.status(500).json({ error: 'Lỗi hệ thống' });
//     }
// }


async function deleteThuocTinhForSanPham(req, res) {
    const { IDSanPham, thuocTinhId, giaTriThuocTinhId } = req.params;

    try {
        const sanPham = await SanPhamModel.findById(IDSanPham);
        if (!sanPham) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }

        // Tìm thuộc tính trong DanhSachThuocTinh
        const thuocTinhIndex = sanPham.DanhSachThuocTinh.findIndex(
            (tt) => tt.thuocTinh.toString() === thuocTinhId.toString()
        );

        if (thuocTinhIndex === -1) {
            return res.status(404).json({ message: 'Thuộc tính không tồn tại trong sản phẩm' });
        }

        // Lọc ra các giá trị thuộc tính không khớp với giaTriThuocTinhId
        sanPham.DanhSachThuocTinh[thuocTinhIndex].giaTriThuocTinh = sanPham.DanhSachThuocTinh[thuocTinhIndex].giaTriThuocTinh.filter(
            (giaTri) => giaTri.toString() !== giaTriThuocTinhId.toString()
        );

        // Nếu không còn giá trị thuộc tính nào, xóa luôn thuộc tính
        if (sanPham.DanhSachThuocTinh[thuocTinhIndex].giaTriThuocTinh.length === 0) {
            sanPham.DanhSachThuocTinh.splice(thuocTinhIndex, 1);
        }

        // Lưu sản phẩm sau khi xóa giá trị thuộc tính hoặc thuộc tính
        await sanPham.save();

        // Tìm các biến thể liên quan đến giaTriThuocTinhId và cập nhật trạng thái isDeleted
        const bienThes = await BienTheSchema.find({
            IDSanPham,
            'KetHopThuocTinh.IDGiaTriThuocTinh': giaTriThuocTinhId
        });

        for (const bienThe of bienThes) {
            // Tìm tất cả các hóa đơn có chứa biến thể
            const hoaDons = await HoadonModel.find({
                'chiTietHoaDon.idBienThe': bienThe._id
            });
            const gioHangs = await GiohangModel.find({
                'chiTietGioHang.idBienThe': bienThe._id
            });

            if (hoaDons.length > 0 || gioHangs.length > 0) {
                // Cập nhật trạng thái isDeleted của biến thể
                await BienTheSchema.findByIdAndUpdate(bienThe._id, { isDeleted: true });
                await SanPhamModel.findOneAndUpdate(
                    { _id: bienThe.IDSanPham },
                    { $inc: { SoLuongHienTai: -bienThe.soLuong } }
                );
                bienThe.soLuong = 0;
                await bienThe.save();
            } else {
                // Nếu không tìm thấy hóa đơn nào, xóa biến thể hoàn toàn
                await SanPhamModel.findOneAndUpdate(
                    { _id: bienThe.IDSanPham },
                    { $inc: { SoLuongHienTai: -bienThe.soLuong } }
                );
                await BienTheSchema.findByIdAndDelete(bienThe._id);
            }
        }

        res.status(200).json({ message: 'Xóa giá trị thuộc tính và cập nhật biến thể thành công', sanPham });
    } catch (error) {
        console.error("Lỗi khi xóa giá trị thuộc tính:", error);
        res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}


async function findthuoctinhInsanpham(req, res) {
    const { IDSanPham } = req.params;
    try {
        // Tìm sản phẩm dựa trên _id
        const sanPham = await SanPhamModel.findById(IDSanPham).populate('DanhSachThuocTinh.thuocTinh', 'TenThuocTinh');

        if (!sanPham) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }

        // Lấy dữ liệu DanhSachThuocTinh và chỉ giữ lại thuộc tính thuocTinh
        const thuoctinhlist = sanPham.DanhSachThuocTinh.map(item => ({
            _id: item.thuocTinh._id,
            TenThuocTinh: item.thuocTinh.TenThuocTinh,
        }));

        res.status(200).json({ thuoctinhlist });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách thuộc tính của sản phẩm:', error);
        res.status(500).json({ message: 'Lỗi hệ thống' });
    }
}
async function getDatabientheByid(req, res) {
    const idbienthe = req.params.idbienthe
    try {
        const bienThe = await BienTheSchema.findById(idbienthe)
            .populate('IDSanPham')
            .populate({
                path: 'KetHopThuocTinh.IDGiaTriThuocTinh',
                model: 'GiaTriThuocTinh'
            });

        if (!bienThe) {
            return res.status(404).json({ error: 'Biến thể không tìm thấy' });
        }
        res.status(200).json(bienThe);
    } catch (error) {
        console.error('Lỗi khi tìm biến thể:', error);
        res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}


// Hàm kết hợp các thuộc tính
function combineAttributes(attributesList) {
    if (!attributesList.length) return [[]];
    const [currentAttr, ...rest] = attributesList;
    const combinations = combineAttributes(rest);
    return currentAttr.giaTriThuocTinh.flatMap(attrValue =>
        combinations.map(combination => [attrValue, ...combination])
    );
}

// Hàm kiểm tra biến thể tồn tại
async function isVariantExists(IDSanPham, combination) {
    // Truy vấn kiểm tra xem tổ hợp đã tồn tại hay chưa
    const existingVariant = await BienTheSchema.findOne({
        IDSanPham,
        $and: combination.map(value => ({
            'KetHopThuocTinh.IDGiaTriThuocTinh': value
        }))
    });

    return existingVariant; // Trả về null nếu không tồn tại
}

// Hàm tạo biến thể
async function createVariants(req, res) {
    const { IDSanPham } = req.params;

    try {
        // Lấy sản phẩm
        const sanPham = await SanPhamModel.findById(IDSanPham).populate('DanhSachThuocTinh.thuocTinh DanhSachThuocTinh.giaTriThuocTinh');
        if (!sanPham) {
            return res.status(404).json({ error: 'Sản phẩm không tồn tại.' });
        }

        const { DanhSachThuocTinh } = sanPham;

        // Tạo tổ hợp các giá trị thuộc tính
        const combinations = combineAttributes(DanhSachThuocTinh);

        let createdCount = 0;
        for (const combination of combinations) {
            // Kiểm tra biến thể đã tồn tại
            const existingVariant = await isVariantExists(IDSanPham, combination);

            if (existingVariant) {
                // Nếu biến thể tồn tại và đã bị xóa, khôi phục lại
                if (existingVariant.isDeleted) {
                    existingVariant.isDeleted = false;
                    await existingVariant.save();
                }
                // Nếu biến thể không bị xóa, bỏ qua
                continue;
            }

            // Nếu không trùng lặp, tạo mới
            const newVariant = new BienTheSchema({
                IDSanPham,
                KetHopThuocTinh: combination.map(value => ({ IDGiaTriThuocTinh: value })),
                gia: sanPham.DonGiaBan, // Giá mặc định từ sản phẩm (có thể điều chỉnh)
                soLuong: 0 // Số lượng mặc định
            });
            await newVariant.save();
            createdCount++;
        }

        res.status(200).json({
            message: 'Tạo biến thể thành công.',
            createdCount,
            totalCombinations: combinations.length
        });
    } catch (error) {
        console.error('Lỗi khi tạo biến thể:', error);
        res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

async function createSanPhamExcel(req, res, next) {
    const { products } = req.body;

    if (!products || !products.length) {
        return res.status(400).json({ message: "Danh sách sản phẩm không hợp lệ." });
    }

    try {
        // Chuẩn bị dữ liệu để lưu
        const newProducts = products.map((product) => {
            // Xử lý hình bổ sung
            let hinhBoSung = [];
            try {
                if (product.col_14 && typeof product.col_14 === "string") {
                    // Thay thế ký tự không chuẩn JSON
                    const parsedData = product.col_14.replace(/'/g, '"');
                    hinhBoSung = JSON.parse(parsedData);
                    if (!Array.isArray(hinhBoSung)) {
                        throw new Error("HinhBoSung phải là mảng JSON.");
                    }
                }
            } catch (error) {
                console.warn(
                    `Lỗi khi parse HinhBoSung tại sản phẩm: ${product.col_0}. Giá trị: "${product.col_14}". Sử dụng giá trị mặc định.`
                );
                hinhBoSung = [];
            }

            // Xử lý danh sách thuộc tính
            let danhSachThuocTinh = [];
            try {
                if (product.col_15 && typeof product.col_15 === "string") {
                    // Thay thế ký tự không chuẩn JSON
                    const parsedData = product.col_15.replace(/'/g, '"');
                    danhSachThuocTinh = JSON.parse(parsedData);
                    if (!Array.isArray(danhSachThuocTinh)) {
                        throw new Error("DanhSachThuocTinh phải là mảng JSON.");
                    }
                }
            } catch (error) {
                console.warn(
                    `Lỗi khi parse DanhSachThuocTinh tại sản phẩm: ${product.col_0}. Giá trị: "${product.col_15}". Sử dụng giá trị mặc định.`
                );
                danhSachThuocTinh = [];
            }

            return {
                IDSanPham: product.col_0, // Mã sản phẩm
                userId: product.col_1,
                TenSanPham: product.col_2, // Tên sản phẩm
                HinhSanPham: product.col_3, // Đường dẫn hình ảnh
                DonGiaNhap: parseFloat(product.col_4) || 0, // Giá nhập
                DonGiaBan: parseFloat(product.col_5) || 0, // Giá bán
                SoLuongNhap: parseInt(product.col_6, 10) || 0, // Số lượng nhập
                SoLuongHienTai: parseInt(product.col_7, 10) || 0, // Số lượng hiện tại
                PhanTramGiamGia: parseFloat(product.col_8) || 0, // Phần trăm giảm giá
                NgayTao: new Date(), // Ngày tạo
                SanPhamMoi: product.col_10 || false, // Sản phẩm vừa tạo chưa được phép bán
                TinhTrang: product.col_11 || "Còn hàng", // Tình trạng mặc định
                MoTa: product.col_12 || "", // Mô tả
                Unit: product.col_13 || "1", // Đơn vị tính
                HinhBoSung: hinhBoSung, // Hình bổ sung
                DanhSachThuocTinh: danhSachThuocTinh, // Danh sách thuộc tính
                IDDanhMuc: product.col_16 || "1", // Đơn vị tính
                IDDanhMucCon: product.col_17 || "1", // Đơn vị tính

            };
        });

        // Lưu tất cả sản phẩm vào database
        const savedProducts = await SanPhamModel.insertMany(newProducts);

        return res.status(201).json({
            message: `${savedProducts.length} sản phẩm đã được thêm thành công.`,
            products: savedProducts,
        });
    } catch (error) {
        console.error("Lỗi khi thêm sản phẩm từ Excel:", error);
        return res.status(500).json({ message: "Lỗi server. Vui lòng thử lại sau." });
    }
}


module.exports = {
    addThuocTinhForSanPham,
    updateGiaTriThuocTinhForSanPham,
    deleteThuocTinhForSanPham,
    findthuoctinhInsanpham,
    getDatabientheByid,
    createVariants,
    createSanPhamExcel,
};
