const HoaDonModel = require("../models/HoaDonSchema");
const GioHangModel = require("../models/GioHangSchema")
const UserModel = require("../models/NguoiDungSchema")
const moment = require('moment-timezone');
require("dotenv").config();
const axios = require('axios');
const { refreshToken } = require('../jwt/index');
const transporter = require("./mailer");
//xoa dau tieng viet 
const removeAccents = require('remove-accents');
const BienThe = require("../models/BienTheSchema");
const SanPham = require("../models/SanPhamSchema");
const KhuyenMai = require("../models/KhuyenMaiSchema")
// qr
// const PayOS = require('@payos/node')
// const pauos = require('client_oid','api_key','checksum-key')

// async function CreateThanhToan(req, res, next) {
//   const order = {
//     amount: 10000,
//     description: 'thanh toan nong san',
//     ordercode : 10,
//     returnUrl: `${YOUR_DOMAIN}/success.html`,
//     cancelUrl: `${YOUR_DOMAIN}/cancel.html`
//   }
// }







//ham lay danh sach thuoc tinh
async function getlistHoaDon(req, res, next) {

  try {
    const HoaDon = await HoaDonModel.find();
    res.status(200).json(HoaDon);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi tìm kiếm thuộc tính' });
  }
}
async function getHoaDonByUserId(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "Thiếu thông tin userid" });
    }

    const hoadon = await HoaDonModel.find({ userId: userId })
      // .populate("userId")
      // .populate('khuyenmaiId')
      // .populate('transactionId')
      // .populate({
      //   path: 'chiTietHoaDon.BienThe.IDSanPham',
      //   model: 'SanPham',
      // })
      .exec();
    if (!hoadon) {
      return res.status(404).json({ message: "Không tìm thấy hoa don" });
    }

    return res.json(hoadon);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng:", error);
    return res
      .status(500)
      .json({ message: "Đã xảy ra lỗi khi lấy thông tin người dùng" });
  }
}

async function getHoaDonByHoaDonId(req, res) {
  try {
    const { hoadonId } = req.params;

    if (!hoadonId) {
      return res.status(400).json({ message: "Thiếu thông tin userid" });
    }

    const hoadon = await HoaDonModel.findById(hoadonId)
    // .populate("userId")
    //.populate('khuyenmaiId')
    // .populate({
    //   path: 'chiTietHoaDon.BienThe.IDSanPham',
    //   model: 'SanPham',
    // })
    if (!hoadon) {
      return res.status(404).json({ message: "Không tìm thấy hoa don" });
    }

    return res.json(hoadon);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng:", error);
    return res
      .status(500)
      .json({ message: "Đã xảy ra lỗi khi lấy thông tin người dùng" });
  }
}

async function getHoaDonByHoaDonIdFullVersion(req, res) {
  try {
    const { hoadonId } = req.params;

    if (!hoadonId) {
      return res.status(400).json({ message: "Thiếu thông tin userid" });
    }

    const hoadon = await HoaDonModel.findById(hoadonId)
      .populate("userId")
      .populate('khuyenmaiId')
      .populate({
        path: 'chiTietHoaDon.idBienThe',
        populate: {
          path: 'IDSanPham',
          model: 'SanPham' // Thay 'SanPham' bằng tên model của bạn
        }
      });
    if (!hoadon) {
      return res.status(404).json({ message: "Không tìm thấy hoa don" });
    }

    return res.json(hoadon);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng:", error);
    return res
      .status(500)
      .json({ message: "Đã xảy ra lỗi khi lấy thông tin người dùng" });
  }
}


// async function createUserDiaChivaThongTinGiaoHang(req, res, next) {
//   const { userId, diaChiMoi, ghiChu, ChiTietGioHang, TongTien, mergedCart } = req.body;

//   mergedCart.forEach((item, index) => {
//     console.log(`Item ${index + 1}:`);

//     if (item.mergedCart && item.mergedCart.length > 0) {
//       item.mergedCart.forEach((subItem, subIndex) => {
//         console.log(`  Sub-Item ${subIndex + 1}:`);
//         console.log(`  User: ${JSON.stringify(subItem.user, null, 2)}`);
//         console.log("dulieu : ", subItem)
//         if (subItem.sanPhamList && subItem.sanPhamList.length > 0) {
//           subItem.sanPhamList.forEach((sanPhamItem, sanPhamIndex) => {
//             console.log(`    SanPhamItem ${sanPhamIndex + 1}:`);
//             console.log(`    User: ${JSON.stringify(sanPhamItem.user, null, 2)}`);
//             console.log(`    SanPham: ${JSON.stringify(sanPhamItem.sanPham, null, 2)}`);
//             console.log("dulieu : ", sanPhamItem)
//             if (sanPhamItem.chiTietGioHangs && sanPhamItem.chiTietGioHangs.length > 0) {
//               sanPhamItem.chiTietGioHangs.forEach((chiTiet, chiTietIndex) => {
//                 console.log(`      ChiTietGioHang ${chiTietIndex + 1}:`);
//                 console.log(chiTiet);
//               });
//             } else {
//               console.log("No chiTietGioHangs found in this sanPhamItem");
//             }
//           });
//         } else {
//           console.log("No sanPhamList found in this subItem");
//         }
//       });
//     } else {
//       console.log("No nested mergedCart found in this item");
//     }
//   });


//   if (!ghiChu) {
//     ghiChu = "no"
//   }
//   const TrangThai = 0
//   try {
//     const user = await UserModel.findById(userId);
//     console.log(removeAccents(user.tenNguoiDung))
//     // const orderResponse = await createOrder(orderData);
//     // user.diaChi = diaChiMoi;
//     // await user.save();
//     // const newHoaDon = new HoaDonModel({
//     //   userId,
//     //   diaChi: diaChiMoi,
//     //   TrangThai,
//     //   TongTien,
//     //   chiTietHoaDon: ChiTietGioHang,
//     //   GhiChu: ghiChu,

//     // });
//     // for (const chiTiet of ChiTietGioHang) {
//     //   if (chiTiet.idBienThe) {
//     //     await BienThe.findOneAndUpdate(
//     //       { _id: chiTiet.idBienThe._id },
//     //       { $inc: { soLuong: -chiTiet.soLuong } }
//     //     );
//     //   }

//     //   await SanPham.findOneAndUpdate(
//     //     { _id: chiTiet.idBienThe.IDSanPham },
//     //     {
//     //       $inc: { soLuongDaBan: chiTiet.soLuong },
//     //       $inc: { SoLuongHienTai: -chiTiet.soLuong }
//     //     }
//     //   );
//     // }
//     // // Lưu đối tượng vào cơ sở dữ liệu
//     // const savedHoaDon = await newHoaDon.save();
//     res.status(200).json({ message: 'ok', mergedCart });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Lỗi khi Tạo Đơn Hàng' });
//   }
// }


async function createUserDiaChivaThongTinGiaoHang(req, res, next) {
  const { userId, diaChiMoi, ghiChu = "no", TongTien, mergedCart } = req.body;
  const TrangThai = 0;

  try {
    const user = await UserModel.findById(userId);
    console.log(removeAccents(user.tenNguoiDung));

    // Tạo một đối tượng để theo dõi hóa đơn theo hoKinhDoanhId
    const hoaDonMap = {};
    const mergedCart2 = mergedCart.user
    console.log("mergedCart2", mergedCart)
    // Duyệt qua mergedCart để tạo hóa đơn cho từng hoKinhDoanhId
    for (const item of mergedCart2) {
      console.log("item", item)
      console.log("user", item.mergedCart)
      console.log("user", item.user)
      console.log("sanpham", item.sanPhamList.userId)
      const hoKinhDoanhId = item.sanPhamList.userId._id;

      if (!hoaDonMap[hoKinhDoanhId]) {
        hoaDonMap[hoKinhDoanhId] = {
          hoKinhDoanhId,
          userId,
          diaChi: diaChiMoi,
          TrangThai,
          chiTietHoaDon: [],
          TongTien: 0,
          GhiChu: ghiChu
        };
      }


      item.chiTietGioHangs.forEach(chiTiet => {
        hoaDonMap[hoKinhDoanhId].chiTietHoaDon.push({
          idBienThe: chiTiet.idBienThe._id,
          soLuong: chiTiet.soLuong,
          donGia: chiTiet.donGia
        });
        hoaDonMap[hoKinhDoanhId].TongTien += chiTiet.donGia * chiTiet.soLuong;
      });
    }

    // Lưu từng hóa đơn và cập nhật số lượng sản phẩm
    for (const hoKinhDoanhId in hoaDonMap) {
      const hoaDonData = hoaDonMap[hoKinhDoanhId];
      const newHoaDon = new HoaDonModel(hoaDonData);
      await newHoaDon.save();

      for (const chiTiet of hoaDonData.chiTietHoaDon) {
        await BienThe.findOneAndUpdate(
          { _id: chiTiet.idBienThe },
          { $inc: { soLuong: -chiTiet.soLuong } }
        );

        await SanPham.findOneAndUpdate(
          { _id: chiTiet.idBienThe.IDSanPham },
          {
            $inc: { soLuongDaBan: chiTiet.soLuong },
            $inc: { SoLuongHienTai: -chiTiet.soLuong }
          }
        );
      }
    }
    console.log({ message: 'Tạo hóa đơn thành công', mergedCart })
    res.status(200).json({ message: 'Tạo hóa đơn thành công', mergedCart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi tạo đơn hàng' });
  }
}











async function createOrder(orderData) {
  try {
    // Tách riêng việc tạo token
    const token = refreshToken();
    const response = await axios.post(process.env.API_URL_createOrder, orderData, {
      params: {
        jwt: token
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    let errorMessage = 'Error creating order';
    if (error.response) {
      errorMessage = error.response.data.message || error.response.statusText;
    }
    throw new Error(errorMessage);
  }
}
function calculateDiscountedItems(items, discountValue, totalQuantity) {
  const discountPerItem = discountValue / totalQuantity;

  return items.map(item => ({
    ...item,
    donGia: Math.max(item.donGia - discountPerItem, 0),
  }));
}



async function updateTransactionHoaDon(req, res, next) {
  const hoadonId = req.params.hoadonId
  const { transactionId, khuyenmaiId, giaTriGiam = 0 } = req.body;
  console.log(khuyenmaiId, giaTriGiam)
  try {
    const hoadon = await HoaDonModel.findById(hoadonId).populate("userId"); // Lấy thông tin đơn hàng từ DB
    const token = refreshToken();
    const vietnamTime = moment().tz('Asia/Ho_Chi_Minh').format('YYYYMMDDHHmmss');
    const orderIdbaokim = `${"name"}-${vietnamTime}`;
    let total_tien = hoadon.TongTien;
    if (khuyenmaiId && giaTriGiam > 0) {
      total_tien = hoadon.TongTien - giaTriGiam;
      total_tien = Math.max(total_tien, 0);
    }
    const totalQuantity = hoadon.chiTietHoaDon.reduce((total, item) => total + item.soLuong, 0);
    // Tính toán các sản phẩm đã được giảm giá
    let discountedItems = hoadon.chiTietHoaDon; // Giữ nguyên mảng ban đầu nếu không có khuyến mãi
    if (khuyenmaiId && giaTriGiam > 0) {
      discountedItems = calculateDiscountedItems(hoadon.chiTietHoaDon, giaTriGiam, totalQuantity);
    }
    // const totalQuantity = hoadon.chiTietHoaDon.reduce((total, item) => total + item.soLuong, 0);
    // // Tính toán các sản phẩm đã được giảm giá
    // const discountedItems = calculateDiscountedItems(hoadon.chiTietHoaDon, giaTriGiam, totalQuantity);
    // console.log(discountedItems)
    // Tạo mảng items cho API thanh toán
    // const itemsForAPI = JSON.stringify(discountedItems.map(item => ({
    //   item_id: item.idBienThe,
    //   item_code: item.idBienThe,
    //   item_name: item.idBienThe,
    //   price_amount: item.donGia,
    //   quantity: item.soLuong,
    //   url: process.env.BASE_URL + item.idBienThe,
    // })));
    const orderData2 = {
      mrc_order_id: orderIdbaokim,
      total_amount: total_tien,
      description: hoadon.GhiChu,
      url_success: `${process.env.MAIN_BASE_URL}api/hoadon/NhanThanhToanTuBaoKim/${hoadon._id}`,
      merchant_id: parseInt(process.env.MERCHANT_ID),
      url_detail: "https://baokim.vn/",
      lang: "en",
      bpm_id: transactionId,
      webhooks: "https://baokim.vn/",
      customer_email: hoadon.userId.gmail,
      customer_phone: "0358748103",
      customer_name: "ho duc hau",
      customer_address: hoadon.diaChi.tinhThanhPho + " " + hoadon.diaChi.quanHuyen + " " + hoadon.diaChi.phuongXa + " " + hoadon.diaChi.duongThon,
      items: JSON.stringify(discountedItems.map(item => ({
        item_id: item.idBienThe,
        item_code: item.idBienThe,
        item_name: item.idBienThe,
        price_amount: item.donGia,
        quantity: item.soLuong,
        url: process.env.BASE_URL + item.idBienThe,
      }))),

    };
    console.log(hoadon.TongTien - giaTriGiam)
    // Kiểm tra thời gian hết hạn của đơn hàng

    if (!hoadon) {
      return res.status(500).json({ message: 'Hóa đơn không tồn tại' });
    }
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const donhangmoi = await createOrder(orderData2)
    console.log(donhangmoi)
    if (khuyenmaiId && giaTriGiam > 0) {
      hoadon.khuyenmaiId = khuyenmaiId;
      hoadon.SoTienKhuyenMai = giaTriGiam;
      await KhuyenMai.findOneAndUpdate(
        { _id: khuyenmaiId },
        { $inc: { SoLuongHienTai: -1 } }
      );
    }
    hoadon.transactionId = transactionId;
    hoadon.payment_url = donhangmoi.data.payment_url
    hoadon.mrc_order_id = orderIdbaokim
    hoadon.order_id = donhangmoi.data.order_id
    hoadon.redirect_url = donhangmoi.data.redirect_url
    hoadon.expiresAt = expiresAt;
    await hoadon.save();
    res.status(200).json(donhangmoi);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi cập nhật hoa don' });
  }
}



async function Checkdonhangbaokim(req, res, next) {

  const orderId = req.params.orderId;

  const order = await HoaDonModel.findById(orderId).populate("userId"); // Lấy thông tin đơn hàng từ DB
  const token = refreshToken();
  const vietnamTime = moment().tz('Asia/Ho_Chi_Minh').format('YYYYMMDDHHmmss');
  const orderIdbaokim = `${"name"}-${vietnamTime}`;
  // const orderData2 = {
  //   mrc_order_id: orderIdbaokim,
  //   total_amount: order.TongTien,
  //   description: order.GhiChu,
  //   url_success: `${process.env.MAIN_BASE_URL}api/hoadon/NhanThanhToanTuBaoKim/${order._id}`,
  //   merchant_id: parseInt(process.env.MERCHANT_ID),
  //   url_detail: "https://baokim.vn/",
  //   lang: "en",
  //   bpm_id: order.transactionId,
  //   webhooks: "https://baokim.vn/",
  //   customer_email: order.userId.gmail,
  //   customer_phone: "0358748103",
  //   customer_name: "ho duc hau",
  //   customer_address: order.diaChi.tinhThanhPho + " " + order.diaChi.quanHuyen + " " + order.diaChi.phuongXa + " " + order.diaChi.duongThon,
  //   items: JSON.stringify(order.chiTietHoaDon.map(item => ({
  //     item_id: item.idBienThe,
  //     item_code: item.idBienThe,
  //     item_name: item.idBienThe,
  //     price_amount: item.donGia,
  //     quantity: item.soLuong,
  //     url: process.env.BASE_URL + item.idBienThe,
  //   }))),

  // };
  const now = new Date()
  // Kiểm tra thời gian hết hạn của đơn hàng
  if (now > new Date(order.expiresAt)) {
    // const donhangmoi = await createOrder(orderData2)
    // res.status(200).json(donhangmoi);
    return res.status(200).json({ message: 'Đơn hàng đã hết hạn' });
  }
  // Nếu đơn hàng còn hạn, kiểm tra trạng thái với API của Bảo Kim
  try {
    const checkResult = await getCheckOrder(token, order.order_id, order.mrc_order_id);

    console.log(checkResult.stat)
    // res.status(200).json(checkResult);
    if (checkResult.stat === "p") {
      res.status(200).json({ message: 'Đơn hàng Chưa thanh toán' })
    } else if (checkResult.stat === "c") {
      res.status(200).json({ message: 'Đơn hàng Đã thanh toán thành công' })
    } else if (checkResult.stat === "d") {
      res.status(200).json({ message: 'Đơn hàng Đã hủy hoặc thất bại' })
    } else {
      res.status(200).json({ message: 'Đã xảy ra lỗi khi check đơn hàng khiến vui lòng liên hệ dev' })
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi kiểm tra đơn hàng', error: error.message });
  }
}



async function getCheckOrder(token, orderid, mrc_order_id) {

  try {
    const response = await axios.get(process.env.API_URL_getCheckOrder, {
      params: {
        jwt: token,
        id: orderid,
        mrc_order_id: mrc_order_id,
      },
      // responseType: 'json'
    });
    console.log(response.data.data)
    return response.data.data;
  } catch (error) {
    return 'Error  check Order methods:', error;
  }
}
async function updatetrangthaihuydonhang(req, res, next) {
  const hoadonId = req.params.hoadonId

  try {

    const hoadon = await HoaDonModel.findById(hoadonId)// Lấy thông tin đơn hàng từ DB
    if (!hoadon) {
      return 'hoa don không tồn tại';
    }
    for (const chiTiet of hoadon.chiTietHoaDon) {
      if (chiTiet.idBienThe) {
        await BienThe.findOneAndUpdate(
          { _id: chiTiet.idBienThe._id },
          { $inc: { soLuong: chiTiet.soLuong } }
        );
      }

      await SanPham.findOneAndUpdate(
        { _id: chiTiet.idBienThe.IDSanPham },
        {
          $inc: { soLuongDaBan: -chiTiet.soLuong },
          $inc: { SoLuongHienTai: chiTiet.soLuong }
        }
      );
    }
    if (hoadon.khuyenmaiId && hoadon.giaTriGiam > 0) {
      await KhuyenMai.findOneAndUpdate(
        { _id: hoadon.khuyenmaiId },
        { $inc: { soLuong: SoLuongHienTai } }
      );
    }
    hoadon.TrangThai = 4;
    await hoadon.save();
    res.status(200).json("Huy don hang thanh cong");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi cập nhật trang thái hủy hoa don' });
  }
}


async function updatetrangthaiHoaDOn(req, res, next) {
  const hoadonId = req.params.hoadonId
  const { TrangThai } = req.body
  try {

    const hoadon = await HoaDonModel.findById(hoadonId)
      .populate({ path: 'chiTietHoaDon.idBienThe', populate: { path: 'IDSanPham', model: 'SanPham' } });

    if (!hoadon) {
      res.status(404).json({ message: 'Hóa đơn ko tồn tại' });

    }
    if (TrangThai == 3) {


      hoadon.DaThanhToan = true;
      let tongTienThucTe = hoadon.TongTien;

      if (hoadon.SoTienKhuyenMai && hoadon.SoTienKhuyenMai > 1) {
        tongTienThucTe -= hoadon.SoTienKhuyenMai;
      }

      if (!hoadon.tienDaCong) {
        let sellerIdList = [];
        for (const chiTiet of hoadon.chiTietHoaDon) {
          const bienThe = chiTiet.idBienThe;
          const sanPham = bienThe.IDSanPham;
          const sellerId = sanPham.userId; // Giả sử bạn có thông tin người bán trong schema SanPham

          if (!sellerIdList.includes(sellerId.toString())) {
            sellerIdList.push(sellerId.toString());

            await UserModel.findOneAndUpdate(
              { _id: sellerId },
              { $inc: { soTienHienTai: chiTiet.soLuong * chiTiet.donGia } },
              { new: true }
            );
          }
        }

        console.log('Đã cập nhật số tiền hiện tại của người bán');

        // Cập nhật biến tienDaCong trong hóa đơn
        hoadon.tienDaCong = true;
      } else {
        return res.status(400).json({ message: 'Số tiền đã được cộng trước đó' });
      }

    }
    if (TrangThai == 4) {
      for (const chiTiet of hoadon.chiTietHoaDon) {
        if (chiTiet.idBienThe) {
          await BienThe.findOneAndUpdate(
            { _id: chiTiet.idBienThe._id },
            { $inc: { soLuong: chiTiet.soLuong } }
          );
        }

        await SanPham.findOneAndUpdate(
          { _id: chiTiet.idBienThe.IDSanPham },
          {
            $inc: { soLuongDaBan: -chiTiet.soLuong },
            $inc: { SoLuongHienTai: chiTiet.soLuong }
          }
        );
      }
      if (hoadon.khuyenmaiId && hoadon.giaTriGiam > 0) {
        await KhuyenMai.findOneAndUpdate(
          { _id: hoadon.khuyenmaiId },
          { $inc: { soLuong: SoLuongHienTai } }
        );
      }
    }
    hoadon.TrangThai = TrangThai;
    await hoadon.save();
    res.status(200).json("Cập nhập đơn hàng thành công");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi cập nhật trang thái  hoa don' });
  }
}






async function updateTransactionHoaDonCOD(req, res, next) {
  const hoadonId = req.params.hoadonId
  const { transactionId, khuyenmaiId, giaTriGiam = 0 } = req.body;


  try {

    const hoadon = await HoaDonModel.findById(hoadonId)// Lấy thông tin đơn hàng từ DB
    if (!hoadon) {
      return 'hoa don không tồn tại';
    }
    // const totalQuantity = hoadon.chiTietHoaDon.reduce((total, item) => total + item.soLuong, 0);
    // // Tính toán các sản phẩm đã được giảm giá
    // const discountedItems = calculateDiscountedItems(hoadon.chiTietHoaDon, giaTriGiam, totalQuantity);
    // console.log(discountedItems)
    if (khuyenmaiId && giaTriGiam > 0) {
      hoadon.khuyenmaiId = khuyenmaiId;
      hoadon.SoTienKhuyenMai = giaTriGiam;
      await KhuyenMai.findOneAndUpdate(
        { _id: khuyenmaiId },
        { $inc: { SoLuongHienTai: -1 } }
      );
    }
    hoadon.transactionId = transactionId;
    await hoadon.save();
    //{ message: "Tạo dơn hàng thành công" }
    res.status(200).json({ message: "Tạo dơn hàng thành công", "data": { hoadon } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi cập nhật hoa don' });
  }
}



async function NhanThanhToanTuBaoKim(req, res) {
  try {
    const { hoadonId } = req.params;
    const hoadon = await HoaDonModel.findById(hoadonId).populate("userId")
    if (!hoadon) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại" });
    }
    hoadon.TrangThai = 1
    hoadon.DaThanhToan = true

    await hoadon.save();
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: hoadon.userId.gmail,
      subject: "Xác nhận khôi phục mật khẩu",
      text: `Chào ${hoadon.userId.tenNguoiDung},\n\nĐơn hàng của bạn đã được thanh toán thành công\n\nTrân trọng,\nĐội ngũ hỗ trợ`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Lỗi khi gửi email:", error);
      } else {
        console.log("Email đã được gửi:", info.response);
      }
    });

    const mailOptionForAdmin = {
      from: process.env.EMAIL_USER,
      to: hoadon.userId.gmail,
      subject: "Đã Thanh toán bảo kim",
      text: `Chào Admin,\n\nĐơn hàng ${hoadon._id} đã được thanh toán tổng số ${hoadon.TongTien}. VND\n\nTrân trọng,\nĐội ngũ hỗ trợ`,
    };

    transporter.sendMail(mailOptionForAdmin, (error, info) => {
      if (error) {
        console.error("Lỗi khi gửi email admin:", error);
      } else {
        console.log("Email đã được gửi admin:", info.response);
      }
    });


    return res.json("đơn hàng đã được thanh toán thành công");
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng:", error);
    return res
      .status(500)
      .json({ message: "Đã xảy ra lỗi khi lấy thông tin người dùng" });
  }
}
async function HuyDonHang(req, res, next) {
  const hoadonId = req.params.hoadonId
  // const { transactionId } = req.body;
  try {
    const hoadon = await HoaDonModel.findById(hoadonId).populate({
      path: 'chiTietHoaDon.idBienThe',
      select: 'IDSanPham _id', // Select desired fields
    })// Lấy thông tin đơn hàng từ DB
    if (!hoadon) {
      return 'Đơn hàng không tồn tại';
    }
    // if (hoadon.TrangThai !== 2 || hoadon.TrangThai !== 3) {
    //   return res.status(400).json({ message: "Chỉ được phép hủy đơn khi vừa đặt hàng và đóng gói" });
    // }
    for (const chiTiet of hoadon.chiTietHoaDon) {
      if (chiTiet.idBienThe) {
        await BienThe.findOneAndUpdate(
          { _id: chiTiet.idBienThe._id },
          { $inc: { soLuong: chiTiet.soLuong } }
        );
      }

      await SanPham.findOneAndUpdate(
        { _id: chiTiet.idBienThe.IDSanPham },
        {
          $inc: { soLuongDaBan: -chiTiet.soLuong },
          $inc: { SoLuongHienTai: chiTiet.soLuong }
        }
      );
    }
    if (hoadon.khuyenmaiId && hoadon.giaTriGiam > 0) {
      await KhuyenMai.findOneAndUpdate(
        { _id: hoadon.khuyenmaiId },
        { $inc: { soLuong: SoLuongHienTai } }
      );
    }
    hoadon.TrangThai = 4;
    await hoadon.save();
    //{ message: "Tạo dơn hàng thành công" }
    res.status(200).json({ message: "Tạo dơn hàng thành công", "data": { hoadon } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi cập nhật hoa don' });
  }
}

async function updateDiaChighichuHoaDon(req, res, next) {
  const hoadonId = req.params.hoadonId;
  const { diaChi, ghiChu } = req.body;
  try {
    const hoadon = await HoaDonModel.findById(hoadonId);
    if (!hoadon) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại" });
    }
    // if (!hoadon.TrangThai == 0 || !hoadon.TrangThai == 1) {
    //   return res.status(400).json({ message: "Chỉ được phép cập nhật đơn hàng vừa đặt hoặc  đang được đóng gói" });
    // }
    // Cập nhật thông tin
    if (diaChi) {
      hoadon.diaChi = diaChi;
    }
    if (ghiChu) {
      hoadon.GhiChu = ghiChu;
    }
    await hoadon.save();
    res.status(200).json({ message: "Cập nhật đơn hàng thành công", data: hoadon });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi cập nhật hóa đơn' });
  }
}
module.exports = {
  getlistHoaDon,
  getHoaDonByUserId,
  getHoaDonByHoaDonId,
  getHoaDonByHoaDonIdFullVersion,
  createUserDiaChivaThongTinGiaoHang,
  updateTransactionHoaDon,
  Checkdonhangbaokim,
  updatetrangthaihuydonhang,
  updateTransactionHoaDonCOD,
  NhanThanhToanTuBaoKim,
  HuyDonHang,
  updateDiaChighichuHoaDon,
  updatetrangthaiHoaDOn,
};
