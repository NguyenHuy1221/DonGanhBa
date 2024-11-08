var jwt = require("jsonwebtoken");
const { URL } = require("url");
const authMiddleware = (req, res, next) => {
  if (req.method != "GET") {
    if (req.query.API_KEY === process.env.API_KEY) {
      next();
    } else {
      res.status(403).json({ message: "Invalid API key" });
    }
  } else {
    next();
  }
};
const allowed_access = ["/api/user/login"];
const isPassUrl = (url) => {
  console.log("isPassUrl", url);
  for (let i = 0; i < allowed_access.length; i++) {
    if (url.toLowerCase() === allowed_access[i]) {
      return true;
    }
  }
  console.log("pass url failed");
  return false;
};
const authorizationJwt = (req, res, next) => {
  console.log("call token here");
  const token = req.headers.authorization;
  const url = new URL(req.originalUrl, `http://${req.headers.host}`);
  if (isPassUrl(url.pathname)) {
    return next();
  }

  if (!token) {
    return res.status(403).json({ message: "token is required" });
  }
  console.log("call token here");
  const parseToken = token.split(" ")[1];
  if (parseToken) {
    jwt.verify(parseToken, process.env.SECRET_KEY, function (err, decoded) {
      if (err) {
        return res.status(403).json({ message: "token not correct" });
      }
      req.user = decoded.data;
      console.log(decoded.data);
      next();
    });
  }
};

const authMiddlewareView = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
};
const moment = require('moment-timezone');

function convertToVietnamTimezone(schema) {
  schema.methods.toJSON = function () {
    const obj = this.toObject();
    if (obj.NgayBatDau) {
      obj.NgayBatDau = moment(obj.NgayBatDau).tz('Asia/Ho_Chi_Minh').format();
    }
    return obj;
  };
}
function checkPermissions(entity, action) {
  return (req, res, next) => {
    const user = req.user; // Giả sử bạn đã có cơ chế xác thực và gán user vào req 
    if (!user) { return res.status(401).json({ message: 'Unauthorized' }); }
    if (user.role === 'admin') {
      return next(); // Admin có tất cả quyền 
    } const hasPermission = user.permissions.some(permission => permission.entity === entity && permission.actions.includes(action));
    if (!hasPermission) { return res.status(403).json({ message: 'Forbidden: You do not have permission' }); } next();
  };
}
module.exports = { authMiddleware, authorizationJwt, authMiddlewareView, convertToVietnamTimezone, checkPermissions };
