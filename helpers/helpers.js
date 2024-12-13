const jwt = require('jsonwebtoken')
const UserModel = require('../models/NguoiDungSchema')
const YeuCauRutTienSchema = require("../models/YeuCauRutTienSchema")
const nodemailer = require('nodemailer');
const GiaTriThuocTinhSchema = require("../models/GiaTriThuocTinhSchema")
const ThongBaoModel = require("../models/thongbaoSchema")
const FirebaseSchema = require("../models/FirebaseSchema")
const notifications = require("../config/notifications.json")

const admin = require('firebase-admin');
const serviceAccount = require('../don-ganh-firebase-adminsdk-2ldcw-efac841716 (1).json'); // Đường dẫn tới file JSON đã tải về
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


const sendVerificationEmail = async (user, verificationToken) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const verificationUrl = `${process.env.BASE_URL}/verify/${verificationToken}`;
  const mailOptions = {
    from: 'DONGANHSTORE@gmail.com',
    to: user.gmail,
    subject: 'Yêu cầu xác Minh yêu cầu rút tiền',
    html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="background-color: #ffffff; margin: 20px auto; padding: 20px; max-width: 600px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center;">
              <img src="${process.env.LOGO_URL}" alt="Logo" style="width: 150px; margin-bottom: 20px;">
            </div>
            <h1 style="text-align: center;">Xác thực yêu cầu rút tiền</h1>
            <p>Chào ${user.tenNguoiDung},</p>
            <p>Vui lòng xác nhận tài khoản của bạn bằng cách nhấp vào liên kết sau:</p>
            <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; margin: 20px 0; background-color: #28a745; color: #ffffff; text-decoration: none; border-radius: 5px;">Xác thực</a>
            <p>Trân trọng,</p>
            <p>Đội ngũ hỗ trợ</p>
            <p>${new Date().toDateString()}</p>
          </div>
        </div>
      `
  };

  await transporter.sendMail(mailOptions);
};

const createNewRequest = async (userId, tenNganHang, soTaiKhoan, soTien, ghiChu, verificationToken) => {
  const newRequest = new YeuCauRutTienSchema({
    userId,
    tenNganHang,
    soTaiKhoan,
    soTien,
    ghiChu,
    verificationToken
  });

  await newRequest.save();
  return newRequest;
};


// async function checkDuplicateGiaTriThuocTinh(res, giaTriThuocTinhIds) {
//   // Kiểm tra sự trùng lặp trong mảng giaTriThuocTinhIds
//   const seen = new Set();
//   for (const id of giaTriThuocTinhIds) {
//     if (seen.has(id)) {
//       res.status(400).json({ message: 'Có giá trị thuộc tính trùng lặp trong mảng giaTriThuocTinhIds' });
//       throw new Error('Duplicate giaTriThuocTinhId found'); // Ngăn chặn tiếp tục thực hiện
//     }
//     seen.add(id);
//   }

//   // Kiểm tra sự trùng lặp của thuocTinhId
//   const thuocTinhIds = [];
//   for (const giaTriThuocTinhId of giaTriThuocTinhIds) {
//     try {
//       const giaTriThuocTinh = await GiaTriThuocTinhSchema.findById(giaTriThuocTinhId);
//       if (!giaTriThuocTinh) {
//         return res.status(404).json({ message: `Không tìm thấy giá trị thuộc tính với ID: ${giaTriThuocTinhId}` });
//       }

//       if (thuocTinhIds.includes(giaTriThuocTinh.ThuocTinhID.toString())) {
//         return res.status(400).json({ message: 'Thuộc tính đã tồn tại trùng lặp' });
//       }
//       thuocTinhIds.push(giaTriThuocTinh.ThuocTinhID.toString());
//     } catch (error) {
//       console.error(`Lỗi khi kiểm tra giá trị thuộc tính với ID: ${giaTriThuocTinhId}`, error);
//       return res.status(500).json({ message: 'Lỗi hệ thống' });
//     }
//   }
// }
// async function checkDuplicateGiaTriThuocTinh(res, KetHopThuocTinh) {
//   // Kiểm tra sự trùng lặp trong mảng KetHopThuocTinh
//   const seen = new Set();
//   for (const item of KetHopThuocTinh) {
//     const id = item.IDGiaTriThuocTinh;
//     if (seen.has(id)) {
//       return res.status(400).json({ message: 'Có giá trị thuộc tính trùng lặp trong mảng KetHopThuocTinh' });
//     }
//     seen.add(id);
//   }
//   // Kiểm tra sự trùng lặp của thuocTinhId
//   const thuocTinhIds = [];
//   for (const item of KetHopThuocTinh) {
//     const giaTriThuocTinhId = item.IDGiaTriThuocTinh;
//     try {
//       const giaTriThuocTinh = await GiaTriThuocTinhSchema.findById(giaTriThuocTinhId);
//       if (!giaTriThuocTinh) {
//         return res.status(404).json({ message: `Không tìm thấy giá trị thuộc tính với ID: ${giaTriThuocTinhId}` });
//       }

//       if (thuocTinhIds.includes(giaTriThuocTinh.ThuocTinhID.toString())) {
//         return res.status(400).json({ message: 'Thuộc tính đã tồn tại trùng lặp' });
//       }
//       thuocTinhIds.push(giaTriThuocTinh.ThuocTinhID.toString());
//     } catch (error) {
//       console.error(`Lỗi khi kiểm tra giá trị thuộc tính với ID: ${giaTriThuocTinhId}`, error);
//       return res.status(500).json({ message: 'Lỗi hệ thống' });
//     }
//   }
// }
async function checkDuplicateGiaTriThuocTinh(res, KetHopThuocTinh) {
  try {
    // Kiểm tra sự trùng lặp trong mảng KetHopThuocTinh
    const seen = new Set();
    for (const item of KetHopThuocTinh) {
      const id = item.IDGiaTriThuocTinh;
      if (seen.has(id)) {
        res.status(400).json({ message: 'Có giá trị thuộc tính trùng lặp trong mảng KetHopThuocTinh' });
        return true; // Dừng hàm sau khi gửi phản hồi
      }
      seen.add(id);
    }
    // const seen = new Set();
    // for (const id of KetHopThuocTinh) {
    //   if (seen.has(id)) {
    //     res.status(400).json({ message: 'Có giá trị thuộc tính trùng lặp trong mảng KetHopThuocTinh' });
    //     return true;
    //   } seen.add(id);
    // }
    // Kiểm tra sự trùng lặp của thuocTinhId
    const thuocTinhIds = [];
    for (const item of KetHopThuocTinh) {
      const giaTriThuocTinhId = item.IDGiaTriThuocTinh;
      const giaTriThuocTinh = await GiaTriThuocTinhSchema.findById(giaTriThuocTinhId);

      if (!giaTriThuocTinh) {
        res.status(404).json({ message: `Không tìm thấy giá trị thuộc tính với ID: ${giaTriThuocTinhId}` });
        return true; // Dừng hàm sau khi gửi phản hồi
      }

      if (thuocTinhIds.includes(giaTriThuocTinh.ThuocTinhID.toString())) {
        res.status(400).json({ message: 'Thuộc tính đã tồn tại trùng lặp' });
        return true; // Dừng hàm sau khi gửi phản hồi
      }
      thuocTinhIds.push(giaTriThuocTinh.ThuocTinhID.toString());
    }
    return false; // Không có lỗi trùng lặp
  } catch (error) {
    console.error('Lỗi khi kiểm tra giá trị thuộc tính:', error);
    res.status(500).json({ message: 'Lỗi hệ thống' });
    return true; // Dừng hàm sau khi gửi phản hồi lỗi hệ thống
  }
}

async function createThongBaoNoreq(userId, notificationType, information) {
  try {
    const { tieude, noidung } = notifications[notificationType]
    let noidungkethop = noidung
    let newThongBao
    if (information) {
      noidungkethop = noidungkethop + " " + information
    }
    newThongBao = new ThongBaoModel({
      userId,
      tieude,
      noidung: noidung,
    });
    console.log(newThongBao)
    const sendthongbao = await sendnotification(userId, tieude, noidungkethop)
    if (!sendthongbao) {
      console.error('Lỗi khi tạo thông báo:FCM');
    }
    await newThongBao.save();
    return true;
  } catch (error) {
    console.error('Lỗi khi tạo thông báo:', error);
    return false;
  }
}
async function sendnotification(userId, title, body) {
  try {
    const firebase = await FirebaseSchema.findOne({ userId: userId })
    if (!firebase) {
      console.error('Không tìm thấy thông tin Firebase cho người dùng:', userId);
      return false;
    }
    const token = firebase.firebaseToken
    if (!userId || !title || !token || !body) {
      console.error('Thiếu dữ liệu khi gửi thông báo FCM');
      return false
    }
    const message = {
      notification: {
        title,
        body,
      },
      token, // Token của thiết bị nhận
    };
    await admin.messaging().send(message);
    return true
  } catch (error) {
    console.error('Lỗi khi gửi thông báo:', error);
    return false
  }
}

async function sendNotificationToAllUsers(notificationType) {
  try {
    const firebaseUsers = await FirebaseSchema.find();
    if (!firebaseUsers || firebaseUsers.length === 0) {
      console.error('Không tìm thấy người dùng trong Firebase');
      return false;
    }

    const { tieude, noidung } = notifications[notificationType];

    let allSuccess = true;

    for (const firebase of firebaseUsers) {
      const userId = firebase.userId;
      const token = firebase.firebaseToken;

      if (!userId || !token) {
        console.error('Thiếu dữ liệu khi gửi thông báo FCM cho người dùng:', userId);
        allSuccess = false;
        continue;
      }

      const newThongBao = new ThongBaoModel({
        userId,
        tieude,
        noidung,
      });

      const sendthongbao = await sendnotification(userId, tieude, noidung);
      if (!sendthongbao) {
        console.error('Lỗi khi tạo thông báo: FCM cho người dùng:', userId);
        allSuccess = false;
      } else {
        await newThongBao.save();
      }
    }

    return allSuccess;
  } catch (error) {
    console.error('Lỗi khi gửi thông báo cho toàn bộ người dùng:', error);
    return false;
  }
}

// const admin = require('firebase-admin');
// const serviceAccount = require('./serviceAccountKey.json');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: 'https://<YOUR_PROJECT_ID>.firebaseio.com'
// });

// const message = {
//   notification: {
//     title: 'Hello Firebase!',
//     body: 'This is a test message.'
//   },
//   token: 'user_device_token'
// };

// admin.messaging().send(message)
//   .then((response) => {
//     console.log('Successfully sent message:', response);
//   })
//   .catch((error) => {
//     console.log('Error sending message:', error);
//   });

module.exports = { sendVerificationEmail, createNewRequest, checkDuplicateGiaTriThuocTinh, createThongBaoNoreq, sendNotificationToAllUsers }