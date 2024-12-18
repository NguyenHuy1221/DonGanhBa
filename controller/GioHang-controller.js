const GioHang = require("../models/GioHangSchema");
const QRCode = require("qrcode");
const axios = require("axios").default;
const CryptoJS = require("crypto-js");
const moment = require("moment");
const Transaction = require("../models/TransactionSchema");
const BienTheSchema = require("../models/BienTheSchema")

// async function createGioHang(req, res, next) {
//   try {
//     const { userId, chiTietGioHang } = req.body;
//     let gioHang = await GioHang.findOne({ userId });

//     if (!gioHang) {
//       gioHang = new GioHang({
//         userId,
//         chiTietGioHang,
//       });
//     } else {
//       chiTietGioHang.forEach((newProduct) => {
//         const existingProductIndex = gioHang.chiTietGioHang.findIndex(
//           (item) => item.idBienThe.toString() === newProduct.idBienThe.toString()
//         );

//         if (existingProductIndex !== -1) {
//           if (gioHang.chiTietGioHang[existingProductIndex].soLuong + newProduct.soLuong >= 10) {
//             gioHang.chiTietGioHang[existingProductIndex].soLuong = 10
//           } else {
//             gioHang.chiTietGioHang[existingProductIndex].soLuong += newProduct.soLuong;

//           }
//           gioHang.chiTietGioHang[existingProductIndex].donGia = newProduct.donGia;
//         } else {
//           gioHang.chiTietGioHang.push(newProduct);
//         }
//       });
//     }

//     const savedGioHang = await gioHang.save();
//     res.status(201).json(savedGioHang);
//   } catch (error) {
//     console.error('Lỗi khi tạo hoặc cập nhật giỏ hàng:', error);
//     res.status(500).json({ error: "Lỗi khi tạo hoặc cập nhật giỏ hàng" });
//   }
// }


async function createGioHang(req, res, next) {
  try {
    const { userId, chiTietGioHang } = req.body;
    let gioHang = await GioHang.findOne({ userId });

    // Lấy thông tin biến thể từ cơ sở dữ liệu
    const bienTheIds = chiTietGioHang.map(product => product.idBienThe);
    const bienTheList = await BienTheSchema.find({ _id: { $in: bienTheIds } });

    if (!gioHang) {
      gioHang = new GioHang({
        userId,
        chiTietGioHang,
      });
    } else {
      chiTietGioHang.forEach((newProduct) => {
        const existingProductIndex = gioHang.chiTietGioHang.findIndex(
          (item) => item.idBienThe.toString() === newProduct.idBienThe.toString()
        );

        // Lấy biến thể tương ứng
        const existingVariant = bienTheList.find(bienThe => bienThe._id.toString() === newProduct.idBienThe.toString());

        // Kiểm tra số lượng tối đa từ biến thể
        if (newProduct.soLuong > existingVariant.soLuong) {
          return res.status(400).json({ error: "Số lượng không đủ trong biến thể." });
        }

        if (existingProductIndex !== -1) {
          // Cập nhật số lượng nếu sản phẩm đã tồn tại trong giỏ hàng
          const currentQuantity = gioHang.chiTietGioHang[existingProductIndex].soLuong;
          const newTotalQuantity = currentQuantity + newProduct.soLuong;

          // Kiểm tra xem tổng số lượng có vượt quá số lượng tối đa hay không
          if (newTotalQuantity > 10) {
            gioHang.chiTietGioHang[existingProductIndex].soLuong = 10; // Đặt giới hạn tối đa
          } else if (newTotalQuantity > existingVariant.soLuong) {
            return res.status(400).json({ error: "Tổng số lượng trong giỏ hàng vượt quá số lượng hiện có của biến thể." });
          } else {
            gioHang.chiTietGioHang[existingProductIndex].soLuong = newTotalQuantity; // Cập nhật số lượng mới
          }

          gioHang.chiTietGioHang[existingProductIndex].donGia = newProduct.donGia;
        } else {
          // Thêm sản phẩm mới vào giỏ hàng
          gioHang.chiTietGioHang.push(newProduct);
        }
      });
    }

    const savedGioHang = await gioHang.save();
    res.status(201).json(savedGioHang);
  } catch (error) {
    console.error('Lỗi khi tạo hoặc cập nhật giỏ hàng:', error);
    res.status(500).json({ error: "Lỗi khi tạo hoặc cập nhật giỏ hàng" });
  }
}


async function getGioHangById(req, res, next) {
  try {
    const gioHang = await GioHang.findById(req.params.id)
      .populate("userId")
      .populate("chiTietGioHang.idBienThe");
    if (!gioHang) {
      return res.status(404).json({ error: "Giỏ hàng không tồn tại" });
    }
    res.status(200).json(gioHang);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy thông tin giỏ hàng" });
  }
}

// const mongoose = require("mongoose");
// const GioHang = require('../models/GioHang');
// const BienThe = require('../models/BienThe');
// const SanPham = require('../models/SanPham');




// async function updateGioHang(req, res, next) {
//   try {
//     const { chiTietGioHang } = req.body;

//     const gioHang = await GioHang.findById(req.params.id);
//     if (!gioHang) {
//       return res.status(404).json({ error: "Giỏ hàng không tồn tại" });
//     }

//     chiTietGioHang.forEach((updatedProduct) => {
//       const existingProduct = gioHang.chiTietGioHang.find(
//         (item) =>
//           item.idBienThe.toString() === updatedProduct.idBienThe.toString()
//       );

//       if (existingProduct) {
//         existingProduct.soLuong = updatedProduct.soLuong;
//         existingProduct.donGia = updatedProduct.donGia;
//       } else {
//         gioHang.chiTietGioHang.push(updatedProduct);
//       }
//     });

//     const updatedGioHang = await gioHang.save();
//     res.status(200).json(updatedGioHang);
//   } catch (error) {
//     res.status(500).json({ error: "Lỗi khi cập nhật giỏ hàng" });
//   }
// }
// async function updateGioHang(req, res, next) {
//   try {

//     const { chiTietGioHang } = req.body;
//     console.log(chiTietGioHang)
//     const gioHang = await GioHang.findById(req.params.id);
//     if (!gioHang) {
//       return res.status(404).json({ error: "Giỏ hàng không tồn tại" });
//     }

//     chiTietGioHang.forEach((updatedProduct) => {
//       const existingProduct = gioHang.chiTietGioHang.find(
//         (item) =>
//           item._id.toString() === updatedProduct._id.toString()
//       );

//       if (existingProduct) {
//         existingProduct.soLuong = updatedProduct.soLuong;
//         existingProduct.donGia = updatedProduct.donGia;
//       } else {
//         gioHang.chiTietGioHang.push(updatedProduct);
//       }
//     });

//     const updatedGioHang = await gioHang.save();
//     res.status(200).json(updatedGioHang);
//   } catch (error) {
//     res.status(500).json({ error: "Lỗi khi cập nhật giỏ hàng" });
//   }
// }
async function updateGioHang(req, res, next) {
  try {
    const { chiTietGioHang } = req.body;
    console.log(chiTietGioHang);

    const gioHang = await GioHang.findById(req.params.id).populate({
      path: "chiTietGioHang.idBienThe",
      select: "soLuong", // Chỉ lấy số lượng của biến thể
    });

    if (!gioHang) {
      return res.status(404).json({ error: "Giỏ hàng không tồn tại" });
    }

    for (const updatedProduct of chiTietGioHang) {
      const existingProduct = gioHang.chiTietGioHang.find(
        (item) => item._id.toString() === updatedProduct._id.toString()
      );

      if (existingProduct) {
        const bienThe = existingProduct.idBienThe;

        // Kiểm tra số lượng sản phẩm trong biến thể
        if (updatedProduct.soLuong > bienThe.soLuong) {
          return res.status(400).json({
            error: `Không đủ số lượng sản phẩm cho biến thể ${bienThe._id}. Chỉ còn ${bienThe.soLuong} sản phẩm.`,
          });
        }

        existingProduct.soLuong = updatedProduct.soLuong;
        existingProduct.donGia = updatedProduct.donGia;
      } else {
        // Nếu không tìm thấy sản phẩm trong giỏ hàng, thêm mới
        const bienThe = await BienTheSchema.findById(updatedProduct.idBienThe).select("soLuong");

        // Kiểm tra số lượng sản phẩm trong biến thể
        if (updatedProduct.soLuong > bienThe.soLuong) {
          return res.status(400).json({
            error: `Không đủ số lượng sản phẩm cho biến thể ${bienThe._id}. Chỉ còn ${bienThe.soLuong} sản phẩm.`,
          });
        }

        gioHang.chiTietGioHang.push(updatedProduct);
      }
    }

    const updatedGioHang = await gioHang.save();
    res.status(200).json(updatedGioHang);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi cập nhật giỏ hàng" });
  }
}

async function deleteGioHang(req, res, next) {
  try {
    const { idBienThe } = req.body;

    const gioHang = await GioHang.findById(req.params.id);
    if (!gioHang) {
      return res.status(404).json({ error: "Giỏ hàng không tồn tại" });
    }

    const productIndex = gioHang.chiTietGioHang.findIndex(
      (item) => item.idBienThe.toString() === idBienThe.toString()
    );

    if (productIndex === -1) {
      return res
        .status(404)
        .json({ error: "Sản phẩm không tồn tại trong giỏ hàng" });
    }

    gioHang.chiTietGioHang.splice(productIndex, 1);

    const updatedGioHang = await gioHang.save();
    res.status(200).json(updatedGioHang);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi xóa sản phẩm khỏi giỏ hàng" });
  }
}
//old
// async function getGioHangByUserId(req, res, next) {
//   try {
//     const { userId } = req.params;

//     const gioHang = await GioHang.findOne({ userId })
//       .populate("userId")
//       .populate({
//         path: "chiTietGioHang.idBienThe",
//         populate: [
//           { path: "KetHopThuocTinh.IDGiaTriThuocTinh", },
//           {
//             path: "IDSanPham", model: "SanPham",
//             populate:
//               { path: "userId", model: "User", },
//           },
//         ],
//       });
//     if (!gioHang) {
//       //  return res.status(404).json({ error: "Giỏ hàng không tồn tại" });
//       const gioHang2 = new GioHang({
//         userId,
//         chiTietGioHang: [],
//       });
//       await gioHang2.save();
//       return res.status(200).json({ message: "không có sản phẩm nào" });

//     }

//     // Gộp các biến thể cùng sản phẩm ID hoặc cùng userID
//     const mergedCartItems = {};

//     gioHang.chiTietGioHang.forEach(item => {
//       const sanPhamId = item.idBienThe.IDSanPham._id.toString();
//       //const userId = item.idBienThe.IDSanPham.userId.toString();

//       const key = `${userId}-${sanPhamId}`;

//       if (!mergedCartItems[key]) {
//         mergedCartItems[key] = {
//           // userId,
//           // //: item.idBienThe.IDSanPham.userId
//           gioHangId: gioHang._id,
//           sanPham: item.idBienThe.IDSanPham,
//           chiTietGioHang: [],
//         };
//       }
//       // Lấy tất cả các trường từ idBienThe trừ IDSanPham và userId 
//       const bienTheData = { ...item.idBienThe._doc };
//       bienTheData.IDSanPham = item.idBienThe.IDSanPham._id;

//       //bienTheData.userId = item.idBienThe.IDSanPham.userId._id;
//       mergedCartItems[key].chiTietGioHang.push({
//         idBienThe: {
//           ...bienTheData,
//           //idBienThe: item.idBienThe,

//         },
//         soLuong: item.soLuong,
//         donGia: item.donGia,
//       });
//     });

//     const mergedCart = Object.values(mergedCartItems);
//     // console.log({ user: gioHang.userId, mergedCart })
//     res.status(200).json({ user: gioHang.userId, mergedCart });
//   } catch (error) {
//     console.error("Lỗi khi lấy thông tin giỏ hàng:", error);
//     res.status(500).json({ error: "Lỗi khi lấy thông tin giỏ hàng" });
//   }
// }



// async function getGioHangByUserId(req, res, next) {
//   try {
//     const { userId } = req.params;
//     // Lấy giỏ hàng và populate các trường liên quan
//     const gioHang = await GioHang.findOne({ userId })
//       .populate("userId")
//       .populate({
//         path: "chiTietGioHang.idBienThe",
//         populate: [
//           {
//             path: "KetHopThuocTinh.IDGiaTriThuocTinh",
//           },
//           {
//             path: "IDSanPham",
//             model: "SanPham",
//             populate: {
//               path: "userId",
//               model: "User",
//             },
//           },
//         ],
//       });

//     if (!gioHang) {
//       return res.status(404).json({ error: "Giỏ hàng không tồn tại" });
//     }

//     // Gộp các biến thể cùng sản phẩm ID hoặc cùng userID
//     const mergedCartItems = {};

//     gioHang.chiTietGioHang.forEach(item => {
//       const sanPhamId = item.idBienThe.IDSanPham._id.toString();
//       const userId = item.idBienThe.IDSanPham.userId._id.toString();

//       const key = `${userId}-${sanPhamId}`;

//       if (!mergedCartItems[key]) {
//         mergedCartItems[key] = {
//           userId: item.idBienThe.IDSanPham.userId,
//           sanPham: item.idBienThe.IDSanPham,
//           chiTietGioHang: [],
//         };
//       }

//       // Lấy tất cả các trường từ idBienThe nhưng chỉ giữ lại _id của IDSanPham và userId
//       const bienTheData = { ...item.idBienThe._doc };
//       bienTheData.IDSanPham = item.idBienThe.IDSanPham._id;
//       //bienTheData.userId = item.idBienThe.IDSanPham.userId._id;

//       mergedCartItems[key].chiTietGioHang.push({
//         // ...bienTheData,
//         idBienThe: {
//           ...bienTheData,
//         },
//         _id: item._id,
//         soLuong: item.soLuong,
//         donGia: item.donGia,
//       });
//     });
//     // Gộp các sản phẩm theo userId
//     const groupedByUser = {};
//     Object.values(mergedCartItems).forEach(item => {
//       const userId = item.userId;
//       if (!groupedByUser[userId]) {
//         groupedByUser[userId] = {
//           user: item.userId,
//           sanPhamList: [],
//         };
//       }
//       groupedByUser[userId].sanPhamList.push(item);
//     });

//     const mergedCart = Object.values(groupedByUser);

//     return res.status(200).json({ gioHangId: gioHang._id, user: gioHang.userId, mergedCart });
//   } catch (error) {
//     console.error("Lỗi khi lấy thông tin giỏ hàng:", error);
//     res.status(500).json({ error: "Lỗi khi lấy thông tin giỏ hàng" });
//   }
// }
async function getGioHangByUserId(req, res, next) {
  try {
    const { userId } = req.params;

    // Lấy giỏ hàng và populate các trường liên quan
    const gioHang = await GioHang.findOne({ userId })
      .populate("userId")
      .populate({
        path: "chiTietGioHang.idBienThe",
        populate: [
          {
            path: "KetHopThuocTinh.IDGiaTriThuocTinh",
          },
          {
            path: "IDSanPham",
            model: "SanPham",
            populate: {
              path: "userId",
              model: "User",
            },
          },
        ],
      });

    if (!gioHang) {
      return res.status(404).json({ error: "Giỏ hàng không tồn tại" });
    }

    // Lọc ra những biến thể không bị xóa
    gioHang.chiTietGioHang = gioHang.chiTietGioHang.filter(item => !item.idBienThe.isDeleted);

    // Cập nhật giỏ hàng trong cơ sở dữ liệu
    await gioHang.save();

    // Gộp các biến thể cùng sản phẩm ID hoặc cùng userID
    const mergedCartItems = {};

    gioHang.chiTietGioHang.forEach(item => {
      const bienThe = item.idBienThe;

      const sanPhamId = bienThe.IDSanPham._id.toString();
      const userId = bienThe.IDSanPham.userId._id.toString();
      const key = `${userId}-${sanPhamId}`;

      if (!mergedCartItems[key]) {
        mergedCartItems[key] = {
          userId: bienThe.IDSanPham.userId,
          sanPham: bienThe.IDSanPham,
          chiTietGioHang: [],
        };
      }

      // Lấy tất cả các trường từ idBienThe nhưng chỉ giữ lại _id của IDSanPham và userId
      const bienTheData = { ...bienThe._doc };
      bienTheData.IDSanPham = bienThe.IDSanPham._id;

      mergedCartItems[key].chiTietGioHang.push({
        idBienThe: { ...bienTheData },
        _id: item._id,
        soLuong: item.soLuong,
        donGia: item.donGia,
      });
    });

    // Gộp các sản phẩm theo userId
    const groupedByUser = {};
    Object.values(mergedCartItems).forEach(item => {
      const userId = item.userId;
      if (!groupedByUser[userId]) {
        groupedByUser[userId] = {
          user: item.userId,
          sanPhamList: [],
        };
      }
      groupedByUser[userId].sanPhamList.push(item);
    });

    const mergedCart = Object.values(groupedByUser);

    return res.status(200).json({ gioHangId: gioHang._id, user: gioHang.userId, mergedCart });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin giỏ hàng:", error);
    res.status(500).json({ error: "Lỗi khi lấy thông tin giỏ hàng" });
  }
}

//du lieu gio hang tra ve khi get ra
// const user = {
//   data: user
// }
// const mergedCart = [{
//   sanPham: {
//     data: sanpham,
//     userId: {
//       data: user
//     }
//   },
//   chiTietGioHang: [{
//     data: chitietgiohang // cái này như cũ
//   },
//   {
//     data: chitietgiohang // cái này như cũ
//   },
//   ]
// }
//   , {
//   sanPham: {
//     data: sanpham,
//     userId: {
//       data: user
//     }
//   },
//   chiTietGioHang: [{
//     data: chitietgiohang // cái này như cũ
//   },
//   {
//     data: chitietgiohang // cái này như cũ
//   },
//   ]
// }]
// async function getGioHangByUserId(req, res, next) {
//   try {
//     const { userId } = req.params;

//     const gioHang = await GioHang.findOne({ userId })
//       .populate("userId")
//       .populate({
//         path: "chiTietGioHang.idBienThe",
//         populate: [
//           {
//             path: "KetHopThuocTinh.IDGiaTriThuocTinh",
//           },
//         ],
//       });


//     if (!gioHang) {
//       // return res.status(404).json({ error: "Giỏ hàng không tồn tại" });
//       gioHang = new GioHang({
//         userId,
//         chiTietGioHang: [],
//       });
//       await gioHang.save();
//     }
//     res.status(200).json(gioHang);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ error: "Lỗi khi lấy thông tin giỏ hàng theo userId" });
//   }
// }

const config = {
  app_id: "2554",
  key1: "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn",
  key2: "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf",
  endpoint: "https://sb-openapi.zalopay.vn/v2/create",
};

async function zaloPay(req, res, next) {
  try {
    const { id } = req.params;
    const gioHang = await GioHang.findById(id);

    if (!gioHang) {
      return res.status(404).json({ error: "Giỏ hàng không tồn tại" });
    }

    const items = gioHang.chiTietGioHang.map((item) => ({
      itemid: item.idBienThe.toString(),
      itemname: item.tenSanPham,
      itemprice: item.donGia,
      itemquantity: item.soLuong,
    }));

    const transID = Math.floor(Math.random() * 1000000);
    const embed_data = {
      redirecturl: "https://pcrender.com",
    };
    const order = {
      app_id: config.app_id,
      app_trans_id: `${moment().format("YYMMDD")}_${transID}`,
      app_user: "user123",
      app_time: Date.now(),
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: gioHang.chiTietGioHang.reduce(
        (acc, item) => acc + item.soLuong * item.donGia,
        0
      ),
      description: `Thanh toán  #${transID}`,
      bank_code: "zalopayapp",
    };

    const data =
      config.app_id +
      "|" +
      order.app_trans_id +
      "|" +
      order.app_user +
      "|" +
      order.amount +
      "|" +
      order.app_time +
      "|" +
      order.embed_data +
      "|" +
      order.item;
    order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    const response = await axios.post(config.endpoint, null, { params: order });

    if (response.data.return_code === 1) {
      res.status(200).json(response.data); // Trả về thông tin QR code cho frontend
    } else {
      return res.status(400).json({ error: "Không thể tạo đơn hàng ZaloPay" });
    }
  } catch (error) {
    console.error("Lỗi khi xử lý thanh toán ZaloPay:", error);
    res.status(500).json({ error: "Lỗi khi xử lý thanh toán ZaloPay" });
  }
}

async function zaloPayWebhook(req, res, next) {
  try {
    const data = req.body;

    // Xác minh MAC để đảm bảo yêu cầu là xác thực
    const macData =
      data.app_id +
      "|" +
      data.app_trans_id +
      "|" +
      data.zp_trans_id +
      "|" +
      data.amount +
      "|" +
      data.app_time +
      "|" +
      data.embed_data +
      "|" +
      data.item;
    const generatedMac = CryptoJS.HmacSHA256(macData, config.key1).toString();

    if (generatedMac !== data.mac) {
      return res.status(400).json({ error: "MAC không hợp lệ" });
    }

    // Lưu giao dịch với trạng thái "success"
    const transaction = new Transaction({
      transactionId: data.zp_trans_id,
      orderId: data.app_trans_id.split("_")[1], // Trích xuất ID đơn hàng từ app_trans_id
      amount: data.amount,
      status: "success", // Cập nhật trạng thái thành công
      method: "ZaloPay",
      timestamp: new Date(),
    });

    await transaction.save();

    res.status(200).json({ message: "Thanh toán đã được xác nhận" });
  } catch (error) {
    console.error("Lỗi khi xử lý callback từ ZaloPay:", error);
    res.status(500).json({ error: "Lỗi khi xử lý callback từ ZaloPay" });
  }
}

module.exports = {
  createGioHang,
  getGioHangById,
  updateGioHang,
  deleteGioHang,
  zaloPay,
  zaloPayWebhook,
  getGioHangByUserId,
};
