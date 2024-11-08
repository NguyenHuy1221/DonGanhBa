require("dotenv").config();
const express = require("express");

const apiRoute = require("./router");
const apiBaokim = require("./baokim");
require("./models/mongo-provider.js");
const app = express();
const session = require("express-session");
const passport = require("./config/passportConfig");
app.use(express.json());
app.use("/api", apiRoute);
app.use("/apiBaokim", apiBaokim);
const path = require("path");
const ConversationModel = require("./models/ConversationSchema.js");
const MessageModel = require("./models/MessageSchema.js");
//chat ong an do thu 3
const cors = require("cors");
app.use(cors());
const jwt = require('jsonwebtoken')

//chat
const http = require("http"); // Needed to set up a server with socket.io
// const socketIO = require("socket.io"); // Socket.IO for real-time functionality
var server = http.createServer(app); // Use http server
// const io = socketIO(server); // Initialize socket.io on the server
var io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket"],
});

// // Thư mục chứa hình ảnh
const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Middleware kiểm tra người dùng đã xác thực
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

// Định nghĩa các tuyến đường
app.get("/dashboard", isAuthenticated, (req, res) => {
  res.send(
    `chúc mừng bạn trúng 100 triệu hãy nạp 100k vào tài khoản 0387162509 NH Timo để rút 100 triệu ${req.user.tenNguoiDung} thân mến`
  );
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get("/auth/google/callback", (req, res, next) => {
  passport.authenticate("google", (err, user, info) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Đăng nhập thất bại", error: err });
    }
    if (!user) {
      return res.status(401).json({ message: "Không tìm thấy người dùng" });
    }
    // Đăng nhập thành công, thực hiện lưu thông tin user vào session
    req.logIn(user, (err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Lỗi khi đăng nhập", error: err });
      }
      // Đăng ký hoặc đăng nhập thành công, trả về thông báo
      return res
        .status(200)
        .json({ message: "Đăng nhập Google thành công", user });
    });
  })(req, res, next);
});

// Tuyến đường bắt đầu quá trình xác thực Facebook
app.get(
  "/auth/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

// Tuyến đường xử lý callback từ Facebook
app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  })
);

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

//chat
let connectedUsers = []; // Danh sách các user đã kết nối

io.on("connection", (socket) => {
  console.log(`New client connected: ${socket.id}`);
  // Lấy token từ handshake
  const token = socket.handshake.auth.token;
  console.log("hand", socket.handshake)
  console.log(token);
  connectedUsers.push(socket.id);
  console.log(connectedUsers);
  let userid;
  // Xác thực token
  try {
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        console.log("Token verification failed:", err);
      } else {
        console.log("Decoded token:", decoded);
        userid = decoded.data;
      }
    });
  } catch (err) {
    console.log("Token verification failed:", err);
    socket.emit("error", { message: "Authentication failed" });
    socket.disconnect(); // Ngắt kết nối nếu token không hợp lệ
    return; // Dừng quá trình nếu token không hợp lệ
  }

  // Đảm bảo userid đã tồn tại trước khi xử lý sự kiện khác
  if (!userid) {
    socket.emit("error", { message: "Invalid token" });
    return;
  }
  socket.on("/test", (mgs) => {
    console.log(mgs);
    // io.emit("/test", mgs);
  });

  console.log(userid); // Đảm bảo userid đã được gán trước khi sử dụng

  socket.on("join", async ({ conversationId }) => {
    try {
      if (!userid) {
        console.error("User ID is not defined");
        socket.emit("error", { message: "User not authenticated" });
        return;
      }
      // Tìm cuộc trò chuyện và populate các tin nhắn
      const conversation = await ConversationModel.findById(
        conversationId
      ).populate({
        path: 'messages',
        populate: {
          path: 'IDSanPham',
          model: 'SanPham' // Name of the Product model
        }
      })
        .populate("sender_id")
        .populate("receiver_id");

      if (conversation) {
        socket.join(conversationId);
        //console.log(`User ${userid} joined conversation ${conversationId}`);

        // Sắp xếp các tin nhắn theo thứ tự thời gian
        const sortedMessages = conversation.messages.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );

        socket.emit("Joined", {
          conversationId,
          messages: sortedMessages,
        });
      } else {
        socket.emit("error", { message: "Conversation not found" });
      }
    } catch (error) {
      console.error(
        `Error during join (conversationId: ${conversationId}):`,
        error
      );
      socket.emit("error", { message: "An error occurred while joining" });
    }
  });

  socket.on('sendMessage', async ({ conversationId, text, imageUrl, videoUrl, IDSanPham, token }) => {
    try {
      //const now = Date.now();
      console.log(token)
      const MIN_TIME_BETWEEN_MESSAGES = 1000;
      const message = new MessageModel({
        text,
        imageUrl,
        videoUrl,
        IDSanPham,
        msgByUserId: userid,
      });
      console.log(message)
      // Gửi phản hồi nhanh chóng tới client
      io.to(conversationId).emit('message', { conversationId, message });
      // Lưu tin nhắn và cập nhật cuộc trò chuyện không đồng bộ
      await message.save();
      const conversation = await ConversationModel.findById(conversationId);
      //console.log(conversation)
      conversation.messages.push(message._id);
      await conversation.save();
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'An error occurred while sending the message' });
    }
  });


  // socket.on("disconnect", () => {
  //   delete socket.token;
  //   console.log("Client disconnected");
  // });
  socket.on('disconnect', () => {
    try {
      //delete socket.token[socket.id];
      delete socket.handshake.auth.token
      connectedUsers = connectedUsers.filter(id => id !== socket.id);
      console.log('User disconnected');
    } catch (error) {
      console.error("Error deleting token:", error);
    }
  });
});
server.listen(3000, "0.0.0.0", () => {
  console.log("Server  is running on port 3000");
});

