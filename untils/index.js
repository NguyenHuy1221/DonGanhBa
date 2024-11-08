const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");


async function hashPassword(plaintextPassword) {
  const hash = await bcrypt.hash(plaintextPassword, 10);
  return hash;
}
const multer = require("multer");
const path = require('path')
const { uid } = require("uid");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/"); //hỉnh ảnh sẽ chưa trong folder uploads
  },
  filename: (req, file, cb) => {
    console.log(file);
    const id = uid();
    cb(null, `${id}-${file.originalname}`);
    // cb(null, Date.now() + path.extname(file.originalname)); // mặc định sẽ save name của hình ảnh
    // là name gốc, chúng ta có thể rename nó.
  },
});


const storageForvideoandimage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(file)
    if (file.fieldname.includes("image")) {
      cb(null, 'public/uploads/'); // Thư mục ảnh
    } else if (file.fieldname.includes("video")) {
      cb(null, 'public/uploads/_videos/'); // Thư mục video
    } else {
      cb(new Error('Invalid file type'), false);
    }
  },
  filename: (req, file, cb) => {
    console.log(file);
    const id = uid();
    cb(null, `${id}-${file.originalname}`);
  }
});
// const storageForvideoandimage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     if (file.mimetype.startsWith('image/')) {
//       cb(null, 'public/upload/'); // Thư mục ảnh
//     } else if (file.mimetype.startsWith('video/')) {
//       cb(null, 'public/upload/_videos/'); // Thư mục video
//     } else {
//       cb(new Error('Invalid file type'), false);
//     }
//   },
//   filename: (req, file, cb) => {
//     const uniqueId = Date.now().toString(); // Tạo ID duy nhất
//     cb(null, `${uniqueId}-${file.originalname}`);
//   }

// })

const uploadFiles = multer({
  storage: storageForvideoandimage,
  limits: { fileSize: 1024 * 1024 * 50 } // Giới hạn kích thước file
}).fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
])

// const uploadVideoOrImage = multer({ storageForvideoandimage: storageForvideoandimage });
// const uploadFiles = uploadVideoOrImage.fields([
//   { name: 'image', maxCount: 1 },
//   { name: 'video', maxCount: 1 }
// ])
const upload = multer({ storage: storage });

async function comparePassword(plaintextPassword, hash) {
  const result = await bcrypt.compare(plaintextPassword, hash);
  return result;
}

function generateToken(payLoad) {
  const secretKey = process.env.SECRET_KEY;
  if (!secretKey) {
    throw new Error("SECRET_KEY is not defined");
  }

  const token = jwt.sign({ data: payLoad }, secretKey, {
    expiresIn: process.env.EXPIRE_TIME,
  });

  return token;
}
function decodeToken(token) {
  const secretKey = process.env.SECRET_KEY;
  if (!secretKey) {
    throw new Error("SECRET_KEY is not defined");
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded;
  } catch (error) {
    throw new Error("Token verification failed: " + error.message);
  }
}
module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  upload,
  uploadFiles,
  decodeToken,
};
