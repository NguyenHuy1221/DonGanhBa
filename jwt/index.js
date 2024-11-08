const jwt = require("jsonwebtoken");
const moment = require('moment-timezone');

function refreshToken() {
  const tokenId = require("crypto").randomBytes(32).toString("base64");
  const issuedAt = Math.floor(Date.now() / 1000);
  const notBefore = issuedAt;
  const expire = notBefore + 60; // Make sure TOKEN_EXPIRE is defined

  // Payload data of the token
  const data = {
    iat: issuedAt, // Issued at: time when the token was generated
    jti: tokenId, // Json Token Id: an unique identifier for the token
    merchant_id: Number(process.env.MERCHANT_ID),
    iss: process.env.API_KEY, // Issuer (replace API_KEY with your actual API key)
    nbf: notBefore, // Not before
    exp: expire, // Expire
    
  };


  // Encode the array to a JWT string
  const jwtToken = jwt.sign(data, process.env.API_SECRET, {
    algorithm: "HS256",
  });

  return jwtToken;
}

//ham thừa thãi vì viết r T-T
function refreshTokenUser(user) {
  const tokenId = require("crypto").randomBytes(32).toString("base64");
  const issuedAt = Math.floor(Date.now() / 1000);
  const vietnamTime = moment.unix(issuedAt).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss');


  // Payload data of the token
  const tokenData = {
    iat: vietnamTime, // Issued at: time when the token was generated (Unix timestamp)
    jti: tokenId, // Json Token Id: an unique identifier for the token
    userId: user._id,
    email: user.gmail,
    phoneNumber: user.soDienThoai,
  };
  // Encode the array to a JWT string
  const jwtTokenUser = jwt.sign(tokenData,process.env.SECRET_KEY,{ expiresIn : '1d'}, {
    algorithm: "HS256",
  });

  return jwtTokenUser;
}
module.exports = {
  refreshToken: refreshToken,
  refreshTokenUser: refreshTokenUser,
};
