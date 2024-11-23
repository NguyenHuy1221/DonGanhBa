const jwt = require('jsonwebtoken')
const UserModel = require('../models/NguoiDungSchema')
const YeuCauRutTienSchema = require("../models/YeuCauRutTienSchema")
const nodemailer = require('nodemailer');

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
module.exports = { sendVerificationEmail, createNewRequest }