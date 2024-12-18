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

const GiohangModel = require("../models/GioHangSchema")

const { uploadFileToViettelCloud } = require("../untils/index")
const { checkDuplicateGiaTriThuocTinh } = require("../helpers/helpers")
const { v4: uuidv4 } = require('uuid');
// const { upload } = require("../untils/index");
//ham lay danh sach thuoc tinh


async function getlistSanPham(req, res, next) {
  try {
    const sanphams = await SanPhamModel.find({ SanPhamMoi: true, TinhTrang: "Còn hàng" }).sort({ NgayTao: -1 })// Lọc và sắp xếp
    if (!sanphams) {
      res.status(404).json({ message: 'Khong thay san pham nao' });
    }
    res.status(200).json(sanphams);
  } catch (error) {
    console.error('Lỗi khi truy xuất sản phẩm:', error);
    res.status(500).json({ message: 'Lỗi khi truy xuất sản phẩm' });
  }
}

async function getlistSanPhamAdmin(req, res, next) {
  const { userId } = req.params;
  const { search = '', tinhTrang = 'Còn hàng', sort = 'NgayTao', gmail = '' } = req.query; // Lấy các tham số tìm kiếm và lọc từ query

  let filter = {};
  let user = {}
  if (tinhTrang !== 'all') {
    filter.TinhTrang = tinhTrang;
  }
  if (search) {
    filter.TenSanPham = { $regex: search, $options: 'i' }; // Tìm kiếm theo tên sản phẩm
  }
  if (userId) {
    user = await UserModel.findById(userId);
    console.log(user)
  }
  try {
    let sanphams = [];
    if (user.role === 'admin') {
      if (gmail) {
        // Tìm userId từ gmail
        const userhokinhdoanh = await UserModel.findOne({ gmail });
        if (userhokinhdoanh) {
          filter.userId = userhokinhdoanh._id; // Lọc theo userId
        } else {
          return res.status(404).json({
            message: 'Không tìm thấy người dùng với gmail này',
          });
        }
      }
      sanphams = await SanPhamModel.find(filter).sort({ [sort]: -1 }); // Lọc và sắp xếp
    } else if (user.role === 'nhanvien') {
      sanphams = await SanPhamModel.find(filter).sort({ [sort]: -1 });
    } else if (user.role === 'hokinhdoanh') {
      filter.userId = user._id; // Lọc theo userId
      sanphams = await SanPhamModel.find(filter).sort({ [sort]: -1 });
    } else {
      return res.status(403).json({
        message: 'Không có quyền',
      });
    }

    res.status(200).json(sanphams);
  } catch (error) {
    console.error('Lỗi khi truy xuất sản phẩm:', error);
    res.status(500).json({ message: 'Lỗi khi truy xuất sản phẩm' });
  }
}


async function toggleSanPhamMoi(req, res, next) {
  const { IDSanPham } = req.params;
  try {
    const sanPham = await SanPhamModel.findById(IDSanPham);
    if (!sanPham) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }
    // Đổi trạng thái SanPhamMoi
    sanPham.SanPhamMoi = !sanPham.SanPhamMoi;
    await sanPham.save();
    res.status(200).json({ message: `Trạng thái SanPhamMoi đã được đổi thành ${sanPham.SanPhamMoi}` });
  } catch (error) {
    console.error("Lỗi cập nhật trạng thái SanPhamMoi:", error);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
}

async function getSanPhamListNew_Old(req, res, next) {
  const { SanPhamMoi } = req.query;

  try {
    // Kiểm tra giá trị của SanPhamMoi
    // if (typeof SanPhamMoi !== 'boolean') {
    //   return res.status(400).json({ message: 'Giá trị SanPhamMoi phải là boolean' });
    // }

    // Lấy danh sách sản phẩm dựa trên giá trị SanPhamMoi
    const sanPhamList = await SanPhamModel.find({ SanPhamMoi }).sort({ NgayTao: -1 });

    res.status(200).json(sanPhamList);
  } catch (error) {
    console.error("Lỗi lấy danh sách sản phẩm:", error);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
}
// Cấu hình Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    console.log(file);
    const id = uid();
    const ext = path.extname(file.originalname).toLowerCase();
    const newFilename = `${id}-${file.originalname.replace(ext, '.jpg')}`;
    cb(null, newFilename);
  },
});

const upload = multer({ storage: storage });
const uploadFields = util.promisify(upload.fields([{ name: 'file', maxCount: 1 }, { name: 'files', maxCount: 4 }]));

async function createSanPham(req, res, next) {
  //sản phẩm tạo sẽ có 2 lựa chọn , 1 là tổ hợp biến thể , 2 là thêm biến thể 
  try {
    // Xử lý tệp chính và các tệp bổ sung
    // await uploadFields(req, res);
    // if (!req.files['file'] || !req.files['file'][0]) {
    //   return res.status(400).json({ message: 'File is required' });
    // }
    // const newPath = req.files['file'][0].path.replace("public", process.env.URL_IMAGE);
    // const hinhBoSung = req.files['files'] ? req.files['files'].map(file => ({
    //   TenAnh: file.originalname,
    //   UrlAnh: file.path.replace("public", process.env.URL_IMAGE),
    // })) : [];




    const bucketName = process.env.VIETTEL_BUCKET;
    const avatarFile = req.files && req.files.find(file => file.fieldname === 'file');
    const detailFiles = req.files && req.files.filter(file => file.fieldname === 'files');

    if (!avatarFile && !detailFiles) {
      return res.status(400).json({ message: 'Không có file được upload' });
    }
    let avatarUrl = ''; let detailUrls = []; // Upload ảnh đại diện nếu có 
    if (avatarFile) {
      let objectKey = ""
      if (avatarFile.mimetype.startsWith('image/')) {
        objectKey = `images/${uuidv4()}-${avatarFile.originalname}`;
      } else {
        return res.status(400).json({ message: 'Chỉ được upload image' });
      }
      try {
        avatarUrl = await uploadFileToViettelCloud(avatarFile.buffer, bucketName, objectKey, avatarFile.mimetype);
      }
      catch (error) {
        console.error('Lỗi khi tải lên ảnh đại diện:', error);
        return res.status(400).json({ message: 'Đã xảy ra lỗi khi tải lên ảnh đại diện' });
      }
    } // Upload ảnh chi tiết nếu có 
    if (detailFiles && detailFiles.length > 0) {
      const uploadPromises = detailFiles.map(file => {
        let objectKey = ""
        if (file.mimetype.startsWith('image/')) {
          objectKey = `images/${uuidv4()}-${file.originalname}`;
        } else {
          return res.status(400).json({ message: 'Chỉ được upload image' });
        }
        return uploadFileToViettelCloud(file.buffer, bucketName, objectKey, file.mimetype);
      });
      try { detailUrls = await Promise.all(uploadPromises); } catch (error) {
        console.error('Lỗi khi tải lên ảnh chi tiết:', error);
        return res.status(500).json({ message: 'Đã xảy ra lỗi khi tải lên ảnh chi tiết' });
      }
    }
    const hinhBoSungData = detailUrls.map((url, index) => ({
      TenAnh: detailFiles[index].originalname, // Tên ảnh từ file gốc
      UrlAnh: url, // URL đã tải lên
    }));
    const { userId, luachon, IDSanPham, TenSanPham, DonGiaNhap, DonGiaBan, SoLuongNhap, SoLuongHienTai, PhanTramGiamGia, TinhTrang, MoTa, Unit, DanhSachThuocTinh, IDDanhMuc, IDDanhMucCon,
    } = req.body;
    const { sku, gia, soLuong, KetHopThuocTinh } = req.body;
    if (!IDSanPham) {
      return res.status(400).json({ message: 'IDSanPham is required and cannot be null' });
    }
    const newSanPham = new SanPhamModel({
      userId,
      IDSanPham, TenSanPham,
      HinhSanPham: avatarUrl,
      DonGiaNhap, DonGiaBan,
      SoLuongNhap, SoLuongHienTai: 0, PhanTramGiamGia, TinhTrang, MoTa, Unit,
      HinhBoSung: hinhBoSungData,
      DanhSachThuocTinh: DanhSachThuocTinh, IDDanhMuc, IDDanhMucCon,
    });
    // Lưu đối tượng vào cơ sở dữ liệu
    let savedSanPham = await newSanPham.save();

    if (luachon == 0) {
      try {
        const thuoctinh = await ThuocTinhModel.findOne({ ThuocTinhID: "SPspimple" })
        if (!thuoctinh) {
          res.status(404).json({ message: 'Lỗi Không tìm thấy thuộc tính sản phẩm dơn giản , nếu không tìm thấy vui lòng tạo lại. với id là SPspimple' });
        }
        const giatrithuoctinh = await GiaTriThuocTinhModel.findOne({ IDGiaTriThuocTinh: "Simple" })

        if (!giatrithuoctinh) {
          res.status(404).json({ message: 'Lỗi Không tìm thấy giá trị thuộc tính sản phẩm dơn giản , nếu không tìm thấy vui lòng tạo lại. với id là Simple' });
        }
        const danhsachthuoctinhdongian = [{
          thuocTinh: thuoctinh._id,
          giaTriThuocTinh: [giatrithuoctinh._id]
        }]
        const KetHopThuocTinh = [{ IDGiaTriThuocTinh: giatrithuoctinh._id }]
        const newBienThe = new BienTheSchema({
          IDSanPham: savedSanPham._id,
          sku: sku,
          gia: DonGiaBan,
          soLuong: SoLuongHienTai,
          KetHopThuocTinh
        });

        newSanPham.DanhSachThuocTinh = danhsachthuoctinhdongian
        newSanPham.SoLuongHienTai = SoLuongHienTai
        savedSanPham = await newSanPham.save();
        await newBienThe.save();
      } catch (error) {
        console.error("Lỗi Thêm Biến thể :", error);
        res.status(500).json({ error: 'Lỗi hệ thống liên quan đến biến thể' });
      }
    } else {
      const createdVariants = await ToHopBienThe(res, savedSanPham._id, sku, gia, soLuong);
    }
    res.status(201).json(savedSanPham);
  } catch (error) {
    console.error("Lỗi Them san pham bổ sung:", error);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
}
async function ToHopBienThe(res, IDSanPham, sku, gia, soLuong) {
  const projection = {
    _id: 1,
    // Set chapters to null explicitly
  };
  const product = await SanPhamModel.findById(IDSanPham)
  if (!product) {
    return res.status(404).json({ message: "sản phẩm không tồn tại" });
  }
  const attributeIds = product.DanhSachThuocTinh;
  // console.log(attributeIds);
  if (attributeIds.length < 2) { return res.status(400).json({ message: "Sản phẩm cần ít nhất 2 thuộc tính để tổ hợp" }); }
  // // Tạo các biến thể sản phẩm
  const createVariants = async (product, thuocTinhs, currentVariant = {}) => {
    if (thuocTinhs.length === 0) {
      // Tạo biến thể mới
      console.log("check  ket hop", currentVariant);
      const KetHopThuocTinh = Object.entries(currentVariant).map(
        ([key, value]) => ({
          IDGiaTriThuocTinh: value,
        })
      );
      const bienthe = await BienTheSchema.find({ IDSanPham: IDSanPham });
      // Kiểm tra trùng lặp biến thể

      for (const existing of bienthe) {
        const existingKetHopThuocTinh = existing.KetHopThuocTinh.map(attr =>
          attr.IDGiaTriThuocTinh.toString()
        );
        const currentKetHopThuocTinh = KetHopThuocTinh.map(attr =>
          attr.IDGiaTriThuocTinh.toString()
        );

        // Kiểm tra nếu tổ hợp thuộc tính giống nhau
        const isDuplicate = existingKetHopThuocTinh.length === currentKetHopThuocTinh.length &&
          existingKetHopThuocTinh.every(value => currentKetHopThuocTinh.includes(value));

        if (isDuplicate) {
          // Nếu biến thể đã tồn tại nhưng bị xóa
          if (existing.isDeleted) {
            existing.sku = sku;
            existing.gia = gia;
            existing.soLuong = soLuong;
            existing.isDeleted = false;
            await existing.save();
            // Cập nhật số lượng cho sản phẩm
            await SanPhamModel.findByIdAndUpdate(
              existing.IDSanPham,
              { $inc: { SoLuongHienTai: soLuong } }
            );
            return; // Ngừng tạo biến thể hiện tại
          }

          // Nếu biến thể đã tồn tại và không bị xóa
          return; // Bỏ qua biến thể hiện tại
        }
      }
      // const bienthe = await BienTheSchema.find({ IDSanPham: IDSanPham })
      // // Duyệt qua từng biến thể đã tồn tại
      // for (const existing of bienthe) {
      //   const existingKetHopThuocTinh = existing.KetHopThuocTinh;
      //   //console.log(existing.KetHopThuocTinh)
      //   // Kiểm tra độ dài
      //   if (existingKetHopThuocTinh.length !== KetHopThuocTinh.length) {
      //     console.log("bo qua")
      //     continue; // Tiếp tục với biến thể tiếp theo
      //   }
      //   // Kiểm tra trùng lặp từng phần tử
      //   let isDuplicate = true;
      //   for (let i = 0; i < existingKetHopThuocTinh.length; i++) {
      //     if (existingKetHopThuocTinh[i].IDGiaTriThuocTinh.toString() !== KetHopThuocTinh[i].IDGiaTriThuocTinh) {
      //       isDuplicate = false;
      //       break;
      //     }
      //   }

      //   if (isDuplicate) {
      //     const bientheisDelete = await BienTheSchema.findById(existing._id)
      //     if (bientheisDelete && bientheisDelete.isDeleted) {
      //       bientheisDelete.sku = sku;
      //       bientheisDelete.gia = gia;
      //       bientheisDelete.soLuong = soLuong;
      //       bientheisDelete.isDeleted = false;
      //       await bientheisDelete.save();
      //       return res.status(200).json({ message: 'Biến thể đã được khôi phục' });
      //     }
      //     return res.status(400).json({ error: 'Kết hợp thuộc tính đã tồn tại' });
      //   }
      // }

      const newVariant = new BienTheSchema({
        IDSanPham: product._id,
        sku: sku,
        gia: gia,
        soLuong: soLuong,
        KetHopThuocTinh: KetHopThuocTinh,
      });
      await newVariant.save();
      console.log(newVariant);
      await SanPhamModel.findOneAndUpdate(
        { _id: newVariant.IDSanPham },
        { $inc: { SoLuongHienTai: soLuong } }
      );
    } else {
      const thuocTinh = thuocTinhs.shift();
      const giaTriThuocTinhList = thuocTinh.giaTriThuocTinh
      console.log("thuoc tinh abababa la zap", thuocTinh);
      // const giaTriThuocTinhList = await ThuocTinhGiaTriModel.find(
      //   { ThuocTinhID: thuocTinh.thuocTinh._id },
      //   projection
      // );
      if (!giaTriThuocTinhList) {
        return res.json("Thuộc tính này không có giá trị",);
      }
      for (const giaTri of giaTriThuocTinhList) {
        const IDGiaTriThuocTinh = giaTri._id; // Destructure to get the value ID
        currentVariant = { ...currentVariant, [thuocTinh]: IDGiaTriThuocTinh };
        await createVariants(product, [...thuocTinhs], currentVariant);
      }

    }
  };

  await createVariants(product, attributeIds);
  // Điều kiện dừng: Kiểm tra nếu tất cả các biến thể đã được tạo xong
  const totalCombinations = attributeIds.reduce((acc, attr) => acc * attr.length, 1);
  const variantsCount = await BienTheSchema.countDocuments({ IDSanPham: product._id });
  if (variantsCount === totalCombinations) {
    console.log("Tất cả các biến thể đã được tạo xong");
    return res.status(200).json("so bien the da duoc tao", variantsCount);
  }
  return product;
}



async function ToHopBienThePhienBanBangTay(req, res) {
  const { IDSanPham, sku, gia, soLuong } = req.body;

  try {
    const product = await SanPhamModel.findById(IDSanPham);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }
    const attributeIds = product.DanhSachThuocTinh;
    if (attributeIds.length < 2) { return res.status(400).json({ message: "Sản phẩm cần ít nhất 2 thuộc tính để tổ hợp" }); }

    const variantsList = []; // Danh sách các biến thể sẽ được thu thập

    // Hàm tạo biến thể
    const createVariants = async (product, thuocTinhs, currentVariant = {}) => {
      if (thuocTinhs.length === 0) {
        // const KetHopThuocTinh = Object.entries(currentVariant).map(([key, value]) => ({
        //   IDGiaTriThuocTinh: new mongoose.Types.ObjectId(value),
        // }));
        // const KetHopThuocTinh = Object.entries(currentVariant).map(
        //   ([key, value]) => ({
        //     IDGiaTriThuocTinh: value,
        //   })
        // );
        const KetHopThuocTinh = Object.entries(currentVariant).map(([key, value]) => ({
          IDGiaTriThuocTinh: value,
        }));
        const bienthe = await BienTheSchema.find({ IDSanPham: IDSanPham });
        // Kiểm tra trùng lặp biến thể

        for (const existing of bienthe) {
          const existingKetHopThuocTinh = existing.KetHopThuocTinh.map(attr =>
            attr.IDGiaTriThuocTinh.toString()
          );
          const currentKetHopThuocTinh = KetHopThuocTinh.map(attr =>
            attr.IDGiaTriThuocTinh.toString()
          );

          // Kiểm tra nếu tổ hợp thuộc tính giống nhau
          const isDuplicate = existingKetHopThuocTinh.length === currentKetHopThuocTinh.length &&
            existingKetHopThuocTinh.every(value => currentKetHopThuocTinh.includes(value));

          if (isDuplicate) {
            // Nếu biến thể đã tồn tại nhưng bị xóa
            if (existing.isDeleted) {
              existing.sku = sku;
              existing.gia = gia;
              existing.soLuong = soLuong;
              existing.isDeleted = false;
              await existing.save();
              // Cập nhật số lượng cho sản phẩm
              await SanPhamModel.findByIdAndUpdate(
                existing.IDSanPham,
                { $inc: { SoLuongHienTai: soLuong } }
              );
              return; // Ngừng tạo biến thể hiện tại
            }
            // Nếu biến thể đã tồn tại và không bị xóa
            variantsList.push(existing);

            return; // Bỏ qua biến thể hiện tại
          }
        }

        // Tạo biến thể mới nếu không có trùng lặp
        const newVariant = new BienTheSchema({
          IDSanPham: product._id,
          sku: sku,
          gia: gia,
          soLuong: soLuong,
          KetHopThuocTinh: KetHopThuocTinh,
        });

        await newVariant.save();
        await SanPhamModel.findOneAndUpdate(
          { _id: newVariant.IDSanPham },
          { $inc: { SoLuongHienTai: soLuong } }
        );
        variantsList.push(newVariant);

        return;
      } else {
        const thuocTinh = thuocTinhs.shift();
        const giaTriThuocTinhList = thuocTinh.giaTriThuocTinh;

        if (!giaTriThuocTinhList) {
          return res.status(400).json({ message: "Thuộc tính này không có giá trị" });
        }

        for (const giaTri of giaTriThuocTinhList) {
          const IDGiaTriThuocTinh = giaTri._id;
          currentVariant = { ...currentVariant, [thuocTinh._id]: IDGiaTriThuocTinh };
          await createVariants(product, [...thuocTinhs], currentVariant);
        }
      }
    };

    await createVariants(product, attributeIds);
    const variantsCount = variantsList.length;

    return res.status(200).json({ message: "Số biến thể đã được tạo", variantsCount, variantsList });
  } catch (error) {
    console.error('Lỗi khi tạo biến thể:', error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi tạo biến thể" });
  }
}







// async function ToHopBienThe(IDSanPham, sku, gia, soLuong) {
//   const projection = {
//     _id: 1,
//     // Set chapters to null explicitly
//   };
//   const product = await SanPhamModel.findById(IDSanPham).populate(
//     "DanhSachThuocTinh.thuocTinh"
//   );
//   if (!product) {
//     return res.status(404).json({ message: "sản phẩm không tồn tại" });
//   }
//   const attributeIds = product.DanhSachThuocTinh;
//   console.log(attributeIds);
//   // // Tạo các biến thể sản phẩm
//   const createVariants = async (product, thuocTinhs, currentVariant = {}) => {
//     if (thuocTinhs.length === 0) {
//       // Tạo biến thể mới
//       console.log("check  ket hop", currentVariant);
//       const KetHopThuocTinh = Object.entries(currentVariant).map(
//         ([key, value]) => ({
//           IDGiaTriThuocTinh: value,
//         })
//       );
//       const newVariant = new BienTheSchema({
//         IDSanPham: product._id,
//         sku: sku,
//         gia: gia,
//         soLuong: soLuong,
//         KetHopThuocTinh: KetHopThuocTinh,
//       });
//       await newVariant.save();
//       console.log(newVariant);
//     } else {
//       const thuocTinh = thuocTinhs.shift();
//       console.log("thuoc tinh abababa la zap", thuocTinh);
//       const giaTriThuocTinhList = await ThuocTinhGiaTriModel.find(
//         { ThuocTinhID: thuocTinh.thuocTinh._id },
//         projection
//       );
//       if (!giaTriThuocTinhList) {
//         return res.json("Thuộc tính này không có giá trị",);
//       }
//       for (const giaTri of giaTriThuocTinhList) {
//         const IDGiaTriThuocTinh = giaTri._id; // Destructure to get the value ID
//         currentVariant = { ...currentVariant, [thuocTinh]: IDGiaTriThuocTinh };
//         await createVariants(product, [...thuocTinhs], currentVariant);
//       }

//     }
//   };

//   await createVariants(product, attributeIds);
//   // Điều kiện dừng: Kiểm tra nếu tất cả các biến thể đã được tạo xong
//   const totalCombinations = attributeIds.reduce((acc, attr) => acc * attr.length, 1);
//   const variantsCount = await BienTheSchema.countDocuments({ IDSanPham: product._id });
//   if (variantsCount === totalCombinations) {
//     console.log("Tất cả các biến thể đã được tạo xong");
//     return res.status(200).json("so bien the da duoc tao", variantsCount);
//   }
//   return product;
// }
async function createSanPhamtest(req, res, next) {
  const { IDSanPham, TenSanPham, DonGiaNhap, DonGiaBan, SoLuongNhap, SoLuongHienTai, PhanTramGiamGia, TinhTrang, MoTa, Unit, DanhSachThuocTinh, IDDanhMuc, IDDanhMucCon,
  } = req.body;
  if (!IDSanPham) {
    return res.status(400).json({ message: 'IDSanPham is required and cannot be null' });
  }
  try {
    const newSanPham = new SanPhamModel({
      IDSanPham,
      TenSanPham,
      DonGiaNhap,
      DonGiaBan,
      SoLuongNhap,
      SoLuongHienTai,
      PhanTramGiamGia,
      TinhTrang,
      MoTa,
      Unit,
      DanhSachThuocTinh: DanhSachThuocTinh,
      IDDanhMuc,
      IDDanhMucCon,
    });
    const thuoctinh = await ThuocTinhModel.findOne({ ThuocTinhID: "SPspimple" })
    if (!thuoctinh) {
      res.status(404).json({ message: 'Lỗi Không tìm thấy thuộc tính sản phẩm dơn giản , nếu không tìm thấy vui lòng tạo lại. với id là SPspimple' });
    }
    const giatrithuoctinh = await GiaTriThuocTinhModel.findOne({ IDGiaTriThuocTinh: "Simple" })

    if (!giatrithuoctinh) {
      res.status(404).json({ message: 'Lỗi Không tìm thấy giá trị thuộc tính sản phẩm dơn giản , nếu không tìm thấy vui lòng tạo lại. với id là Simple' });
    }
    const KetHopThuocTinh = [{ IDGiaTriThuocTinh: giatrithuoctinh._id }]
    const newBienThe = new BienTheSchema({
      IDSanPham: "67230ded0ed1250d8ba7880c",
      sku: "kk",
      gia: DonGiaBan,
      soLuong: SoLuongHienTai,
      KetHopThuocTinh
    });
    await newBienThe.save();

    // Lưu đối tượng vào cơ sở dữ liệu
    //const savedSanPham = await newSanPham.save();
    res.status(201).json(newSanPham);
  } catch (error) {
    console.error("Lỗi Them san pham bổ sung:", error);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
}


async function updateHinhBoSung(req, res, next) {
  const { IDSanPham } = req.params;
  try {
    await upload.array('files', 4)(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(500).json({ error: err });
      } else if (err) {
        return res.status(500).json({ error: err });
      }

      const hinhBoSung = req.files.map(file => ({
        TenAnh: file.originalname,
        UrlAnh: file.path.replace("public", process.env.URL_IMAGE),
      }));

      const sanPham = await SanPhamModel.findById(IDSanPham);
      if (!sanPham) {
        return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
      }

      // Xóa ảnh cũ nếu tổng số ảnh vượt quá 4
      const totalImages = sanPham.HinhBoSung.length + hinhBoSung.length;
      if (totalImages > 4) {
        const imagesToRemove = totalImages - 4;
        for (let i = 0; i < imagesToRemove; i++) {
          const oldImage = sanPham.HinhBoSung.shift();
          const oldImagePath = path.join(__dirname, 'public', oldImage.UrlAnh.replace(process.env.URL_IMAGE, ''));
          fs.unlink(oldImagePath, (err) => {
            if (err) console.error('Lỗi xóa ảnh cũ:', err);
          });
        }
      }

      sanPham.HinhBoSung = sanPham.HinhBoSung.concat(hinhBoSung);
      await sanPham.save();

      res.status(200).json(sanPham);
    });
  } catch (error) {
    console.error("Lỗi cập nhật ảnh bổ sung:", error);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
}


async function updateSanPham(req, res, next) {
  try {
    const { id } = req.params;
    const bucketName = process.env.VIETTEL_BUCKET;
    const avatarFile = req.files && req.files.find(file => file.fieldname === 'file');
    const detailFiles = req.files && req.files.filter(file => file.fieldname === 'files');
    let avatarUrl = ''; let detailUrls = []; // Upload ảnh đại diện nếu có 

    const sanPham = await SanPhamModel.findById(id);
    if (!sanPham) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }




    if (avatarFile) {
      let objectKey = ""
      if (avatarFile.mimetype.startsWith('image/')) {
        objectKey = `images/${uuidv4()}-${avatarFile.originalname}`;
      } else {
        return res.status(400).json({ message: 'Chỉ được upload image' });
      }
      try {
        avatarUrl = await uploadFileToViettelCloud(avatarFile.buffer, bucketName, objectKey, avatarFile.mimetype);
        sanPham.HinhSanPham = avatarUrl
      }
      catch (error) {
        console.error('Lỗi khi tải lên ảnh đại diện:', error);
        return res.status(400).json({ message: 'Đã xảy ra lỗi khi tải lên ảnh đại diện' });
      }
    } // Upload ảnh chi tiết nếu có 
    if (detailFiles && detailFiles.length > 0) {
      const uploadPromises = detailFiles.map(file => {
        let objectKey = ""
        if (file.mimetype.startsWith('image/')) {
          objectKey = `images/${uuidv4()}-${file.originalname}`;
        } else {
          return res.status(400).json({ message: 'Chỉ được upload image' });
        }
        return uploadFileToViettelCloud(file.buffer, bucketName, objectKey, file.mimetype);
      });
      try {
        detailUrls = await Promise.all(uploadPromises);
        const hinhBoSungData = detailUrls.map((url, index) => ({
          TenAnh: detailFiles[index].originalname, // Tên ảnh từ file gốc
          UrlAnh: url, // URL đã tải lên
        }));
        sanPham.HinhBoSung = hinhBoSungData

      } catch (error) {
        console.error('Lỗi khi tải lên ảnh chi tiết:', error);
        return res.status(500).json({ message: 'Đã xảy ra lỗi khi tải lên ảnh chi tiết' });
      }
    }

    const {
      IDSanPham,
      TenSanPham,
      DonGiaNhap,
      DonGiaBan,
      SoLuongNhap,
      //SoLuongHienTai, app tự sử lý biến này
      PhanTramGiamGia,
      NgayTao,
      TinhTrang,
      MoTa,
      Unit,
      DanhSachThuocTinh,
      IDDanhMuc,
      IDDanhMucCon,
    } = req.body;

    if (IDSanPham !== undefined) sanPham.IDSanPham = IDSanPham;
    if (TenSanPham !== undefined) sanPham.TenSanPham = TenSanPham;
    if (DonGiaNhap !== undefined) sanPham.DonGiaNhap = DonGiaNhap;
    if (DonGiaBan !== undefined) sanPham.DonGiaBan = DonGiaBan;
    if (SoLuongNhap !== undefined) sanPham.SoLuongNhap = SoLuongNhap;
    //if (SoLuongHienTai !== undefined) sanPham.SoLuongHienTai = SoLuongHienTai;
    if (PhanTramGiamGia !== undefined) sanPham.PhanTramGiamGia = PhanTramGiamGia;
    if (NgayTao !== undefined) sanPham.NgayTao = NgayTao;
    if (TinhTrang !== undefined) sanPham.TinhTrang = TinhTrang;
    if (MoTa !== undefined) sanPham.MoTa = MoTa;
    if (Unit !== undefined) sanPham.Unit = Unit;
    if (DanhSachThuocTinh !== undefined) sanPham.DanhSachThuocTinh = DanhSachThuocTinh;
    if (IDDanhMuc !== undefined) sanPham.IDDanhMuc = IDDanhMuc;
    if (IDDanhMucCon !== undefined) sanPham.IDDanhMucCon = IDDanhMucCon;

    const updatedSanPham = await sanPham.save();

    // if (luachon == 0) {
    // } else {
    //   const createdVariants = await ToHopBienThe(updatedSanPham._id, sku, gia, soLuong);
    // }
    res.status(200).json(updatedSanPham);
  } catch (error) {
    console.error("Lỗi cập nhật sản phẩm:", error);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
}

async function deleteSanPham(req, res, next) {
  const { IDSanPham } = req.params;

  try {
    const sanPham = await SanPhamModel.findById(IDSanPham);
    if (!sanPham) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }
    // Cập nhật trạng thái sản phẩm thành "Đã xóa"
    sanPham.TinhTrang = 'Đã xóa';
    await sanPham.save();

    res.status(200).json({ message: 'Sản phẩm đã được cập nhật trạng thái thành "Đã xóa"' });
  } catch (error) {
    console.error("Lỗi cập nhật trạng thái sản phẩm:", error);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
}

async function ToggleSanPhamMoi(req, res, next) {
  const { IDSanPham } = req.params;

  try {
    const sanPham = await SanPhamModel.findById(IDSanPham);
    if (!sanPham) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }
    // Đảo ngược giá trị SanPhamMoi
    const newStatus = !sanPham.SanPhamMoi;

    // Cập nhật trạng thái SanPhamMoi
    sanPham.SanPhamMoi = newStatus;
    await sanPham.save();

    res.status(200).json({ message: 'Sản phẩm đã được cập nhật trạng thái ' });
  } catch (error) {
    console.error("Lỗi cập nhật trạng thái sản phẩm:", error);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
}

async function updateTinhTrangSanPham(req, res, next) {
  const { IDSanPham } = req.params;
  const { TinhTrang } = req.body;

  try {
    const sanPham = await SanPhamModel.findById(IDSanPham);
    if (!sanPham) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }
    // Cập nhật trạng thái sản phẩm thành "Đã xóa"
    sanPham.TinhTrang = TinhTrang;
    await sanPham.save();

    res.status(200).json({ message: 'Sản phẩm đã được cập nhật trạng thái thành ' + TinhTrang });
  } catch (error) {
    console.error("Lỗi cập nhật trạng thái sản phẩm:", error);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
}
async function createSanPhamVoiBienThe(req, res) {
  // Tạo sản phẩm gốc
  const projection = {
    _id: 1,
    // Set chapters to null explicitly
  };
  const { IDSanPham } = req.params;
  const { sku, gia, soLuong, } = req.body;
  // const validation = validateSanPhamData(sku, gia, soLuong);
  // if (!validation.valid) {
  //   return res.status(400).json({ errors: validation.errors });
  // }
  const product = await SanPhamModel.findById(IDSanPham)
  if (!product) {
    return res.status(404).json({ message: "sản phẩm không tồn tại" });
  }
  const attributeIds = product.DanhSachThuocTinh;
  console.log(attributeIds);
  // // Tạo các biến thể sản phẩm
  const createVariants = async (product, thuocTinhs, currentVariant = {}) => {
    if (thuocTinhs.length === 0) {
      // Tạo biến thể mới
      console.log("check  ket hop", currentVariant);
      const KetHopThuocTinh = Object.entries(currentVariant).map(
        ([key, value]) => ({
          IDGiaTriThuocTinh: value,
        })
      );
      //   const maBienThe = `${product._id}_${KetHopThuocTinh}`;

      // const existingVariant = await BienTheSchema.findOne({ maBienThe });
      // if (existingVariant) {
      //     console.log('Biến thể đã tồn tại');
      //     return;
      // }
      const newVariant = new BienTheSchema({
        IDSanPham: product._id,
        sku: sku,
        gia: gia,
        soLuong: soLuong,
        KetHopThuocTinh: KetHopThuocTinh,
      });
      await newVariant.save();
      console.log(newVariant);
      await SanPhamModel.findOneAndUpdate(
        { _id: newVariant.IDSanPham },
        { $inc: { SoLuongHienTai: soLuong } }
      );
    } else {
      const thuocTinh = thuocTinhs.shift();
      const giaTriThuocTinhList = thuocTinh.giaTriThuocTinh

      console.log("thuoc tinh abababa la zap", thuocTinh);
      // const giaTriThuocTinhList = await ThuocTinhGiaTriModel.find(
      //   { ThuocTinhID: thuocTinh.thuocTinh._id },
      //   projection
      // );
      if (!giaTriThuocTinhList) {
        return res.json("Thuộc tính này không có giá trị",);
      }
      for (const giaTri of giaTriThuocTinhList) {
        const IDGiaTriThuocTinh = giaTri._id; // Destructure to get the value ID
        currentVariant = { ...currentVariant, [thuocTinh]: IDGiaTriThuocTinh };
        await createVariants(product, [...thuocTinhs], currentVariant);
      }

    }
  };

  await createVariants(product, attributeIds);
  // Điều kiện dừng: Kiểm tra nếu tất cả các biến thể đã được tạo xong
  const totalCombinations = attributeIds.reduce((acc, attr) => acc * attr.length, 1);
  const variantsCount = await BienTheSchema.countDocuments({ IDSanPham: product._id });
  if (variantsCount === totalCombinations) {
    console.log("Tất cả các biến thể đã được tạo xong");
    return res.status(200).json("so bien the da duoc tao", variantsCount);
  }
  return product;
}




// async function createSanPhamVoiBienThe(req, res) {
//   // Tạo sản phẩm gốc
//   const projection = {
//     _id: 1,
//     // Set chapters to null explicitly
//   };
//   const { IDSanPham } = req.params;
//   const { sku, gia, soLuong, } = req.body;
//   // const validation = validateSanPhamData(sku, gia, soLuong);
//   // if (!validation.valid) {
//   //   return res.status(400).json({ errors: validation.errors });
//   // }
//   const product = await SanPhamModel.findById(IDSanPham).populate(
//     "DanhSachThuocTinh.thuocTinh"
//   );
//   if (!product) {
//     return res.status(404).json({ message: "sản phẩm không tồn tại" });
//   }
//   const attributeIds = product.DanhSachThuocTinh;
//   console.log(attributeIds);
//   // // Tạo các biến thể sản phẩm
//   const createVariants = async (product, thuocTinhs, currentVariant = {}) => {
//     if (thuocTinhs.length === 0) {
//       // Tạo biến thể mới
//       console.log("check  ket hop", currentVariant);
//       const KetHopThuocTinh = Object.entries(currentVariant).map(
//         ([key, value]) => ({
//           IDGiaTriThuocTinh: value,
//         })
//       );
//       const newVariant = new BienTheSchema({
//         IDSanPham: product._id,
//         sku: sku,
//         gia: gia,
//         soLuong: soLuong,
//         KetHopThuocTinh: KetHopThuocTinh,
//       });
//       await newVariant.save();
//       console.log(newVariant);
//     } else {
//       const thuocTinh = thuocTinhs.shift();
//       console.log("thuoc tinh abababa la zap", thuocTinh);
//       const giaTriThuocTinhList = await ThuocTinhGiaTriModel.find(
//         { ThuocTinhID: thuocTinh.thuocTinh._id },
//         projection
//       );
//       if (!giaTriThuocTinhList) {
//         return res.json("Thuộc tính này không có giá trị",);
//       }
//       for (const giaTri of giaTriThuocTinhList) {
//         const IDGiaTriThuocTinh = giaTri._id; // Destructure to get the value ID
//         currentVariant = { ...currentVariant, [thuocTinh]: IDGiaTriThuocTinh };
//         await createVariants(product, [...thuocTinhs], currentVariant);
//       }

//     }
//   };

//   await createVariants(product, attributeIds);
//   // Điều kiện dừng: Kiểm tra nếu tất cả các biến thể đã được tạo xong
//   const totalCombinations = attributeIds.reduce((acc, attr) => acc * attr.length, 1);
//   const variantsCount = await BienTheSchema.countDocuments({ IDSanPham: product._id });
//   if (variantsCount === totalCombinations) {
//     console.log("Tất cả các biến thể đã được tạo xong");
//     return res.status(200).json("so bien the da duoc tao", variantsCount);
//   }
//   return product;
// }
async function getDanhSachThuocTinhTrongSanPham(req, res) {
  const { IDSanPham } = req.params
  try {
    // Tìm sản phẩm và populate các thuộc tính
    const sanPham = await SanPhamModel.findById(IDSanPham).populate({
      path: 'DanhSachThuocTinh.thuocTinh',
      populate: {
        path: 'GiaTriThuocTinh',
        model: 'GiaTriThuocTinh'
      }
    });

    if (!sanPham) {
      throw new Error('Sản phẩm không tồn tại');
    }

    return res.json(sanPham.DanhSachThuocTinh);
  } catch (error) {
    console.error("Lỗi khi get list giá trị thuộc tính", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
}


//code them thuoc tinh vao ben trong san pham
async function createThuocTinhSanPham(req, res, next) {
  const { ThuocTinhID } = req.body;
  const { IDSanPham } = req.params

  try {
    // Tìm sản phẩm theo ID
    const sanPham = await SanPhamModel.findById(IDSanPham);
    if (!sanPham) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" }); // Trả về lỗi HTTP 404
    }

    // Thêm ThuocTinhID vào mảng DanhSachThuocTinh
    sanPham.DanhSachThuocTinh.push(ThuocTinhID);
    // const validationThuocTinh = await validateDanhSachThuocTinh(sanPham.DanhSachThuocTinh);
    // if (!validationThuocTinh.valid) {
    //   return res.status(404).json({ message: validationThuocTinh.message });
    // }
    // Lưu thay đổi
    const sanPhamUpdated = await sanPham.save();

    return res.json(sanPhamUpdated); // Trả về sản phẩm đã cập nhật
  } catch (error) {
    console.error("Lỗi khi thêm thuộc tính:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" }); // Trả về lỗi HTTP 500
  }
}

//hamdequy
async function getlistBienThe(req, res, next) {
  const { IDSanPham } = req.params;

  try {
    const BienThe = await BienTheSchema.find({ IDSanPham: IDSanPham, isDeleted: false }).populate('KetHopThuocTinh.IDGiaTriThuocTinh');

    res.status(200).json(BienThe);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi truy xuat san pham" });
  }
}

//create biến thể sản phẩm chay , dự phòng
async function createBienTheThuCong(req, res, next) {
  const { IDSanPham } = req.params;
  const { sku, gia, soLuong, KetHopThuocTinh } = req.body;
  try {
    // console.log(KetHopThuocTinhs)
    // if (KetHopThuocTinh) {
    //   await checkDuplicateGiaTriThuocTinh(res, KetHopThuocTinh)
    // }
    const hasDuplicate = await checkDuplicateGiaTriThuocTinh(res, KetHopThuocTinh);
    if (hasDuplicate) { return; }
    const bienthe = await BienTheSchema.find({ IDSanPham: IDSanPham })
    // Duyệt qua từng biến thể đã tồn tại
    for (const existing of bienthe) {
      // const formattedKetHopThuocTinh = KetHopThuocTinh.map(id => ({ IDGiaTriThuocTinh: new mongoose.Types.ObjectId(id) }));
      const existingKetHopThuocTinh = existing.KetHopThuocTinh;
      //console.log(existing.KetHopThuocTinh)
      // Kiểm tra độ dài
      if (existingKetHopThuocTinh.length !== KetHopThuocTinh.length) {
        console.log("bo qua")
        continue; // Tiếp tục với biến thể tiếp theo
      }
      // Kiểm tra trùng lặp từng phần tử
      let isDuplicate = true;
      for (let i = 0; i < existingKetHopThuocTinh.length; i++) {
        if (existingKetHopThuocTinh[i].IDGiaTriThuocTinh.toString() !== KetHopThuocTinh[i].IDGiaTriThuocTinh) {
          isDuplicate = false;
          break;
        }
      }

      if (isDuplicate) {
        const bientheisDelete = await BienTheSchema.findById(existing._id)
        if (bientheisDelete && bientheisDelete.isDeleted) {
          bientheisDelete.sku = sku;
          bientheisDelete.gia = gia;
          bientheisDelete.soLuong = soLuong;
          bientheisDelete.isDeleted = false;
          await bientheisDelete.save();
          await SanPhamModel.findOneAndUpdate(
            { _id: bientheisDelete.IDSanPham },
            { $inc: { SoLuongHienTai: soLuong } }
          );

          return res.status(200).json({ message: 'Biến thể đã được khôi phục' });
        }
        return res.status(400).json({ message: 'Kết hợp thuộc tính đã tồn tại' });
      }
    }

    const newBienThe = new BienTheSchema({
      IDSanPham,
      sku,
      gia,
      soLuong,
      KetHopThuocTinh,
    });

    const savedBienThe = await newBienThe.save();
    await SanPhamModel.findOneAndUpdate(
      { _id: savedBienThe.IDSanPham },
      { $inc: { SoLuongHienTai: soLuong } }
    );
    // Trả về kết quả cho client
    res.status(200).json(savedBienThe);
  } catch (error) {
    console.error("Lỗi Thêm Biến thể :", error);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
}
async function updateBienTheThuCong(req, res, next) {
  const { IDBienThe } = req.params;
  const { sku, gia, soLuong, KetHopThuocTinh } = req.body;
  const BienTheS = await BienTheSchema.findById(IDBienThe);
  if (!BienTheS) {
    return res.status(404).json({ message: 'Không tìm thấy biến thể' });
  }
  try {
    //const bienthe = await BienTheSchema.find({ IDSanPham: BienTheS.IDSanPham })
    const bienthe = await BienTheSchema.find({ IDSanPham: BienTheS.IDSanPham, _id: { $ne: IDBienThe } });
    console.log(bienthe)
    // Duyệt qua từng biến thể đã tồn tại
    for (const existing of bienthe) {
      const existingKetHopThuocTinh = existing.KetHopThuocTinh;
      //console.log(existing.KetHopThuocTinh)
      // Kiểm tra độ dài
      if (existingKetHopThuocTinh.length !== KetHopThuocTinh.length) {
        console.log("bo qua")
        continue; // Tiếp tục với biến thể tiếp theo
      }
      // Kiểm tra trùng lặp từng phần tử
      let isDuplicate = true;
      for (let i = 0; i < existingKetHopThuocTinh.length; i++) {
        if (existingKetHopThuocTinh[i].IDGiaTriThuocTinh.toString() !== KetHopThuocTinh[i].IDGiaTriThuocTinh) {
          isDuplicate = false;
          break;
        }
      }

      if (isDuplicate) {
        const bientheisDelete = await BienTheSchema.findById(existing._id)
        if (bientheisDelete && bientheisDelete.isDeleted) {
          bientheisDelete.sku = sku;
          bientheisDelete.gia = gia;
          bientheisDelete.soLuong = soLuong;
          bientheisDelete.isDeleted = false;
          await bientheisDelete.save();
          return res.status(200).json({ message: 'Biến thể đã được khôi phục' });
        }
        return res.status(400).json({ error: 'Kết hợp thuộc tính đã tồn tại' });
      }
    }
    const soLuongCu = BienTheS.soLuong;
    const soLuongMoi = soLuong;
    const deltaSoLuong = soLuongMoi - soLuongCu;


    const sanpham = await SanPhamModel.findByIdAndUpdate(
      BienTheS.IDSanPham,
      { $inc: { SoLuongHienTai: deltaSoLuong } }
    ).sort({ NgayTao: -1 });
    BienTheS.sku = sku
    BienTheS.gia = gia
    BienTheS.soLuong = soLuong
    BienTheS.KetHopThuocTinh = KetHopThuocTinh
    await BienTheS.save();
    // Trả về kết quả cho client
    res.status(200).json(BienTheS);
  } catch (error) {
    console.error("Lỗi update biến thể :", error);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
}
async function deleteBienTheThuCong(req, res, next) {
  const { IDBienThe } = req.params;
  try {
    // Tìm tất cả các hóa đơn có chứa biến thể
    const hoaDons = await HoadonModel.find({
      'chiTietHoaDon.idBienThe': IDBienThe
    });

    const gioHangs = await GiohangModel.find({
      'chiTietGioHang.idBienThe': IDBienThe
    });
    // Kiểm tra xem có hóa đơn nào chứa biến thể cần xóa
    if (hoaDons.length > 0 || gioHangs.length > 0) {
      // Cập nhật trạng thái isDeleted của biến thể
      const bienthe = await BienTheSchema.findByIdAndUpdate(IDBienThe, { isDeleted: true });
      await SanPhamModel.findOneAndUpdate(
        { _id: bienthe.IDSanPham },
        { $inc: { SoLuongHienTai: -bienthe.soLuong } }
      ).sort({ NgayTao: -1 });
      bienthe.soLuong = 0
      await bienthe.save()
      res.status(200).json({ message: 'Biến thể đã được đánh dấu là đã xóa' });
    } else {
      // Nếu không tìm thấy hóa đơn nào, có nghĩa là biến thể chưa được mua
      // Bạn có thể thực hiện các hành động khác ở đây, ví dụ: xóa biến thể hoàn toàn
      const bienthe = await BienTheSchema.findById(IDBienThe);
      await SanPhamModel.findOneAndUpdate(
        { _id: bienthe.IDSanPham },
        { $inc: { SoLuongHienTai: -bienthe.soLuong } }
      );
      await BienTheSchema.findByIdAndDelete(IDBienThe);

      res.status(200).json({ message: 'Biến thể đã được xóa' });
    }
  } catch (error) {
    console.error("Lỗi khi xóa biến thể:", error);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
}

async function findSanPham(req, res, next) {
  const { ThuocTinhID } = req.params;

  let query = {};
  if (ThuocTinhID) {
    query.ThuocTinhID = ThuocTinhID;
  }

  try {
    const thuocTinhs = await SanPhamModel.find(query);
    res.status(200).json(thuocTinhs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi tìm kiếm giá trị thuộc tính" });
  }
}

async function findSanPhambyID(req, res, next) {
  const { IDSanPham } = req.params;
  const { userId, yeuThichId } = req.query
  // console.log(IDSanPham);
  // let query = {};
  // if (IDSanPham) {
  //   query.IDSanPham = IDSanPham;
  // }
  try {
    const SanPham = await SanPhamModel.findById(IDSanPham).populate({
      path: 'DanhSachThuocTinh',
      populate: {
        path: 'thuocTinh'
      }
    })
      .populate({
        path: 'DanhSachThuocTinh',
        populate: {
          path: 'giaTriThuocTinh'
        }
      })
      .populate("userId")

    let isFavorited = false; // Kiểm tra yêu thích nếu userId không null 
    if (userId && yeuThichId) {
      const yeuThich = await YeuThichModel.findById(yeuThichId);
      if (yeuThich) { isFavorited = yeuThich.sanphams.some(sanpham => sanpham.IDSanPham.equals(productId)); }
    }
    //res.status(200).json({ SanPham, isFavorited })
    const productWithFavoriteStatus = SanPham.toObject();
    productWithFavoriteStatus.isFavorited = isFavorited;


    res.status(200).json(productWithFavoriteStatus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi lay gia tri san pham" });
  }
}

async function getlistPageSanPham(req, res, next) {
  const { userId, yeuThichId } = req.query
  try {
    const page = parseInt(req.params.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    //true chi hien sp ok
    const sanphams = await SanPhamModel.find({ SanPhamMoi: true, TinhTrang: "Còn hàng" }).skip(skip).limit(limit).populate("userId").sort({ NgayTao: -1 });
    const totalProducts = await SanPhamModel.countDocuments();

    let favoritedProductIds = [];
    if (userId && yeuThichId) {
      const yeuThich = await YeuThichModel.findById(yeuThichId);
      if (yeuThich) { favoritedProductIds = yeuThich.sanphams.map(sanpham => sanpham.IDSanPham.toString()); }
    } // Thêm thuộc tính isFavorited vào từng sản phẩm 
    const sanphamsWithFavoriteStatus = sanphams.map(sanpham => {
      const productObject = sanpham.toObject();
      productObject.isFavorited = favoritedProductIds.includes(productObject._id.toString());
      return productObject;
    });

    res.status(200).json({
      sanphams: sanphamsWithFavoriteStatus,
      totalProducts,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi truy xuất sản phẩm" });
  }
}
async function getlistBienTheInSanPham(req, res, next) {
  const { IDSanPham } = req.params;
  console.log(IDSanPham);
  try {
    const bienThe = await BienTheSchema.find({ IDSanPham: IDSanPham, isDeleted: false }).populate(
      "KetHopThuocTinh.IDGiaTriThuocTinh"
    );

    res.status(200).json(bienThe);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi tìm kiếm giá trị thuộc tính" });
  }
}
// k su dung
async function getlistBienTheAdmin(req, res, next) {
  const { IDSanPham } = req.params;

  try {
    const BienThe = await BienTheSchema.find({ IDSanPham: IDSanPham })
      .populate({ path: 'KetHopThuocTinh.IDGiaTriThuocTinh', populate: { path: 'ThuocTinhID', model: 'ThuocTinh', } });

    if (!BienThe) {
      return res.status(404).json({ message: "không tìm thấy biến thể nào" });
    }

    return res.status(200).json(BienThe);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi khi truy xuat san pham" });
  }
}
async function findSanPhamByDanhMuc(req, res, next) {
  const { IDDanhMuc } = req.params;

  try {
    const sanphams = await SanPhamModel.find({ SanPhamMoi: false, TinhTrang: "Còn hàng", IDDanhMuc });

    if (!sanphams || sanphams.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    res.status(200).json(sanphams);
  } catch (error) {
    console.error("Lỗi khi tìm kiếm sản phẩm theo danh mục:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi tìm kiếm sản phẩm theo danh mục" });
  }
}

async function sapXepSanPhamTheoGia(req, res, next) {
  try {
    const sanPhams = await SanPhamModel.find({ SanPhamMoi: false, TinhTrang: "Còn hàng" }).sort({ DonGiaBan: 1 }); // Sắp xếp tăng dần

    return res.status(200).json(sanPhams);
  } catch (error) {
    console.error("Lỗi khi sắp xếp sản phẩm:", error);
    res.status(500).json({ message: "Lỗi khi sắp xếp sản phẩm" });
  }
}
async function sapXepSanPhamTheoGiaGiamDan(req, res, next) {
  try {
    const sanPhams = await SanPhamModel.find({ SanPhamMoi: false, TinhTrang: "Còn hàng", }).sort({ DonGiaBan: -1 }); // Sắp xếp tăng dần

    return res.status(200).json(sanPhams);
  } catch (error) {
    console.error("Lỗi khi sắp xếp sản phẩm:", error);
    res.status(500).json({ message: "Lỗi khi sắp xếp sản phẩm" });
  }
}

async function sapXepSanPhamTheoNgayTao(req, res, next) {
  try {
    const sanPhams = await SanPhamModel.find({ SanPhamMoi: false, TinhTrang: "Còn hàng" }).sort({ NgayTao: 1 }); // Sắp xếp tăng dần

    return res.status(200).json(sanPhams);
  } catch (error) {
    console.error("Lỗi khi sắp xếp sản phẩm:", error);
    res.status(500).json({ message: "Lỗi khi sắp xếp sản phẩm" });
  }
}
async function sapXepSanPhamNgayTaoGiamDan(req, res, next) {
  try {
    const sanPhams = await SanPhamModel.find({ SanPhamMoi: false, TinhTrang: "Còn hàng", }).sort({ NgayTao: -1 }); // Sắp xếp tăng dần

    return res.status(200).json(sanPhams);
  } catch (error) {
    console.error("Lỗi khi sắp xếp sản phẩm:", error);
    res.status(500).json({ message: "Lỗi khi sắp xếp sản phẩm" });
  }
}

async function sapXepSanPhamBanChayNhat(req, res, next) {
  try {
    const sanPhams = await SanPhamModel.aggregate([
      {
        $match: {
          SanPhamMoi: false,
          TinhTrang: "Còn hàng",
        },
      },
      {
        $addFields: {

          SoLuongDaBan: { $subtract: ["$SoLuongNhap", "$SoLuongHienTai"] },
        },
      },
      {
        $sort: { soLuongDaBan: -1 },
      },
    ]);
    return res.status(200).json(sanPhams);
  } catch (error) {
    console.error("Lỗi khi sắp xếp sản phẩm:", error);
    res.status(500).json({ message: "Lỗi khi sắp xếp sản phẩm" });
  }
}
async function sapXepSanPhamCoGiamGia(req, res, next) {
  try {
    const sanPhams = await SanPhamModel.find({
      SanPhamMoi: false, TinhTrang: "Còn hàng", PhanTramGiamGia: { $gt: 0 }
    });

    return res.status(200).json(sanPhams);
  } catch (error) {
    console.error("Lỗi khi sắp xếp sản phẩm:", error);
    res.status(500).json({ message: "Lỗi khi sắp xếp sản phẩm" });
  }
}

async function findSanPhamByDanhMuc(req, res, next) {
  const { IDDanhMuc } = req.params;

  try {
    const sanphams = await SanPhamModel.find({ SanPhamMoi: true, TinhTrang: "Còn hàng", IDDanhMuc });

    if (!sanphams || sanphams.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    res.status(200).json(sanphams);
  } catch (error) {
    console.error("Lỗi khi tìm kiếm sản phẩm theo danh mục:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi tìm kiếm sản phẩm theo danh mục" });
  }
}
async function searchSanPham(req, res, next) {
  try {
    const { TenSanPham, userId, yeuThichId } = req.query;
    const tenSanPhamKhongDau = removeAccents(TenSanPham.toLowerCase());

    // Biểu thức chính quy linh hoạt hơn, bao gồm khoảng trắng và các ký tự đặc biệt
    const regex = new RegExp(`.*${TenSanPham}.*`, 'gi');

    // Tìm kiếm, thêm index nếu chưa có
    const sanphams = await SanPhamModel.find({
      SanPhamMoi: true, TinhTrang: "Còn hàng",
      TenSanPham: { $regex: regex }
    }).collation({ locale: 'vi' })
      .populate("userId").exec(); // Sử dụng collation cho tiếng Việt

    let favoritedProductIds = [];
    if (userId && yeuThichId) {
      const yeuThich = await YeuThichModel.findById(yeuThichId);
      if (yeuThich) { favoritedProductIds = yeuThich.sanphams.map(sanpham => sanpham.IDSanPham.toString()); }
    } // Thêm thuộc tính isFavorited vào từng sản phẩm 
    const sanphamsWithFavoriteStatus = sanphams.map(sanpham => {
      const productObject = sanpham.toObject();
      productObject.isFavorited = favoritedProductIds.includes(productObject._id.toString());
      return productObject;
    });


    res.status(200).json(sanphamsWithFavoriteStatus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi tìm kiếm sản phẩm" });
  }
}

// async function searchSanPhamtest(req, res, next) {
//   try {
//     const { TenSanPham } = req.query;
//     console.log(TenSanPham)

//     const tenSanPhamKhongDau = removeAccents(TenSanPham.toLowerCase());
//     // Biểu thức chính quy linh hoạt hơn, bao gồm khoảng trắng và các ký tự đặc biệt
//     const regex = new RegExp(`.*${tenSanPhamKhongDau}.*`, 'gi');



//     // Tìm kiếm, thêm index nếu chưa có
//     const sanphams = await SanPhamModel.find({
//       TenSanPham: { $regex: regex }
//     })

//     res.status(200).json(sanphams);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Lỗi khi tìm kiếm sản phẩm" });
//   }
// }
async function searchSanPhamtest(req, res, next) {
  try {
    const { TenSanPham } = req.query;
    if (!TenSanPham) {
      return res.status(400).json({ message: "Vui lòng nhập tên sản phẩm để tìm kiếm" });
    }

    const tenSanPhamKhongDau = removeAccents(TenSanPham.toLowerCase());
    const regex = new RegExp(`.*${tenSanPhamKhongDau}.*`, 'i'); // chỉ một regex, 'i' để không phân biệt hoa thường

    // Tìm kiếm với cả từ không dấu và từ gốc có dấu
    const sanphams = await SanPhamModel.find({
      $or: [
        { TenSanPham: { $regex: regex } },
        { TenSanPham: { $regex: new RegExp(`.*${TenSanPham}.*`, 'i') } }
      ]
    }).collation({ locale: 'vi', strength: 1 });

    res.status(200).json(sanphams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi tìm kiếm sản phẩm" });
  }
}
function removeAccents(str) {
  return str.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D');
}
// tự nhiên ngiu tiếng anh
async function checkNumberProductvaBienthe(req, res, next) {
  const { IDSanPham } = req.params;
  try {
    // Tìm tất cả các hóa đơn có chứa biến thể
    const bienthes = await BienTheSchema.find({ IDSanPham: IDSanPham });
    const totalBientheQuantity = bienthes.reduce((total, bienthe) => total + bienthe.soLuong, 0);

    const sanpham = await SanPhamModel.findById(IDSanPham);
    if (!sanpham) {
      return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
    }
    const Data = {
      TongSoluongsp: sanpham.SoLuongHienTai,
      TongSoluongSanPhamBienThe: totalBientheQuantity,
      ChenhLech: totalBientheQuantity - sanpham.SoLuongHienTai
    }
    res.status(200).json({ message: 'Biến Kiểm tra xong', Data });

  } catch (error) {
    console.error("Lỗi khi xóa biến thể:", error);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
}
//hàm chuyển đổi ngày tạo sang ngày việt nam
// async function layNgayTaoSanPham(idSanPham) {
//   try {
//     const sanPham = await SanPham.findById(idSanPham);
//     if (sanPham) {
//       const ngayTao = sanPham.NgayTao; // Đối tượng Date
//       // Định dạng lại ngày tạo theo mong muốn
//       const ngayTaoFormat = ngayTao.toLocaleDateString('vi-VN'); // Định dạng theo tiếng Việt
//       console.log('Ngày tạo sản phẩm:', ngayTaoFormat);
//     } else {
//       console.log('Không tìm thấy sản phẩm');
//     }
//   } catch (error) {
//     console.error('Lỗi khi lấy ngày tạo:', error);
//   }
// }

async function validateSanPham(IDSanPham, TenSanPham) {
  const sanPham = await SanPhamModel.findOne({ IDSanPham, TenSanPham });
  if (!sanPham) {
    return { valid: false, message: 'Sản phẩm không tồn tại' };
  }
  return { valid: true, sanPham };
}
function validateDanhSachThuocTinh(DanhSachThuocTinh) {
  if (!Array.isArray(DanhSachThuocTinh)) {
    return { valid: false, message: 'Danh sách thuộc tính phải là một mảng' };
  }

  const idSet = new Set();

  for (const thuocTinh of DanhSachThuocTinh) {
    if (!thuocTinh.IDThuocTinh) {
      return { valid: false, message: 'Mỗi thuộc tính phải có IDThuocTinh' };
    }

    if (idSet.has(thuocTinh.IDThuocTinh)) {
      return { valid: false, message: `Thuộc tính với ID ${thuocTinh.IDThuocTinh} bị trùng` };
    }

    idSet.add(thuocTinh.IDThuocTinh);
  }

  return { valid: true };
}
function validateSanPhamData(sku, gia, soLuong) {
  const errors = [];

  // Kiểm tra sku
  if (!sku) {
    errors.push('SKU không được để trống');
  }

  // Kiểm tra gia
  if (gia === undefined || gia === null) {
    errors.push('Giá không được để trống');
  } else if (typeof gia !== 'number') {
    errors.push('Giá phải là số');
  }

  // Kiểm tra soLuong
  if (soLuong === undefined || soLuong === null) {
    errors.push('Số lượng không được để trống');
  } else if (typeof soLuong !== 'number') {
    errors.push('Số lượng phải là số');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

async function checkVariantExistence(IDSanPham, KetHopThuocTinh) {
  try {
    // Validate sự tồn tại của IDGiaTriThuocTinh
    // for (const item of KetHopThuocTinh) {
    //   const giaTriThuocTinh = await BienTheSchema.findById(item.IDGiaTriThuocTinh);
    //   if (!giaTriThuocTinh) {
    //     throw new Error(`IDGiaTriThuocTinh ${item.IDGiaTriThuocTinh} không tồn tại`);
    //   }
    // }

    // Validate không trùng lặp IDGiaTriThuocTinh trong KetHopThuocTinh
    const uniqueValues = new Set(KetHopThuocTinh.map(item => item.IDGiaTriThuocTinh.toString()));
    if (uniqueValues.size !== KetHopThuocTinh.length) {
      throw new Error('Các IDGiaTriThuocTinh không được trùng lặp');
    }

    // Tìm kiếm biến thể có cùng IDSanPham và KetHopThuocTinh
    const existingVariant = await BienTheSchema.findOne({
      IDSanPham: IDSanPham,
      KetHopThuocTinh: { $all: KetHopThuocTinh }
    });
    console.log("kiem tra", existingVariant)
    return existingVariant !== null;
  } catch (error) {
    console.error('Error checking variant existence:', error);
    return false;
  }
}


async function updateMissingUserIds(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "Thiếu thông tin userId" });
    }
    const products = await SanPhamModel.find();

    products.forEach(async (product) => {
      if (!product.userId) {
        product.userId = userId;
        await product.save();
      }
    });
    if (products) {
      return res.status(200).json({ message: `${products} sản phẩm đã được cập nhật với userId mới` });
    } else {
      return res.status(200).json({ message: 'Không có sản phẩm nào cần được cập nhật' });
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật userId cho các sản phẩm:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật userId cho các sản phẩm' });
  }
}


module.exports = {
  searchSanPham,
  getlistSanPham,
  getlistSanPhamAdmin,
  getSanPhamListNew_Old,
  toggleSanPhamMoi,
  createSanPham,
  updateHinhBoSung,
  createSanPhamVoiBienThe,
  createThuocTinhSanPham,
  getlistBienThe,
  createBienTheThuCong,
  updateBienTheThuCong,
  deleteBienTheThuCong,
  updateSanPham,
  deleteSanPham,
  ToggleSanPhamMoi,
  updateTinhTrangSanPham,
  findSanPham,
  findSanPhamByDanhMuc,
  getlistPageSanPham,
  // createimageSanPham,
  // updateimageSanPham,
  // deleteImageSanPham,
  findSanPhambyID,
  getlistBienTheInSanPham,
  getlistBienTheAdmin,
  sapXepSanPhamTheoGia,
  sapXepSanPhamTheoGiaGiamDan,
  sapXepSanPhamTheoNgayTao,
  sapXepSanPhamNgayTaoGiamDan,
  sapXepSanPhamBanChayNhat,
  sapXepSanPhamCoGiamGia,
  // getlistSanPham,
  // createSanPham,
  // createSanPhamVoiBienThe,
  // createThuocTinhSanPham,
  // createbienthesanpham,
  // getlistBienTheFake,
  // createBienTheFake,
  // updateSanPham,
  // deleteSanPham,
  // findSanPham,
  // findSanPhambyID,
  getlistPageSanPham,
  createSanPhamtest,
  getDanhSachThuocTinhTrongSanPham,
  checkNumberProductvaBienthe,
  searchSanPhamtest,
  //ham su dung ca nhan
  updateMissingUserIds,
  ToHopBienThePhienBanBangTay,
};
