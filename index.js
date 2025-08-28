require('dotenv').config();

const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  
})
.catch((error) => {
  console.error('Lỗi kết nối MongoDB:', error);
});

const conn = mongoose.createConnection(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const exp = require('express');
const app = exp();
const port = process.env.PORT || 3000;
const cors = require('cors');
const slugify = require('slugify');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const passport = require('passport');
require('./auth/google');
require('./auth/facebook');

app.use(cors({
  origin: function (origin, callback) {

    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/$/, '');

    const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : [];

    const vercelPattern = /^https:\/\/fe-vclock.*\.vercel\.app$/;
    
    if (allowedOrigins.includes(cleanOrigin) || vercelPattern.test(cleanOrigin)) {
      callback(null, cleanOrigin);
    } else {
  
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.options('*', cors());

app.use((req, res, next) => {

  next();
});

app.use( exp.json() );

app.all('/checkout-success', (req, res) => {
  res.sendStatus(200);
});

app.get('/test-cors', (req, res) => {
  res.json({
    message: 'CORS test successful',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

const storagePM = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'vclock/payment-methods',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 300, height: 200, crop: 'limit' }]
  },
});

const uploadPMs = multer({
  storage: storagePM,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const storageAvt = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'vclock/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  },
});

const uploadAvatar = multer({
  storage: storageAvt,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const storageUser = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'vclock/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  },
});
const uploadUser = multer({ 
  storage: storageUser,
  limits: { fileSize: 10 * 1024 * 1024 }
});

const storageCateProduct = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'vclock/categories',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }]
  },
});

const uploadCateProduct = multer({
  storage: storageCateProduct,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const storageBrand = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'vclock/brands',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 300, crop: 'limit' }]
  },
});

const uploadCateBrand = multer({
  storage: storageBrand,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const storageCateNews = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'vclock/news',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 800, crop: 'limit' }]
  },
});

const uploadCateNews = multer({
  storage: storageCateNews,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const storageProduct = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'vclock/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  },
});

const uploadDoneProduct = multer({
  storage: storageProduct,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});



const ObjectId = mongoose.Types.ObjectId;
const newsSchema = require("./model/schemaNews");
const categoryNewsSchema = require("./model/schemaCategoryNews");
const userSchema = require("./model/schemaUser");
const voucherSchema = require("./model/schemaVoucher");
const VoucherUserSchema = require("./model/schemaVoucherUser");
const brandSchema = require("./model/schemaBrand");
const productSchema = require("./model/schemaProduct");
const productImageSchema = require("./model/schemaProductImages");
const productCategoriesSchema = require("./model/schemaproductCategories");
const categorySchema = require("./model/schemaCategory");
const orderSchema = require("./model/schemaOrder");
const orderDetailSchema = require("./model/schemaOrderDetail");
const reviewsSchema = require("./model/schemaReviews");
const wishlistSchema = require("./model/schemaWishlist");
const addressSchema = require("./model/schemaAddress");
const PaymentMethoaShema = require("./model/schemaPaymentMethods");
const MessageSchema = require("./model/schemaMessage");
const ConversationSchema = require("./model/schemaConversation");
const NotificationSchema = require("./model/schemaNotification");

const NewsModel = conn.model("news", newsSchema);
const CategoryNewsModel = conn.model("category_news", categoryNewsSchema);
const UserModel = conn.model("users", userSchema);
const VoucherModel = conn.model("vouchers", voucherSchema);
const VoucherUserModel = conn.model("voucher_user", VoucherUserSchema);
const BrandModel = conn.model("brands", brandSchema);
const ProductModel = conn.model("products", productSchema);
const ProductImageModel = conn.model("product_images", productImageSchema);
const ProductCategoriesModel = conn.model(
  "product_categories",
  productCategoriesSchema
);
const CategoryModel = conn.model("categories", categorySchema);
const OrderModel = conn.model("orders", orderSchema);
const OrderDetailModel = conn.model("order_details", orderDetailSchema);
const ReviewModel = conn.model("reviews", reviewsSchema);
const WishlistModel = conn.model("wishlists", wishlistSchema);
const AddressModel = conn.model("address", addressSchema);
const PaymentMethodModel = conn.model("payment_methods", PaymentMethoaShema);
const MessageModel = conn.model("messages", MessageSchema);
const ConversationModel = conn.model("conversations", ConversationSchema);
const NotificationModel = conn.model("notifications", NotificationSchema);

const verifyOptionalToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      req.user = null;
    } else {
      req.user = user;
    }
    next();
  });
};

const {
  getProvinces,
  getDistrictsByProvinceCode,
  getWardsByDistrictCode
} = require('sub-vn');

app.get('/api/provinces', (req, res) => {
  const provinces = getProvinces();
  res.json(provinces);
});

app.get('/api/districts/:provinceCode', (req, res) => {
  const districts = getDistrictsByProvinceCode(req.params.provinceCode);
  res.json(districts);
});

app.get('/api/wards/:districtCode', (req, res) => {
  const wards = getWardsByDistrictCode(req.params.districtCode);
  res.json(wards);
});

const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });



const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(exp.json());

// Socket.IO xử lý chat
io.on("connection", (socket) => {


  socket.on("sendMessage", async (msg) => {
    try {
      const newMsg = new MessageModel({
        ...msg,
        createdAt: new Date(),
      });
      await newMsg.save();

      // Tách tạo mới và update
      const conv = await ConversationModel.findOne({ conversationId: msg.conversationId });
      if (!conv) {
        await ConversationModel.create({
          conversationId: msg.conversationId,
          participants: [],
          lastMessage: msg.text,
          lastMessageType: msg.messageType,
          lastMessageSenderId: msg.senderId,
          lastTime: new Date(),
        });
      } else {
        await ConversationModel.updateOne(
          { conversationId: msg.conversationId },
          {
            $set: {
              lastMessage: msg.text,
              lastMessageType: msg.messageType,
              lastMessageSenderId: msg.senderId,
              lastTime: new Date(),
            },
            $inc: { "participants.$[elem].unreadCount": 1 }
          },
          {
            arrayFilters: [{ "elem.userId": { $ne: msg.senderId } }]
          }
        );
      }

      io.to(msg.conversationId).emit("receiveMessage", newMsg);

      // AI chỉ trả lời khách, không trả lời admin
      if (msg.senderId !== "AI_BOT" && msg.senderId !== "admin-id") {
        const text = msg.text.toLowerCase();

        let aiMsg;

        if (text.includes("sản phẩm") || text.includes("đồng hồ") || text.includes("mẫu")) {
        const limit = 4;

        // --- 1) Phân tích câu giá ---
        // Hỗ trợ: "50 triệu", "50tr", "50m", "50.000.000", "50000000"
        const priceRegex = /(\d{1,3}(?:[.\s]\d{3})+|\d+(?:[.,]\d+)?)(?:\s*)(triệu|tr|trieu|m|vnđ|vnd|đ)?/i;
        const m = text.match(priceRegex);

        const hasUpper = /(dưới|nhỏ hơn|ít hơn|<=)/i.test(text);
        const hasLower = /(trên|lớn hơn|cao hơn|>=)/i.test(text);

        let priceValue = null;
        if (m) {
          // làm sạch số (50.000.000 -> 50000000, 2,5 -> 2.5)
          let raw = m[1].replace(/\s|\./g, '').replace(',', '.');
          let num = parseFloat(raw);
          const unit = (m[2] || '').toLowerCase();

          if (['triệu', 'tr', 'trieu', 'm'].includes(unit)) {
            priceValue = Math.round(num * 1_000_000);
          } else {
            // nếu người dùng ghi thẳng VND (>= 1e6) thì giữ nguyên
            priceValue = Math.round(num >= 1_000_000 ? num : num * 1_000_000);
          }
        }

        // --- 2) Làm sạch từ khóa tên ---
        let cleanText = text
          .replace(priceRegex, '')
          .replace(/sản phẩm|đồng hồ|mẫu|tham khảo/gi, '')
          .trim();

        const useName = cleanText.length > 2;

        // --- 3) Tạo pipeline cơ bản: tính effective_price trước rồi mới match ---
const baseAddFields = [
          {
            $addFields: {
              // ép kiểu an toàn nếu DB lưu string
              price_num: {
                $cond: [{ $isNumber: "$price" }, "$price", { $toDouble: "$price" }]
              },
              sale_price_num: {
                $cond: [{ $isNumber: "$sale_price" }, "$sale_price", { $toDouble: "$sale_price" }]
              }
            }
          },
          {
            $addFields: {
              effective_price: {
                $cond: [
                  { $and: [{ $ne: ["$sale_price_num", null] }, { $gt: ["$sale_price_num", 0] }] },
                  "$sale_price_num",
                  "$price_num"
                ]
              }
            }
          }
        ];

        const buildLookupStages = () => ([
          {
            $lookup: {
              from: "product_images",
              let: { pid: "$_id" },
              pipeline: [
                { $match: { $expr: { $eq: ["$product_id", "$$pid"] } } },
                { $project: { _id: 1, image: 1, alt: 1, is_main: 1 } }
              ],
              as: "images"
            }
          },
          {
            $addFields: {
              main_image: {
                $let: {
                  vars: {
                    mains: {
                      $filter: {
                        input: "$images",
                        as: "img",
                        cond: { $eq: ["$$img.is_main", true] }
                      }
                    }
                  },
                  in: {
                    $cond: [
                      { $gt: [{ $size: "$$mains" }, 0] },
                      { image: { $arrayElemAt: ["$$mains.image", 0] }, alt: { $arrayElemAt: ["$$mains.alt", 0] } },
                      // nếu không có is_main, lấy ảnh đầu tiên
                      {
                        $cond: [
                          { $gt: [{ $size: "$images" }, 0] },
                          { image: { $arrayElemAt: ["$images.image", 0] }, alt: { $arrayElemAt: ["$images.alt", 0] } },
                          null
                        ]
                      }
                    ]
                  }
                }
              }
            }
          },
          {
            $lookup: {
              from: "brands",
              localField: "brand_id",
              foreignField: "_id",
              as: "brand"
            }
          },
          { $unwind: "$brand" },
          // Nếu nghi ngờ brand_status làm rỗng kết quả, có thể tạm comment dòng dưới để test
          { $match: { "brand.brand_status": 0 } },
          {
            $project: {
              _id: 1,
              name: 1,
              price: 1,
              sale_price: 1,
              effective_price: 1,
              main_image: 1,
              brand: { _id: 1, name: 1 }
            }
          }
]);

        // --- 4) Tạo $match theo tiêu chí ---
        const matchBoth = {};
        let hasPriceFilter = false;

        if (priceValue) {
          hasPriceFilter = true;
          if (hasUpper && !hasLower) {
            matchBoth.effective_price = { $lte: priceValue };
          } else if (hasLower && !hasUpper) {
            matchBoth.effective_price = { $gte: priceValue };
          } else {
            // nếu chỉ ghi "50 triệu" không kèm dưới/trên → coi như khoảng ±20%
            const delta = Math.round(priceValue * 0.2);
            matchBoth.effective_price = { $gte: priceValue - delta, $lte: priceValue + delta };
          }
        }

        if (useName) {
          matchBoth.name = { $regex: cleanText, $options: "i" };
        }

        // --- 5) Try 1: lọc theo (giá + tên nếu có) ---
        let stages1 = [
          ...baseAddFields,
          Object.keys(matchBoth).length ? { $match: matchBoth } : { $match: {} },
          { $sort: priceValue ? { effective_price: 1 } : { _id: -1 } },
          { $limit: limit },
          ...buildLookupStages()
        ];
        let products = await ProductModel.aggregate(stages1);

        // --- 6) Try 2: nếu rỗng và có dùng tên → bỏ tên, GIỮ GIÁ ---
        if (products.length === 0 && useName && hasPriceFilter) {
          const matchPriceOnly = { effective_price: matchBoth.effective_price };
          let stages2 = [
            ...baseAddFields,
            { $match: matchPriceOnly },
            // nếu "dưới": ưu tiên gần ngưỡng nên sort giảm dần; nếu "trên": sort tăng dần
            ...(hasUpper ? [{ $sort: { effective_price: -1 } }] : hasLower ? [{ $sort: { effective_price: 1 } }] : [{ $sort: { effective_price: 1 } }]),
            { $limit: limit },
            ...buildLookupStages()
          ];
          products = await ProductModel.aggregate(stages2);
        }

        // --- 7) Try 3: nếu vẫn rỗng nhưng có giá → gợi ý gần nhất VẪN đúng ràng buộc giá ---
        if (products.length === 0 && hasPriceFilter) {
          const nearMatch = hasUpper
            ? { effective_price: { $lte: priceValue } }
            : hasLower
            ? { effective_price: { $gte: priceValue } }
            : {}; // nếu là "khoảng", đã thử ở try 1

          let stages3 = [
            ...baseAddFields,
            Object.keys(nearMatch).length ? { $match: nearMatch } : { $match: {} },
            ...(hasUpper ? [{ $sort: { effective_price: -1 } }] : hasLower ? [{ $sort: { effective_price: 1 } }] : [{ $sort: { effective_price: 1 } }]),
            { $limit: limit },
            ...buildLookupStages()
          ];
          products = await ProductModel.aggregate(stages3);
        }

        // --- 8) Try 4: chỉ random khi KHÔNG có tiêu chí nào cả ---
        if (products.length === 0 && !hasPriceFilter && !useName) {
products = await ProductModel.aggregate([
            { $sample: { size: limit } },
            ...buildLookupStages()
          ]);
        }

        // --- 9) Compose trả lời ---
        let replyText;
        if (products.length > 0) {
          if (hasPriceFilter) {
            if (hasUpper) replyText = `Mình gợi ý các mẫu **dưới ${priceValue.toLocaleString()}₫**:`;
            else if (hasLower) replyText = `Mình gợi ý các mẫu **trên ${priceValue.toLocaleString()}₫**:`;
            else replyText = `Mình gợi ý các mẫu **khoảng ${priceValue.toLocaleString()}₫**:`;
          } else {
            replyText = "Dưới đây là sản phẩm bạn cần:";
          }
        } else {
          replyText = hasPriceFilter
            ? "Hiện tại chưa có mẫu đúng mức giá bạn muốn. Bạn muốn nới khoảng giá một chút không?"
            : "Xin lỗi, hiện tại chưa có sản phẩm phù hợp. Bạn muốn xem mẫu khác không?";
        }

        aiMsg = {
          conversationId: msg.conversationId,
          senderId: "AI_BOT",
          senderName: "ChatBot",
          senderAvatar: "https://img.freepik.com/free-vector/chatbot-chat-message-vectorart_78370-4104.jpg",
          text: replyText,
          messageType: "products",
          products: products.map(p => ({
            id: p._id,
            name: p.name,
            price: p.price,
            sale_price: p.sale_price,
            main_image: p.main_image,
            brand: p.brand,
          })),
        };

      }
        else {
          // AI trả lời có role-play như nhân viên VClock Store
          const prompt = `
          Bạn là nhân viên bán hàng online của VClock Store (https://vclock.store).
          Bạn phải:
          - Chỉ trả lời dựa trên dữ liệu của VClock Store.
          - Nếu không biết thông tin, hãy nói "Hiện tại mình chưa có thông tin này, bạn có muốn xem thêm các mẫu đồng hồ khác không?".
          - Trả lời thân thiện, ngắn gọn, tập trung vào sản phẩm đồng hồ.
          - Nếu khách hỏi về sản phẩm, chỉ lấy dữ liệu từ DB MongoDB (collection products, brands, promotions).
          Khách hỏi: ${msg.text}
          `;

          const result = await model.generateContent(prompt);
          const aiText = result.response.text();

          aiMsg = {
            conversationId: msg.conversationId,
            senderId: "AI_BOT",
            senderName: "ChatBot",
            senderAvatar: "https://img.freepik.com/free-vector/chatbot-chat-message-vectorart_78370-4104.jpg",
            text: aiText,
            messageType: "text",
          };
        }

        const savedAiMsg = new MessageModel(aiMsg);
        await savedAiMsg.save();

        await ConversationModel.updateOne(
          { conversationId: msg.conversationId },
          {
            $set: {
lastMessage: aiMsg.text,
              lastMessageType: aiMsg.messageType,
              lastMessageSenderId: "AI_BOT",
              lastTime: new Date(),
            },
            $inc: { "participants.$[elem].unreadCount": 1 }
          },
          {
            arrayFilters: [{ "elem.userId": { $ne: "AI_BOT" } }]
          }
        );

        io.to(msg.conversationId).emit("receiveMessage", aiMsg);
      }
    } catch (err) {
      console.error("Error saving message:", err);
      io.to(msg.conversationId).emit("receiveMessage", {
        conversationId: msg.conversationId,
        senderId: "AI_BOT",
        senderName: "ChatBot",
        senderAvatar: "https://img.freepik.com/free-vector/chatbot-chat-message-vectorart_78370-4104.jpg",
        text: "Xin lỗi, hiện tại hệ thống đang quá tải. Vui lòng thử lại sau!",
        messageType: "text",
      });
    }
  });

  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);

  });

  socket.on("disconnect", () => {

  });

  socket.on("seenMessage", async ({ conversationId, userId }) => {
    await ConversationModel.updateOne(
      { conversationId, "participants.userId": userId },
      { $set: { "participants.$.unreadCount": 0 } }
    );
    io.to(conversationId).emit("messagesSeen", { conversationId, userId });
  });
});

app.get('/api/messages/:conversationId', verifyOptionalToken, async (req, res) => {
  const { conversationId } = req.params;
  const user = req.user;

  try {
    const messages = await MessageModel.find({ conversationId }).sort({ createdAt: 1 });
    
    const populatedMessages = await Promise.all(
      messages.map(async (msg) => {
        try {
          if (msg.senderId === 'admin-id' || msg.senderId === 'guest' || !msg.senderId.match(/^[0-9a-fA-F]{24}$/)) {
            return msg.toObject();
          }
          
          const user = await UserModel.findById(msg.senderId).select('username fullName avatar');
          if (user) {
            return {
              ...msg.toObject(),
              senderName: user.fullName || user.username || msg.senderName,
              senderAvatar: user.avatar || msg.senderAvatar,
            };
          }
          return msg.toObject();
        } catch (error) {
          console.error('Error fetching user for message:', error);
          return msg.toObject();
        }
      })
    );
    
    res.json(populatedMessages);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/conversations', async (req, res) => {
  try {
    const conversations = await ConversationModel.find().sort({ lastTime: -1 });
    
    const populatedConversations = await Promise.all(
      conversations.map(async (conv) => {
const updatedParticipants = await Promise.all(
          conv.participants.map(async (participant) => {
            try {
              if (participant.userId === 'admin-id' || participant.userId === 'guest' || !participant.userId.match(/^[0-9a-fA-F]{24}$/)) {
                return participant;
              }
              
              const user = await UserModel.findById(participant.userId).select('username fullName avatar');
              if (user) {
                return {
                  userId: participant.userId,
                  userName: user.fullName || user.username || participant.userName,
                  userAvatar: user.avatar || participant.userAvatar,
                };
              }
              return participant;
            } catch (error) {
              console.error('Error fetching user:', error);
              return participant;
            }
          })
        );
        
        return {
          ...conv.toObject(),
          participants: updatedParticipants,
        };
      })
    );
    
    res.json(populatedConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/api/messages/:messageId', async (req, res) => {
  const { messageId } = req.params;
  try {
    const deletedMessage = await MessageModel.findByIdAndDelete(messageId);
    if (!deletedMessage) {
      return res.status(404).json({ error: 'Message not found' });
    }

    io.to(deletedMessage.conversationId).emit('messageDeleted', { messageId });

    res.json({ message: 'Message deleted', messageId });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/api/conversations/:conversationId', async (req, res) => {
  const { conversationId } = req.params;
  try {
    await MessageModel.deleteMany({ conversationId });

    const deletedConv = await ConversationModel.findOneAndDelete({ conversationId });

    if (!deletedConv) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    io.to(conversationId).emit('conversationDeleted', { conversationId });

    res.json({ message: 'Conversation deleted', conversationId });
  } catch (error) {
    console.error('❌ Lỗi khi xoá cuộc hội thoại:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'vclock/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  },
});

const upload = multer({ 
  storage: storage, 
  limits: { fileSize: 1024 * 1024 * 10 }
});

app.use('/images', exp.static(path.join(__dirname, '..', 'duantn', 'public', 'images')));

const jwt = require('jsonwebtoken');
const User = mongoose.model('User', userSchema);

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Vui lòng đăng nhập' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token không hợp lệ' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== '1') {
    return res.status(403).json({ message: 'Không có quyền truy cập' });
  }
  next();
};

app.use(session({
  secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.post('/register', 
  body('email').isEmail().withMessage('Email không hợp lệ.'),
  body('password') .isLength({ min: 6, max: 15 }).withMessage('Mật khẩu phải có từ 6 đến 15 ký tự.')
  .matches(/^[A-Za-z0-9@]+$/).withMessage('Mật khẩu chỉ được chứa chữ cái, số và ký tự @.')
  .custom((value) => {
    if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
      throw new Error('Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số.');
    }
    return true;
  }),
  body('username').notEmpty().withMessage('Tên tài khoản không được để trống.'),
  async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { username, password, email } = req.body;
    let existUser = await User.findOne({ email });
    if (existUser && existUser.account_status === '1') {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }
     existUser = await User.findOne({ username });
    if (existUser) {
      return res.status(400).json({ message: 'Username đã được sử dụng' });
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    const emailVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const emailVerificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

    let savedUser;
    const existingUnverifiedUser = await User.findOne({ email, account_status: '0' });

    if (existingUnverifiedUser) {
      existingUnverifiedUser.username = username;
      existingUnverifiedUser.password_hash = password_hash;
      existingUnverifiedUser.emailVerificationCode = emailVerificationCode;
      existingUnverifiedUser.emailVerificationCodeExpires = emailVerificationCodeExpires;
      savedUser = await existingUnverifiedUser.save();
    } else {
      const newUser = new User({
        username,
        password_hash,
        email,
        emailVerificationCode,
        emailVerificationCodeExpires,
        account_status: '0',
        role: '0',
      });
      savedUser = await newUser.save();
    }

    const mailOptions = {
      from: `"V.CLOCK" <${process.env.EMAIL_USER}>`,
      to: savedUser.email,
      subject: 'Mã xác thực tài khoản V.CLOCK',
      html: `<p>Chào bạn,</p>
             <p>Cảm ơn bạn đã đăng ký tài khoản tại V.CLOCK. Mã xác thực của bạn là:</p>
             <h2 style="text-align:center;color:#d9534f;">${emailVerificationCode}</h2>
             <p>Mã này sẽ hết hạn trong 10 phút.</p>
             <p>Trân trọng,<br/>Đội ngũ V.CLOCK</p>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để lấy mã xác thực.',
      user: { email: savedUser.email } 
    });
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});
app.post('/request-password-reset',
  body('email').isEmail().withMessage('Email không hợp lệ.'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { email } = req.body;
      const user = await User.findOne({ email: email, account_status: '1' });

      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy tài khoản hoạt động với email này.' });
      }

      const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
      user.passwordResetToken = resetToken;
      user.passwordResetTokenExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      const mailOptions = {
        from: `"V.CLOCK" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Yêu cầu đặt lại mật khẩu cho tài khoản V.CLOCK',
        html: `<p>Chào bạn,</p>
               <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Mã OTP để đặt lại mật khẩu là:</p>
               <h2 style="text-align:center;color:#d9534f;">${resetToken}</h2>
               <p>Mã này sẽ hết hạn trong 10 phút. Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
               <p>Trân trọng,<br/>Đội ngũ V.CLOCK</p>`,
      };

      await transporter.sendMail(mailOptions);

      res.status(200).json({ message: 'Yêu cầu thành công. Vui lòng kiểm tra email để lấy mã OTP.' });

    } catch (error) {
      console.error('Lỗi yêu cầu đặt lại mật khẩu:', error);
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

app.post('/verify-email', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Vui lòng cung cấp email và mã OTP.' });
    }

    const user = await User.findOne({
      email: email,
      emailVerificationCode: otp,
      emailVerificationCodeExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Mã OTP không hợp lệ hoặc đã hết hạn.' });
    }

    user.account_status = '1';
    user.emailVerificationCode = null;
    user.emailVerificationCodeExpires = null;
    await user.save();
    
    res.status(200).json({ message: 'Xác thực email thành công!' });

  } catch (error) {
    console.error('Lỗi xác thực email:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    let user = await User.findOne({
       $or: [{ username: username }, { email: username }] 
      });

    if (!user) {
      return res.status(404).json({ message: 'Tài khoản không tồn tại' });
    }

    if (user.account_status !== '1') {
      return res.status(403).json({ message: 'Tài khoản của bạn chưa được xác thực. Vui lòng kiểm tra email.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu không đúng' });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '3d' }
    );

    const { password_hash: _, ...userWithoutPassword } = user.toObject();

    res.json({
      
      message: 'Đăng nhập thành công',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

app.post('/refresh-token', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || user.account_status !== '1') {
      return res.status(401).json({ message: 'Tài khoản không hợp lệ' });
    }
    
    const newToken = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '3d' }
    );
    
    const { password_hash: _, ...userWithoutPassword } = user.toObject();
    
    res.json({ 
      token: newToken, 
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi refresh token' });
  }
});

app.post('/reset-password',
  body('email').isEmail().withMessage('Email không hợp lệ.'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('Mã OTP phải có 6 chữ số.'),
  body('newPassword')
  .isLength({ min: 6, max: 15 }).withMessage('Mật khẩu mới phải có từ 6 đến 15 ký tự.')
  .matches(/^[A-Za-z0-9@]+$/).withMessage('Mật khẩu mới chỉ được chứa chữ cái, số và ký tự @.')
  .custom((value) => {
    if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
      throw new Error('Mật khẩu mới phải chứa ít nhất 1 chữ cái và 1 số.');
    }
    return true;
  }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }
      
      const { email, otp, newPassword } = req.body;

      const user = await User.findOne({
        email: email,
        passwordResetToken: otp,
        passwordResetTokenExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({ message: 'Mã OTP không hợp lệ hoặc đã hết hạn.' });
      }

      const saltRounds = 10;
      user.password_hash = await bcrypt.hash(newPassword, saltRounds);
      user.passwordResetToken = null;
      user.passwordResetTokenExpires = null;
      await user.save();

      res.status(200).json({ message: 'Mật khẩu đã được đặt lại thành công. Bạn có thể đăng nhập ngay bây giờ.' });

    } catch (error) {
      console.error('Lỗi đặt lại mật khẩu:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

app.put('/user/profile/update', verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    const { fullname, email, phone_number, address } = req.body;
    const userId = req.user.userId;

    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    if (email && email !== userToUpdate.email) {
      const existingUserWithNewEmail = await User.findOne({ email: email, _id: { $ne: userId } });
      if (existingUserWithNewEmail) {
        return res.status(400).json({ message: 'Email này đã được sử dụng bởi tài khoản khác.' });
      }
      userToUpdate.email = email;
    }

    if (fullname) userToUpdate.fullName = fullname;
    if (phone_number) userToUpdate.phone_number = phone_number;
    if (address) userToUpdate.address = address;

    if (req.file) {
      if (userToUpdate.avatar && !userToUpdate.avatar.startsWith('http')) {
        const oldAvatarPath = path.join(avatarUploadPath, userToUpdate.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          try {
            fs.unlinkSync(oldAvatarPath);
          } catch (err) {
            console.error("Lỗi xóa ảnh cũ:", err);
          }
        }
      }
      userToUpdate.avatar = req.file.path;
    }

    const updatedUser = await userToUpdate.save();

    const { password_hash: _, ...userWithoutPassword } = updatedUser.toObject();
    res.json({
      message: 'Cập nhật thông tin thành công',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error("Lỗi cập nhật hồ sơ:", error);
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
        return res.status(400).json({ message: 'Email này đã được sử dụng.' });
    }
    if (error.message.includes('Chỉ chấp nhận file ảnh')) {
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi server khi cập nhật thông tin', error: error.message });
  }
});

app.get('/user/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    const { password_hash: _, ...userWithoutPassword } = user.toObject();
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

app.get("/", (req, res) => {res.json("{'thongbao':'API NodeJS'}")});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign(
      { userId: req.user._id, username: req.user.username, role: req.user.role },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '3d' }
    );
    const frontendUrl = process.env.CORS_ORIGIN?.split(',')[0];
    res.redirect(`${frontendUrl}/auth/google/success?token=${token}`);
  }
);

app.get('/auth/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login', session: false }),
  (req, res) => {
    const token = jwt.sign(
      { userId: req.user._id, username: req.user.username, role: req.user.role },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '3d' }
    );
    const frontendUrl = process.env.CORS_ORIGIN?.split(',')[0];
    res.redirect(`${frontendUrl}/auth/facebook/success?token=${token}`);
  }
);

app.post('/auth/facebook/delete-data', async (req, res) => {
  const signedRequest = req.body.signed_request;
  if (!signedRequest) {
    return res.status(400).send('Invalid request');
  }

  try {
    const [encodedSig, payload] = signedRequest.split('.');
    const sig = Buffer.from(encodedSig.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
    const data = JSON.parse(Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString());

    const crypto = require('crypto');
    const expectedSig = crypto.createHmac('sha256', process.env.FACEBOOK_APP_SECRET).update(payload).digest();

    if (!crypto.timingSafeEqual(sig, expectedSig)) {
      console.error('Facebook Deletion Callback: Chữ ký không hợp lệ.');
      return res.status(400).send('Invalid signature');
    }

    const userIdToDelete = data.user_id;
    await User.findOneAndDelete({ facebookId: userIdToDelete });

    const confirmationCode = `delete_confirm_${userIdToDelete}`;
    res.json({
      url: `${SERVER_URL}/auth/facebook/deletion-status/${confirmationCode}`,
      confirmation_code: confirmationCode,
    });

  } catch (error) {
    console.error('Lỗi xử lý xóa dữ liệu Facebook:', error);
    res.status(500).send('An error occurred');
  }
});

app.get('/auth/facebook/deletion-status/:confirmation_code', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(`
        <html>
            <head><title>Data Deletion Status</title></head>
            <body>
                <h2>Yêu cầu xóa dữ liệu của bạn đã được xử lý.</h2>
                <p>Tất cả dữ liệu liên quan đến tài khoản của bạn trên ứng dụng của chúng tôi đã được xóa thành công.</p>
                <p>Mã xác nhận của bạn: ${req.params.confirmation_code}</p>
            </body>
        </html>
    `);
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.post('/api/contact',
    body('name').notEmpty().withMessage('Tên không được để trống.'),
    body('email').isEmail().withMessage('Email không hợp lệ.'),
    body('message').notEmpty().withMessage('Nội dung tin nhắn không được để trống.'),
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ message: errors.array()[0].msg });
        }

        const { name, email, phone, company, message } = req.body;

        const adminMailOptions = {
          from: `"V.CLOCK Contact Form" <${process.env.EMAIL_USER}>`,
          to: process.env.EMAIL_USER,
          subject: 'Tin nhắn liên hệ mới từ V.CLOCK',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #d9534f; border-bottom: 2px solid #d9534f; padding-bottom: 10px;">
                Tin Nhắn Liên Hệ Mới
              </h2>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 0;">Thông Tin Người Gửi:</h3>
                <p><strong>Họ và Tên:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                ${phone ? `<p><strong>Số Điện Thoại:</strong> ${phone}</p>` : ''}
                ${company ? `<p><strong>Công Ty:</strong> ${company}</p>` : ''}
              </div>

              <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <h3 style="color: #333; margin-top: 0;">Nội Dung Tin Nhắn:</h3>
                <p style="line-height: 1.6; white-space: pre-wrap;">${message}</p>
              </div>

              <div style="margin-top: 20px; padding: 15px; background-color: #e9ecef; border-radius: 8px;">
                <p style="margin: 0; color: #666; font-size: 14px;">
                  <strong>Thời gian:</strong> ${new Date().toLocaleString('vi-VN')}<br>
                  <strong>IP:</strong> ${req.ip}<br>
                  <strong>User Agent:</strong> ${req.get('User-Agent')}
                </p>
              </div>
            </div>
          `,
        };

        const customerMailOptions = {
          from: `"V.CLOCK" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: 'Xác nhận tin nhắn liên hệ - V.CLOCK',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #d9534f; border-bottom: 2px solid #d9534f; padding-bottom: 10px;">
                Xác Nhận Tin Nhắn Liên Hệ
              </h2>
              
              <p>Chào <strong>${name}</strong>,</p>
              
              <p>Cảm ơn bạn đã liên hệ với V.CLOCK. Chúng tôi đã nhận được tin nhắn của bạn và sẽ phản hồi trong thời gian sớm nhất.</p>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 0;">Thông Tin Tin Nhắn:</h3>
                <p><strong>Thời gian gửi:</strong> ${new Date().toLocaleString('vi-VN')}</p>
                <p><strong>Nội dung:</strong></p>
                <div style="background-color: #fff; padding: 15px; border: 1px solid #ddd; border-radius: 5px; margin-top: 10px;">
                  <p style="line-height: 1.6; white-space: pre-wrap; margin: 0;">${message}</p>
                </div>
              </div>

              <p>Nếu bạn có bất kỳ câu hỏi nào khác, vui lòng liên hệ với chúng tôi qua:</p>
              <ul>
                <li>Email: contact@vclock.vn</li>
                <li>Điện thoại: 0909 123 456</li>
                <li>Địa chỉ: 1073/23 Cách Mạng Tháng 8, Phường 7, Quận Tân Bình, TP. Hồ Chí Minh</li>
              </ul>

              <p style="margin-top: 30px; color: #666; font-size: 14px;">
                Trân trọng,<br>
                <strong>Đội ngũ V.CLOCK</strong>
              </p>
            </div>
          `,
        };

        await Promise.all([
          transporter.sendMail(adminMailOptions),
          transporter.sendMail(customerMailOptions)
        ]);

        res.status(200).json({ 
          message: 'Tin nhắn của bạn đã được gửi thành công! Chúng tôi sẽ liên hệ lại sớm.',
          success: true 
        });

      } catch (error) {
        console.error('Lỗi form liên hệ:', error);
        res.status(500).json({ 
          message: 'Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.',
          error: error.message 
        });
      }
  });

const client_id = process.env.client_id;
const api_key = process.env.api_key;
const checksum_key = process.env.checksum_key;

const PayOS = require('@payos/node');

const payos = new PayOS(client_id,api_key,checksum_key);
app.use(exp.static('public'));

const TempOrderSchema = require("./model/schemaTempOrder");

const TempOrderModel = conn.model("TempOrders", TempOrderSchema);

const SERVER_URL = process.env.SERVER_URL;

app.post("/create-payment-link", verifyOptionalToken, async (req, res) => {
  try {
    const { orderData, amount, description, orderCode } = req.body;
    const user_id = req.user?.userId || null;
    if (orderData.cart && orderData.cart.length > 0) {
      const stockCheckPromises = orderData.cart.map(async (item) => {
        const product = await ProductModel.findById(item._id).select('name quantity');
        if (!product) {
          return { 
            productId: item._id, 
            error: true, 
            message: `Sản phẩm không tồn tại` 
          };
        }
        
        if (product.quantity < item.so_luong) {
          return { 
            productId: item._id, 
            productName: product.name,
            error: true, 
            message: `Chỉ còn ${product.quantity} sản phẩm "${product.name}" trong kho`,
            availableQuantity: product.quantity,
            requestedQuantity: item.so_luong
          };
        }
        
        return { 
          productId: item._id, 
          productName: product.name,
          error: false, 
          availableQuantity: product.quantity 
        };
      });

      const stockCheckResults = await Promise.all(stockCheckPromises);
      const stockErrors = stockCheckResults.filter(result => result.error);

      if (stockErrors.length > 0) {
        const errorMessages = stockErrors.map(error => error.message);
        return res.status(400).json({ 
          message: "Một số sản phẩm không đủ tồn kho", 
          errors: stockErrors,
          details: errorMessages.join(', ')
        });
      }
    }

    const fullOrderData = {
      ...orderData,
      user_id 
    };

    const tempOrder = await TempOrderModel.create({
      orderCode,
      orderData: fullOrderData, 
      created_at: new Date()
    });

    const orderCodeStr = String(orderCode || '');
    const numericOrderCode = parseInt(orderCodeStr.replace(/\D/g, '')) || Date.now();
    
    const order = {
      amount: amount, //
      description: description || `Thanh toán đơn hàng ${orderCode}`,
      orderCode: numericOrderCode,
      returnUrl: `${process.env.CORS_ORIGIN?.split(',')[0]}/checkout-success`,
      cancelUrl: `${process.env.CORS_ORIGIN?.split(',')[0]}/checkout-cancel`,
    };

    if (!client_id || !api_key || !checksum_key) {
      return res.json({ 
        checkoutUrl: `${process.env.CORS_ORIGIN?.split(',')[0]}/checkout-success?orderCode=${orderCode}&status=success` 
      });
    }

    const paymentLink = await payos.createPaymentLink(order);

    res.json({ checkoutUrl: paymentLink.checkoutUrl });
  } catch (err) {
    console.error("Lỗi tạo payment link:", err);
    res.status(500).json({ 
      success: false, 
      message: "Lỗi tạo link thanh toán",
      error: err.message 
    });
  }
});


app.get("/api/order-status/:orderCode", async (req, res) => {
  try {
    const { orderCode } = req.params;
    const tempOrder = await TempOrderModel.findOne({ orderCode });
    
    const realOrder = await OrderModel.findOne({ orderCode });

    const result = {
      orderCode,
      hasTempOrder: !!tempOrder,
      hasRealOrder: !!realOrder,
      tempOrder: tempOrder ? {
        id: tempOrder._id,
        created_at: tempOrder.created_at,
        orderData: tempOrder.orderData
      } : null,
      realOrder: realOrder ? {
        id: realOrder._id,
        order_status: realOrder.order_status,
        created_at: realOrder.created_at,
        total_amount: realOrder.total_amount
      } : null
    };

    res.json(result);
  } catch (err) {
    console.error("Lỗi kiểm tra trạng thái đơn hàng:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

app.post("/api/payment-success", verifyOptionalToken, async (req, res) => {
  try {
    const { orderCode } = req.body;
    const user_id = req.user?.userId || null;

    if (!orderCode) {
      return res.status(400).json({ message: "Thiếu orderCode" });
    }
    const existingOrder = await OrderModel.findOne({ orderCode });
    if (existingOrder) {
      return res.json({ 
        message: "Đơn hàng đã được xử lý", 
        order_id: existingOrder._id,
        order_status: existingOrder.order_status
      });
    }

    let temp = await TempOrderModel.findOne({ orderCode });
    if (!temp) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }
    const orderData = temp.orderData;
    let finalAddressId = orderData.address_id;

    if (!orderData.address_id && orderData.new_address) {
      const addr = await AddressModel.create({
        ...orderData.new_address,
        user_id: orderData.user_id || null,
        created_at: new Date(),
        updated_at: new Date()
      });
      finalAddressId = addr._id;
    }

    const newOrder = await OrderModel.create({
      user_id: orderData.user_id || null,
      orderCode,
      voucher_id: orderData.voucher_id || null,
      address_id: finalAddressId,
      payment_method_id: orderData.payment_method_id,
      shipping_fee: 0,
      note: orderData.note || "",
      total_amount: orderData.total_amount,
      discount_amount: orderData.discount_amount || 0,
      order_status: "processing",
      payment_status: "paid",
      created_at: new Date(),
      updated_at: new Date()
    });

    if (orderData.user_id) {
      await createOrderNotification(orderData.user_id, newOrder._id, 'processing', newOrder.orderCode);
    }

    if (orderData.voucher_id && orderData.user_id) {
      await VoucherUserModel.updateOne({ voucher_id: orderData.voucher_id, user_id: orderData.user_id }, { $set: { used: true } });
    }

    const items = orderData.cart.map(i => ({
      order_id: newOrder._id,
      product_id: i._id,
      quantity: i.so_luong,
      price: i.sale_price > 0 ? i.sale_price : i.price
    }));

    await OrderDetailModel.insertMany(items);
    const stockUpdatePromises = orderData.cart.map(async (item) => {
      await ProductModel.findByIdAndUpdate(
        item._id,
        { $inc: { quantity: -item.so_luong } }
      );
    });

    await Promise.all(stockUpdatePromises);
    await TempOrderModel.findByIdAndDelete(temp._id);

    res.json({ 
      message: "Xử lý thanh toán thành công", 
      order_id: newOrder._id 
    });
  } catch (err) {
    console.error("Lỗi xử lý payment success:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

app.post("/receive-hook", async (req, res) => {
  const data = req.body?.data;
  const status = req.body?.code;

  if (status !== "00") {
    return res.status(200).json({ message: "Bỏ qua trạng thái không thành công" });
  }

  const orderCode = data?.orderCode;
  const transactionId = data?.transactionId;

  if (!orderCode) {
    return res.status(400).json({ message: "Thiếu orderCode trong webhook" });
  }

  

  try {
    let temp = await TempOrderModel.findOne({ orderCode });
    if (!temp && transactionId) {
      temp = await TempOrderModel.findOne({ 
        "orderData.orderCode": transactionId 
      });
    }
    if (!temp) {
      temp = await TempOrderModel.findOne({ 
        orderCode: String(orderCode) 
      });
    }

    if (!temp) {
      return res.status(404).json({ message: "Không tìm thấy đơn tạm" });
    }

    const orderData = temp.orderData;
    let finalAddressId = orderData.address_id;

    if (!orderData.address_id && orderData.new_address) {
      const addr = await AddressModel.create({
        ...orderData.new_address,
        user_id: orderData.user_id || null,
        created_at: new Date(),
        updated_at: new Date()
      });
      finalAddressId = addr._id;
    }

    const newOrder = await OrderModel.create({
      user_id: orderData.user_id || null,
      orderCode,
      voucher_id: orderData.voucher_id || null,
      address_id: finalAddressId,
      payment_method_id: orderData.payment_method_id,
      shipping_fee: 0,
      note: orderData.note || "",
      total_amount: orderData.total_amount,
      discount_amount: orderData.discount_amount || 0,
      order_status: "processing",
      payment_status: "paid",
      created_at: new Date(),
      updated_at: new Date()
    });

    if (orderData.user_id) {
      await createOrderNotification(orderData.user_id, newOrder._id, 'processing', newOrder.orderCode);
    }

    if (orderData.voucher_id && orderData.user_id) {
      await VoucherUserModel.updateOne({ voucher_id: orderData.voucher_id, user_id: orderData.user_id }, { $set: { used: true } });
    }

    const items = orderData.cart.map(i => ({
      order_id: newOrder._id,
      product_id: i._id,
      quantity: i.so_luong,
      price: i.sale_price > 0 ? i.sale_price : i.price
    }));

    await OrderDetailModel.insertMany(items);
    const stockUpdatePromises = orderData.cart.map(async (item) => {
      await ProductModel.findByIdAndUpdate(
        item._id,
        { $inc: { quantity: -item.so_luong } }
      );
    });

    await Promise.all(stockUpdatePromises);
    await TempOrderModel.findByIdAndDelete(temp._id);
    
    res.status(200).json({ message: "Tạo đơn hàng thành công" });
  } catch (err) {
    console.error("Lỗi xử lý webhook:", err);
    res.status(500).json({ message: "Lỗi xử lý webhook" });
  }
});

app.post("/api/checkout", verifyOptionalToken, async (req, res) => {
  try {
    const { orderCode, orderData } = req.body;

    if (!orderData) {
      return res.status(400).json({ message: "Thiếu dữ liệu đơn hàng (orderData)." });
    }

    const {
      cart,
      address_id,
      new_address,
      payment_method_id,
      voucher_id,
      discount_amount,
      note,
      total_amount
    } = orderData;

    const user_id = req.user?.userId || null;

    if (!cart || cart.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng không được để trống." });
    }

    if (!payment_method_id || !total_amount) {
      return res.status(400).json({ message: "Thiếu phương thức thanh toán hoặc tổng tiền." });
    }
    const stockCheckPromises = cart.map(async (item) => {
      const product = await ProductModel.findById(item._id).select('name quantity');
      if (!product) {
        return { 
          productId: item._id, 
          error: true, 
          message: `Sản phẩm không tồn tại` 
        };
      }
      
      if (product.quantity < item.so_luong) {
        return { 
          productId: item._id, 
          productName: product.name,
          error: true, 
          message: `Chỉ còn ${product.quantity} sản phẩm "${product.name}" trong kho`,
          availableQuantity: product.quantity,
          requestedQuantity: item.so_luong
        };
      }
      
      return { 
        productId: item._id, 
        productName: product.name,
        error: false, 
        availableQuantity: product.quantity 
      };
    });

    const stockCheckResults = await Promise.all(stockCheckPromises);
    const stockErrors = stockCheckResults.filter(result => result.error);

    if (stockErrors.length > 0) {
      const errorMessages = stockErrors.map(error => error.message);
      return res.status(400).json({ 
        message: "Một số sản phẩm không đủ tồn kho", 
        errors: stockErrors,
        details: errorMessages.join(', ')
      });
    }

    let finalAddressId = address_id;

    if (!address_id && new_address) {
      if (!new_address.name || !new_address.phone || !new_address.address) {
        return res.status(400).json({ message: "Thiếu thông tin địa chỉ giao hàng." });
      }
      
      const newAddr = await AddressModel.create({
        receiver_name: new_address.name,
        phone: new_address.phone,
        address: new_address.address,
        user_id: user_id || null,
        created_at: new Date(),
        updated_at: new Date()
      });
      finalAddressId = newAddr._id;
    }

    if (!finalAddressId) {
      return res.status(400).json({ message: "Thiếu địa chỉ giao hàng." });
    }
    const paymentMethod = await PaymentMethodModel.findById(payment_method_id);
    const isCOD = paymentMethod?.code === 'COD';
    
    const newOrder = await OrderModel.create({
      orderCode: orderCode || null,
      user_id: user_id || null,
      voucher_id: voucher_id || null,
      address_id: finalAddressId,
      payment_method_id: payment_method_id,
      shipping_fee: 0,
      note: note || "",
      total_amount: total_amount,
      discount_amount: discount_amount || 0,
      order_status: isCOD ? "pending" : "processing",
      payment_status: isCOD ? "unpaid" : "paid",
      created_at: new Date(),
      updated_at: new Date()
    });

    if (user_id) {
      const notificationStatus = isCOD ? 'pending' : 'processing';
      await createOrderNotification(user_id, newOrder._id, notificationStatus, newOrder.orderCode);
    }

    if (voucher_id && user_id) {
      await VoucherUserModel.updateOne({ voucher_id, user_id }, { $set: { used: true } });
    }
    const orderItems = cart.map((item) => ({
      order_id: newOrder._id,
      product_id: item._id,
      quantity: item.so_luong,
      price: item.sale_price > 0 ? item.sale_price : item.price
    }));

    await OrderDetailModel.insertMany(orderItems);
    const stockUpdatePromises = cart.map(async (item) => {
      await ProductModel.findByIdAndUpdate(
        item._id,
        { $inc: { quantity: -item.so_luong } }
      );
    });

    await Promise.all(stockUpdatePromises);

    return res.status(200).json({ message: "Đặt hàng thành công", order_id: newOrder._id });
  } catch (err) {
    console.error("Lỗi khi tạo đơn hàng:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
});

app.post('/checkout/addresses', verifyOptionalToken, async (req, res) => {
  try {
    const { receiver_name, phone, address } = req.body;
    const userId = req.user?.userId || null;

    if (!receiver_name || !phone || !address) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    }

    if (userId) {
      const existingAddress = await AddressModel.findOne({
        user_id: userId,
        receiver_name: receiver_name,
        phone: phone,
        address: address
      });

      if (existingAddress) {
        return res.status(200).json({ 
          success: true, 
          address: existingAddress,
          message: 'Địa chỉ đã tồn tại'
        });
      }
    }

    const newAddress = new AddressModel({
      user_id: userId,
      receiver_name,
      phone,
      address,
      created_at: new Date(),
      updated_at: new Date()
    });

    const savedAddress = await newAddress.save();
    return res.status(201).json({ success: true, address: savedAddress });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

app.get('/api/products/stock-info', async (req, res) => {
  try {
    const { productIds } = req.query;
    
    if (!productIds) {
      return res.status(400).json({ message: "Thiếu productIds" });
    }

    const ids = Array.isArray(productIds) ? productIds : [productIds];
    const products = await ProductModel.find(
      { _id: { $in: ids } },
      { _id: 1, name: 1, quantity: 1 }
    );

    const stockInfo = products.reduce((acc, product) => {
      acc[product._id.toString()] = {
        name: product.name,
        quantity: product.quantity
      };
      return acc;
    }, {});

    res.json({ stockInfo });
  } catch (err) {
    console.error("Lỗi khi lấy thông tin tồn kho:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

app.get('/api/product/price-range', async (req, res) => {
  try {
    const products = await ProductModel.find({}, { price: 1, sale_price: 1 });
    let minPrice = null;
    let maxPrice = null;
    products.forEach(p => {
      const price = (p.sale_price && p.sale_price > 0) ? p.sale_price : p.price;
      if (minPrice === null || (price < minPrice && price > 0)) {
        minPrice = price;
      }
      if (maxPrice === null || price > maxPrice) {
        maxPrice = price;
      }
    });
    res.json({ minPrice: minPrice || 0, maxPrice: maxPrice || 0 });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi lấy khoảng giá', details: err.message });
  }
});

app.get('/api/product/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID không hợp lệ' });
  }

  const objectId = new ObjectId(id);

  try {
    const product = await ProductModel.aggregate([
      { $match: { _id: objectId } },
      {
        $lookup: {
          from: 'product_images',
          let: { pid: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$product_id', '$$pid'] }
              }
            },
            {
              $project: {
                _id: 1,
                image: 1,
                alt: 1,
                is_main: 1
              }
            }
          ],
          as: 'images'
        }
      },
      {
        $addFields: {
          main_image: {
            $arrayElemAt: [
              {
                $map: {
                  input: {
                    $filter: {
                      input: '$images',
                      as: 'img',
                      cond: { $eq: ['$$img.is_main', true] }
                    }
                  },
                  as: 'm',
                  in: { image: '$$m.image', alt: '$$m.alt' },
                }
              },
              0
            ]
          }
        }
      },
      {
        $lookup: {
          from: 'brands',
          localField: 'brand_id',
          foreignField: '_id',
          as: 'brand'
        }
      },
      { $unwind: '$brand' },
      {
        $match: {
          'brand.brand_status': 0
        }
      },

      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          price: 1,
          sale_price: 1,
          quantity: 1,
          views: 1,

          status: 1,
          sex: 1,
          case_diameter: 1,
          style: 1,
          features: 1,
          water_resistance: 1,
          thickness: 1,
          color: 1,
          machine_type: 1,
          strap_material: 1,
          case_material: 1,
          created_at: 1,
          updated_at: 1,
          main_image: 1,
          images: 1,
          brand: {
            _id: 1,
            name: 1
          }
        }
      }
    ]);

    if (product.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    }

    const productData = product[0];
    const slug = slugify(productData.name, { lower: true, locale: 'vi' });

    res.json({
      ...productData,
      slug: `${slug}-${productData._id}`,
    });    
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ', details: err.message });
  }
});
app.post('/api/product/:id/increment-view', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID không hợp lệ' });
    }

    const objectId = new ObjectId(id);
    
    const product = await ProductModel.findById(objectId);
    if (!product) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    }

    const result = await ProductModel.findByIdAndUpdate(
      objectId,
      { $inc: { views: 1 } },
      { new: true }
    );

    res.json({ 
      success: true,
      message: 'Đã tăng lượt xem',
      views: result.views 
    });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi tăng lượt xem', details: err.message });
  }
});

app.get('/api/products/top-rated', async function(req, res) {
    const limit = parseInt(req.query.limit) || 6;
    
    try {
      const topRatedProducts = await ProductModel.aggregate([
        {
          $lookup: {
            from: 'order_details',
            localField: '_id',
            foreignField: 'product_id',
            as: 'order_details'
          }
        },
        {
          $lookup: {
            from: 'reviews',
            let: { orderDetailIds: '$order_details._id' },
            pipeline: [
              {
                $match: {
                  $expr: { $in: ['$order_detail_id', '$$orderDetailIds'] }
                }
              }
            ],
            as: 'reviews'
          }
        },
        {
          $addFields: {
            averageRating: {
              $cond: {
                if: { $gt: [{ $size: '$reviews' }, 0] },
                then: { $avg: '$reviews.rating' },
                else: 0
              }
            },
            reviewCount: { $size: '$reviews' }
          }
        },
        {
          $lookup: {
            from: 'product_images',
            let: { productId: '$_id' },
            pipeline: [
              { $match: { $expr: { $and: [
                { $eq: ['$product_id', '$$productId'] },
                { $eq: ['$is_main', true] }
              ] } } },
              { $project: { image: 1, alt: 1, _id: 0 } }
            ],
            as: 'main_image'
          }
        },
        {
          $addFields: {
            main_image: { $arrayElemAt: ['$main_image', 0] }
          }
        },
        {
          $lookup: {
            from: 'brands',
            localField: 'brand_id',
            foreignField: '_id',
            as: 'brand'
          }
        },
        { $unwind: '$brand' },
        {
          $match: {
            'brand.brand_status': 0,
            status: 0,
            quantity: { $gt: 0 }
          }
        },
        {
          $sort: { averageRating: -1, reviewCount: -1 }
        },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            name: 1,
            price: 1,
            sale_price: 1,
            quantity: 1,
            averageRating: { $round: ['$averageRating', 1] },
            reviewCount: 1,
            main_image: 1,
            brand: {
              _id: 1,
              name: 1
            }
          }
        }
      ]);
  
      res.json(topRatedProducts);
    }
    catch (err) {
      res.status(500).json({ error: 'Lỗi lấy sản phẩm được đánh giá cao', details: err });
    }
});

app.get('/api/sp_filter', async (req, res) => {
  const { category, brand, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;
  let filter = {};

  try {
    if (category && category !== 'Tất cả') {
      const categoryObj = await CategoryModel.findOne({ name: category });
      if (categoryObj) {
        const productCategories = await ProductCategoriesModel.find({ category_id: categoryObj._id });
        const productIds = productCategories.map(pc => new mongoose.Types.ObjectId(pc.product_id));
        filter._id = { $in: productIds };
      } else {
        return res.json({ products: [], total: 0, totalPages: 0, currentPage: 1 });
      }
    }

    if (brand) {
      const brandObj = await BrandModel.findOne({ name: brand });
      if (brandObj) {
        filter.brand_id = brandObj._id;
      } else {
        return res.json({ products: [], total: 0, totalPages: 0, currentPage: 1 });
      }
    }

    if (minPrice || maxPrice) {
      const minPriceNum = minPrice ? Number(minPrice) : 0;
      const maxPriceNum = maxPrice ? Number(maxPrice) : Number.MAX_SAFE_INTEGER;

      filter.$or = [

        {
          $and: [
            { sale_price: { $gt: 0 } },
            { sale_price: { $gte: minPriceNum, $lte: maxPriceNum } }
          ]
        },

        {
          $and: [
            { $or: [{ sale_price: 0 }, { sale_price: null }] },
            { price: { $gte: minPriceNum, $lte: maxPriceNum } }
          ]
        }
      ];
    }
    
    let sortOption = {};
    if (sort === 'price-asc') {

      sortOption = {
        $addFields: {
          sortPrice: {
            $cond: {
              if: { $gt: ['$sale_price', 0] },
              then: '$sale_price',
              else: '$price'
            }
          }
        }
      };
    } else if (sort === 'price-desc') {

      sortOption = {
        $addFields: {
          sortPrice: {
            $cond: {
              if: { $gt: ['$sale_price', 0] },
              then: '$sale_price',
              else: '$price'
            }
          }
        }
      };
    } else {
      sortOption = { _id: 1 };
    }

    const pageNum = Math.max(parseInt(page), 1);
    const limitNum = Math.max(parseInt(limit), 1);
    const skip = (pageNum - 1) * limitNum;

    const total = await ProductModel.countDocuments(filter);
let aggregationPipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'product_images',
          let: { productId: '$_id' },
          pipeline: [
            { $match: { $expr: { $and: [
              { $eq: ['$product_id', '$$productId'] },
              { $eq: ['$is_main', true] }
            ] } } },
            { $project: { image: 1, alt: 1, _id: 1 } }
          ],
          as: 'main_image'
        }
      },
      {
        $lookup: {
          from: 'brands',
          localField: 'brand_id',
          foreignField: '_id',
          as: 'brand'
        }
      },
      { $unwind: '$brand' },
      { $match: { 'brand.brand_status': 0 } },
      { $addFields: { main_image: { $arrayElemAt: ['$main_image', 0] } } }
    ];

    if (sort === 'price-asc' || sort === 'price-desc') {
      aggregationPipeline.push({
        $addFields: {
          sortPrice: {
            $cond: {
              if: { $gt: ['$sale_price', 0] },
              then: '$sale_price',
              else: '$price'
            }
          }
        }
      });
      aggregationPipeline.push({ $sort: { sortPrice: sort === 'price-asc' ? 1 : -1 } });
    } else {
      aggregationPipeline.push({ $sort: { _id: 1 } });
    }

    aggregationPipeline.push({ $skip: skip });
    aggregationPipeline.push({ $limit: limitNum });
    aggregationPipeline.push({
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        price: 1,
        sale_price: 1,
        status: 1,
        quantity: 1,
        views: 1,
        sex: 1,
        case_diameter: 1,
        style: 1,
        features: 1,
        water_resistance: 1,
        thickness: 1,
        color: 1,
        machine_type: 1,
        strap_material: 1,
        case_material: 1,
        created_at: 1,
        updated_at: 1,
        main_image: {
          _id: 1,
          image: 1,
          alt: 1
        },
        brand: {
          _id: 1,
          name: 1
        }
      }
    });

    const products = await ProductModel.aggregate(aggregationPipeline);
    
    res.json({
      products,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum
    });
  } catch (err) {
    console.error('Lỗi lọc sản phẩm:', err);
    res.status(500).json({ error: 'Lỗi lọc sản phẩm', details: err });
  }
});

app.get('/api/sp_moi', async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;

  try {
    const products = await ProductModel.aggregate([
      {
        $lookup: {
          from: 'product_images',
          let: { productId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$product_id', '$$productId'] },
                    { $eq: ['$is_main', true] }
                  ]
                }
              }
            },
            {
              $project: {
                image: 1,
                alt: 1,
                _id: 1
              }
            }
          ],
          as: 'main_image'
        }
      },
      {$lookup: {
        from: 'brands',
        localField: 'brand_id',
        foreignField: '_id',
        as: 'brand'
        }
      },
      { $unwind: '$brand' },
      { $match: { 'brand.brand_status': 0 } },
      { $sort: { created_at: -1 } },
      { $addFields: { main_image: { $arrayElemAt: ['$main_image', 0] } } },
      { $limit: limit },
    {
      $project: {
        _id: 1,
        name: 1,
        price: 1,
        sale_price: 1,
        created_at: 1,
        views: 1,
        quantity: 1,
        main_image: {
          _id: 1,
          image: 1,
          alt: 1
        },
        brand: {
          _id: 1,
          name: 1
        },
      }
    }
    ]);

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi lấy sản phẩm', details: err });
  }
});

app.get('/api/sp_giam_gia', async function(req, res) {
const limit = parseInt(req.query.limit, 10) || 10;
try {
  const products = await ProductModel.aggregate([
    {
      $match: { sale_price: { $gt: 0 } }
    },
    {
      $lookup: {
        from: 'product_images',
        let: { productId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$product_id', '$$productId'] },
                  { $eq: ['$is_main', true] }
                ]
              }
            }
          },
          {
            $project: {
              image: 1,
              alt: 1,
              _id: 1
            }
          }
        ],
        as: 'main_image'
      }
    },
    {$lookup: {
      from: 'brands',
      localField: 'brand_id',
      foreignField: '_id',
      as: 'brand'
      }
    },
    { $unwind: '$brand' },
    { $match: { 'brand.brand_status': 0 } },
    { $addFields: { main_image: { $arrayElemAt: ['$main_image', 0] } } },
      {
        $sort: { sale_price: 1 }
      },
      { $limit: limit },
    {
      $project: {
        _id: 1,
        name: 1,
        price: 1,
        sale_price: 1,
        created_at: 1,
        views: 1,
        quantity: 1,
        main_image: {
          _id: 1,
          image: 1,
          alt: 1
        },
        brand: {
          _id: 1,
          name: 1
        },
      }
    }
    ]);

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi lấy sản phẩm giảm giá', details: err });
  }
});

app.get('/api/sp_lien_quan/:id', async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 5;
  const productId = new ObjectId(req.params.id);

  try {
    const product = await ProductModel.findById(productId).lean();
    if (!product) {
      return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
    }

    const brandObjectId = new ObjectId(product.brand_id);

    const relatedProducts = await ProductModel.aggregate([
      {
        $match: {
          brand_id: brandObjectId,
          _id: { $ne: productId }
        }
      },
      {
        $lookup: {
          from: 'product_images',
          let: { pid: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$product_id', '$$pid'] },
                    { $eq: ['$is_main', true] }
                  ]
                }
              }
            },
            {
              $project: {
                _id: 1,
                image: 1,
                alt: 1
              }
            }
          ],
          as: 'main_image'
        }
      },
      {
        $lookup: {
          from: 'brands',
          localField: 'brand_id',
          foreignField: '_id',
          as: 'brand'
        }
      },
      { $unwind: '$brand' },
      { $match: { 'brand.brand_status': 0 } },
      {
        $addFields: {
          main_image: { $arrayElemAt: ['$main_image', 0] }
        }
      },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          name: 1,
          price: 1,
          sale_price: 1,
          created_at: 1,
          views: 1,
          quantity: 1,
          main_image: {
            _id: 1,
            image: 1,
            alt: 1
          },
          brand: {
            _id: 1,
            name: 1
          }
        }
      }
    ]);

    res.json(relatedProducts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi lấy sản phẩm liên quan', details: err });
  }
});

app.get('/api/brand', async function (req, res) {
  try {
    const brandsWithProductCount = await BrandModel.aggregate([
      {
        $match: {
          brand_status: 0  
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'brand_id',
          as: 'products'
        }
      },
      {
        $addFields: {
          productCount: { $size: '$products' }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          alt: 1,
          brand_status: 1,
          productCount: 1,
          created_at: 1,
          updated_at: 1
        }
      }
    ]);

    res.json(brandsWithProductCount);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi lấy danh sách thương hiệu', details: err.message });
  }
});

app.get('/api/category', async (req, res) => {
  try {
    const categories = await CategoryModel.find({ category_status: 0 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi lấy danh mục', details: err });
  }
});

app.put('/api/user/addresses/:id/set-default', verifyToken, async (req, res) => {
  const userId = req.user.userId;
  const addressId = req.params.id;

  try {

    const address = await AddressModel.findOne({ _id: addressId, user_id: userId });
    if (!address) {
      return res.status(404).json({ message: "Không tìm thấy địa chỉ hoặc không có quyền." });
    }

    await AddressModel.updateMany({ user_id: userId }, { is_default: false });

    await AddressModel.findByIdAndUpdate(addressId, { is_default: true });

    res.json({ message: "Cập nhật địa chỉ mặc định thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

app.get('/user/addresses', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const addresses = await AddressModel.find({ user_id: userId });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

app.post('/user/addresses', verifyToken, async (req, res) => {
  try {
    const { receiver_name, phone, address } = req.body;
    const userId = req.user.userId;

    if (!receiver_name || !phone || !address) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    }

    const existingAddress = await AddressModel.findOne({
      user_id: userId,
      receiver_name: receiver_name,
      phone: phone,
      address: address
    });

    if (existingAddress) {
      return res.status(400).json({ 
        message: 'Địa chỉ này đã tồn tại trong danh sách của bạn' 
      });
    }

    const newAddress = new AddressModel({
      user_id: userId,
      receiver_name,
      phone,
      address,
      created_at: new Date(),
      updated_at: new Date()
    });

    const savedAddress = await newAddress.save();
    res.status(201).json(savedAddress);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

app.put('/user/addresses/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { receiver_name, phone, address } = req.body;
    const userId = req.user.userId;

    const addressToUpdate = await AddressModel.findOne({ _id: id, user_id: userId });
    if (!addressToUpdate) {
      return res.status(404).json({ message: 'Không tìm thấy địa chỉ' });
    }

    addressToUpdate.receiver_name = receiver_name;
    addressToUpdate.phone = phone;
    addressToUpdate.address = address;
    addressToUpdate.updated_at = new Date();

    await addressToUpdate.save();
    res.json(addressToUpdate);
  } catch (error) {
    console.error('Lỗi cập nhật địa chỉ:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.delete('/user/addresses/:id', verifyToken, async (req, res) => {
  try {
    const addressId = req.params.id;
    const userId = req.user.userId;

    const address = await AddressModel.findOne({
      _id: addressId,
      user_id: userId
    });

    if (!address) {
      return res.status(404).json({ 
        message: 'Không tìm thấy địa chỉ hoặc bạn không có quyền xóa' 
      });
    }

    await AddressModel.findByIdAndDelete(addressId);
    res.json({ message: 'Xóa địa chỉ thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

  app.get('/api/search/suggestions', async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || q.length < 2) {
        return res.json({ suggestions: [] });
      }
      const products = await ProductModel.find({
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { brand: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } }
        ]
      }).limit(5);

      const brands = await BrandModel.find({
        name: { $regex: q, $options: 'i' }
      }).limit(3);

      const categories = await CategoryModel.find({
        name: { $regex: q, $options: 'i' }
      }).limit(3);

      const suggestions = [
        ...products.map(p => ({ name: p.name, type: 'product' })),
        ...brands.map(b => ({ name: b.name, type: 'brand' })),
        ...categories.map(c => ({ name: c.name, type: 'category' }))
      ];

      res.json({ suggestions });
    } catch (error) {
      console.error('Lỗi gợi ý tìm kiếm:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/search', async (req, res) => {
    try {
      const { q, brand, category, priceRange, sortBy, page, limit } = req.query;
      const currentPage = parseInt(page) || 1;
      const itemsPerPage = parseInt(limit) || 10;
      const skip = (currentPage - 1) * itemsPerPage;
      
      let matchQuery = {};

      if (q) {
        matchQuery.$or = [
          { name: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } }
        ];
      }

      if (brand) {
        matchQuery['brand.name'] = { $regex: brand, $options: 'i' };
      }

      if (category) {
        matchQuery['category.name'] = { $regex: category, $options: 'i' };
      }

      if (priceRange) {
        const [min, max] = priceRange.split('-');
        if (max === '+') {
          matchQuery.price = { $gte: parseInt(min) };
        } else {
          matchQuery.price = { $gte: parseInt(min), $lte: parseInt(max) };
        }
      }

      let sort = {};
      switch (sortBy) {
        case 'price-asc':
          sort = { price: 1 };
          break;
        case 'price-desc':
          sort = { price: -1 };
          break;
        case 'name-asc':
          sort = { name: 1 };
          break;
        default:
          sort = { created_at: -1 };
      }

      const aggregationPipeline = [
        { $match: { status: 0, quantity: { $gt: 0 } } },
        {
          $lookup: {
            from: 'brands',
            localField: 'brand_id',
            foreignField: '_id',
            as: 'brand'
          }
        },
        { $unwind: '$brand' },
        { $match: { 'brand.brand_status': 0 } },
        {
          $lookup: {
            from: 'product_categories',
            localField: '_id',
            foreignField: 'product_id',
            as: 'productCategories'
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'productCategories.category_id',
            foreignField: '_id',
            as: 'category'
          }
        },
        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
        { $match: matchQuery },
        { $sort: sort },
        {
          $lookup: {
            from: 'product_images',
            localField: '_id',
            foreignField: 'product_id',
            as: 'images'
          }
        },
        {
          $addFields: {
            main_image: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: '$images',
                    as: 'img',
                    cond: { $eq: ['$$img.is_main', true] }
                  }
                },
                0
              ]
            }
          }
        },
        {
          $project: {
            _id: 1,
            name: 1,
            price: 1,
            sale_price: 1,
            description: 1,
            status: 1,
            quantity: 1,
            brand: {
              _id: 1,
              name: 1
            },
            category: {
              _id: 1,
              name: 1
            },
            main_image: {
              image: 1,
              alt: 1
            },
            images: {
              image: 1,
              alt: 1
            },
            created_at: 1
          } },

          { $group: {
              _id: '$_id',
              doc: { $first: '$$ROOT' }
          } },
          { $replaceRoot: { newRoot: '$doc' } },
      ];
      const countPipeline = [...aggregationPipeline];
      countPipeline.push({ $count: "total" });

      aggregationPipeline.push({ $skip: skip });
      aggregationPipeline.push({ $limit: itemsPerPage });

      const [products, countResult] = await Promise.all([
        ProductModel.aggregate(aggregationPipeline),
        ProductModel.aggregate(countPipeline)
      ]);

      const total = countResult[0]?.total || 0;

      res.json({ 
        products,
        total,
        currentPage,
        totalPages: Math.ceil(total / itemsPerPage),
        itemsPerPage
      });
    } catch (error) {
      console.error('Lỗi tìm kiếm:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

app.get('/api/news', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const news = await NewsModel.aggregate([
      { $match: { news_status: 0 } }, 
      {
        $lookup: {
          from: 'category_news',
          localField: 'categorynews_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $project: {
          _id: 1,
          title: 1,
          content: 1,
          image: 1,
          news_status: 1,
          views: 1,
          created_at: 1,
          updated_at: 1,
          'category.name': 1
        }
      },
      { $sort: { created_at: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    const total = await NewsModel.countDocuments({ news_status: 0 }); 

    res.json({
      news,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalNews: total
    });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi lấy danh sách tin tức', details: err.message });
  }
});

app.get('/api/news/:id', async (req, res) => {
  try {
    const newsId = new ObjectId(req.params.id);
    const news = await NewsModel.aggregate([
      { $match: { _id: newsId, news_status: 0 } }, 
      {
        $lookup: {
          from: 'category_news',
          localField: 'categorynews_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $project: {
          _id: 1,
          title: 1,
          content: 1,
          image: 1,
          news_status: 1,
          views: 1,
          created_at: 1,
          updated_at: 1,
          'category.name': 1
        }
      }
    ]);

    if (!news.length) {
      return res.status(404).json({ error: 'Không tìm thấy tin tức' });
    }

    res.json(news[0]);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi lấy tin tức', details: err.message });
  }
});

app.post('/api/news/:id/increment-view', async (req, res) => {
  try {
    const newsId = new ObjectId(req.params.id);
    
    const news = await NewsModel.findById(newsId);
    if (!news) {
      return res.status(404).json({ error: 'Không tìm thấy tin tức' });
    }

    const result = await NewsModel.findByIdAndUpdate(
      newsId,
      { $inc: { views: 1 } },
      { new: true }
    );

    res.json({ 
      success: true,
      message: 'Đã tăng lượt xem',
      views: result.views 
    });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi tăng lượt xem', details: err.message });
  }
});

app.get('/api/news/category/:categoryId', async (req, res) => {
  try {
    const categoryId = new ObjectId(req.params.categoryId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const news = await NewsModel.aggregate([
      { $match: { categorynews_id: categoryId, news_status: 0 } }, 
      {
        $lookup: {
          from: 'category_news',
          localField: 'categorynews_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $project: {
          _id: 1,
          title: 1,
          content: 1,
          image: 1,
          news_status: 1,
          views: 1,
          created_at: 1,
          updated_at: 1,
          'category.name': 1
        }
      },
      { $sort: { created_at: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    const total = await NewsModel.countDocuments({ categorynews_id: categoryId, news_status: 0 }); 
    res.json({
      news,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalNews: total
    });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi lấy tin tức theo danh mục', details: err.message });
  }
});

 app.get('/api/category-news', async (req, res) => {
  try {
    const categories = await CategoryNewsModel.find({ status: 0 })
      .sort({ created_at: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi lấy danh mục tin tức', details: err });
  }
});

app.get('/user/wishlist', verifyToken, async (req, res) => {
  try {
      const userId = req.user.userId;
      const wishlistItems = await WishlistModel.find({ user_id: userId })
          .populate('product_id', 'name price main_image description')
          .sort({ created_at: -1 });

      const result = await Promise.all(wishlistItems.map(async item => {
          if (!item.product_id) {
              return null;
          }
          
          let main_image = item.product_id.main_image;
          if (!main_image) {
              const img = await ProductImageModel.findOne({ product_id: item.product_id._id, is_main: true });
              main_image = img ? img.image : '';
          }
          return {
              _id: item._id,
              product_id: item.product_id._id,
              user_id: item.user_id,
              created_at: item.created_at,
              updated_at: item.updated_at,
              product: {
                  _id: item.product_id._id,
                  name: item.product_id.name,
                  price: item.product_id.price,
                  main_image,
                  description: item.product_id.description
              }
          };
      }));

      const filteredResult = result.filter(item => item !== null);
      const nullItems = result.filter(item => item === null);
      if (nullItems.length > 0) {
          const nullWishlistIds = wishlistItems
              .filter((item, index) => result[index] === null)
              .map(item => item._id);
          
          if (nullWishlistIds.length > 0) {
              await WishlistModel.deleteMany({ _id: { $in: nullWishlistIds } });

          }
      }

      res.json(filteredResult);
  } catch (error) {
      console.error('Lỗi lấy danh sách yêu thích:', error);
      res.status(500).json({ message: 'Lỗi khi lấy danh sách yêu thích' });
  }
});

app.post('/user/wishlist/:productId', verifyToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const productId = req.params.productId;

        const product = await ProductModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }

        const existingWishlistItem = await WishlistModel.findOne({
            user_id: userId,
            product_id: productId
        });

        if (existingWishlistItem) {
            return res.status(400).json({ message: 'Sản phẩm đã có trong danh sách yêu thích' });
        }

        const wishlistItem = new WishlistModel({
            user_id: userId,
            product_id: productId
        });

        await wishlistItem.save();
        res.status(201).json({ message: 'Đã thêm vào danh sách yêu thích' });
    } catch (error) {
        console.error('Lỗi thêm vào danh sách yêu thích:', error);
        res.status(500).json({ message: 'Lỗi khi thêm vào danh sách yêu thích' });
    }
});

app.delete('/user/wishlist/all', verifyToken, async (req, res) => {
  try {
    let userId = req.user.userId;
    if (typeof userId === 'string') {
      const mongoose = require('mongoose');
      userId = new mongoose.Types.ObjectId(userId);
    }
    const result = await WishlistModel.deleteMany({ user_id: userId });
    
    res.json({ message: 'Đã xóa toàn bộ wishlist', deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Lỗi xóa wishlist:', error);
    res.status(500).json({ message: 'Lỗi khi xóa toàn bộ wishlist', error: error.message });
  }
});

app.delete('/user/wishlist/:productId', verifyToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const productId = req.params.productId;

        const result = await WishlistModel.findOneAndDelete({
            user_id: userId,
            product_id: productId
        });

        if (!result) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm trong danh sách yêu thích' });
        }

        res.json({ message: 'Đã xóa khỏi danh sách yêu thích' });
    } catch (error) {
        console.error('Lỗi xóa khỏi danh sách yêu thích:', error);
        res.status(500).json({ message: 'Lỗi khi xóa khỏi danh sách yêu thích' });
    }
});

app.get("/api/payment-method", async function (req, res) {
  try {
    const filter = { is_active: true };
    const list = await PaymentMethodModel.find(filter)
      .sort({ _id: -1 })

    res.json({ list });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách phương thức thanh toán:", error);
    res
      .status(500)
      .json({ error: "Lỗi khi lấy danh sách phương thức thanh toán." });
  }
});

app.get("/api/orders", async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ message: "Thiếu user_id" });
  }

  try {
    const orders = await OrderModel.find({ user_id })
      .populate("payment_method_id", "name")
      .populate("address_id")
      .populate("voucher_id")
      .sort({ created_at: -1 });

    res.json(orders);
  } catch (err) {
    console.error("Lỗi khi lấy đơn hàng theo user_id:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

app.get("/api/order-details/:order_id", async (req, res) => {
  const {order_id} = req.params;
  
    try {
      const chiTietDonHangs = await OrderDetailModel.find({ order_id }).populate({
        path: "product_id",
        model: "products",
        select: "name price sale_price status",
      });
  
      const populated = await Promise.all(
        chiTietDonHangs.map(async (item) => {
          const productId = item?.product_id?._id;
          let main_image = null;
  
          if (productId) {
            main_image = await ProductImageModel.findOne({
              product_id: productId,
              is_main: true,
            }).select("image alt");
          }
  
          return {
            ...item.toObject(),
            product_id: {
              ...item.product_id?.toObject?.(),
              main_image,
            },
          };
        })
      );
  
      if (populated.length > 0) {
        res.json(populated);
      } else {
        res
          .status(404)
          .json({ error: "Không tìm thấy chi tiết cho đơn hàng này." });
      }
    } catch (error) {
      console.error("Lỗi lấy chi tiết đơn hàng:", error);
      res.status(500).json({ error: "Lỗi khi lấy chi tiết đơn hàng." });
    }
});

app.put("/api/cancel-order/:order_id", async (req, res) => {
  try {
    const order_id = new ObjectId(req.params.order_id);
    
    const order = await OrderModel.findById(order_id);

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    }

    if (order.order_status === "cancelled") {
      return res.status(400).json({ message: "Đơn hàng đã được hủy." });
    }

    if (order.order_status !== "processing" && order.order_status !== "pending") {
      return res.status(400).json({
        message: `Không thể hủy đơn hàng khi đang ở trạng thái: ${order.order_status}.`
      });
    }

    order.order_status = "cancelled";
    order.updated_at = new Date();
    await order.save();
    try {
      const orderDetails = await OrderDetailModel.find({ order_id: order_id });
      for (const detail of orderDetails) {
        await ProductModel.findByIdAndUpdate(
          detail.product_id,
          { $inc: { quantity: detail.quantity } },
          { new: true }
        );
      }
      
      
    } catch (stockError) {
      console.error('Lỗi khi cập nhật tồn kho:', stockError);
    }

    res.json({ message: "Đơn hàng đã được hủy thành công." });
  } catch (error) {
    console.error("Lỗi khi hủy đơn hàng:", error);
    res.status(500).json({ message: "Lỗi khi hủy đơn hàng." });
  }
});

app.put("/api/return-order/:order_id", async (req, res) => {
  const { order_id } = req.params;
  const { reason } = req.body;

  try {
    const order = await OrderModel.findById(order_id);
    if (!order) return res.status(404).json({ error: "Đơn không tồn tại" });

    if (order.order_status !== "delivered") {
      return res.status(400).json({ error: "Chỉ được trả đơn đã giao" });
    }

    const now = new Date();
    const deliveredAt = order.updated_at;
    const diffTime = now.getTime() - deliveredAt.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays > 3) {
      return res.status(400).json({ error: "Đơn hàng đã giao quá 3 ngày, không thể trả" });
    }

    order.order_status = "returned";
    const paymentMethod = await PaymentMethodModel.findById(order.payment_method_id);
    const isCOD = paymentMethod?.code === 'COD';
    
    // Cập nhật payment_status cho cả COD và non-COD khi đã thanh toán
    if (order.payment_status === "paid") {
      order.payment_status = "refunding";
    }
    order.note = (order.note || "") + `\nTrả hàng: ${reason}`;
    await order.save();
    if (order.user_id) {
      const notificationStatus = isCOD ? 'returned' : 'refunding';
      await createOrderNotification(
        order.user_id, 
        order._id, 
        notificationStatus, 
        order.orderCode || `ORDER-${order._id.toString().slice(-6).toUpperCase()}`
      );
    }

    try {
      const orderDetails = await OrderDetailModel.find({ order_id: order_id });
      for (const detail of orderDetails) {
        await ProductModel.findByIdAndUpdate(
          detail.product_id,
          { $inc: { quantity: detail.quantity } },
          { new: true }
        );
      }
      
      
    } catch (stockError) {
      console.error('Lỗi khi cập nhật tồn kho:', stockError);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Lỗi khi xử lý trả hàng:", err);
    return res.status(500).json({ error: "Có lỗi xảy ra, thử lại sau" });
  }
});



app.get("/reviews/user", verifyToken, async (req, res) => {
  const userId = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "ID người dùng không hợp lệ" });
  }

  try {
    const reviews = await ReviewModel.find(
      { user_id: userId },
      { order_detail_id: 1, rating: 1, _id: 0 }
    );

    res.json(reviews);
  } catch (err) {
    console.error("Lỗi khi lấy đánh giá:", err);
    res.status(500).json({ error: "Không thể lấy danh sách đánh giá" });
  }
});

app.get('/api/reviews/:id', async (req, res) => {
  const { id } = req.params;    
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID không hợp lệ' });
  }

  const objectId = new ObjectId(id);

  const page  = Math.max(parseInt(req.query.page)  || 1, 1);
  const limit = Math.max(parseInt(req.query.limit) || 10, 1);
  const skip  = (page - 1) * limit;

  const pipeline = [
    { $lookup: {                   
        from: 'order_details',
        localField: 'order_detail_id',
        foreignField: '_id',
        as: 'order_details'
    }},
    { $unwind: '$order_details' },
    { $match: { 'order_details.product_id': objectId } },
    { $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'user'
    }},
    { $unwind: '$user' },
    { $project: {
        _id: 1,
        rating: 1,
        comment: 1,
        created_at: 1,
        order_detail_id: 1,
        user_id: {
            _id: '$user._id',
            username: '$user.username',
            fullName: '$user.fullName',
            avatar: '$user.avatar'
        }
    }},
    { $sort: { created_at: -1 } },
    { $facet: {
        data:       [ { $skip: skip }, { $limit: limit } ],
        totalCount: [ { $count: 'total' } ]
    }}
  ];

  try {
    const [{ data, totalCount } = { data: [], totalCount: [] }] =
      await ReviewModel.aggregate(pipeline).exec();

    res.json({
      page,
      limit,
      total: totalCount[0]?.total || 0,
      reviews: data
    });
  } catch (err) {
    console.error('Lỗi lấy đánh giá:', err);
    res.status(500).json({ error: 'Lỗi lấy đánh giá', details: err.message });
  }
});

app.get('/api/reviews/stats/:productId', async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ error: 'ID không hợp lệ' });
  }

  const objectId = new mongoose.Types.ObjectId(productId);

  try {
    const stats = await ReviewModel.aggregate([
      {
        $lookup: {
          from: 'order_details',
          localField: 'order_detail_id',
          foreignField: '_id',
          as: 'order_detail',
        },
      },
      { $unwind: '$order_detail' },
      {
        $match: {
          'order_detail.product_id': objectId,
        },
      },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
        },
      },
    ]);

    const result = stats[0] || { totalReviews: 0, averageRating: 0 };

    res.json({
      totalReviews: result.totalReviews,
      averageRating: parseFloat(result.averageRating.toFixed(1)),
    });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi thống kê đánh giá', details: err.message });
  }
});

app.post('/api/reviews', verifyToken , async (req, res) => {
  const { product_id, rating, comment } = req.body;

  if (!req.user || !req.user.userId) {
    return res.status(401).json({ error: 'Bạn cần đăng nhập để bình luận.' });
  }

  const userId = new ObjectId(req.user.userId);
  const productId = new ObjectId(product_id);

  try {
    const purchased = await OrderDetailModel.aggregate([
      { $match: { product_id: productId } },
      {
        $lookup: {
          from: 'orders',
          localField: 'order_id',
          foreignField: '_id',
          as: 'order'
        }
      },
      { $unwind: '$order' },
      { $match: { 'order.user_id': userId } },
      { $limit: 1 }
    ]);

    const purchasedDetail = purchased[0];

    if (!purchasedDetail) {
      return res.status(403).json({ error: 'Bạn chưa mua sản phẩm này.' });
    }

    const existingReview = await ReviewModel.findOne({
      order_detail_id: purchasedDetail._id,
      user_id: userId
    });

    if (existingReview) {
      return res.status(409).json({ error: 'Bạn đã đánh giá sản phẩm này rồi.' });
    }

    const newReview = new ReviewModel({
      order_detail_id: purchasedDetail._id,
      user_id: userId,
      rating,
      comment,
      created_at: new Date(),
    });

    await newReview.save();

    res.status(201).json({ message: 'Đã thêm đánh giá', review: newReview });

  } catch (err) {
    console.error('Lỗi tạo đánh giá:', err);
    res.status(500).json({ error: 'Lỗi tạo đánh giá', details: err.message });
  }
});

app.get("/voucher-user", verifyToken, async (req, res) => {
  try {
    const user_id = req.user.userId;

    const savedVoucherLinks = await VoucherUserModel.find({ user_id });
    const voucherIds = savedVoucherLinks.map((vu) => vu.voucher_id);
    const vouchers = await VoucherModel.find({ _id: { $in: voucherIds } });

    // Lọc voucher theo target_audience (sử dụng cùng logic với /api/voucher-user/available)
    const user = await UserModel.findById(user_id);
    let customerType = 'new_customer';
    
    if (user) {
      // Xác định loại khách hàng chỉ dựa trên số đơn hàng
      const orderCount = await OrderModel.countDocuments({ user_id });
      
      if (orderCount >= 5) {
        customerType = 'vip_customer';
      } else if (orderCount >= 2) {
        customerType = 'loyal_customer';
      } else {
        customerType = 'new_customer';
      }
      
      // Bỏ debug logs
    }

    const filteredVouchers = vouchers.filter(v => 
      v.target_audience === 'all' || v.target_audience === customerType
    );

    const result = filteredVouchers.map((v) => {
      const link = savedVoucherLinks.find((vu) => vu.voucher_id.toString() === v._id.toString());
      return { ...v.toObject(), _id: v._id, voucher_user_id: link?._id, used: link?.used };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy voucher đã lưu" });
  }
});

// API mới để lấy tất cả voucher phù hợp với target_audience của user
app.get("/api/voucher-user/available", verifyToken, async (req, res) => {
  try {
    const user_id = req.user.userId;

    // Lấy thông tin user để xác định loại khách hàng
    const user = await UserModel.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Xác định loại khách hàng chỉ dựa trên số đơn hàng
    const orderCount = await OrderModel.countDocuments({ user_id });
    let customerType = 'new_customer';
    
    if (orderCount >= 5) {
      customerType = 'vip_customer';
    } else if (orderCount >= 2) {
      customerType = 'loyal_customer';
    } else {
      customerType = 'new_customer';
    }

    // Lấy tất cả voucher phù hợp với target_audience
    const availableVouchers = await VoucherModel.find({
      $or: [
        { target_audience: 'all' },
        { target_audience: customerType }
      ]
    });

    // Lấy thông tin voucher đã lưu của user
    const savedVoucherLinks = await VoucherUserModel.find({ user_id });
    const savedVoucherIds = savedVoucherLinks.map(vu => vu.voucher_id.toString());

    // Thêm thông tin đã lưu và đã sử dụng
    const result = availableVouchers.map(voucher => {
      const savedLink = savedVoucherLinks.find(vu => 
        vu.voucher_id.toString() === voucher._id.toString()
      );
      return {
        ...voucher.toObject(),
        isSaved: !!savedLink,
        used: savedLink?.used || false,
        voucher_user_id: savedLink?._id
      };
    });

    res.json(result);
  } catch (err) {
    console.error('Lỗi khi lấy voucher available:', err);
    res.status(500).json({ message: "Lỗi khi lấy voucher khả dụng" });
  }
});

app.post("/api/voucher-user/save", verifyToken, async (req, res) => {
  try {
    const { voucher_id } = req.body;
    const user_id = req.user.userId;

    const voucher = await VoucherModel.findById(voucher_id);
    if (!voucher) {
      return res.status(404).json({ message: "Không tìm thấy voucher" });
    }

    if (new Date() > new Date(voucher.end_date)) {
      return res.status(400).json({ message: "Voucher đã hết hạn" });
    }

    // Kiểm tra xem user có phù hợp với target_audience của voucher không
    const user = await UserModel.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Xác định loại khách hàng chỉ dựa trên số đơn hàng
    const orderCount = await OrderModel.countDocuments({ user_id });
    let customerType = 'new_customer';
    
    if (orderCount >= 5) {
      customerType = 'vip_customer';
    } else if (orderCount >= 2) {
      customerType = 'loyal_customer';
    } else {
      customerType = 'new_customer';
    }

    // Kiểm tra target_audience
    if (voucher.target_audience !== 'all' && voucher.target_audience !== customerType) {
      return res.status(403).json({ 
        message: "Voucher này không dành cho loại khách hàng của bạn!" 
      });
    }

    const existingVoucher = await VoucherUserModel.findOne({ user_id, voucher_id });
    if (existingVoucher) {
      if (existingVoucher.used) {
        return res.status(400).json({ message: "Voucher này đã được sử dụng!" });
      } else {
        return res.status(400).json({ message: "Bạn đã lưu voucher này rồi!" });
      }
    }

    await VoucherUserModel.create({ user_id, voucher_id, used: false });

    res.json({ message: "Lưu voucher thành công!" });
  } catch (error) {
    console.error("Lỗi khi lưu voucher:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi lưu voucher" });
  }
});







app.get("/api/admin/search", async (req, res) => {
  const searchTerm = req.query.q?.toString().trim() || "";

  try {
    const regexPattern = new RegExp(searchTerm, "i");

    const [
      products,
      categories,
      users,
      news,
      categoryNews,
      vouchers,
      orders,
      reviews,
      brands,
    ] = await Promise.all([
      ProductModel.find({ name: regexPattern }).select("name _id"),
      CategoryModel.find({ name: regexPattern }).select("name _id"),
      UserModel.find({
        $or: [{ username: regexPattern }, { email: regexPattern }],
      }).select("username email _id"),
      NewsModel.find({ title: regexPattern }).select("title _id"),
      CategoryNewsModel.find({ name: regexPattern }).select("name _id"),
      VoucherModel.find({
        $or: [{ voucher_name: regexPattern }, { voucher_code: regexPattern }],
      }).select("voucher_name voucher_code _id"),
      OrderModel.find({ note: regexPattern }).select("note _id"),
      ReviewModel.find({ comment: regexPattern }).select("comment _id"),
      BrandModel.find({
        $or: [{ name: regexPattern }, { description: regexPattern }],
      }).select("name description _id"),
    ]);

    const results = [
      ...products.map((p) => ({
        type: "Sản phẩm",
        name: p.name,
        link: `/admin/products/${p._id}`,
      })),
      ...categories.map((c) => ({
        type: "Danh mục sản phẩm",
        name: c.name,
        link: `/admin/categories-product-list`,
      })),
      ...users.map((u) => ({
        type: "Người dùng",
        name: `${u.username} (${u.email})`,
        link: `/admin/users/${u._id}`,
      })),
      ...news.map((n) => ({
        type: "Tin tức",
        name: n.title,
        link: `/admin/news/${n._id}`,
      })),
      ...categoryNews.map((cn) => ({
        type: "Danh mục tin tức",
        name: cn.name,
        link: `/admin/categories-news-list`,
      })),
      ...vouchers.map((v) => ({
        type: "Voucher",
        name: `${v.voucher_name} (${v.voucher_code})`,
        link: `/admin/vouchers/${v._id}`,
      })),
      ...orders.map((o) => ({
        type: "Đơn hàng",
        name: o.note,
        link: `/admin/orders/${o._id}`,
      })),
      ...reviews.map((r) => ({
        type: "Đánh giá",
        name: r.comment,
        link: `/admin/reviews`,
      })),
      ...brands.map((b) => ({
        type: "Thương hiệu",
        name: `${b.name} (${b.description})`,
        link: `/admin/brands/${b._id}`,
      })),
    ];

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi tìm kiếm dữ liệu." });
  }
});

app.get("/api/admin/categoryProduct", async function (req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10000;
  const skip = (page - 1) * limit;

  const searchTerm = req.query.searchTerm || "";
  const statusFilter = req.query.statusFilter;
  const categoryFilter = req.query.categoryFilter;
  const sortOption = req.query.sort || "newest";

  let query = {};
  let sortQuery = {};

  switch (sortOption) {
    case "newest":
      sortQuery = { created_at: -1 };
      break;
    case "oldest":
      sortQuery = { created_at: 1 };
      break;
    case "name-asc":
      sortQuery = { alt: 1 };
      break;
    case "name-desc":
      sortQuery = { alt: -1 };
      break;
    default:
      sortQuery = { created_at: -1 };
      break;
  }

  if (searchTerm) {
    query.name = { $regex: searchTerm, $options: "i" };
  }

  if (statusFilter && statusFilter != "all") {
    query.category_status = parseInt(statusFilter);
  }

  if (categoryFilter && categoryFilter != "all") {
    query.name = categoryFilter;
  }

  try {
    const total = await CategoryModel.countDocuments(query);
    const list = await CategoryModel.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    res.json({ list, total });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách loại sản phẩm." });
  }
});

app.get("/api/admin/categoryProduct/:id", async (req, res) => {
  const categoryProductId = req.params.id;

  try {
    const categoryPro = await CategoryModel.findById(categoryProductId);

    if (!categoryPro) {
      return res.status(404).json({ error: "Không tìm thấy loại sản phẩm." });
    }

    res.json({ categoryPro });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy loại sản phẩm." });
  }
});

app.post(
  "/api/admin/categoryProduct/them",
  uploadCateProduct.single("image"),
  async function (req, res) {
    try {
      const { name, alt, category_status } = req.body;
      const image = req.file ? `${req.file.path}` : null;

      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: "Tên danh mục không được để trống!" });
      }

      if (!alt || typeof alt !== 'string' || !alt.trim()) {
        return res.status(400).json({ error: "Alt không được để trống!" });
      }

      if (!image) {
        return res.status(400).json({ error: "Vui lòng chọn ảnh cho danh mục!" });
      }

      const existingCategory = await CategoryModel.findOne({ name: name.trim() });
      if (existingCategory) {
        return res.status(400).json({ error: "Tên danh mục đã tồn tại!" });
      }

      const newLoai = new CategoryModel({
        name: name.trim(),
        image,
        alt: alt.trim(),
        category_status: category_status == undefined ? 0 : parseInt(category_status),
        created_at: new Date(),
        updated_at: new Date(),
      });

      await newLoai.save();
      res.status(200).json({ message: "Thêm loại sản phẩm thành công!" });
    } catch (error) {
      console.error("Lỗi khi thêm danh mục:", error);
      res.status(500).json({ error: "Lỗi khi thêm danh mục: " + error.message });
    }
  }
);

app.put(
  "/api/admin/categoryProduct/sua/:id",
  uploadCateProduct.single("image"),
  async function (req, res) {
    const id = req.params.id;
    const { name, alt, category_status } = req.body;
    const image = req.file ? `${req.file.path}` : req.body.image_cu;

    try {
      const updatedLoai = await CategoryModel.findByIdAndUpdate(
        id,
        {
          name,
          image,
          alt,
          category_status:
            category_status == undefined ? 0 : parseInt(category_status),
          updated_at: new Date(),
        },
        { new: true }
      );

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "ID không hợp lệ." });
      }

      if (updatedLoai) {
        res.json({
          message: "Cập nhật loại sản phẩm thành công!",
          loai: updatedLoai,
        });
      } else {
        res.status(404).json({ error: "Không tìm thấy loại sản phẩm." });
      }
    } catch (error) {
      res.status(500).json({ error: "Tên danh mục đã tồn tại!" });
    }
  }
);

app.delete("/api/admin/categoryProduct/xoa/:id", async function (req, res) {
  const id = req.params.id;

  try {
    const count = await ProductCategoriesModel.countDocuments({
      category_id: id,
    });
    if (count > 0) {
      return res.status(400).json({
        thong_bao: "Không thể xóa vì vẫn còn sản phẩm thuộc loại này.",
      });
    }

    const result = await CategoryModel.findByIdAndDelete(id);
    if (result) {
      res.json({ message: "Xóa loại sản phẩm thành công!" });
    } else {
      res.status(404).json({ error: "Không tìm thấy loại sản phẩm." });
    }
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi xóa loại sản phẩm." });
  }
});

app.get("/api/admin/product", async function (req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const searchTerm = req.query.searchTerm || "";
  const statusFilter = req.query.statusFilter;
  const categoryFilter = req.query.categoryFilter;
  const brandFilter = req.query.brandFilter;
  const sortOption = req.query.sort || "newest";

  let sortQuery = {};
  switch (sortOption) {
    case "newest":
      sortQuery = { created_at: -1 };
      break;
    case "oldest":
      sortQuery = { created_at: 1 };
      break;
    case "name-asc":
      sortQuery = { name: 1 };
      break;
    case "name-desc":
      sortQuery = { name: -1 };
      break;
    default:
      sortQuery = { created_at: -1 };
  }

  try {
    let productFilterQuery = {};

    let categoryProductIds = null;
    if (categoryFilter && categoryFilter != "all") {
      const mappings = await ProductCategoriesModel.find({
        category_id: categoryFilter,
      }).select("product_id");

      categoryProductIds = mappings.map((m) => m.product_id.toString());
    }

    if (searchTerm) {
      productFilterQuery.name = { $regex: searchTerm, $options: "i" };
    }

    if (statusFilter && statusFilter != "all") {
      productFilterQuery.quantity = statusFilter == "0" ? 0 : { $gt: 0 };
    }

    if (brandFilter && brandFilter != "all") {
      productFilterQuery.brand_id = brandFilter;
    }

    if (categoryProductIds) {
      productFilterQuery._id = { $in: categoryProductIds };
    }

    const allFilteredProducts = await ProductModel.find(
      productFilterQuery
    ).sort(sortQuery);

    const total = allFilteredProducts.length;

    const paginatedProducts = allFilteredProducts.slice(skip, skip + limit);

    const list = await Promise.all(
      paginatedProducts.map(async (product) => {
        const main_image = await ProductImageModel.findOne({
          product_id: product._id,
          is_main: true,
        }).select("image alt");

        const categoryMap = await ProductCategoriesModel.find({
          product_id: product._id,
        }).populate({
          path: "category_id",
          model: "categories",
          select: "name",
        });

        const categories = categoryMap.map((item) => item.category_id);

        const sold = await OrderDetailModel.aggregate([
          { $match: { product_id: product._id } },
          { $group: { _id: "$product_id", total: { $sum: "$quantity" } } },
        ]);

        const sold_count = sold[0]?.total || 0;

        const populatedProduct = await ProductModel.populate(product, {
          path: "brand_id",
          model: "brands",
          select: "name",
        });

        return {
          ...populatedProduct.toObject(),
          main_image,
          categories,
          sold: sold_count,
        };
      })
    );

    res.json({ list, total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách sản phẩm." });
  }
});

app.get("/api/admin/product/:id", async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await ProductModel.findById(productId).populate({
      path: "brand_id",
      model: "brands",
      select: "name",
    });

    if (!product) {
      return res.status(404).json({ error: "Không tìm thấy sản phẩm." });
    }

    const images = await ProductImageModel.find({
      product_id: productId,
    }).select("image alt is_main");

    const categoryMap = await ProductCategoriesModel.find({
      product_id: productId,
    }).populate({
      path: "category_id",
      model: "categories",
      select: "_id name",
    });

    const categories = categoryMap.map((item) => item.category_id);

    const sold = await OrderDetailModel.aggregate([
      { $match: { product_id: product._id } },
      { $group: { _id: "$product_id", total: { $sum: "$quantity" } } },
    ]);

    const sold_count = sold[0]?.total || 0;

    res.json({
      ...product.toObject(),
      images,
      categories,
      sold: sold_count,
    });
  } catch (error) {
    res.status(500).json({ error: "Không thể lấy chi tiết sản phẩm." });
  }
});

app.post(
  "/api/admin/product/them",
  uploadDoneProduct.fields([
    { name: "main_image", maxCount: 1 },
    { name: "sub_images", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const {
        brand_id,
        name,
        description,
        price,
        sale_price,
        status,
        quantity,
        sex,
        case_diameter,
        style,
        features,
        water_resistance,
        thickness,
        color,
        machine_type,
        strap_material,
        case_material,
        category_ids,
      } = req.body;

      if (!name || !brand_id || !price || !quantity) {
        return res.status(400).json({ error: "Thiếu thông tin bắt buộc!" });
      }

      const existingProduct = await ProductModel.findOne({ name: name.trim() });
      if (existingProduct) {
        return res.status(400).json({ error: "Tên sản phẩm đã tồn tại!" });
      }

      const newProduct = await ProductModel.create({
        brand_id,
        name: name.trim(),
        description: description || "",
        price: parseFloat(price) || 0,
        sale_price: parseFloat(sale_price) || 0,
        status: status || "0",
        quantity: parseInt(quantity) || 0,
        sex: sex || null,
        case_diameter: case_diameter || "",
        style: style || "",
        features: features || "",
        water_resistance: water_resistance || "",
        thickness: thickness || "",
        color: color || "",
        machine_type: machine_type || "",
        strap_material: strap_material || "",
        case_material: case_material || "",
        created_at: new Date(),
        updated_at: new Date(),
      });

      const productId = newProduct._id;

      if (req.files && req.files["main_image"] && req.files["main_image"].length > 0) {
        const main = req.files["main_image"][0];
        await ProductImageModel.create({
          product_id: productId,
          image: main.path,
          is_main: true,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }

      if (req.files && req.files["sub_images"] && req.files["sub_images"].length > 0) {
        const subImgs = req.files["sub_images"];
        const subDocs = subImgs.map((img) => ({
          product_id: productId,
          image: img.path,
          is_main: false,
          created_at: new Date(),
          updated_at: new Date(),
        }));
        await ProductImageModel.insertMany(subDocs);
      }

      if (category_ids) {
        const categories = Array.isArray(category_ids)
          ? category_ids
          : [category_ids];
        
        await Promise.all(
          categories.map((categoryId) =>
            ProductCategoriesModel.create({
              product_id: productId,
              category_id: categoryId,
            })
          )
        );
      }

      res.status(200).json({ message: "Thêm sản phẩm thành công!" });
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm:", error);
      res.status(500).json({ error: "Lỗi khi thêm sản phẩm: " + error.message });
    }
  }
);

app.put(
  "/api/admin/product/sua/:id",
  uploadDoneProduct.fields([
    { name: "main_image", maxCount: 1 },
    { name: "sub_images", maxCount: 10 },
  ]),
  async (req, res) => {
    const productId = req.params.id;

    try {
      const {
        brand_id,
        name,
        description,
        price,
        sale_price,
        status,
        quantity,
        sex,
        case_diameter,
        style,
        features,
        water_resistance,
        thickness,
        color,
        machine_type,
        strap_material,
        case_material,
        category_ids,
      } = req.body;

      const existingProduct = await ProductModel.findOne({
        name: name.trim(),
        _id: { $ne: productId },
      });
      if (existingProduct) {
        return res.status(400).json({ error: "Tên sản phẩm đã tồn tại!" });
      }

      const updatedProduct = await ProductModel.findByIdAndUpdate(
        productId,
        {
          brand_id,
          name,
          description,
          price,
          sale_price,
          status,
          quantity,
          sex,
          case_diameter,
          style,
          features,
          water_resistance,
          thickness,
          color,
          machine_type,
          strap_material,
          case_material,
          updated_at: new Date(),
        },
        { new: true }
      );

      if (!updatedProduct) {
        return res.status(404).json({ error: "Không tìm thấy sản phẩm." });
      }

      if (req.files["main_image"]?.length) {
        await ProductImageModel.deleteMany({
          product_id: productId,
          is_main: true,
        });

        const mainImg = req.files["main_image"][0];
        await ProductImageModel.create({
          product_id: productId,
          image: mainImg.path,
          is_main: true,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }

      if (req.files["sub_images"]?.length) {
        await ProductImageModel.deleteMany({
          product_id: productId,
          is_main: false,
        });

        const subImgs = req.files["sub_images"];
        const subDocs = subImgs.map((img) => ({
          product_id: productId,
          image: img.path,
          is_main: false,
          created_at: new Date(),
          updated_at: new Date(),
        }));
        await ProductImageModel.insertMany(subDocs);
      }

      const categories = Array.isArray(category_ids)
        ? category_ids
        : category_ids
        ? [category_ids]
        : [];
      await ProductCategoriesModel.deleteMany({ product_id: productId });

      await Promise.all(
        categories.map((categoryId) =>
          ProductCategoriesModel.create({
            product_id: productId,
            category_id: categoryId,
          })
        )
      );

      res.json({
        message: "Cập nhật sản phẩm thành công!",
        product: updatedProduct,
      });
    } catch (error) {
      res.status(500).json({ error: "Lỗi khi cập nhật sản phẩm." });
    }
  }
);

app.delete("/api/admin/product/xoa/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const deleted = await ProductModel.findByIdAndDelete(id);

    if (!deleted) {
      return res
        .status(404)
        .json({ error: "Không tìm thấy sản phẩm với ID này." });
    }

    await ProductImageModel.deleteMany({ product_id: id });
    await ProductCategoriesModel.deleteMany({ product_id: id });

    res.json({ message: "Xóa sản phẩm thành công!" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi xóa sản phẩm." });
  }
});

app.get("/api/admin/user", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search || "";
    const role = req.query.role;
    const status = req.query.status;

    let filterConditions = [];

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      filterConditions.push({
        $or: [
          { fullName: searchRegex },
          { username: searchRegex },
          { email: searchRegex },
          {
            addresses: {
              $elemMatch: {
                receiver_name: searchRegex,
              },
            },
          },
        ],
      });
    }

    if (role && role != "all") {
      const roleValue = parseInt(role);
      if (!isNaN(roleValue)) {
        filterConditions.push({
          $or: [{ role: roleValue }, { role: roleValue.toString() }],
        });
      }
    }

    if (status && status != "all") {
      const statusValue = parseInt(status);
      if (!isNaN(statusValue)) {
        filterConditions.push({
          $or: [
            { account_status: statusValue },
            { account_status: statusValue.toString() },
          ],
        });
      }
    }

    let filter = {};
    if (filterConditions.length > 0) {
      filter =
        filterConditions.length == 1
          ? filterConditions[0]
          : { $and: filterConditions };
    }
    const total = await UserModel.countDocuments(filter);

    const list = await UserModel.aggregate([
      { $match: filter },
      {
        $addFields: {
          roleNumeric: {
            $cond: {
              if: { $type: "$role" },
              then: {
                $cond: {
                  if: { $eq: [{ $type: "$role" }, "string"] },
                  then: { $toInt: "$role" },
                  else: "$role",
                },
              },
              else: 0,
            },
          },
        },
      },
      {
        $sort: {
          roleNumeric: -1,
          created_at: -1,
        },
      },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "addresses",
          localField: "addresses",
          foreignField: "_id",
          as: "addresses",
        },
      },
    ]);

    const roleAggregation = await UserModel.aggregate([
      {
        $group: {
          _id: null,
          roles: { $addToSet: "$role" },
        },
      },
    ]);

    const statusAggregation = await UserModel.aggregate([
      {
        $group: {
          _id: null,
          statuses: { $addToSet: "$account_status" },
        },
      },
    ]);

    const availableRoles =
      roleAggregation.length > 0 ? roleAggregation[0].roles : [];
    const normalizedRoles = [
      ...new Set(
        availableRoles.map((role) => {
          const roleValue = typeof role == "string" ? parseInt(role) : role;
          return isNaN(roleValue) ? 0 : roleValue;
        })
      ),
    ];

    const availableStatuses =
      statusAggregation.length > 0 ? statusAggregation[0].statuses : [];
    const normalizedStatuses = [
      ...new Set(
        availableStatuses.map((status) => {
          const statusValue =
            typeof status == "string" ? parseInt(status) : status;
          return isNaN(statusValue) ? 0 : statusValue;
        })
      ),
    ];

    const roleOptions = normalizedRoles
      .map((role) => {
        let label;
        switch (role) {
          case 0:
            label = "Người dùng";
            break;
          case 1:
            label = "Quản trị viên";
            break;
          case 2:
            label = "Quản trị viên cấp cao";
            break;
          default:
            label = `Vai trò ${role}`;
        }
        return { value: role, label };
      })
      .sort((a, b) => b.value - a.value);

    const statusOptions = normalizedStatuses
      .map((status) => {
        const label = status == 1 ? "Hoạt động" : "Bị khóa";
        return { value: status, label };
      })
      .sort((a, b) => b.value - a.value);

    res.status(200).json({
      success: true,
      list,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
      metadata: {
        roles: roleOptions,
        statuses: statusOptions,
      },
      debug: {
        appliedFilters: {
          search: search || null,
          role: role != "all" ? role : null,
          status: status != "all" ? status : null,
        },
        queryExecuted: filter,
        originalRoles: availableRoles,
        originalStatuses: availableStatuses,
        filterConditions: filterConditions.length,
        sortApplied: "role descending, created_at descending",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Lỗi khi lấy danh sách người dùng",
      message: error.message,
      stack: process.env.NODE_ENV == "development" ? error.stack : undefined,
    });
  }
});

app.get("/api/admin/user/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const currentUser = req.user;

  if (currentUser.role < 1) {
    return res.status(403).json({ error: "Không có quyền truy cập." });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "ID không hợp lệ." });
  }

  try {
    const user = await UserModel.findById(id).populate("addresses");

    if (!user) {
      return res.status(404).json({ error: "Không tìm thấy người dùng." });
    }

    const userData = user.toObject();
    delete userData.password_hash;
    delete userData.refresh_token;

    res.json(userData);
  } catch (error) {
    console.error("Lỗi khi truy vấn MongoDB:", error);
    res.status(500).json({ error: "Lỗi khi lấy người dùng theo ID." });
  }
});

app.put(
  "/api/admin/user/edit/:id",
  uploadAvatar.single("image"),
  verifyToken,
  async (req, res) => {
    const { id } = req.params;
    const { username, fullName, role, account_status, password } = req.body;
    const currentUser = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID không hợp lệ" });
    }

    if (!username || username.trim().length < 3) {
      return res
        .status(400)
        .json({ error: "Tên đăng nhập phải có ít nhất 3 ký tự" });
    }

    if (!fullName || fullName.trim().length < 3) {
      return res
        .status(400)
        .json({ error: "Tên đầy đủ phải có ít nhất 3 ký tự" });
    }

    if (password && password.length < 6) {
      return res
        .status(400)
        .json({ error: "Mật khẩu phải có ít nhất 6 ký tự" });
    }

    try {
      const targetUser = await UserModel.findById(id);
      if (!targetUser) {
        return res.status(404).json({ error: "Không tìm thấy người dùng." });
      }

      if (Number(currentUser.role) != 2) {
        if (Number(targetUser.role) >= Number(currentUser.role)) {
          return res.status(403).json({
            error: "Không có quyền chỉnh sửa người dùng này.",
          });
        }

        if (role != undefined && Number(role) != Number(targetUser.role)) {
          return res.status(403).json({
            error: "Bạn không có quyền thay đổi vai trò.",
          });
        }

        if (
          typeof account_status != "undefined" &&
          Number(targetUser.role) >= Number(currentUser.role)
        ) {
          return res.status(403).json({
            error: "Bạn không được sửa trạng thái của người dùng này.",
          });
        }
      }

      if (username != targetUser.username) {
        const existingUser = await UserModel.findOne({
          username: username.trim(),
          _id: { $ne: id },
        });
        if (existingUser) {
          return res.status(400).json({ error: "Tên đăng nhập đã tồn tại" });
        }
      }

      const updateData = {
        username: username.trim(),
        fullName: fullName.trim(),
        updated_at: new Date(),
      };

      if (Number(currentUser.role) == 2 && role != undefined) {
        updateData.role = Number(role);
      }

      if (account_status != undefined) {
        updateData.account_status = Number(account_status);
      }

      if (password && password.trim()) {
        const bcrypt = require("bcryptjs");
        updateData.password_hash = await bcrypt.hash(password.trim(), 10);
      }

      if (req.file) {
        try {
          if (targetUser.avatar) {
            const fs = require("fs");
            const path = require("path");
            const oldImagePath = path.join(
              __dirname,
              "public",
              targetUser.avatar
            );

            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
  
            }
          }

          updateData.avatar = req.file.path;

        } catch (error) {
          console.error("Lỗi xử lý tải ảnh:", error);
        }
      }

      const updatedUser = await UserModel.findByIdAndUpdate(id, updateData, {
        new: true,
      }).select("-password_hash -refresh_token");

      res.json(updatedUser);
    } catch (error) {
      console.error("Lỗi cập nhật người dùng:", error);
      if (error.code == 11000) {
        return res.status(400).json({ error: "Tên đăng nhập đã tồn tại" });
      }
      res.status(500).json({ error: "Lỗi server khi cập nhật người dùng" });
    }
  }
);

app.post(
  "/api/admin/user/add",
  verifyToken,
  uploadAvatar.single("image"),
  async (req, res) => {
    try {
      const currentUser = req.user;

      if (!currentUser || Number(currentUser.role) < 1) {
        return res
          .status(403)
          .json({ message: "Bạn không có quyền tạo người dùng." });
      }

      let { username, password, email, role, account_status, fullName } =
        req.body;

      if (!username || !password || !email) {
        return res
          .status(400)
          .json({ message: "Vui lòng cung cấp đầy đủ thông tin." });
      }

      const userRole = typeof role == "string" ? parseInt(role) : role;
      const accountStatus =
        typeof account_status == "string"
          ? parseInt(account_status)
          : account_status;

      if (isNaN(userRole)) {
        return res.status(400).json({ message: "Vai trò không hợp lệ." });
      }

      if (userRole >= Number(currentUser.role)) {
        return res.status(403).json({
          message: "Không thể tạo tài khoản với quyền ngang hoặc cao hơn bạn.",
        });
      }

      const existingUser = await UserModel.findOne({
        $or: [{ username }, { email }],
      });

      if (existingUser) {
        return res
          .status(400)
          .json({ message: "Username hoặc email đã tồn tại" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new UserModel({
        username,
        password_hash: hashedPassword,
        email,
        role: userRole,
        account_status: accountStatus || 0,
        fullName: fullName || "",
        avatar: null,
      });

      const savedUser = await newUser.save();

      const { password_hash, ...userSafe } = savedUser.toObject();
      res.status(201).json({
        message: "Tạo người dùng thành công",
        user: userSafe,
        success: true,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Lỗi server", error: error.message, success: false });
    }
  }
);

app.delete("/api/admin/user/delete/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const currentUser = req.user;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      error: "ID không hợp lệ",
      thong_bao: "ID không hợp lệ",
    });
  }

  try {
    const targetUser = await UserModel.findById(id);

    if (!targetUser) {
      return res.status(404).json({
        error: "Không tìm thấy người dùng",
        thong_bao: "Không tìm thấy người dùng",
      });
    }

    if (targetUser._id.equals(currentUser._id)) {
      return res.status(400).json({
        error: "Không thể tự xóa chính mình",
        thong_bao: "Không thể tự xóa chính mình",
      });
    }

    const currentUserRole = Number(currentUser.role);
    const targetUserRole = Number(targetUser.role);

    let canDelete = false;

    if (currentUserRole == 2) {
      canDelete = targetUserRole < 2;
    } else if (currentUserRole == 1) {
      canDelete = targetUserRole == 0;
    } else if (currentUserRole == 0) {
      canDelete = false;
    }

    if (!canDelete) {
      return res.status(403).json({
        error: "Bạn không có quyền xóa người dùng này",
        thong_bao: "Bạn không có quyền xóa người dùng này",
      });
    }

    await UserModel.findByIdAndDelete(id);

    res.json({
      message: "Xóa người dùng thành công",
      thong_bao: "Xóa người dùng thành công",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      error: "Lỗi server khi xóa người dùng",
      thong_bao: "Lỗi server khi xóa người dùng",
    });
  }
});

app.get("/api/admin/order", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10000;
  const skip = (page - 1) * limit;

  const searchTerm = req.query.searchTerm || "";
  const statusFilter = req.query.statusFilter;
  const paymentStatusFilter = req.query.paymentStatusFilter;
  const sortOption = req.query.sort || "newest";

  const statusMapping = {
    'choXuLy': 'pending',
    'dangXuLy': 'processing',
    'dangGiaoHang': 'shipping',
    'daGiaoHang': 'delivered',
    'daHuy': 'cancelled',
    'hoanTra': 'returned',
    'hoanThanh': 'completed'
  };

  const paymentStatusMapping = {
    'chuaThanhToan': 'unpaid',
    'thanhToan': 'paid',
    'choHoanTien': 'refunding',
    'hoanTien': 'refunded'
  };

  let query = {};
  let sortQuery = {};

  if (statusFilter && statusFilter != "all") {
    query.order_status = statusMapping[statusFilter] || statusFilter;
  }

  if (paymentStatusFilter && paymentStatusFilter != "all") {
    query.payment_status = paymentStatusMapping[paymentStatusFilter] || paymentStatusFilter;
  }

  switch (sortOption) {
    case "newest":
      sortQuery = { created_at: -1 };
      break;
    case "oldest":
      sortQuery = { created_at: 1 };
      break;
    case "price-asc":
      sortQuery = { total_amount: 1 };
      break;
    case "price-desc":
      sortQuery = { total_amount: -1 };
      break;
    default:
      sortQuery = { created_at: -1 };
      break;
  }

  try {
    if (searchTerm) {
      const matchedUsers = await UserModel.find({
        username: { $regex: searchTerm, $options: "i" },
      }).select("_id");

      const userIds = matchedUsers.map((user) => user._id);

      if (userIds.length == 0) {
        return res.json({
          list: [],
          totalCount: 0,
          statusCounts: {},
          paymentCounts: {},
        });
      }

      query.user_id = { $in: userIds };
    }

    const total = await OrderModel.countDocuments(query);

    const list = await OrderModel.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .populate({
        path: "user_id",
        model: "users",
        select: "username email",
        populate: {
          path: "addresses",
          model: "address",
          select: "receiver_name phone address",
        },
      })
      .populate({
        path: "voucher_id",
        model: "vouchers",
        select: "voucher_name voucher_code discount_type discount_value",
      })
      .populate({
        path: "payment_method_id",
        model: "payment_methods",
        select: "name",
      })
      .lean();

    for (const order of list) {
      const orderDetails = await OrderDetailModel.find({ order_id: order._id })
        .populate({
          path: "product_id",
          model: "products",
          select: "name price sale_price status",
        })
        .lean();

      const populatedDetails = await Promise.all(
        orderDetails.map(async (item) => {
          const productId = item?.product_id?._id;
          let main_image = null;

          if (productId) {
            main_image = await ProductImageModel.findOne({
              product_id: productId,
              is_main: true,
            })
              .select("image alt")
              .lean();
          }

          return {
            ...item,
            product_id: {
              ...item.product_id,
              main_image,
            },
          };
        })
      );

      order.details = populatedDetails;
    }

    const reverseStatusMapping = {
      'pending': 'choXuLy',
      'processing': 'dangXuLy',
      'shipping': 'dangGiaoHang',
      'delivered': 'daGiaoHang',
      'cancelled': 'daHuy',
      'returned': 'hoanTra',
      'completed': 'hoanThanh'
    };

    const reversePaymentStatusMapping = {
      'unpaid': 'chuaThanhToan',
      'paid': 'thanhToan',
      'refunding': 'choHoanTien',
      'refunded': 'hoanTien'
    };
    for (const order of list) {
      if (order.order_status && reverseStatusMapping[order.order_status]) {
        order.order_status = reverseStatusMapping[order.order_status];
      }
      if (order.payment_status && reversePaymentStatusMapping[order.payment_status]) {
        order.payment_status = reversePaymentStatusMapping[order.payment_status];
      }
    }


    const allOrders = await OrderModel.find({}).lean();
    for (const order of allOrders) {
      if (order.order_status && reverseStatusMapping[order.order_status]) {
        order.order_status = reverseStatusMapping[order.order_status];
      }
      if (order.payment_status && reversePaymentStatusMapping[order.payment_status]) {
        order.payment_status = reversePaymentStatusMapping[order.payment_status];
      }
    }

    const countByStatus = (orders) => {
      return orders.reduce((acc, order) => {
        const frontendStatus = reverseStatusMapping[order.order_status] || order.order_status;
        acc[frontendStatus] = (acc[frontendStatus] || 0) + 1;
        return acc;
      }, {});
    };

    const countByPaymentStatus = (orders) => {
      return orders.reduce((acc, order) => {
        const frontendPaymentStatus = reversePaymentStatusMapping[order.payment_status] || order.payment_status;
        acc[frontendPaymentStatus] = (acc[frontendPaymentStatus] || 0) + 1;
        return acc;
      }, {});
    };

    res.status(200).json({
      list,
      totalCount: total,
      statusCounts: countByStatus(allOrders),
      paymentCounts: countByPaymentStatus(allOrders),
    });
  } catch (error) {
    console.error("Lỗi API đơn hàng:", error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách đơn hàng." });
  }
});

app.get("/api/admin/order/chitiet/:id_dh", async (req, res) => {
  const order_id = req.params.id_dh;

  try {
    const chiTietDonHangs = await OrderDetailModel.find({ order_id }).populate({
      path: "product_id",
      model: "products",
      select: "name price sale_price status description",
    });

    const populated = await Promise.all(
      chiTietDonHangs.map(async (item) => {
        const productId = item?.product_id?._id;
        let main_image = null;

        if (productId) {
          main_image = await ProductImageModel.findOne({
            product_id: productId,
            is_main: true,
          }).select("image alt");
        }

        return {
          ...item.toObject(),
          product_id: {
            ...item.product_id?.toObject?.(),
            main_image,
          },
        };
      })
    );

    if (populated.length > 0) {
      res.json(populated);
    } else {
      res
        .status(404)
        .json({ error: "Không tìm thấy chi tiết cho đơn hàng này." });
    }
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy chi tiết đơn hàng." });
  }
});

app.put("/api/admin/order/suaStatus/:id", async (req, res) => {
  const id = req.params.id;
  const { order_status, payment_status } = req.body;

  const statusMapping = {
    'choXuLy': 'pending',
    'dangXuLy': 'processing', 
    'dangGiaoHang': 'shipping',
    'daGiaoHang': 'delivered',
    'daHuy': 'cancelled',
    'hoanTra': 'returned',
    'hoanThanh': 'completed'
  };

  const paymentStatusMapping = {
    'chuaThanhToan': 'unpaid',
    'thanhToan': 'paid',
    'choHoanTien': 'refunding',
    'hoanTien': 'refunded'
  };

  try {
    let updateData = { updated_at: new Date() };

    if (order_status) {
      const backendStatus = statusMapping[order_status] || order_status;
      updateData.order_status = backendStatus;
    }

    if (payment_status) {
      const backendPaymentStatus = paymentStatusMapping[payment_status] || payment_status;
      updateData.payment_status = backendPaymentStatus;
    }

    const updated = await OrderModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (updated) {
      if (order_status === 'daHuy') {
        try {
          const orderDetails = await OrderDetailModel.find({ order_id: id });
          
          for (const detail of orderDetails) {
            await ProductModel.findByIdAndUpdate(
              detail.product_id,
              { $inc: { quantity: detail.quantity } },
              { new: true }
            );
          }
          

        } catch (stockError) {
          console.error('Lỗi khi cập nhật tồn kho:', stockError);
        }
      }
      const statusNotificationMapping = {
        'choXuLy': 'pending',
        'dangXuLy': 'processing', 
        'dangGiaoHang': 'shipping',
        'daGiaoHang': 'delivered',
        'daHuy': 'cancelled'
      };

      const paymentStatusNotificationMapping = {
        'choHoanTien': 'refunding',
        'hoanTien': 'refunded'
      };
      if (order_status && updated.user_id) {
        const notificationStatus = statusNotificationMapping[order_status];
        if (notificationStatus) {
          await createOrderNotification(
            updated.user_id, 
            updated._id, 
            notificationStatus, 
            updated.orderCode || `ORDER-${updated._id.toString().slice(-6).toUpperCase()}`
          );
        }
      }
      if (payment_status && updated.user_id) {
        const paymentNotificationStatus = paymentStatusNotificationMapping[payment_status];
        if (paymentNotificationStatus) {
          await createOrderNotification(
            updated.user_id, 
            updated._id, 
            paymentNotificationStatus, 
            updated.orderCode || `ORDER-${updated._id.toString().slice(-6).toUpperCase()}`
          );
        }
      }

      res.json({
        message: "Cập nhật trạng thái đơn hàng thành công!",
        order: updated,
      });
    } else {
      res.status(404).json({ error: "Không tìm thấy đơn hàng với ID này." });
    }
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi cập nhật trạng thái đơn hàng." });
  }
});

app.get("/api/admin/news", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 1000 ;
  const skip = (page - 1) * limit;

  const searchTerm = req.query.searchTerm || "";
  const statusFilter = req.query.statusFilter;
  const categoryFilter = req.query.categoryFilter;
  const sortOption = req.query.sort || "newest";

  let query = {};
  let sortQuery = {};

  switch (sortOption) {
    case "newest":
      sortQuery = { created_at: -1 };
      break;
    case "oldest":
      sortQuery = { created_at: 1 };
      break;
    case "name-asc":
      sortQuery = { title: 1 };
      break;
    case "name-desc":
      sortQuery = { title: -1 };
      break;
    default:
      sortQuery = { created_at: -1 };
      break;
  }

  if (searchTerm) {
    query.title = { $regex: searchTerm, $options: "i" };
  }

  if (statusFilter && statusFilter != "all") {
    query.news_status = parseInt(statusFilter);
  }

  if (categoryFilter && categoryFilter != "all") {
    query.categorynews_id = categoryFilter;
  }

  try {
    const total = await NewsModel.countDocuments(query);
    const list = await NewsModel.find(query)
      .populate({
        path: "categorynews_id",
        model: "category_news",
        select: "name",
      })
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    res.json({ list, total });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách tin tức." });
  }
});

app.get("/api/admin/news/:id", async (req, res) => {
  const newsId = req.params.id;

  try {
    const news = await NewsModel.findById(newsId).populate({
      path: "categorynews_id",
      model: "category_news",
      select: "name",
    });

    if (!news) {
      return res.status(404).json({ error: "Không tìm thấy loại sản phẩm." });
    }

    res.json({ news });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy loại sản phẩm." });
  }
});

app.post(
  "/api/admin/news/them",
  uploadCateNews.single("image"),
  async (req, res) => {
    try {
      const { title, content, categorynews_id, news_status } = req.body;

      const image = req.file ? req.file.path : null;

      const newTin = await NewsModel.create({
        title,
        content,
        categorynews_id,
        news_status: news_status == undefined ? 0 : parseInt(news_status),
        image,
        created_at: new Date(),
        updated_at: new Date(),
      });

      res.status(201).json({
        message: "Thêm tin tức thành công!",
        tin_tuc: newTin,
      });
    } catch (error) {
      res.status(500).json({
        error: "Lỗi khi thêm tin tức",
        details: error.message,
      });
    }
  }
);

app.put(
  "/api/admin/news/sua/:id",
  uploadCateNews.single("image"),
  async (req, res) => {
    const id = req.params.id;
    const { title, content, categorynews_id, news_status } = req.body;

    const image = req.file ? req.file.path : null;

    try {
      const updateData = {
        title,
        content,
        categorynews_id,
        news_status: news_status == undefined ? 0 : parseInt(news_status),
        updated_at: new Date(),
      };

      if (image) updateData.image = image;

      const updatedTin = await NewsModel.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      if (updatedTin) {
        res.json({
          message: "Cập nhật tin tức thành công!",
          tin_tuc: updatedTin,
        });
      } else {
        res.status(404).json({ error: "Không tìm thấy tin tức với ID này." });
      }
    } catch (error) {
      res.status(500).json({
        error: "Lỗi khi cập nhật tin tức",
        details: error.message,
      });
    }
  }
);

app.delete("/api/admin/news/xoa/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const deleted = await NewsModel.findByIdAndDelete(id);

    if (deleted) {
      res.json({ message: "Xóa thành công!" });
    } else {
      res.status(404).json({ error: "Không tìm thấy tin tức với ID này." });
    }
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi xóa tin tức." });
  }
});

app.get("/api/admin/categoryNews", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10000;
  const skip = (page - 1) * limit;

  const searchTerm = req.query.searchTerm || "";
  const statusFilter = req.query.statusFilter;
  const sortOption = req.query.sort || "newest";

  let query = {};
  let sortQuery = {};

  switch (sortOption) {
    case "newest":
      sortQuery = { created_at: -1 };
      break;
    case "oldest":
      sortQuery = { created_at: 1 };
      break;
    case "name-asc":
      sortQuery = { name: 1 };
      break;
    case "name-desc":
      sortQuery = { name: -1 };
      break;
    default:
      sortQuery = { created_at: -1 };
      break;
  }

  if (searchTerm) {
    query.name = { $regex: searchTerm, $options: "i" };
  }

  if (statusFilter && statusFilter != "all") {
    query.status = parseInt(statusFilter);
  }

  try {
    const total = await CategoryNewsModel.countDocuments(query);
    const list = await CategoryNewsModel.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    res.json({ list, total });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách loại tin." });
  }
});

app.get("/api/admin/categoryNews/:id", async (req, res) => {
  const categoryNewsId = req.params.id;

  try {
    const categoryNews = await CategoryNewsModel.findById(categoryNewsId);

    if (!categoryNews) {
      return res.status(404).json({ error: "Không tìm thấy loại sản phẩm." });
    }

    res.json({ categoryNews });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy loại sản phẩm." });
  }
});

app.post("/api/admin/categoryNews/them", async (req, res) => {
  const { name, status } = req.body;

  try {
    await CategoryNewsModel.create({
      name,
      status: status == undefined ? 0 : parseInt(status),
      created_at: new Date(),
      updated_at: new Date(),
    });

    res.status(200).json({ message: "Thêm loại tin thành công!" });
  } catch (error) {
    res.status(500).json({ error: "Tên danh mục đã tồn tại!" });
  }
});

app.put("/api/admin/categoryNews/sua/:id", async (req, res) => {
  const id = req.params.id;
  const { name, status } = req.body;

  try {
    const updatedLoai = await CategoryNewsModel.findByIdAndUpdate(
      id,
      {
        name,
        status: status == undefined ? 0 : parseInt(status),
        updated_at: new Date(),
      },
      { new: true }
    );

    if (updatedLoai) {
      res.json({ message: "Cập nhật loại tin thành công!", loai: updatedLoai });
    } else {
      res.status(404).json({ error: "Không tìm thấy loại tin với ID này." });
    }
  } catch (error) {
    res.status(500).json({ error: "Tên danh mục đã tồn tại!" });
  }
});

app.delete("/api/admin/categoryNews/xoa/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const count = await NewsModel.countDocuments({ categorynews_id: id });
    if (count > 0) {
      return res.status(400).json({
        thong_bao: "Không thể xóa vì vẫn còn tin thuộc loại này.",
      });
    }

    const deleted = await CategoryNewsModel.findByIdAndDelete(id);
    if (deleted) {
      res.json({ message: "Xóa loại tin thành công!" });
    } else {
      res.status(404).json({ error: "Không tìm thấy loại tin với ID này." });
    }
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi xóa loại tin." });
  }
});

app.get("/api/admin/voucher", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const searchTerm = req.query.searchTerm || "";
  const statusFilter = req.query.statusFilter;
  const sortOption = req.query.sort || "newest";

  let query = {};
  let sortQuery = {};

  switch (sortOption) {
    case "newest":
      sortQuery = { created_at: -1 };
      break;
    case "oldest":
      sortQuery = { created_at: 1 };
      break;
    case "name-asc":
      sortQuery = { voucher_name: 1 };
      break;
    case "name-desc":
      sortQuery = { voucher_name: -1 };
      break;
    default:
      sortQuery = { created_at: -1 };
      break;
  }

  if (searchTerm) {
    query.$or = [
      { voucher_name: { $regex: searchTerm, $options: "i" } },
      { voucher_code: { $regex: searchTerm, $options: "i" } },
    ];
  }

  if (statusFilter == "Còn hạn") {
    query.end_date = { $gte: new Date() };
  } else if (statusFilter == "Hết hạn") {
    query.end_date = { $lt: new Date() };
  }

  try {
    const total = await VoucherModel.countDocuments(query);
    const list = await VoucherModel.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    res.json({ list, total });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách voucher." });
  }
});

app.get("/api/admin/voucher/:id", async (req, res) => {
  const voucherId = req.params.id;

  try {
    const voucher = await VoucherModel.findById(voucherId);

    if (!voucher) {
      return res.status(404).json({ error: "Không tìm thấy voucher." });
    }

    res.json({ voucher });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy voucher." });
  }
});

app.post("/api/admin/voucher/them", async (req, res) => {
  const {
    voucher_name,
    voucher_code,
    start_date,
    end_date,
    discount_type,
    discount_value,
    minimum_order_value,
    max_discount,
    target_audience,
  } = req.body;

  try {
    const existingVoucher = await VoucherModel.findOne({ voucher_code });
    if (existingVoucher) {
      return res.status(400).json({ error: "Mã khuyến mãi đã tồn tại!" });
    }
    const existingVoucherName = await VoucherModel.findOne({ voucher_name });
    if (existingVoucherName) {
      return res.status(400).json({ error: "Tên khuyến mãi đã tồn tại!" });
    }

    const newVoucher = await VoucherModel.create({
      voucher_name,
      voucher_code,
      start_date,
      end_date,
      discount_type,
      discount_value,
      minimum_order_value: minimum_order_value || 0,
      max_discount: max_discount || 0,
      target_audience: target_audience || 'all',
      created_at: new Date(),
      updated_at: new Date(),
    });

    res.json({
      message: "Thêm voucher thành công!",
      voucher: newVoucher,
    });
  } catch (error) {
    console.error("Lỗi khi thêm voucher:", error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      if (field === 'voucher_code') {
        return res.status(400).json({ error: "Mã khuyến mãi đã tồn tại!" });
      } else if (field === 'voucher_name') {
        return res.status(400).json({ error: "Tên khuyến mãi đã tồn tại!" });
      }
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    
    res.status(500).json({ error: "Đã xảy ra lỗi khi thêm voucher. Vui lòng thử lại!" });
  }
});

app.put("/api/admin/voucher/sua/:id", async (req, res) => {
  const id = req.params.id;
  const {
    voucher_name,
    voucher_code,
    start_date,
    end_date,
    discount_type,
    discount_value,
    minimum_order_value,
    max_discount,
    target_audience,
  } = req.body;

  try {
    const existingVoucher = await VoucherModel.findById(id);
    if (!existingVoucher) {
      return res.status(404).json({ error: "Không tìm thấy voucher với ID này." });
    }

    const duplicateCode = await VoucherModel.findOne({ 
      voucher_code, 
      _id: { $ne: id } 
    });
    if (duplicateCode) {
      return res.status(400).json({ error: "Mã khuyến mãi đã tồn tại!" });
    }
    const duplicateName = await VoucherModel.findOne({ 
      voucher_name, 
      _id: { $ne: id } 
    });
    if (duplicateName) {
      return res.status(400).json({ error: "Tên khuyến mãi đã tồn tại!" });
    }

    const updated = await VoucherModel.findByIdAndUpdate(
      id,
      {
        voucher_name,
        voucher_code,
        start_date,
        end_date,
        discount_type,
        discount_value,
        minimum_order_value: minimum_order_value || 0,
        max_discount: max_discount || 0,
        target_audience: target_audience || 'all',
        updated_at: new Date(),
      },
      { new: true }
    );

    res.json({
      message: "Cập nhật voucher thành công!",
      voucher: updated,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật voucher:", error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      if (field === 'voucher_code') {
        return res.status(400).json({ error: "Mã khuyến mãi đã tồn tại!" });
      } else if (field === 'voucher_name') {
        return res.status(400).json({ error: "Tên khuyến mãi đã tồn tại!" });
      }
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    
    res.status(500).json({ error: "Đã xảy ra lỗi khi cập nhật voucher. Vui lòng thử lại!" });
  }
});

app.delete("/api/admin/voucher/xoa/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const deleted = await VoucherModel.findByIdAndDelete(id);

    if (deleted) {
      res.json({ message: "Xóa thành công!" });
    } else {
      res.status(404).json({ error: "Không tìm thấy voucher với ID này." });
    }
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi xóa." });
  }
});

app.get("/api/admin/brand", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10000;
  const skip = (page - 1) * limit;

  const search = req.query.search || "";
  const status = req.query.status || "all";
  const sortBy = req.query.sortBy || "newest";

  try {
    let query = {};
    if (search && search.trim() != "") {
      query.name = { $regex: search.trim(), $options: "i" };
    }
    if (status != "all") {
      query.brand_status = parseInt(status);
    }
    let sortOption = {};
    switch (sortBy) {
      case "newest":
        sortOption = { created_at: -1 };
        break;
      case "oldest":
        sortOption = { created_at: 1 };
        break;
      case "a-z":
        sortOption = { name: 1 };
        break;
      case "z-a":
        sortOption = { name: -1 };
        break;
      default:
        sortOption = { created_at: -1 };
    }

    const total = await BrandModel.countDocuments(query);
    const list = await BrandModel.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    res.json({
      list,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      sortBy,
      status,
      search,
    });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách thương hiệu." });
  }
});

app.get("/api/admin/brand/:id", async (req, res) => {
  const brandId = req.params.id;

  try {
    const brand = await BrandModel.findById(brandId);

    if (!brand) {
      return res.status(404).json({ error: "Không tìm thấy thương hiệu." });
    }

    res.json({ brand });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy thương hiệu." });
  }
});

app.post(
  "/api/admin/brand/add",
  uploadCateBrand.single("image"),
  async function (req, res) {
    try {
      const { name, alt, brand_status, description } = req.body;
      const image = req.file ? `${req.file.path}` : null;

      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: "Tên thương hiệu không được để trống!" });
      }

      if (!alt || typeof alt !== 'string' || !alt.trim()) {
        return res.status(400).json({ error: "Alt không được để trống!" });
      }

      if (!image) {
        return res.status(400).json({ error: "Vui lòng chọn ảnh cho thương hiệu!" });
      }

      const existingBrand = await BrandModel.findOne({ name: name.trim() });
      if (existingBrand) {
        return res.status(400).json({ error: "Tên thương hiệu đã tồn tại!" });
      }

      const newLoai = new BrandModel({
        name: name.trim(),
        image,
        alt: alt.trim(),
        description: description || "",
        brand_status: brand_status == undefined ? 0 : parseInt(brand_status),
        created_at: new Date(),
        updated_at: new Date(),
      });

      await newLoai.save();
      res.status(200).json({ message: "Thêm thương hiệu thành công!" });
    } catch (error) {
      console.error("Lỗi khi thêm thương hiệu:", error);
      res.status(500).json({ error: "Lỗi khi thêm thương hiệu: " + error.message });
    }
  }
);

app.put(
  "/api/admin/brand/edit/:id",
  uploadCateBrand.single("image"),
  async function (req, res) {
    const id = req.params.id;
    const { name, alt, brand_status, description } = req.body;
    const image = req.file ? `${req.file.path}` : req.body.image_cu;

    try {
      const updatedBrand = await BrandModel.findByIdAndUpdate(
        id,
        {
          name,
          image,
          alt,
          description,
          brand_status: brand_status == undefined ? 0 : parseInt(brand_status),
          updated_at: new Date(),
        },
        { new: true }
      );

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "ID không hợp lệ." });
      }

      if (updatedBrand) {
        res.json({
          message: "Cập nhật thương hiệu thành công!",
          brand: updatedBrand,
        });
      } else {
        res.status(404).json({ error: "Không tìm thấy thương hiệu." });
      }
    } catch (error) {
      res.status(500).json({ error: "Lỗi khi cập nhật thương hiệu." });
    }
  }
);

app.delete("/api/admin/brand/xoa/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const count = await ProductModel.countDocuments({
      brand_id: id,
    });
    if (count > 0) {
      return res.status(400).json({
        thong_bao: "Không thể xóa vì vẫn còn sản phẩm thuộc thương hiệu này.",
      });
    }

    const deleted = await BrandModel.findByIdAndDelete(id);

    if (deleted) {
      res.json({ message: "Xóa thương hiệu thành công!" });
    } else {
      res.status(404).json({ error: "Không tìm thấy brand với ID này." });
    }
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi xóa thương hiệu." });
  }
});



app.get("/api/admin/review", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const search = req.query.search || "";
  const ratingFilter = req.query.rating || "all";
  const sortBy = req.query.sortBy || "created_at";
  const sortOrder = req.query.sortOrder || "desc";

  try {
    let filterQuery = {};
    
    if (ratingFilter != "all") {
      filterQuery.rating = parseInt(ratingFilter);
    }

    if (search) {
      filterQuery.comment = { $regex: search, $options: "i" };
    }

    const total = await ReviewModel.countDocuments(filterQuery);
    
    const list = await ReviewModel.find(filterQuery)
      .sort({ [sortBy]: sortOrder == "desc" ? -1 : 1 })
      .skip(skip)
      .limit(limit)
      .populate('user_id', 'username fullName')
      .populate({
        path: 'order_detail_id',
        populate: {
          path: 'product_id',
          select: 'name'
        }
      });

    const populatedList = list.map(review => review.toObject());

    res.json({
      list: populatedList,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    });
  } catch (error) {
    console.error("Lỗi trong API /api/admin/review:", error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách đánh giá." });
  }
});

app.get("/api/admin/payment-method", async function (req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const searchTerm = req.query.searchTerm || "";
  const statusFilter = req.query.statusFilter;
  const sortOption = req.query.sort || "newest";

  let query = {};
  let sortQuery = {};

  switch (sortOption) {
    case "newest":
      sortQuery = { created_at: -1 };
      break;
    case "oldest":
      sortQuery = { created_at: 1 };
      break;
    case "name-asc":
      sortQuery = { name: 1 };
      break;
    case "name-desc":
      sortQuery = { name: -1 };
      break;
    default:
      sortQuery = { created_at: -1 };
      break;
  }

  if (searchTerm) {
    query.name = { $regex: searchTerm, $options: "i" };
  }

  if (statusFilter && statusFilter != "all") {
    query.is_active = parseInt(statusFilter);
  }

  try {
    const total = await PaymentMethodModel.countDocuments(query);
    const list = await PaymentMethodModel.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    res.json({ list, total });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Lỗi khi lấy danh sách phương thức thanh toán." });
  }
});

app.get("/api/admin/payment-method/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const payment = await PaymentMethodModel.findById(id);
    if (!payment) {
      return res
        .status(404)
        .json({ error: "Không tìm thấy phương thức thanh toán." });
    }

    res.json({ payment });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy phương thức thanh toán." });
  }
});

app.post(
  "/api/admin/payment-method/them",
  uploadPMs.single("image"),
  async (req, res) => {
    const { name, code, description, is_active } = req.body;

    const icon_url = req.file ? req.file.path : null;

    const existingProduct = await PaymentMethodModel.findOne({
      name: name.trim(),
    });
    if (existingProduct) {
      return res.status(400).json({ error: "Tên phương thức đã tồn tại!" });
    }

    try {
      const newPayment = await PaymentMethodModel.create({
        name,
        code,
        description,
        is_active: is_active != undefined ? !!is_active : true,
        icon_url,
        created_at: new Date(),
        updated_at: new Date(),
      });

      res.status(201).json({
        message: "Thêm phương thức thanh toán thành công!",
        payment: newPayment,
      });
    } catch (error) {
      res.status(500).json({ error: "Tên hoặc code này đã tồn tại!" });
    }
  }
);

app.put(
  "/api/admin/payment-method/sua/:id",
  uploadPMs.single("image"),
  async (req, res) => {
    const id = req.params.id;
    const { name, code, description, is_active } = req.body;

    const image = req.file ? req.file.path : null;

    try {
      const updatedPayment = {
        name,
        code,
        description,
        is_active: is_active == "true",
        updated_at: new Date(),
      };

      const existingProduct = await PaymentMethodModel.findOne({
        name: name.trim(),
        _id: { $ne: id },
      });
      if (existingProduct) {
        return res.status(400).json({ error: "Tên phương thức đã tồn tại!" });
      }

      if (image) updatedPayment.icon_url = image;

      const updatedPM = await PaymentMethodModel.findByIdAndUpdate(
        id,
        updatedPayment,
        {
          new: true,
        }
      );

      if (updatedPM) {
        res.json({
          message: "Cập nhật phương thức thanh toán thành công!",
        });
      } else {
        res
          .status(404)
          .json({ error: "Không tìm thấy phương thức thanh toán với ID này." });
      }
    } catch (error) {
      res.status(500).json({
        error: "Tên hoặc code này đã tồn tại!",
      });
    }
  }
);

app.delete("/api/admin/payment-method/xoa/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const deleted = await PaymentMethodModel.findByIdAndDelete(id);

    if (!deleted) {
      return res
        .status(404)
        .json({ error: "Không tìm thấy phương thức thanh toán." });
    }

    res.json({ message: "Xóa phương thức thanh toán thành công!" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi xóa phương thức thanh toán." });
  }
});

app.put(
  "/api/admin/account/edit/:id",
  uploadAvatar.single("image"),
  verifyToken,
  async (req, res) => {

    const { id } = req.params;
    const { username, fullName, avatar, password } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID không hợp lệ",
      });
    }

    if (!username || username.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Tên đăng nhập phải có ít nhất 3 ký tự",
      });
    }

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Họ và tên là bắt buộc",
      });
    }

    if (password && password.trim() && password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu mới phải có ít nhất 6 ký tự",
      });
    }

    try {
      const targetUser = await UserModel.findById(id);
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy người dùng.",
        });
      }

      let avatarPath = targetUser.avatar;

      if (req.file) {
        avatarPath = `${req.file.path}`;
      } else if (avatar && avatar.trim()) {
        avatarPath = avatar.trim();
      }

      if (username.trim() != targetUser.username) {
        const existingUser = await UserModel.findOne({
          username: username.trim(),
          _id: { $ne: id },
        });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: "Tên đăng nhập đã tồn tại",
          });
        }
      }

      const updateData = {
        username: username.trim(),
        fullName: fullName.trim(),
        avatar: avatarPath,
        updatedAt: new Date(),
      };

      if (password && password.trim()) {
        const bcrypt = require("bcryptjs");
        updateData.password_hash = await bcrypt.hash(password.trim(), 10);
      }

      const updatedUser = await UserModel.findByIdAndUpdate(id, updateData, {
        new: true,
      }).select("-password_hash -refresh_token");

      const responseUser = {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      };

      res.json({
        success: true,
        message: "Cập nhật tài khoản thành công",
        user: responseUser,
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật tài khoản:", error);

      if (error.name == "ValidationError") {
        const errors = Object.values(error.errors).map((err) => err.message);
        return res.status(400).json({
          success: false,
          message: `Dữ liệu không hợp lệ: ${errors.join(", ")}`,
        });
      }

      if (error.code == 11000) {
        const field = Object.keys(error.keyValue)[0];
        const value = error.keyValue[field];
        return res.status(400).json({
          success: false,
          message: `${
            field == "username" ? "Tên đăng nhập" : "Trường"
          } "${value}" đã tồn tại`,
        });
      }

      res.status(500).json({
        success: false,
        message: "Lỗi server khi cập nhật tài khoản",
      });
    }
  }
);

app.get("/check-role", (req, res) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader)
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });

  const token = authHeader.split(" ")[1];
  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    UserModel.findById(decoded.userId).then((user) => {
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      res.json({
        success: true,
        user: {
          userId: user._id,
          username: user.username,
          role: user.role,
        },
        role: {
          id: user.role,
          name:
            user.role == "2"
              ? "Super Admin"
              : user.role == "1"
              ? "Admin"
              : "User",
          displayName: user.fullName || user.username,
          permissions: [],
        },
      });
    });
  } catch (err) {
    return res
      .status(403)
      .json({ success: false, message: "Token invalid or expired" });
  }
});

app.get("/check-username", async (req, res) => {
  const { username } = req.query;
  const user = await UserModel.findOne({ username });
  res.json({ exists: !!user });
});

app.get('/api/notifications', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notifications = await NotificationModel.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const unreadCount = await NotificationModel.countDocuments({ 
      userId, 
      isRead: false 
    });

    const total = await NotificationModel.countDocuments({ userId });

    res.json({
      notifications,
      unreadCount,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Lỗi khi tải thông báo' });
  }
});

app.put('/api/notifications/:id/read', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const notification = await NotificationModel.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true, updatedAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Không tìm thấy thông báo' });
    }

    res.json({ message: 'Đã đánh dấu thông báo đã đọc' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Lỗi khi cập nhật thông báo' });
  }
});

app.put('/api/notifications/mark-all-read', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    await NotificationModel.updateMany(
      { userId, isRead: false },
      { isRead: true, updatedAt: new Date() }
    );

    res.json({ message: 'Đã đánh dấu tất cả thông báo đã đọc' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Lỗi khi cập nhật thông báo' });
  }
});

app.post('/api/notifications/create', verifyToken, isAdmin, async (req, res) => {
  try {
    const { userId, title, message, type = 'system', orderId } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    const notification = new NotificationModel({
      userId,
      title,
      message,
      type,
      orderId: orderId || null
    });

    await notification.save();

    res.json({ 
      message: 'Tạo thông báo thành công',
      notification 
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Lỗi khi tạo thông báo' });
  }
});

const createOrderNotification = async (userId, orderId, orderStatus, orderCode) => {
  try {
    let title, message;
    
    switch(orderStatus) {
      case 'pending':
        title = 'Đơn hàng đã được đặt thành công!';
        message = `Đơn hàng #${orderCode} của bạn đã được đặt và đang chờ xác nhận. Chúng tôi sẽ liên hệ với bạn sớm nhất.`;
        break;
      case 'paid':
        title = 'Đơn hàng đã được thanh toán!';
        message = `Đơn hàng #${orderCode} đã được thanh toán thành công. Chúng tôi sẽ xử lý và giao hàng sớm nhất có thể.`;
        break;
      case 'processing':
        title = 'Đơn hàng đã được xác nhận';
        message = `Đơn hàng #${orderCode} đã được xác nhận và đang được chuẩn bị. Bạn có thể theo dõi tiến độ trong tài khoản.`;
        break;
      case 'shipping':
        title = 'Đơn hàng đang được giao';
        message = `Đơn hàng #${orderCode} đang trên đường giao đến bạn. Vui lòng chú ý điện thoại để nhận hàng.`;
        break;
      case 'delivered':
        title = 'Đơn hàng đã được giao thành công';
        message = `Đơn hàng #${orderCode} đã được giao thành công. Cảm ơn bạn đã mua sắm tại VClock!`;
        break;
      case 'cancelled':
        title = 'Đơn hàng đã bị hủy';
        message = `Đơn hàng #${orderCode} đã bị hủy. Nếu có thắc mắc, vui lòng liên hệ hotline để được hỗ trợ.`;
        break;
      case 'returned':
        title = 'Yêu cầu trả hàng đã được chấp nhận';
        message = `Đơn hàng #${orderCode} đã được chấp nhận trả hàng. Chúng tôi sẽ xử lý trong thời gian sớm nhất.`;
        break;
      case 'refunding':
        title = 'Yêu cầu hoàn tiền đã được xử lý';
        message = `Đơn hàng #${orderCode} đã được chấp nhận trả hàng. Chúng tôi sẽ xử lý hoàn tiền trong thời gian sớm nhất.`;
        break;
      case 'refunded':
        title = 'Hoàn tiền thành công';
        message = `Đơn hàng #${orderCode} đã được hoàn tiền thành công. Số tiền sẽ được chuyển về tài khoản của bạn trong 3-5 ngày làm việc.`;
        break;
      // case 'completed':
      //   title = 'Đơn hàng đã hoàn thành';
      //   message = `Đơn hàng #${orderCode} đã được hoàn thành. Cảm ơn bạn đã mua sắm tại VClock!`;
      //   break;
      default:
        return;
    }

    const notification = new NotificationModel({
      userId,
      title,
      message,
      type: 'order',
      orderId
    });

    await notification.save();
  } catch (error) {
    console.error('Error creating order notification:', error);
  }
};


const autoCompleteOrders = async () => {
  try {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const ordersToComplete = await OrderModel.find({
      $or: [
        { order_status: "delivered" },
        { order_status: "daGiaoHang" }
      ],
      updated_at: { $lte: twoDaysAgo }
    });

    if (ordersToComplete.length > 0) {
      for (const order of ordersToComplete) {
        await OrderModel.findByIdAndUpdate(order._id, {
          order_status: "completed",
          updated_at: new Date()
        });
        if (order.user_id) {
          await createOrderNotification(
            order.user_id, 
            order._id, 
            'completed', 
            order.orderCode || `ORDER-${order._id.toString().slice(-6).toUpperCase()}`
          );
        }
      }
    }
  } catch (error) {
    console.error(' Lỗi khi tự động chuyển trạng thái đơn hàng:', error);
  }
};



setInterval(autoCompleteOrders, 300000);

autoCompleteOrders();

server.listen(port, () => {
  console.log(`🚀 Server đang chạy tại port ${port}`);
});