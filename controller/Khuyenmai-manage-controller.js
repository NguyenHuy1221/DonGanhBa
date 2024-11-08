const KhuyenMaiModel = require("../models/KhuyenMaiSchema");
const LoaiKhuyenMaiModel = require("../models/LoaiKhuyenMaiSchema")
require("dotenv").config();

//ham lay danh sach thuoc tinh
async function getlistLoaiKhuyenMai(req, res, next) {

    try {
        const loaikhuyenmais = await LoaiKhuyenMaiModel.find();
        res.status(200).json(loaikhuyenmais);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi tìm kiếm thuộc tính' });
    }
}


//hàm thêm thuộc tính
async function createLoaiKhuyenMai(req, res, next) {
    const { TenLoaiKhuyenMai, MoTa,LoaiKhuyenMai } = req.body;
    try {
        // Kiểm tra xem ThuocTinhID đã tồn tại chưa
    const existingLoaiKhuyenMai = await LoaiKhuyenMaiModel.findOne({ LoaiKhuyenMai:LoaiKhuyenMai });

    if (existingLoaiKhuyenMai) {
        return res.status(409).json({ message: 'Loại khuyến mãi này đã tồn tại' });
    }
        // Tạo một đối tượng thuộc tính mới dựa trên dữ liệu nhận được
        const newLoaiKhuyenMai = new LoaiKhuyenMaiModel({
            TenLoaiKhuyenMai,
            LoaiKhuyenMai,
            MoTa
        });
        // Lưu đối tượng vào cơ sở dữ liệu
        const savedLoaiKhuyenMai = await newLoaiKhuyenMai.save();

        // Trả về kết quả cho client
        res.status(201).json(savedLoaiKhuyenMai);
    } catch (error) {
        if (error.code === 11000) {
            console.error('LoaiKhuyenMai đã tồn tại');
          } else {
            console.error('Lỗi khác:', error);
          }
    }
}
  
   
async function updateLoaiKhuyenMai(req, res, next) {
    const { LoaiKhuyenMaiID,TenLoaiKhuyenMai, MoTa,LoaiKhuyenMai } = req.body;
    const existingLoaiKhuyenMai = await LoaiKhuyenMaiModel.findOne({ LoaiKhuyenMai:LoaiKhuyenMai });

    if (!existingLoaiKhuyenMai) {
        return res.status(409).json({ message: 'không tìm thấy loại khuyến mãi này' });
    }
    // Kiểm tra xem có loại khuyến mãi nào khác có cùng LoaiKhuyenMai không (ngoại trừ bản ghi đang cập nhật)
    const isDuplicate = await LoaiKhuyenMaiModel.findOne({
    LoaiKhuyenMai,
    _id: { $ne: existingLoaiKhuyenMai._id }
  });

  if (isDuplicate) {
    return res.status(409).json({ message: 'Loại khuyến mãi này đã tồn tại' });
  }
    try {
        const updatedLoaiKhuyenMai = await LoaiKhuyenMaiModel.findByIdAndUpdate(
            { _id :LoaiKhuyenMaiID  },
            { TenLoaiKhuyenMai,
                MoTa,
                LoaiKhuyenMai
             },
            { new: true }
        );

        if (!updatedLoaiKhuyenMai) {
            return res.status(404).json({ message: 'Không tìm thấy Loại khuyến mãi' });
        }

        res.status(200).json(updatedLoaiKhuyenMai);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi cập nhật loại khuyến mãi' });
    }
}
module.exports = {
    getlistLoaiKhuyenMai,
    createLoaiKhuyenMai,
    updateLoaiKhuyenMai,
};
