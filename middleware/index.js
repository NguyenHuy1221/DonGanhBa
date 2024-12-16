var jwt = require("jsonwebtoken");
const { URL } = require("url");
// const UserModel = require("../models/NguoiDungSchema")
const mongoose = require('mongoose');
const { decodeToken } = require("../untils")

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

const authenticateUser = async (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  try {
    const UserModel = require("../models/NguoiDungSchema")
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findOne({ _id: decoded._id, 'tokens.token': token });

    if (!user) {
      throw new Error();
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    return res.status(401).send({ error: 'Please authenticate.' });
  }
};
// const checkPermissions = (requiredRole, requiredPermissions) => {
//   return (req, res, next) => {
//     const { user } = req;

//     if (user.role !== requiredRole) {
//       return res.status(403).send({ error: 'Access denied. Insufficient role.' });
//     }

//     const hasRequiredPermissions = requiredPermissions.every(permission => {
//       return user.permissions.some(userPermission => {
//         return userPermission.entity === permission.entity && userPermission.actions.includes(permission.action);
//       });
//     });

//     if (!hasRequiredPermissions) {
//       return res.status(403).send({ error: 'Access denied. Insufficient permissions.' });
//     }

//     next();
//   };
// };



// function convertToVietnamTimezoneVip(schema, fields) {
//   schema.methods.toJSON = function () {
//     const obj = this.toObject();

//     fields.forEach(field => {
//       if (obj[field]) {
//         obj[field] = moment(obj[field]).tz('Asia/Ho_Chi_Minh').format();
//       }
//     });

//     return obj;
//   };
// }

// // Sử dụng hàm này trong Mongoose schema
// const exampleSchema = new mongoose.Schema({
//   NgayBatDau: Date,
//   NgayKetThuc: Date,
//   NgayTao: Date,
//   date: Date // Thêm trường 'date'
// });


// function checkPermissions(entity, action) {
//   return (req, res, next) => {
//     const user = req.user; // Giả sử bạn đã có cơ chế xác thực và gán user vào req 
//     if (!user) { return res.status(401).json({ message: 'Unauthorized' }); }
//     if (user.role === 'admin') {
//       return next(); // Admin có tất cả quyền 
//     } const hasPermission = user.permissions.some(permission => permission.entity === entity && permission.actions.includes(action));
//     if (!hasPermission) { return res.status(403).json({ message: 'Forbidden: You do not have permission' }); } next();
//   };
// }

function checkPermissions(entity, action) {
  return async (req, res, next) => {
    // const user = req.user; // User is already authenticated and verified
    // const user = req.body.user;
    const authHeader = req.header('Authorization');
    console.log(authHeader)

    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }
    try {


      const token = req.header('Authorization').replace('Bearer ', '');
      const UserModel = require("../models/NguoiDungSchema")
      const decoded = decodeToken((token))
      // const user = await UserModel.findOne({ _id: decoded.data, 'tokens.token': token });
      const user = await UserModel.findOne({ _id: decoded.data });
      console.log(user)

      console.log(decoded)
      // const user = decoded
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      if (user.role === 'admin') {
        return next(); // Admin có tất cả quyền
      }

      if (user.role === 'hokinhdoanh') {
        const restrictedEntities = ['danhmuc', 'khuyenmai', 'nguoidung', 'admin', 'yeucaudangky'];
        if (restrictedEntities.includes(entity)) {
          return res.status(403).json({ message: 'Forbidden: You do not have permission for this entity' });
        }
        return next(); // Hộ kinh doanh có quyền ngoại trừ các entity bị giới hạn
      }

      if (user.role === 'nhanvien') {
        const hasPermission = user.permissions.some(permission =>
          permission.entity === entity && permission.actions.includes(action)
        );

        if (!hasPermission) {
          return res.status(403).json({ message: 'Forbidden: You do not have permission' });
        }

        return next();
      }

      return res.status(403).json({ message: 'Forbidden: Insufficient role or permissions' });

    } catch (error) {
      return res.status(500).json({ message: 'error Unauthorized' });
    }

  };
}




module.exports = { authMiddleware, authorizationJwt, authMiddlewareView, convertToVietnamTimezone, checkPermissions };
