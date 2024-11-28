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
const UserModel = require("../models/NguoiDungSchema")
//thu vien tim ket qua gan dung
const fuzzysearch = require('fuzzysearch');

require("dotenv").config();
const multer = require("multer");
const util = require('util');
const { v4: uid } = require('uuid');
const HoaDon = require("../models/HoaDonSchema");


const { uploadFileToViettelCloud, uploadmemory } = require("../untils/index")
const { v4: uuidv4 } = require('uuid');
// const { upload } = require("../untils/index");
//ham lay danh sach thuoc tinh


async function addThuocTinhForSanPham(req, res) {
    const { IDSanPham } = req.params;
    const { thuocTinhId, giaTriThuocTinhIds } = req.body;

    try {
        const sanPham = await SanPhamModel.findById(IDSanPham);
        if (!sanPham) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }

        const newThuocTinh = {
            thuocTinh: thuocTinhId,
            giaTriThuocTinh: giaTriThuocTinhIds,
        };

        sanPham.DanhSachThuocTinh.push(newThuocTinh);
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

async function deleteThuocTinhForSanPham(req, res) {
    const { IDSanPham, thuocTinhId } = req.params;

    try {
        const sanPham = await SanPhamModel.findById(IDSanPham);
        if (!sanPham) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }

        sanPham.DanhSachThuocTinh = sanPham.DanhSachThuocTinh.filter(
            (tt) => tt.thuocTinh.toString() !== thuocTinhId.toString()
        );

        await sanPham.save();

        res.status(200).json({ message: 'Xóa thuộc tính thành công', sanPham });
    } catch (error) {
        console.error("Lỗi khi xóa thuộc tính:", error);
        res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}

module.exports = {
    addThuocTinhForSanPham,
    updateGiaTriThuocTinhForSanPham,
    deleteThuocTinhForSanPham,
};
