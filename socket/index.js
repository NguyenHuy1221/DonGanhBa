// const express = require('express')
// const routerSocket = express.Router();
// const { Server } = require('socket.io')
// const http  = require('http')
// const getUserDetailsFromToken = require('../helpers/getUserDetailsFromToken')
// const UserModel = require('../models/NguoiDungSchema')
// const MessageModel = require('../models/MessageSchema')
// const ConversationModel = require('../models/ConversationSchema')
// const getConversation = require('../helpers/getUserDetailsFromToken')
// const socket = require('../socket/index');

//  const app = express()
//  const setupSocket = (server) => {
//     const io = new Server(server, {
//         cors: {
//             origin: process.env.BASE_URL_SOCKET, // URL ngrok của bạn
//             methods: ['GET', 'POST'],
//             credentials: true
//         }
//     });

//     const onlineUser = new Set();

// io.on('connection',async(socket)=>{
//     console.log("connect User ", socket.id)

//     const token = socket.handshake.auth.token 

//     //current user details 
//     const user = await getUserDetailsFromToken(token)

//     //create a room
//     socket.join(user?._id.toString())
//     onlineUser.add(user?._id?.toString())

//     io.emit('onlineUser',Array.from(onlineUser))

//     socket.on('message-page',async(userId)=>{
//         console.log('userId',userId)
//         const userDetails = await UserModel.findById(userId).select("-password")
        
//         const payload = {
//             _id : userDetails?._id,
//             name : userDetails?.tenNguoiDung,
//             email : userDetails?.gmail,
//             profile_pic : userDetails?.anhDaiDien,
//             online : onlineUser.has(userId)
//         }
//         socket.emit('message-user',payload)


//          //get previous message
//          const getConversationMessage = await ConversationModel.findOne({
//             "$or" : [
//                 { sender : user?._id, receiver : userId },
//                 { sender : userId, receiver :  user?._id}
//             ]
//         }).populate('messages').sort({ updatedAt : -1 })

//         socket.emit('message',getConversationMessage?.messages || [])
//     })


//     //new message
//     socket.on('new message',async(data)=>{

//         //check conversation is available both user

//         let conversation = await ConversationModel.findOne({
//             "$or" : [
//                 { sender : data?.sender, receiver : data?.receiver },
//                 { sender : data?.receiver, receiver :  data?.sender}
//             ]
//         })

//         //if conversation is not available
//         if(!conversation){
//             const createConversation = await ConversationModel({
//                 sender : data?.sender,
//                 receiver : data?.receiver
//             })
//             conversation = await createConversation.save()
//         }
        
//         const message = new MessageModel({
//           text : data.text,
//           imageUrl : data.imageUrl,
//           videoUrl : data.videoUrl,
//           msgByUserId :  data?.msgByUserId,
//         })
//         const saveMessage = await message.save()

//         const updateConversation = await ConversationModel.updateOne({ _id : conversation?._id },{
//             "$push" : { messages : saveMessage?._id }
//         })

//         const getConversationMessage = await ConversationModel.findOne({
//             "$or" : [
//                 { sender : data?.sender, receiver : data?.receiver },
//                 { sender : data?.receiver, receiver :  data?.sender}
//             ]
//         }).populate('messages').sort({ updatedAt : -1 })


//         io.to(data?.sender).emit('message',getConversationMessage?.messages || [])
//         io.to(data?.receiver).emit('message',getConversationMessage?.messages || [])

//         //send conversation
//         const conversationSender = await getConversation(data?.sender)
//         const conversationReceiver = await getConversation(data?.receiver)

//         io.to(data?.sender).emit('conversation',conversationSender)
//         io.to(data?.receiver).emit('conversation',conversationReceiver)
//     })


//     //sidebar
//     socket.on('sidebar',async(currentUserId)=>{
//         console.log("current user",currentUserId)

//         const conversation = await getConversation(currentUserId)

//         socket.emit('conversation',conversation)
        
//     })

//     socket.on('seen',async(msgByUserId)=>{
        
//         let conversation = await ConversationModel.findOne({
//             "$or" : [
//                 { sender : user?._id, receiver : msgByUserId },
//                 { sender : msgByUserId, receiver :  user?._id}
//             ]
//         })

//         const conversationMessageId = conversation?.messages || []

//         const updateMessages  = await MessageModel.updateMany(
//             { _id : { "$in" : conversationMessageId }, msgByUserId : msgByUserId },
//             { "$set" : { seen : true }}
//         )

//         //send conversation
//         const conversationSender = await getConversation(user?._id?.toString())
//         const conversationReceiver = await getConversation(msgByUserId)

//         io.to(user?._id?.toString()).emit('conversation',conversationSender)
//         io.to(msgByUserId).emit('conversation',conversationReceiver)
//     })

//     //disconnect
//     socket.on('disconnect',()=>{
//         onlineUser.delete(user?._id?.toString())
//         console.log('disconnect user ',socket.id)
//     })
// })
// return io;
//  }
// module.exports = setupSocket;
// File: socket/index.js

// const { Server } = require('socket.io');
// const getUserDetailsFromToken = require('../helpers/getUserDetailsFromToken');
// const UserModel = require('../models/NguoiDungSchema');
// const MessageModel = require('../models/MessageSchema');
// const ConversationModel = require('../models/ConversationSchema');
// const getConversation = require('../helpers/getUserDetailsFromToken');

// const setupSocket = (server) => {
//     const io = new Server(server, {
//         cors: {
//             origin: process.env.BASE_URL_SOCKET, // URL ngrok của bạn
//             methods: ['GET', 'POST'],
//             credentials: true
//         }
//     });

//     const onlineUsers = new Set(); // Set để theo dõi người dùng online

//     io.on('connection', async (socket) => {
//         console.log("User connected: ", socket.id);

//         // Lấy token từ handshake auth
//         const token = socket.handshake.auth.token;
        
//         // Lấy thông tin người dùng từ token
//         const user = await getUserDetailsFromToken(token);
//         if (!user) {
//             console.log("Invalid token, disconnecting");
//             return socket.disconnect();
//         }

//         // Tham gia phòng dựa trên ID người dùng
//         socket.join(user._id.toString());
//         onlineUsers.add(user._id.toString());

//         // Gửi danh sách người dùng online
//         io.emit('onlineUser', Array.from(onlineUsers));

//         // Sự kiện khi người dùng vào trang tin nhắn
//         socket.on('message-page', async (userId) => {
//             console.log('User ID for message page:', userId);

//             // Lấy thông tin chi tiết của người dùng khác
//             const userDetails = await UserModel.findById(userId).select("-password");

//             const payload = {
//                 _id: userDetails._id,
//                 name: userDetails.tenNguoiDung,
//                 email: userDetails.gmail,
//                 profile_pic: userDetails.anhDaiDien,
//                 online: onlineUsers.has(userId)
//             };

//             socket.emit('message-user', payload);

//             // Lấy tin nhắn trước đó của cuộc hội thoại
//             const getConversationMessage = await ConversationModel.findOne({
//                 "$or": [
//                     { sender: user._id, receiver: userId },
//                     { sender: userId, receiver: user._id }
//                 ]
//             }).populate('messages').sort({ updatedAt: -1 });

//             socket.emit('message', getConversationMessage?.messages || []);
//         });

//         // Xử lý tin nhắn mới
//         socket.on('new message', async (data) => {
//             let conversation = await ConversationModel.findOne({
//                 "$or": [
//                     { sender: data.sender, receiver: data.receiver },
//                     { sender: data.receiver, receiver: data.sender }
//                 ]
//             });

//             if (!conversation) {
//                 const createConversation = new ConversationModel({
//                     sender: data.sender,
//                     receiver: data.receiver
//                 });
//                 conversation = await createConversation.save();
//             }

//             const message = new MessageModel({
//                 text: data.text,
//                 imageUrl: data.imageUrl,
//                 videoUrl: data.videoUrl,
//                 msgByUserId: data.msgByUserId,
//             });

//             const savedMessage = await message.save();

//             await ConversationModel.updateOne(
//                 { _id: conversation._id },
//                 { "$push": { messages: savedMessage._id } }
//             );

//             const updatedConversation = await ConversationModel.findOne({
//                 "$or": [
//                     { sender: data.sender, receiver: data.receiver },
//                     { sender: data.receiver, receiver: data.sender }
//                 ]
//             }).populate('messages').sort({ updatedAt: -1 });

//             io.to(data.sender).emit('message', updatedConversation?.messages || []);
//             io.to(data.receiver).emit('message', updatedConversation?.messages || []);

//             // Gửi cuộc hội thoại cập nhật
//             const conversationSender = await getConversation(data.sender);
//             const conversationReceiver = await getConversation(data.receiver);

//             io.to(data.sender).emit('conversation', conversationSender);
//             io.to(data.receiver).emit('conversation', conversationReceiver);
//         });

//         // Xử lý sidebar (cuộc hội thoại)
//         socket.on('sidebar', async (currentUserId) => {
//             const conversation = await getConversation(currentUserId);
//             socket.emit('conversation', conversation);
//         });

//         // Đánh dấu tin nhắn đã xem
//         socket.on('seen', async (msgByUserId) => {
//             const conversation = await ConversationModel.findOne({
//                 "$or": [
//                     { sender: user._id, receiver: msgByUserId },
//                     { sender: msgByUserId, receiver: user._id }
//                 ]
//             });

//             const messageIds = conversation?.messages || [];

//             await MessageModel.updateMany(
//                 { _id: { "$in": messageIds }, msgByUserId },
//                 { "$set": { seen: true } }
//             );

//             const conversationSender = await getConversation(user._id.toString());
//             const conversationReceiver = await getConversation(msgByUserId);

//             io.to(user._id.toString()).emit('conversation', conversationSender);
//             io.to(msgByUserId).emit('conversation', conversationReceiver);
//         });

//         // Xử lý ngắt kết nối
//         socket.on('disconnect', () => {
//             onlineUsers.delete(user._id.toString());
//             console.log('User disconnected: ', socket.id);
//         });
        
//     });


//     // const PORT = process.env.PORT || 3000;
//     // server.listen(PORT, () => {
//     //     console.log(`Server is running on port ${PORT}`);
//     // });

//     return io;
// };

// module.exports = setupSocket;


// const socketIo = require('socket.io');

// module.exports = (server) => {
//     const io = socketIo(server);

//     io.on('connection', (socket) => {
//         console.log('a user connected');
//         socket.on('disconnect', () => {
//             console.log('user disconnected');
//         });

//         socket.on('chat message', (msg) => {
//             io.emit('chat message', msg);
//         });
//     });

//     return io;
// };