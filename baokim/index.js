const express = require("express");
const apiBaokim = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const crypto = require("crypto")

const { refreshToken } = require('../jwt/index');

async function getPaymentMethods(req, res) {
  const token = refreshToken();
  try {
      const response = await axios.get(process.env.API_URL_PaymentMethods, {
          params: {
              jwt: token
          }
      });
      res.status(200).json(response.data);
  } catch (error) {
      console.error('Error fetching payment methods:', error);
      res.status(500).json({ message: 'Error fetching payment methods', error: error.message });
  }
}

// hàm này sẽ trở thành hàm phụ nằm bên trong hàm createUserDiaChivaThongTinGiaoHang ở hóa đơn controller.
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

async function getCheckOrder(req, res) {
  const token = refreshToken();
  try {
      const response = await axios.get(process.env.API_URL_getCheckOrder, {
          params: {
              jwt: token,
              id: 177636	,
              mrc_order_id :"Bc203412",
          }
      });
      res.status(200).json(response.data);
  } catch (error) {
      console.error('Error  check Order methods:', error);
      res.status(500).json({ message: 'Error  check Order methods', error: error.message });
  }
}


async function deleteCannelOrder(req, res) {
  const token = refreshToken();
  const cannel = {
    id : 177607
  }
  // const id = 177607;
  try {
      const response = await axios.post(process.env.API_URL_deleteCannelOrder,cannel, {
          params: {
              jwt: token,
          },
          headers: {
            'Content-Type': 'application/json',
          },
      });
      res.status(200).json(response.data);
  } catch (error) {
      console.error('Error  cannel order methods:', error);
      res.status(500).json({ message: 'Error cannel order methods', error: error.message });
  }
}


async function getPayfee(req, res) {
  const token = refreshToken();
  const fee = {
    merchant_id: 40002,
    amount: 200000
  }
  // const id = 177607;
  try {
      const response = await axios.post("https://dev-api.baokim.vn/paymentapi/v5/refund/create",fee, {
          params: {
              jwt: token,
          },
          headers: {
            'Content-Type': 'application/json',
          },
      });
      res.status(200).json(response.data);
  } catch (error) {
      console.error('Error  fee methods:', error);
      res.status(500).json({ message: 'Error  fee methods', error: error.message });
  }
}



async function checkToken(req, res) {
  const token = refreshToken();
  try {
    const decipher = crypto.createDecipher('aes-256-cbc', process.env.API_SECRET);
let decrypted = decipher.update('51234516847402740000', 'hex', 'utf8');
decrypted += decipher.final('utf8');
    const decoded = jwt.decode(token);
    console.log(decrypted);
    res.status(201).json(decoded,decrypted);
    return decoded;
} catch (error) {
    console.error('Error decoding token:', error);
    return null;
}
}


// api ham ko ton tai  chỉ có 4 api đầu tiên của bảo kim có thể hoạt động.

// async function calculateBankFee(req, res) {
//   const API_URL2 = 'https://dev-api.baokim.vn/paymentapi/v5/payment-txn/calculate-bank-fee';
//     const token = refreshToken();
//     const payload = {
//         merchant_id: 40002,
//         amount: 200000,
//         bpm_id: 128,
//         fee_payer: 1 // Thêm trường fee_payer (1 - Người mua chịu phí, 2 - Merchant chịu phí)
//     };

//     try {
//         const response = await axios.post("https://dev-api.baokim.vn/paymentapi/v5/payment-txn/calculate-bank-fee", payload, {
//             params: {
//                 jwt: token
//             },
//             headers: {
//               // 'Authorization': `Bearer ${token}`,
//               'Content-Type': 'application/json'
//           }
            
//         });
//         res.status(200).json(response.data);
//     } catch (error) {
//         console.error('Error calculating bank fee:', error);
//         res.status(500).json({ message: 'Error calculating bank fee', error: error.message, token });
//     }
// }

apiBaokim.get('/checkToken', checkToken);
apiBaokim.get('/getPaymentMethods', getPaymentMethods);
apiBaokim.post('/createOrder', createOrder);
apiBaokim.get('/getCheckOrder', getCheckOrder);
apiBaokim.post('/deleteCannelOrder', deleteCannelOrder);
apiBaokim.post('/getPayfee', getPayfee);

// apiBaokim.post('/calculateBankFee', calculateBankFee);

  module.exports = apiBaokim;
