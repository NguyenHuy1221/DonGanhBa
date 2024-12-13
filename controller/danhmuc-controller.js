const DanhMucModel = require("../models/DanhMucSchema");
//danh de delete anh da update o danh mục
const fs = require('fs');
const path = require('path');
require("dotenv").config();
const multer = require("multer");
const { uploadFileToViettelCloud } = require("../untils/index")

const { v4: uuidv4 } = require('uuid');

//ham lay danh sach thuoc tinh
async function getlistDanhMuc(req, res, next) {

  try {
    const DanhMucs = await DanhMucModel.find();
    res.status(200).json(DanhMucs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi tìm kiếm danh mục' });
  }
}

// const DanhMucConSchema = new Schema({
//     _id: { type: Schema.Types.ObjectId, required: true }, // ID của danh mục con
//     TenDanhMucCon: { type: String, required: true },
//     MieuTa: String
//   });

// add products
// mediaRouter.post(
//     "/createProductsMultiple",
//     upload.single("file"),
//     async (req, res) => {
//       const {
//         ten,
//         donGiaNhap,
//         donGiaBan,
//         soLuongNhap,
//         soLuongDaBan,
//         category,
//         moTa,
//         tinhTrang,
//       } = req.body;

//       try {
//         const newPath = req.file.path.replace(
//           "public",
//           "https://imp-model-widely.ngrok-free.app/"
//         );

//         await ProductModel.create({
//           ten,
//           hinh: newPath,
//           donGiaNhap,
//           donGiaBan,
//           soLuongNhap,
//           soLuongDaBan,
//           category,
//           moTa,
//           tinhTrang,
//         });

//         return res.json({
//           message: "Thêm sản phẩm thành công",
//         });
//       } catch (error) {
//         console.error("Lỗi khi thêm sản phẩm:", error);
//         return res
//           .status(500)
//           .json({ message: "Đã xảy ra lỗi khi thêm sản phẩm" });
//       }
//     }
//   );
//hàm thêm thuộc tính

//const {upload} = require("../untils/index")
// async function createDanhMuc(req, res, next) {
//     upload.single("file"), async (req, res) => {
//         console.log("aaa2")
//         if (err instanceof multer.MulterError) {
//             return res.status(500).json({ error: err });
//         } else if (err) {
//             return res.status(500).json({error: err });
//         }
//         const newPath = req.file.path.replace(
//             "public",
//             "https://imp-model-widely.ngrok-free.app/"
//           ); 
//           console.log(newPath)
//           const { IDDanhMuc, TenDanhMuc } = req.body;

//           const existingDanhMuc = await DanhMucModel.findOne({ IDDanhMuc });
//           if (existingDanhMuc) {
//               return res.status(409).json({ message: 'Thuộc tính đã tồn tại' });
//           }
//           // Tạo một đối tượng thuộc tính mới dựa trên dữ liệu nhận được
//         const newDanhMuc = new ThuocTinhModel({
//             IDDanhMuc,
//             TenDanhMuc,
//             AnhDanhMuc : newPath
//         });
//         // Lưu đối tượng vào cơ sở dữ liệu
//         const savedDanhMuc = await newDanhMuc.save();

//         // Trả về kết quả cho client
//         res.status(201).json(savedDanhMuc);

//     }

// }

// const { upload } = require("../untils/index");

// async function createDanhMuc(req, res, next) {
//     try {
//         // Upload file trước
//         upload.single('file')(req, res, async (err) => {
//             if (err instanceof multer.MulterError) {
//                 return res.status(500).json({ error: err });
//             } else if (err) {
//                 return res.status(500).json({ error: err });
//             }
//         const newPath = req.file.path.replace(
//             "public",
//             "https://imp-model-widely.ngrok-free.app/"
//           ); 
//             const { IDDanhMuc, TenDanhMuc } = req.body;
//             console.log(IDDanhMuc)
//             const existingDanhMuc = await DanhMucModel.findOne({ IDDanhMuc });
//           if (existingDanhMuc) {
//               return res.status(409).json({ message: 'Thuộc tính đã tồn tại' });
//           }
//           // Tạo một đối tượng thuộc tính mới dựa trên dữ liệu nhận được
//         const newDanhMuc = await DanhMucModel.create({
//             IDDanhMuc : IDDanhMuc,
//             TenDanhMuc : TenDanhMuc,
//             AnhDanhMuc : newPath
//         });

//         console.log(newDanhMuc)
//         // Lưu đối tượng vào cơ sở dữ liệu
//         // const savedDanhMuc = await newDanhMuc.save();

//         // Trả về kết quả cho client
//         res.status(201).json(newDanhMuc);
//         });
//     } catch (error) {
//         console.error('Lỗi khi tạo danh mục:', error);
//         res.status(500).json({ message: 'Lỗi server' });
//     }
// }

const { upload } = require("../untils/index");

// async function createDanhMuc(req, res, next) {
//     try {
//         upload.single('file')(req, res, async (err) => {
//             if (err instanceof multer.MulterError) {
//                 return res.status(500).json({ error: err });
//             } else if (err) {
//                 return res.status(500).json({ error: err });
//             }

//             const { IDDanhMuc, TenDanhMuc } = req.body;

//             // Kiểm tra dữ liệu đầu vào
//             if (!IDDanhMuc || !TenDanhMuc) {
//                 return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
//             }

//             const newPath = req.file.path.replace(
//                 "public",
//                 // Sử dụng thư viện path để xây dựng đường dẫn một cách an toàn
//                 path.join(__dirname, '../', 'uploads')
//             ); 

//             // Tạo đối tượng danh mục
//             const newDanhMuc = await DanhMucModel.create({
//                 IDDanhMuc,
//                 TenDanhMuc,
//                 AnhDanhMuc: newPath
//             });

//             res.status(201).json(newDanhMuc);
//         });
//     } catch (error) {
//         console.error('Lỗi khi tạo danh mục:', error);
//         res.status(500).json({ message: 'Lỗi server', error });
//     }
// }



// async function createDanhMucCha(req, res, next) {
//   try {
//     upload.single('file')(req, res, async (err) => {
//       if (err instanceof multer.MulterError) {
//         return res.status(500).json({ error: err });
//       } else if (err) {
//         return res.status(500).json({
//           error: err
//         });
//       }

//       const { IDDanhMuc, TenDanhMuc } = req.body;
//       console.log(IDDanhMuc, TenDanhMuc)
//       if (!IDDanhMuc || !TenDanhMuc || !req.file) {
//         return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
//       }


//       const newPath = req.file.path.replace(
//         "public",
//         process.env.URL_IMAGE
//       );
//       try {
//         const newDanhMuc = await DanhMucModel.create({
//           IDDanhMuc,
//           TenDanhMuc,
//           AnhDanhMuc: newPath,
//           DanhMucCon: []
//         });

//         res.status(201).json(newDanhMuc);
//       } catch (error) {
//         console.error('Lỗi khi tạo danh mục:', error);
//         // Xử lý lỗi cụ thể của Mongoose (ví dụ: ValidationError, DuplicateKeyError)
//         res.status(500).json({ message: 'Lỗi server', error });
//       }
//     });
//   } catch (error) {
//     console.error('Lỗi chung:', error);
//     res.status(500).json({ message: 'Lỗi server', error });
//   }
// }

async function createDanhMucCha(req, res) {
  try {
    const { IDDanhMuc, TenDanhMuc } = req.body;

    if (!IDDanhMuc || !TenDanhMuc || !req.file) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    const bucketName = process.env.VIETTEL_BUCKET;
    const file = req.file;

    let imageUrl = "";

    if (file) {
      let objectKey = "";
      if (file.mimetype.startsWith('image/')) {
        objectKey = `images/${uuidv4()}-${file.originalname}`;
      } else {
        return res.status(400).json({ message: 'Chỉ được upload image' });
      }
      try {
        imageUrl = await uploadFileToViettelCloud(file.buffer, bucketName, objectKey, file.mimetype);
      } catch (error) {
        console.error('Lỗi khi tải lên ảnh:', error);
        return res.status(500).json({ message: 'Đã xảy ra lỗi khi tải lên ảnh' });
      }

    }

    try {
      const newDanhMuc = await DanhMucModel.create({
        IDDanhMuc,
        TenDanhMuc,
        AnhDanhMuc: imageUrl,
        DanhMucCon: []
      });

      res.status(201).json(newDanhMuc);
    } catch (error) {
      console.error('Lỗi khi tạo danh mục:', error);
      res.status(500).json({ message: 'Lỗi server', error });
    }
  } catch (error) {
    console.error('Lỗi chung:', error);
    res.status(500).json({ message: 'Lỗi server', error });
  }
};


async function updateDanhMucCha(req, res) {
  try {
    const { id } = req.params;
    const { IDDanhMuc, TenDanhMuc } = req.body;

    const danhmuc = await DanhMucModel.findById(id)
    let imageUrl = danhmuc.AnhDanhMuc;
    console.log(danhmuc)
    if (!danhmuc) {
      return res.status(404).json({ message: 'Danh mục không tồn tại' });
    }

    // Kiểm tra và tải lên ảnh mới nếu có
    if (req.file) {
      const bucketName = process.env.VIETTEL_BUCKET;
      const file = req.file;


      // Kiểm tra loại tệp tin
      if (file.mimetype.startsWith('image/')) {
        const objectKey = `images/${uuidv4()}-${file.originalname}`;
        try {
          imageUrl = await uploadFileToViettelCloud(file.buffer, bucketName, objectKey, file.mimetype);
        } catch (error) {
          console.error('Lỗi khi tải lên ảnh:', error);
          return res.status(500).json({ message: 'Đã xảy ra lỗi khi tải lên ảnh' });
        }
      } else {
        return res.status(400).json({ message: 'Chỉ được upload image' });
      }
      danhmuc.AnhDanhMuc = imageUrl
      //updateData.AnhDanhMuc = imageUrl;

      // // Xóa ảnh cũ từ Viettel Cloud
      // const danhMuc = await DanhMucModel.findById(id);
      // if (danhMuc && danhMuc.AnhDanhMuc) {
      //   const oldImagePath = danhMuc.AnhDanhMuc.replace(process.env.URL_IMAGE, '');
      //   try {
      //     await deleteImageFromViettelCloud(oldImagePath);
      //   } catch (err) {
      //     console.error('Lỗi khi xóa ảnh cũ:', err);
      //   }
      // }
    }
    console.log(IDDanhMuc, TenDanhMuc, imageUrl)
    if (IDDanhMuc != undefined) { danhmuc.IDDanhMuc = IDDanhMuc }
    if (TenDanhMuc != undefined) { danhmuc.TenDanhMuc = TenDanhMuc }
    await danhmuc.save()
    // Cập nhật thông tin danh mục
    //const updatedDanhMucCha = await DanhMucModel.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json(danhmuc);
  } catch (error) {
    console.error('Lỗi khi sửa danh mục cha:', error);
    res.status(500).json({ message: 'Lỗi server', error });
  }
}



// async function updateDanhMucCha(req, res, next) {
//   try {
//     upload.single('file')(req, res, async (err) => {
//       if (err instanceof multer.MulterError) {
//         return res.status(500).json({ error: err });
//       } else if (err) {
//         return res.status(500).json({ error: err });
//       }

//       const { id } = req.params;
//       const { IDDanhMuc, TenDanhMuc } = req.body;
//       let updateData = { IDDanhMuc, TenDanhMuc };

//       if (req.file) {
//         const newPath = req.file.path.replace("public", process.env.URL_IMAGE);
//         updateData.AnhDanhMuc = newPath;

//         // Xóa ảnh cũ
//         const danhMuc = await DanhMucModel.findById(id);
//         if (danhMuc && danhMuc.AnhDanhMuc) {
//           const oldImagePath = path.join(__dirname, '..', 'public', danhMuc.AnhDanhMuc.replace(process.env.URL_IMAGE, ''));
//           fs.unlink(oldImagePath, (err) => {
//             if (err) {
//               console.error('Lỗi khi xóa ảnh cũ:', err);
//             }
//           });
//         }
//       }

//       const updatedDanhMucCha = await DanhMucModel.findByIdAndUpdate(id, updateData, { new: true });
//       res.status(200).json(updatedDanhMucCha);
//     });
//   } catch (error) {
//     console.error('Lỗi khi sửa danh mục cha:', error);
//     res.status(500).json({ message: 'Lỗi server', error });
//   }
// }
async function deleteDanhMucCha(req, res, next) {
  try {
    const { id } = req.params;
    const danhMucCha = await DanhMucModel.findByIdAndDelete(id);
    if (!danhMucCha) {
      return res.status(404).json({ message: 'Danh mục cha không tồn tại' });
    }
    res.status(200).json({ message: 'Xóa danh mục cha thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa danh mục cha:', error);
    res.status(500).json({ message: 'Lỗi server', error });
  }
}


async function getListDanhMucCon(req, res, next) {
  try {
    const { IDDanhMucCha } = req.params;
    console.log(IDDanhMucCha)
    const danhMuc = await DanhMucModel.findById(IDDanhMucCha).select('DanhMucCon');
    if (!danhMuc) {
      return res.status(404).json({ message: 'Danh mục cha không tồn tại' });
    }
    res.status(200).json(danhMuc.DanhMucCon);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi tìm kiếm danh mục con' });
  }
}


async function createDanhMucCon(req, res, next) {
  try {
    const { IDDanhMucCha } = req.params;
    const { IDDanhMucCon, TenDanhMucCon, MieuTa } = req.body;
    if (!IDDanhMucCha || !IDDanhMucCon || !TenDanhMucCon) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    try {
      const danhMucCha = await DanhMucModel.findById(IDDanhMucCha);
      if (!danhMucCha) {
        return res.status(404).json({ message: 'Danh mục cha không tồn tại' });
      }

      const newDanhMucCon = {
        IDDanhMucCon,
        TenDanhMucCon,
        MieuTa
      };

      danhMucCha.DanhMucCon.push(newDanhMucCon);
      await danhMucCha.save();

      res.status(201).json(danhMucCha);
    } catch (error) {
      console.error('Lỗi khi tạo danh mục con:', error);
      res.status(500).json({ message: 'Lỗi server', error });
    }
  } catch (error) {
    console.error('Lỗi chung:', error);
    res.status(500).json({ message: 'Lỗi server', error });
  }
}


async function updateDanhMucCon(req, res, next) {
  try {
    const { IDDanhMucCha, IDDanhMucCon } = req.params;
    const { TenDanhMucCon, MieuTa, IDDanhMucContudat } = req.body;
    if (!IDDanhMucCha || !IDDanhMucCon) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    try {
      const danhMucCha = await DanhMucModel.findById(IDDanhMucCha);
      if (!danhMucCha) {
        return res.status(404).json({ message: 'Danh mục cha không tồn tại' });
      }

      const danhMucCon = danhMucCha.DanhMucCon.id(IDDanhMucCon);
      if (!danhMucCon) {
        return res.status(404).json({ message: 'Danh mục con không tồn tại' });
      }
      danhMucCon.IDDanhMucCon = IDDanhMucCon;
      danhMucCon.TenDanhMucCon = TenDanhMucCon;
      danhMucCon.MieuTa = MieuTa;

      await danhMucCha.save();

      res.status(200).json(danhMucCha);
    } catch (error) {
      console.error('Lỗi khi sửa danh mục con:', error);
      res.status(500).json({ message: 'Lỗi server', error });
    }
  } catch (error) {
    console.error('Lỗi chung:', error);
    res.status(500).json({ message: 'Lỗi server', error });
  }
}



async function deleteDanhMucCon(req, res, next) {
  try {
    // Lấy ID từ params
    const { IDDanhMucCha, IDDanhMucCon } = req.params;

    // Kiểm tra nếu thiếu ID nào
    if (!IDDanhMucCha || !IDDanhMucCon) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    // Tìm danh mục cha theo ID
    const danhMucCha = await DanhMucModel.findById(IDDanhMucCha);
    if (!danhMucCha) {
      return res.status(404).json({ message: 'Danh mục cha không tồn tại' });
    }

    // Sử dụng pull() để xóa danh mục con theo ID
    const updatedDanhMucCha = await DanhMucModel.findByIdAndUpdate(
      IDDanhMucCha,
      { $pull: { DanhMucCon: { _id: IDDanhMucCon } } },
      { new: true }
    );

    if (!updatedDanhMucCha) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục cha sau khi cập nhật' });
    }

    res.status(200).json({ message: 'Xóa danh mục con thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa danh mục con:', error);
    res.status(500).json({ message: 'Lỗi server', error });
  }
}



module.exports = {
  getlistDanhMuc,
  createDanhMucCha,
  updateDanhMucCha,
  deleteDanhMucCha,
  createDanhMucCon,
  updateDanhMucCon,
  deleteDanhMucCon,
  getListDanhMucCon,
};
