const UserModel = require("../models/NguoiDungSchema");
const transporter = require("./mailer");
const ChatModel = require('../models/MessageSchema')
const { refreshTokenUser } = require('../jwt/index')
require("dotenv").config();
const { hashPassword, comparePassword, generateToken, decodeToken } = require("../untils");
const crypto = require("crypto");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);
const jwt = require("jsonwebtoken")
const BaiVietModel = require("../models/baivietSchema")
const SanPhamModel = require("../models/SanPhamSchema")
const yeuthichSchema = require("../models/YeuThichSchema")
const ThongBaoModel = require("../models/thongbaoSchema")
async function verifyGoogleToken(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload;
}





async function RegisterUser(req, res) {
  const { tenNguoiDung, gmail, matKhau } = req.body;
  const hash_pass = await hashPassword(matKhau);

  try {
    if (!tenNguoiDung || !gmail || !matKhau) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp đầy đủ thông tin người dùng" });
    }

    const checkEmail = await UserModel.findOne({ gmail: gmail });
    if (checkEmail) {
      return res.status(400).json({ message: "Email đã được sử dụng" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Tạo mã OTP 4 chữ số
    const otpExpiry = Date.now() + 15 * 60 * 1000; // OTP hết hạn sau 15 phút

    await UserModel.create({
      tenNguoiDung,
      matKhau: hash_pass,
      gmail,
      otp,
      otpExpiry,
      isVerified: false,
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: gmail,
      subject: "Xác nhận đăng ký tài khoản",
      text: `Chào ${tenNguoiDung},\n\nVui lòng sử dụng mã OTP sau để xác nhận tài khoản của bạn:\n\n${otp}\n\nTrân trọng,\nĐội ngũ hỗ trợ`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Lỗi khi gửi email:", error);
      } else {
        console.log("Email đã được gửi:", info.response);
      }
    });

    return res.json({
      message:
        "Thêm người dùng thành công, vui lòng kiểm tra email để nhận OTP",
    });
  } catch (error) {
    console.error("Lỗi khi thêm người dùng:", error);
    return res
      .status(500)
      .json({ message: "Đã xảy ra lỗi khi thêm người dùng" });
  }
}

// async function RegisterUserGG(req, res) {
//    const { tenNguoiDung ,gmail,googleId  } = req.body;
// console.log(tenNguoiDung ,gmail,googleId)
//   try {
//     const user = await UserModel.findOne({ gmail: gmail });
//     if (!user) {// Create new user if not exist
//       // user = await UserModel.create({
//       //   tenNguoiDung: tenNguoiDung,
//       //   gmail: gmail,
//       //   googleId:googleId,
//       //   isVerified: "true",
//       // });
//       user.tenNguoiDung = tenNguoiDung,
//       user.gmail =gmail
//       user.googleId =googleId
//       await user.save();
//     }
//     console.log("Thanh cong")
//     return res.json({
//       message:"đăng nhập thành công ",user} );
//  } catch (error) {
//     console.error("Lỗi khi thêm người dùng:", error);
//     return res
//       .status(500)
//       .json({ message: "Đã xảy ra lỗi khi thêm người dùng" });
//   }
// }
async function RegisterUserGG(req, res) {
  const { tenNguoiDung, gmail, googleId } = req.body;
  // const tenNguoiDung = "huy 111"
  // const gmail = "huylop090@gmail.com"
  // const googleId = "102999632489815117168"


  console.log(tenNguoiDung, gmail, googleId);

  try {
    let user = await UserModel.findOne({ gmail: gmail });

    if (!user) {
      // Create new user if not exist
      user = await UserModel.create({
        tenNguoiDung: tenNguoiDung,
        gmail: gmail,
        googleId: googleId,
        isVerified: true,
      });
    } else {
      // Update existing user's information
      user.tenNguoiDung = tenNguoiDung;
      user.gmail = gmail;
      user.googleId = googleId;
      user = await user.save();
    }
    const token = generateToken(user, user._id, user.role);
    return res.json({ message: "Đăng nhập thành công", token });
  } catch (error) {
    console.error("Lỗi khi thêm người dùng:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi thêm người dùng" });
  }
}

async function LoginUserGG(req, res) {
  const { gmail, matKhau } = req.body;

  try {
    if (!gmail || !matKhau) {
      return res.status(400).json({ message: "Vui lòng cung cấp đầy đủ thông tin đăng nhập" });
    }

    const user = await UserModel.findOne({ gmail: gmail });
    if (!user) {
      return res.status(400).json({ message: "Người dùng không tồn tại" });
    }

    const isMatch = await comparePassword(matKhau, user.matKhau);
    if (!isMatch) {
      return res.status(400).json({ message: "Sai mật khẩu" });
    }

    // Tạo token (nếu cần thiết) và trả về dữ liệu người dùng
    return res.json({ message: "Đăng nhập thành công", user });
  } catch (error) {
    console.error("Lỗi khi đăng nhập người dùng:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi đăng nhập người dùng" });
  }

}
async function VerifyOTP(req, res) {
  const { gmail, otp } = req.body;

  try {
    const user = await UserModel.findOne({ gmail: gmail });

    if (!user) {
      return res.status(400).json({ message: "Người dùng không tồn tại" });
    }

    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return res
        .status(400)
        .json({ message: "OTP không hợp lệ hoặc đã hết hạn" });
    }

    user.otp = undefined;
    user.otpExpiry = undefined;
    user.isVerified = true;
    await user.save();



    return res.json({
      message: "Xác nhận OTP thành công, tài khoản đã được kích hoạt",
    });
  } catch (error) {
    console.error("Lỗi khi xác nhận OTP:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi xác nhận OTP" });
  }
}

async function loginUser(req, res) {
  const { gmail, matKhau } = req.body;
  try {
    const user = await UserModel.findOne({ gmail });
    if (!user) {
      return res.status(400).json({ message: "Email không tồn tại" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: "Tài khoản chưa được xác nhận" });
    }

    const check = await comparePassword(matKhau, user.matKhau);
    if (!check) {
      return res.status(400).json({ message: "Mật khẩu không đúng" });
    }

    // if (!user.IDYeuThich) {
    //   const yeuThich = new yeuthichSchema({ sanphams: [] });
    //   await yeuThich.save();

    //   // Cập nhật IDYeuThich của người dùng
    //   user.IDYeuThich = yeuThich._id;
    //   await user.save();
    // }

    const token = generateToken(user._id, user.role);
    return res.json({ message: "Đăng nhập thành công", token });
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi đăng nhập" });
  }
}

async function SendOtpForgotPassword(req, res) {
  const { gmail } = req.body;

  try {
    const user = await UserModel.findOne({ gmail });
    if (!user) {
      return res.status(400).json({ message: "Email không tồn tại" });
    }
    if (user.otp && user.otpExpiry > Date.now()) {
      // Kiểm tra xem OTP đã quá 5 phút chưa
      if (Date.now() - (user.otpExpiry - 15 * 60 * 1000) <= 5 * 60 * 1000) {
        return res.status(400).json({ message: "OTP đã được gửi, vui lòng chờ trước khi yêu cầu mới" });
      }
    }
    //const otp = Math.floor(1000 + Math.random() * 9000).toString(); // Tạo mã OTP 6 chữ số
    const otp = Math.floor(1000 + Math.random() * 9000).toString(); // Tạo mã OTP 4 chữ số
    const otpExpiry = Date.now() + 15 * 60 * 1000; // OTP hết hạn sau 15 phút

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: gmail,
      subject: "Xác nhận khôi phục mật khẩu",
      text: `Chào ${user.tenNguoiDung},\n\nVui lòng sử dụng mã OTP sau để xác nhận khôi phục mật khẩu của bạn:\n\n${otp}\n\n thời hạn 5 phút \n\nTrân trọng,\nĐội ngũ hỗ trợ`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Lỗi khi gửi email:", error);
      } else {
        console.log("Email đã được gửi:", info.response);
      }
    });

    return res.json({
      message: "OTP khôi phục mật khẩu đã được gửi, vui lòng kiểm tra email",
    });
  } catch (error) {
    console.error("Lỗi khi gửi OTP khôi phục mật khẩu:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi gửi OTP" });
  }
}

async function CheckOtpForgotPassword(req, res) {
  const { gmail, otp } = req.body;

  try {
    const user = await UserModel.findOne({ gmail });

    if (!user) {
      return res.status(400).json({ message: "Người dùng không tồn tại" });
    }
    const otpIssuedTime = user.otpExpiry - 15 * 60 * 1000; // Thời gian tạo OTP
    if (Date.now() - otpIssuedTime > 5 * 60 * 1000) {
      return res.status(400).json({ message: "OTP đã quá 5 phút, vui lòng yêu cầu OTP mới" });
    }
    if (user.otp != otp) {
      return res.status(400).json({ message: "otp không chính xác" });

    }


    const resetToken = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '15m' })
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save()
    return res.json({
      message: "otp đã được kiểm tra thành công", resetToken
    });
  } catch (error) {
    console.error("Lỗi khi đặt lại mật khẩu:", error);
    return res
      .status(500)
      .json({ message: "Đã xảy ra lỗi khi đặt lại mật khẩu" });
  }
}

async function SendPassword(req, res) {
  const { gmail, matKhauMoi, resetToken } = req.body;
  const decoded = jwt.verify(resetToken, process.env.SECRET_KEY);
  try {
    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      return res.status(400).json({ message: "Người dùng không tồn tại" });
    }
    if (!user.gmail === gmail) {
      return res.status(400).json({ message: "Tài khoản và dữ liệu gửi đến không khớp vui lòng thử lại hoặc liên hệ đến quản lý app" });

    }
    const hash_pass = await hashPassword(matKhauMoi);
    user.matKhau = hash_pass;
    await user.save();
    return res.json({ message: "Thay đổi mật khẩu thành công" });
  } catch (error) {
    console.error("Lỗi khi thay đổi mật khẩu:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi thay đổi mật khẩu" });
  }
}
async function ResetPassword(req, res) {
  const { gmail, matKhauMoi, matKhau, } = req.body;
  // const decoded = jwt.verify(resetToken, process.env.SECRET_KEY);
  try {
    console.log(gmail, matKhauMoi, matKhau,)

    const user = await UserModel.findOne({ gmail: gmail });
    if (!user) {
      return res.status(400).json({ message: "Người dùng không tồn tại" });
    }
    const check = await comparePassword(matKhau, user.matKhau);
    if (!check) {
      return res.status(400).json({ message: "Mật khẩu không đúng" });
    }


    const hash_pass = await hashPassword(matKhauMoi);
    user.matKhau = hash_pass;
    await user.save();

    return res.json({
      message: "Mật khẩu đã được cập nhật thành công",
    });
  } catch (error) {
    console.error("Lỗi khi đặt lại mật khẩu:", error);
    return res
      .status(500)
      .json({ message: "Đã xảy ra lỗi khi đặt lại mật khẩu" });
  }
}

async function showUserById(req, res) {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "Thiếu thông tin userId" });
    }
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    return res.json(user);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng:", error);
    return res
      .status(500)
      .json({ message: "Đã xảy ra lỗi khi lấy thông tin người dùng" });
  }
}

async function getAllUsers(req, res) {
  try {
    const users = await UserModel.find();
    return res.json(users);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    return res.status(500).json({
      message: "Đã xảy ra lỗi khi lấy danh sách người dùng",
    });
  }
}

async function ResendOTP(req, res) {
  const { gmail } = req.body;

  try {
    const user = await UserModel.findOne({ gmail });

    if (!user) {
      return res.status(400).json({ message: "Email không tồn tại" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Tài khoản đã được xác nhận" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Tạo mã OTP 6 chữ số
    const otpExpiry = Date.now() + 15 * 60 * 1000; // OTP hết hạn sau 15 phút

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: gmail,
      subject: "Xác nhận mã OTP mới",
      text: `Chào ${user.tenNguoiDung},\n\nVui lòng sử dụng mã OTP sau để xác nhận tài khoản của bạn:\n\n${otp}\n\nTrân trọng,\nĐội ngũ hỗ trợ`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Lỗi khi gửi email:", error);
        return res.status(500).json({ message: "Lỗi khi gửi lại mã OTP" });
      } else {
        console.log("Email đã được gửi:", info.response);
        return res.json({
          message: "Mã OTP mới đã được gửi, vui lòng kiểm tra email",
        });
      }
    });
  } catch (error) {
    console.error("Lỗi khi gửi lại mã OTP:", error);
    return res
      .status(500)
      .json({ message: "Đã xảy ra lỗi khi gửi lại mã OTP" });
  }
}

const multer = require("multer");
const { upload } = require("../untils/index");

async function createAnhDaiDien(req, res, next) {
  try {
    upload.single("file")(req, res, async (err) => {
      if (err) {
        // Handle file upload errors
        console.error(err);
        return res.status(500).json({ message: "Error uploading file" });
      }

      const { IDNguoiDung } = req.params;
      if (!IDNguoiDung || !req.file) {
        return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
      }
      console.log(req.file)
      const newPath = req.file.path.replace("public", process.env.URL_IMAGE);
      try {
        const updateNguoiDung = await UserModel.findOneAndUpdate(
          { _id: IDNguoiDung },
          { anhDaiDien: newPath },
          { new: true }
        );

        res.status(201).json({ message: "Đổi ảnh đại diện thành công" });
      } catch (error) {
        console.error("Lỗi khi Sửa ảnh đại diện:", error);
        // Xử lý lỗi cụ thể của Mongoose (ví dụ: ValidationError, DuplicateKeyError)
        res.status(500).json({ message: "Lỗi server", error });
      }
    });
  } catch (error) {
    console.error("Lỗi chung:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
}

// async function updateUser(req, res, next) {
//   // const { ThuocTinhID } = req.params;
//   const { tenNguoiDung,UserID,LoaiThongTinUpdate } = req.body;

//   try {
//       const updatedThuocTinh = await UserModel.findByIdAndUpdate(
//           { UserID },
//           { tenNguoiDung:tenNguoiDung},
//           { new: true }
//       );

//       if (!updatedThuocTinh) {
//           return res.status(404).json({ message: 'Không tìm thấy thuộc tính' });
//       }

//       res.status(200).json(updatedThuocTinh);
//   } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: 'Lỗi khi cập nhật thuộc tính' });
//   }
// }

async function updateUser12(req, res, next) {
  try {
    const userId = req.params.id;
    const { tenNguoiDung, soDienThoai, GioiTinh, ngaySinh } = req.body;

    // Tìm người dùng theo ID
    let user = await UserModel.findById(userId);

    // Nếu không tìm thấy người dùng, tạo mới
    if (!user) {
      user = new UserModel({
        _id: userId,
        tenNguoiDung,
        soDienThoai,
        GioiTinh,
        ngaySinh,
      });
      await user.save();
      return res.status(201).json(user); // Trả về mã trạng thái 201 cho bản ghi mới
    }

    // Nếu tìm thấy, cập nhật thông tin người dùng
    user.tenNguoiDung = tenNguoiDung;
    user.soDienThoai = soDienThoai;
    user.GioiTinh = GioiTinh;
    user.ngaySinh = ngaySinh;

    const updatedUser = await user.save(); // Lưu thay đổi
    res.status(200).json(updatedUser); // Trả về người dùng đã cập nhật
  } catch (error) {
    console.error("Lỗi khi cập nhật người dùng:", error);
    res.status(500).json({ message: "Lỗi cập nhật hồ sơ." });
  }
}

async function updateUser(req, res, next) {
  const { UserID, LoaiThongTinUpdate } = req.body;

  // Tạo một object để lưu trữ các trường cần cập nhật
  const updateData = {};
  updateData[LoaiThongTinUpdate] = req.body[LoaiThongTinUpdate];
  console.log(updateData);
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(UserID, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy người dùng", updatedUser });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi cập nhật người dùng" });
  }
}
async function updateUserDiaChi(req, res, next) {
  const { UserID, diaChiMoi } = req.body;
  // Tạo một object để lưu trữ các trường cần cập nhật
  console.log(diaChiMoi);
  try {
    const user = await UserModel.findById(UserID);
    if (!user) {
      return "Người dùng không tồn tại";
    }

    user.diaChi = diaChiMoi;
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi cập nhật người dùng" });
  }
}
async function saveChat(req, res, next) {
  try {
    new ChatModel({
      sender_id: req.body.sender_id,
      receiver_id: req.body.receiver_id,
      message: req.body.message,
    }),

      await ChatModel.save;
    res.status(200).send({ success: true, msg: 'chat inserted' })
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message })
  }
}


async function toggleFollowUser(req, res) {
  try {
    const { userId, targetId, action } = req.body; // userId: người thực hiện hành động, targetId: người bị theo dõi hoặc bỏ theo dõi
    const user = await UserModel.findById(userId);
    const targetUser = await UserModel.findById(targetId);
    console.log(userId, targetId, action)
    if (!user || !targetUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    if (action === 'follow') {
      // Thực hiện theo dõi
      if (!user.following.includes(targetId)) {
        user.following.push(targetId);
        await user.save();
      }
      if (!targetUser.followers.includes(userId)) {
        targetUser.followers.push(userId);
        await targetUser.save();
      }
      res.status(200).json({ message: 'Đã theo dõi người dùng thành công' });
    } else if (action === 'unfollow') {
      // Thực hiện bỏ theo dõi
      user.following = user.following.filter(id => id.toString() !== targetId);
      await user.save();
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== userId);
      await targetUser.save();
      res.status(200).json({ message: 'Đã bỏ theo dõi người dùng thành công' });
    } else {
      res.status(400).json({ message: 'Hành động không hợp lệ' });
    }
  } catch (error) {
    console.error('Lỗi khi xử lý hành động theo dõi/bỏ theo dõi người dùng:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi xử lý hành động theo dõi/bỏ theo dõi người dùng' });
  }
}

async function getListMySanPham(req, res, next) {
  try {
    const { userId, yeuThichId } = req.query;


    // Tìm kiếm, thêm index nếu chưa có
    const sanphams = await SanPhamModel.find({ userId: userId })

    let favoritedProductIds = [];
    if (userId && yeuThichId) {
      const yeuThich = await yeuthichSchema.findById(yeuThichId);
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

async function findUserById(req, res) {
  try {
    const { userId, me } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "Thiếu thông tin userId" });
    }

    // Lấy thông tin cơ bản của người dùng
    const user = await UserModel.findById(userId)
      .populate('followers', 'tenNguoiDung')
      .populate('following', 'tenNguoiDung');
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Lấy số lượng và danh sách bài viết của người dùng
    const [posts, products] = await Promise.all([
      BaiVietModel.find({ userId }).populate("userId").populate({
        path: 'binhluan.userId',
      }),
      SanPhamModel.find({ userId })
    ]);
    const baivietsWithLikeInfo = posts.map(baiViet => {
      const isLiked = baiViet.likes.includes(me); // Giả sử req.user._id là ID của người dùng hiện tại
      return { ...baiViet._doc, isLiked };
    });
    const userDetails = {
      tenNguoiDung: user.tenNguoiDung,
      anhDaiDien: user.anhDaiDien,
      GioiTinh: user.GioiTinh,
      soDienThoai: user.soDienThoai,
      gmail: user.gmail,
      ngaySinh: user.ngaySinh,
      hoKinhDoanh: user.hoKinhDoanh,
      followers: user.followers.length,
      following: user.following.length,
      baiViet: {
        count: baivietsWithLikeInfo.length,
        list: baivietsWithLikeInfo
      },
      sanPham: {
        count: products.length,
        list: products
      }
    };

    return res.json(userDetails);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi lấy thông tin người dùng" });
  }
}

async function getListThongBao(req, res) {
  const { userId } = req.params;
  try {
    const thongBaos = await ThongBaoModel.find({ userId: userId }).sort({ ngayTao: -1 });

    return res.status(200).json(thongBaos);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách thông báo:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách thông báo' });
  }
}
async function updateDaDoc(req, res) {
  const { thongBaoId } = req.params;
  try {
    const thongBao = await ThongBaoModel.findById(thongBaoId);
    if (!thongBao) {
      return res.status(404).json({ message: 'Không tìm thấy thông báo' });
    }

    thongBao.daDoc = true;
    await thongBao.save();

    res.status(200).json({ message: 'Đã cập nhật trạng thái đọc của thông báo', thongBao });
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái đọc của thông báo:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật trạng thái đọc của thông báo' });
  }
}

module.exports = {
  RegisterUser,
  VerifyOTP,
  loginUser,
  SendOtpForgotPassword,
  CheckOtpForgotPassword,
  SendPassword,
  ResetPassword,
  createAnhDaiDien,
  showUserById,
  updateUser,
  updateUserDiaChi,
  ResendOTP,
  saveChat,
  RegisterUserGG,
  LoginUserGG,
  getAllUsers,
  updateUser12,
  toggleFollowUser,
  findUserById,
  getListThongBao,
  updateDaDoc,
};
