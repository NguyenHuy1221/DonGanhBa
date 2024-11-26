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


const express = require('express');
const { S3Client, PutObjectCommand, DeleteBucketCorsCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');


// Cấu hình AWS S3 Client
const s3Client = new S3Client({
  region: 'ap-southeast-1',
  endpoint: process.env.VIETTEL_ENDPOINT,
  credentials: {
    accessKeyId: process.env.VIETTEL_ACCESS_KEY,
    secretAccessKey: process.env.VIETTEL_SECRET_KEY
  }
});

// Cấu hình Multer để xử lý file upload
const storagememory = multer.memoryStorage(); // Lưu trữ file trong bộ nhớ tạm

const uploadmemory = multer({
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Hàm upload file lên Viettel Cloud
async function uploadFileToViettelCloud(buffer, bucketName, key, mimetype) {
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: mimetype
  };

  try {
    const data = await s3Client.send(new PutObjectCommand(params));
    const fileUrl = `${process.env.VIETTEL_ENDPOINT}/${bucketName}/${key}`;
    console.log('File uploaded successfully:', data, fileUrl);
    return fileUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}









module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  upload,
  uploadFiles,
  decodeToken,
  uploadFileToViettelCloud,
  uploadmemory,
};


// code khac phuc khi lo cau hinh cors khien chung ta ko lam gi dc bucket

// const deleteBucketParams = {
//   Bucket: bucketName
// };

// try {
//   const data = await s3Client.send(new DeleteBucketCorsCommand(deleteBucketParams));
//   console.log("Bucket deleted successfully:", data);
// } catch (err) {
//   console.error("Error deleting bucket:", err);
// }