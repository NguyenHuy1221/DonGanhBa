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
const { decodeToken } = require("./untils")

//chat
const http = require("http"); // Needed to set up a server with socket.io
var server = http.createServer(app); // Use http server
var io = require("socket.io")(server, {
  cors: {
    origin: ["https://peacock-wealthy-vaguely.ngrok-free.app", "http://61.14.233.64:3000", "https://resolved-thankfully-collie.ngrok-free.app"],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket"],
});

// // Thư mục chứa hình ảnh
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));
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

// app.get("/auth/google/callback", (req, res, next) => {
//   passport.authenticate("google", (err, user, info) => {
//     if (err) {
//       return res
//         .status(500)
//         .json({ message: "Đăng nhập thất bại", error: err });
//     }
//     if (!user) {
//       return res.status(401).json({ message: "Không tìm thấy người dùng" });
//     }
//     // Đăng nhập thành công, thực hiện lưu thông tin user vào session
//     req.logIn(user, (err) => {
//       if (err) {
//         return res
//           .status(500)
//           .json({ message: "Lỗi khi đăng nhập", error: err });
//       }
//       // Đăng ký hoặc đăng nhập thành công, trả về thông báo
//       return res
//         .status(200)
//         .json({ message: "Đăng nhập Google thành công", user });
//     });
//   })(req, res, next);
// });

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
app.get("/auth/google/callback", (req, res, next) => {
  passport.authenticate("google", { session: false }, (err, user) => {
    // Log để kiểm tra lỗi và user
    console.log("Error:", err);
    console.log("User:", user);

    if (err || !user) {
      console.log("Đăng nhập thất bại hoặc không tìm thấy user!");
      return res.send(`
        <script>
          window.opener.postMessage({ error: "Đăng nhập thất bại" }, "http://localhost:3000");
          window.close();
        </script>
      `);
    }

    const token = generateToken(user._id, user.role);

    // Log token và user ID để kiểm tra
    console.log("Token:", token);
    console.log("User ID:", user._id);

    // Gửi token và userId về client thông qua postMessage
    return res.send(`
      <script>
        window.opener.postMessage({
          token: "${token}",
          userId: "${user._id}"
        }, "http://localhost:3000");
        window.close();
      </script>
    `);
  })(req, res, next);
});
//chat
let connectedUsers = []; // Danh sách các user đã kết nối

io.on("connection", (socket) => {
  console.log(`New client connected: ${socket.id}`);
  // Lấy token từ handshake
  const tokenerror = socket.handshake.auth.token;
  // console.log("hand", socket.handshake)
  // console.log(token);
  connectedUsers.push(socket.id);
  // console.log("user", decodeToken(token));
  let userid;
  // Xác thực token

  // Đảm bảo userid đã tồn tại trước khi xử lý sự kiện khác
  // if (!userid) {
  //   socket.emit("error", { message: "Invalid token" });
  //   return;
  // }
  socket.on("/test", (mgs) => {
    console.log(mgs);
    // io.emit("/test", mgs);
  });


  socket.on("join", async ({ conversationId, token }) => {
    try {
      // const tokeninfo = decodeToken(token)
      // if (tokeninfo.error) {
      //   console.error('Invalid token:', tokeninfo.error);
      //   socket.disconnect(true); return;
      // }
      // if (!tokeninfo.data) {
      //   console.error("User ID is not defined");
      //   socket.emit("error",
      //     { message: "User not authenticated" });
      //   socket.disconnect(true); return;
      // }
      const tokeninfo = decodeToken(token)
      if (tokeninfo.error) {
        console.error('Token không hợp lệ:', decoded.error);
        socket.disconnect(true); // Ngắt kết nối
      }
      // console.log(tokeninfo.data)
      // console.log(token)
      // console.log("0", tokeninfo.data)

      if (!tokeninfo.data) {
        console.error("User ID is not defined");
        socket.emit("error", { message: "User not authenticated" });
        socket.disconnect(true); // Ngắt kết nối

        return;
      }

      const userID = tokeninfo.data

      // Tìm cuộc trò chuyện và populate các tin nhắn
      const conversation = await ConversationModel.findById(
        conversationId
      )
        .populate({
          path: 'messages',
          populate: {
            path: 'IDSanPham',
            model: 'SanPham',
            populate: {
              path: 'userId',
              model: 'User' // Name of the Product model
            }
          }
        })
        .populate("sender_id")
        .populate("receiver_id");

      if (conversation) {
        socket.join(conversationId);
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
      const tokeninfo = decodeToken(token)
      if (tokeninfo.error) {
        console.error('Token không hợp lệ:', decoded.error);
        socket.disconnect(true); // Ngắt kết nối
      }
      if (!tokeninfo.data) {
        console.error("User ID is not defined");
        socket.emit("error", { message: "User not authenticated" });
        socket.disconnect(true); // Ngắt kết nối

        return;
      }
      const userID = tokeninfo.data
      // console.log(tokeninfo.data)

      // console.log(tokeninfo)
      // console.log(userID)
      const MIN_TIME_BETWEEN_MESSAGES = 1000;
      const message = new MessageModel({
        text,
        imageUrl,
        videoUrl,
        IDSanPham,
        msgByUserId: userID,
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
async function jwtdecor(token) {
  try {
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        console.log("Token verification failed:", err);
        return "token khong hop le"
      } else {
        console.log("Decoded token:", decoded);
        return decoded.data
      }
    });
  } catch (err) {
    console.log("Token verification failed:", err);
    socket.emit("error", { message: "Authentication failed" });
    socket.disconnect(); // Ngắt kết nối nếu token không hợp lệ
    return; // Dừng quá trình nếu token không hợp lệ
  }

}

server.listen(5000, "0.0.0.0", () => {
  console.log("Server  is running on port 3000");
});

