const mongoose = require("mongoose");
require("dotenv").config();

// Kết nối MongoDB mà không cần các tùy chọn đã lỗi thời
mongoose.connect(process.env.MONGO_URI);

// Xử lý lỗi kết nối
mongoose.connection.on("error", (err) => {
  console.log("err", err);
});

// Xử lý khi kết nối thành công
mongoose.connection.on("connected", () => {
  console.log("mongoose is connected");
});
