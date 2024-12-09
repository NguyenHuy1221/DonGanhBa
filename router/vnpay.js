const express = require('express');
const vnPayRouter = express.Router();
const crypto = require('crypto');
const querystring = require('qs');
const moment = require('moment');
const request = require('request');
const {
    getListYeuThich,
    addToFavorites,
    getListYeuThichNopopulate, } = require("../controller/yeuthich-controller")

vnPayRouter.post('/create_payment_url', (req, res) => {
    try {
        const { amount, orderInfo, bankCode, language } = req.body;
        let vnpUrl = process.env.VNP_URL
        if (!amount || !orderInfo) {
            return res.status(400).json({ message: 'Thiếu thông tin thanh toán!' });
        }
        let date = new Date();
        const createDate = moment().format('YYYYMMDDHHmmss');
        const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        console.log("ipAddr", ipAddr)
        let vnp_Params = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: process.env.VNP_TMNCODE,
            vnp_Locale: language === 'en' ? 'en' : 'vn',
            vnp_CurrCode: 'VND',
            vnp_TxnRef: moment(date).format('DDHHmmss'), // Mã giao dịch
            vnp_OrderInfo: "thanh toan cho ma giao dich" + moment(date).format('DDHHmmss'), // Đảm bảo giá trị hợp lệ
            vnp_OrderType: 'other',
            vnp_Amount: amount * 100,
            vnp_ReturnUrl: process.env.VNP_RETURNURL,
            vnp_IpAddr: ipAddr,
            vnp_CreateDate: createDate,
        };
        if (bankCode) vnp_Params.vnp_BankCode = bankCode;

        // Sắp xếp tham số
        // const sortedParams = Object.keys(vnp_Params)
        //     .sort()
        //     .reduce((result, key) => {
        //         result[key] = vnp_Params[key];
        //         return result;
        //     }, {});

        // const sortedParams = Object.keys(vnp_Params)
        //     .sort()
        //     .reduce((result, key) => {
        //         result[key] = String(vnp_Params[key]); // Ép tất cả các giá trị thành chuỗi
        //         return result;
        //     }, {});
        vnp_Params = sortObject(vnp_Params);



        let signData = querystring.stringify(vnp_Params, { encode: false });
        // const signData = Object.keys(sortedParams)
        //     .map(key => `${key}=${sortedParams[key]}`) // Tạo từng cặp key=value
        //     .join('&'); // Ghép lại bằng ký tự &


        const hmac = crypto.createHmac('sha512', process.env.VNP_HASHSECRET);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
        console.log('signed:', signed);
        vnp_Params.vnp_SecureHash = signed;
        // const paymentUrl = `${process.env.VNP_URL}?${querystring.stringify(sortedParams)}`;
        vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

        console.log('paymentUrl:', vnpUrl);

        res.json({ vnpUrl });
    } catch (error) {
        console.error('Lỗi tạo URL thanh toán:', error.message);
        res.status(500).json({ message: 'Lỗi server khi tạo URL thanh toán' });
    }
});

vnPayRouter.get('/vnpay_return', (req, res) => {
    const vnp_Params = req.query;

    const secureHash = vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    // Sắp xếp tham số để kiểm tra
    const sortedParams = Object.keys(vnp_Params)
        .sort()
        .reduce((result, key) => {
            result[key] = vnp_Params[key];
            return result;
        }, {});

    const signData = querystring.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac('sha512', process.env.VNP_HASHSECRET);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash === signed) {
        // Chữ ký hợp lệ
        if (vnp_Params['vnp_ResponseCode'] === '00') {
            res.send('Giao dịch thành công!');
        } else {
            res.send('Giao dịch không thành công!');
        }
    } else {
        // Chữ ký không hợp lệ
        res.status(400).send('Chữ ký không hợp lệ!');
    }
});



vnPayRouter.post('/check_payment_status', async (req, res) => {
    const { txnRef } = req.body; // Mã giao dịch cần kiểm tra
    const secretKey = process.env.VNP_HASHSECRET; // Khóa bảo mật của bạn
    const vnpUrl = process.env.VNP_URL; // URL của VNPAY

    try {
        // Tham số yêu cầu
        let vnp_Params = {
            vnp_Version: '2.1.0',
            vnp_Command: 'querydr', // Lệnh kiểm tra trạng thái giao dịch
            vnp_TmnCode: process.env.VNP_TMNCODE,
            vnp_TxnRef: txnRef,
            vnp_CreateDate: moment().format('YYYYMMDDHHmmss'), // Ngày tạo
        };

        // Sắp xếp tham số
        vnp_Params = sortObject(vnp_Params);

        // Tạo chuỗi ký
        let signData = querystring.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac('sha512', secretKey);
        const signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');
        vnp_Params.vnp_SecureHash = signed;

        // Gửi yêu cầu đến VNPAY
        request.post({ url: vnpUrl, form: vnp_Params }, (error, response, body) => {
            if (error) {
                console.error('Lỗi khi gọi API kiểm tra:', error);
                return res.status(500).json({ message: 'Lỗi khi gọi API kiểm tra trạng thái' });
            }

            const result = JSON.parse(body);
            if (result) {
                // Xử lý kết quả trả về
                const paymentStatus = result.vnp_ResponseCode; // Mã trạng thái thanh toán
                if (paymentStatus === '00') {
                    // Thanh toán thành công
                    res.json({ message: 'Thanh toán thành công', details: result });
                } else {
                    // Thanh toán thất bại hoặc đang chờ xử lý
                    res.json({ message: 'Trạng thái thanh toán: ' + paymentStatus, details: result });
                }
            } else {
                res.status(404).json({ message: 'Không tìm thấy thông tin thanh toán' });
            }
        });
    } catch (error) {
        console.error('Lỗi khi kiểm tra trạng thái đơn hàng:', error.message);
        res.status(500).json({ message: 'Lỗi server khi kiểm tra trạng thái đơn hàng' });
    }
});


vnPayRouter.put('/addToFavorites/:userId/:productId', async function (req, res) {
    return addToFavorites(req, res);
})


function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}


module.exports = vnPayRouter;