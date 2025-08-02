require('dotenv').config();

const mongoose = require("mongoose");

// Sử dụng MongoDB Atlas thay vì local
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/DATN_V2";

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Kết nối MongoDB Atlas thành công');
})
.catch((error) => {
  console.error('❌ Lỗi kết nối MongoDB:', error);
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


//app.use( [ cors() , exp.json() ] );

const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const passport = require('passport');
require('./auth/google'); // import cấu hình passport google
require('./auth/facebook');

app.use(cors({
  origin: function (origin, callback) {
    // Cho phép requests không có origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    // Loại bỏ dấu / ở cuối nếu có
    const cleanOrigin = origin.replace(/\/$/, '');
    
    // Danh sách domain được phép
    const allowedOrigins = [
      'https://fe-vclock.vercel.app',
      'https://www.fe-vclock.vercel.app',
      'https://vclock.fun',
      'http://localhost:3005'
    ];
    
    // Pattern matching cho Vercel preview deployments
    const vercelPattern = /^https:\/\/fe-vclock.*\.vercel\.app$/;
    
    if (allowedOrigins.includes(cleanOrigin) || vercelPattern.test(cleanOrigin)) {
      callback(null, cleanOrigin); // Trả về origin đã được clean
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.options('*', cors());

// Middleware để debug CORS
app.use((req, res, next) => {
  console.log('Request origin:', req.headers.origin);
  console.log('Request method:', req.method);
  console.log('Request path:', req.path);
  next();
});

app.use( exp.json() );

app.all('/checkout-success', (req, res) => {
  res.sendStatus(200);
});

// Test endpoint để kiểm tra CORS
app.get('/test-cors', (req, res) => {
  res.json({
    message: 'CORS test successful',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// ! Lưu ảnh phương thức thanh toán
const uploadPM = path.join(
  __dirname,
  "..",
  "DATN_FE",
  "public",
  "images",
  "payment-Method"
);

const storagePM = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPM);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomNum = Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, "-");
    cb(null, `${baseName}-${timestamp}-${randomNum}${ext}`);
  },
});

const uploadPMs = multer({
  storage: storagePM,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Chỉ cho phép file ảnh (.jpg, .jpeg, .png, .webp)!"),
        false
      );
    }
    cb(null, true);
  },
});

module.exports = uploadPMs;

// ! Lưu ảnh Avatar
const uploadAvt = path.join(
  __dirname,
  "uploads",
  "avatars"
);

const storageAvt = multer.diskStorage({
  destination: (req, file, cb) => {
    // Đảm bảo thư mục tồn tại
    if (!fs.existsSync(uploadAvt)) {
      fs.mkdirSync(uploadAvt, { recursive: true });
    }
    cb(null, uploadAvt);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomNum = Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, "-");
    cb(null, `${baseName}-${timestamp}-${randomNum}${ext}`);
  },
});

const uploadAvatar = multer({
  storage: storageAvt,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Chỉ cho phép file ảnh (.jpg, .jpeg, .png, .webp)!"),
        false
      );
    }
    cb(null, true);
  },
});

module.exports = uploadAvatar;


// ! Lưu ảnh account user admin

const storageUser = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(
      __dirname,
      "..",
      "duantn",
      "public",
      "images",
      "avatar"
    );
    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + fileExtension);
  },
});
const uploadUser = multer({ storage: storageUser });

// ! Lưu ảnh danh mục sản phẩm
const uploadDir = path.join(
  __dirname,
  "..",
  "DATN",
  "public",
  "images",
  "category"
);

const storageCateProduct = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomNum = Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, "-");
    cb(null, `${baseName}-${timestamp}-${randomNum}${ext}`);
  },
});

const uploadCateProduct = multer({
  storage: storageCateProduct,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Chỉ cho phép file ảnh (.jpg, .jpeg, .png, .webp)!"),
        false
      );
    }
    cb(null, true);
  },
});

module.exports = uploadCateProduct;

// ! Lưu ảnh thương hiệu
const uploadBrand = path.join(
  __dirname,
  "..",
  "DATN",
  "public",
  "images",
  "brand"
);

const storageBrand = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadBrand);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomNum = Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, "-");
    cb(null, `${baseName}-${timestamp}-${randomNum}${ext}`);
  },
});

const uploadCateBrand = multer({
  storage: storageBrand,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Chỉ cho phép file ảnh (.jpg, .jpeg, .png, .webp)!"),
        false
      );
    }
    cb(null, true);
  },
});

module.exports = uploadCateBrand;

// ! Lưu ảnh tin tức
const uploadNews = path.join(
  __dirname,
  "..",
  "DATN",
  "public",
  "images",
  "news"
);

const storageCateNews = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadNews);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomNum = Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, "-");
    cb(null, `${baseName}-${timestamp}-${randomNum}${ext}`);
  },
});

const uploadCateNews = multer({
  storage: storageCateNews,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Chỉ cho phép file ảnh (.jpg, .jpeg, .png, .webp)!"),
        false
      );
    }
    cb(null, true);
  },
});

module.exports = uploadCateNews;

// ! Lưu ảnh sản phẩm
const uploadProduct = path.join(
  __dirname,
  "..",
  "DATN",
  "public",
  "images",
  "product"
);

const storageProduct = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadProduct);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomNum = Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, "-");
    cb(null, `${baseName}-${timestamp}-${randomNum}${ext}`);
  },
});

const uploadDoneProduct = multer({
  storage: storageProduct,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Chỉ cho phép file ảnh (.jpg, .jpeg, .png, .webp)!"),
        false
      );
    }
    cb(null, true);
  },
});

module.exports = uploadDoneProduct;

// ! <== Schema ==>
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
// ! <== End Schema ==>

// ! <== Models ==>
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
// ! <== End Models ==>


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


// ! select vị trí
const {
  getProvinces,
  getDistrictsByProvinceCode,
  getWardsByDistrictCode
} = require('sub-vn');

// http://localhost:3000/api/provinces
app.get('/api/provinces', (req, res) => {
  const provinces = getProvinces(); // [{ name, code }]
  res.json(provinces);
});

// http://localhost:3000/api/districts/02
app.get('/api/districts/:provinceCode', (req, res) => {
  const districts = getDistrictsByProvinceCode(req.params.provinceCode);
  res.json(districts); // [{ name, code }]
});

// http://localhost:3000/api/wards/024
app.get('/api/wards/:districtCode', (req, res) => {
  const wards = getWardsByDistrictCode(req.params.districtCode);
  res.json(wards); // [{ name, code }]
});
// ! <== End select vị trí ==>


const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(exp.json());

// ! Setup api real-time socket.io
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  socket.on('typing', ({ conversationId, userId }) => {
    socket.to(conversationId).emit('typing', { userId });
  });
  

  // Join conversation room
  socket.on('joinConversation', (conversationId) => {
    socket.join(conversationId);
  });

  // Send message
  socket.on('sendMessage', async (msg) => {
    try {
      let senderId = msg.senderId || 'guest';
      let senderName = msg.senderName || 'Khách';
      let senderAvatar = msg.senderAvatar || '';
  
      // Nếu có token thì override thông tin từ token
      if (msg.token) {
        try {
          const decoded = jwt.verify(msg.token, process.env.JWT_SECRET);
          console.log(decoded);
          
          if (decoded) {
            senderId = decoded.id;
            senderName = decoded.name;
            senderAvatar = decoded.avatar || '';
          }
        } catch (err) {
          console.warn('❗ Token không hợp lệ hoặc hết hạn:', err.message);
        }
      }
  
      const newMessage = new MessageModel({
        ...msg,
        senderId,
        senderName,
        senderAvatar,
        createdAt: new Date(),
      });
  
      await newMessage.save();
  
      await ConversationModel.findOneAndUpdate(
        { conversationId: msg.conversationId },
        {
          conversationId: msg.conversationId,
          $addToSet: {
            participants: {
              userId: senderId,
              userName: senderName,
              userAvatar: senderAvatar,
            }
          },
          lastMessage: msg.text || (msg.image ? '[Hình ảnh]' : msg.file ? '[File]' : ''),
          lastMessageType: msg.messageType,
          lastMessageSenderId: senderId,
          lastTime: new Date(),
        },
        { upsert: true, new: true }
      );
  
      io.to(msg.conversationId).emit('newMessage', newMessage);
  
    } catch (error) {
      console.error('❌ Lỗi khi gửi tin nhắn:', error);
    }
  });
  

  // Seen messages
  socket.on('seenMessage', async ({ conversationId, userId }) => {
    try {
      await MessageModel.updateMany(
        { conversationId, seenBy: { $ne: userId } },
        { $addToSet: { seenBy: userId } }
      );
      io.to(conversationId).emit('messagesSeen', { conversationId, userId });
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật seen:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });

  // Delete messages
  socket.on('deleteMessage', async ({ messageId, conversationId }) => {
    try {
      const deletedMessage = await MessageModel.findByIdAndDelete(messageId);
      if (deletedMessage) {
        io.to(conversationId).emit('messageDeleted', { messageId });
      }
    } catch (error) {
      console.error('❌ Lỗi khi xoá tin nhắn:', error);
    }
  });
  
});

//! REST API: Get messages by conversationId
app.get('/api/messages/:conversationId', verifyOptionalToken, async (req, res) => {
  const { conversationId } = req.params;
  const user = req.user;  // Có thể là null nếu không có token

  console.log("🔑 User đang xem:", user);

  try {
    const messages = await MessageModel.find({ conversationId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//! REST API: Get conversations
app.get('/api/conversations', async (req, res) => {
  try {
    const conversations = await ConversationModel.find().sort({ lastTime: -1 });
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//! API REST xoá tin nhắn:
app.delete('/api/messages/:messageId', async (req, res) => {
  const { messageId } = req.params;
  try {
    const deletedMessage = await MessageModel.findByIdAndDelete(messageId);
    if (!deletedMessage) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Gửi thông báo realtime cho những ai trong conversation đó
    io.to(deletedMessage.conversationId).emit('messageDeleted', { messageId });

    res.json({ message: 'Message deleted', messageId });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/api/conversations/:conversationId', async (req, res) => {
  const { conversationId } = req.params;
  try {
    // Xoá tất cả tin nhắn liên quan
    await MessageModel.deleteMany({ conversationId });

    // Xoá cuộc hội thoại
    const deletedConv = await ConversationModel.findOneAndDelete({ conversationId });

    if (!deletedConv) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Gửi socket thông báo xoá
    io.to(conversationId).emit('conversationDeleted', { conversationId });

    res.json({ message: 'Conversation deleted', conversationId });
  } catch (error) {
    console.error('❌ Lỗi khi xoá cuộc hội thoại:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadAvt); // Sử dụng thư mục avatar đã định nghĩa
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const randomNum = Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, "-");
    cb(null, `${baseName}-${timestamp}-${randomNum}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif') {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (jpeg, png, gif)'), false);
  }
};

const upload = multer({ 
  storage: storage, 
  limits: { fileSize: 1024 * 1024 * 5 }, 
  fileFilter: fileFilter 
});

app.use('/uploads', exp.static(path.join(__dirname, 'uploads')));

const jwt = require('jsonwebtoken');
const User = mongoose.model('User', userSchema);

const JWT_SECRET = process.env.JWT_SECRET;

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

// ! register and send email verification
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
    
    // Tạo mã xác thực
    const emailVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const emailVerificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // Hết hạn sau 10 phút

    // Nếu email đã tồn tại nhưng chưa xác thực, cập nhật người dùng đó
    let savedUser;
    const existingUnverifiedUser = await User.findOne({ email, account_status: '0' });

    if (existingUnverifiedUser) {
      existingUnverifiedUser.username = username;
      existingUnverifiedUser.password_hash = password_hash;
      existingUnverifiedUser.emailVerificationCode = emailVerificationCode;
      existingUnverifiedUser.emailVerificationCodeExpires = emailVerificationCodeExpires;
      savedUser = await existingUnverifiedUser.save();
    } else {
      // Ngược lại, tạo người dùng mới
      const newUser = new User({
        username,
        password_hash,
        email,
        emailVerificationCode,
        emailVerificationCodeExpires,
        account_status: '0', // 0 = chưa xác thực
        role: '0', // Sửa lại thành '0' thay vì '1'
      });
      savedUser = await newUser.save();
    }

    // Gửi email xác thực
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
    console.error('Register error:', error);
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
      user.passwordResetTokenExpires = new Date(Date.now() + 10 * 60 * 1000); // Hết hạn sau 10 phút
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
      console.error('Request password reset error:', error);
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
      emailVerificationCodeExpires: { $gt: Date.now() }, // Kiểm tra mã còn hạn
    });

    if (!user) {
      return res.status(400).json({ message: 'Mã OTP không hợp lệ hoặc đã hết hạn.' });
    }

    user.account_status = '1'; // Cập nhật trạng thái đã xác thực
    user.emailVerificationCode = null; // Xóa mã OTP
    user.emailVerificationCodeExpires = null; // Xóa thời gian hết hạn
    await user.save();
    
    res.status(200).json({ message: 'Xác thực email thành công!' });

  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});
// ! end register and send email verification

// ! login
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    let user = await User.findOne({
       $or: [{ username: username }, { email: username }] 
      });

    if (!user) {
      return res.status(404).json({ message: 'Tài khoản không tồn tại' });
    }
    //Kiểm tra tài khoản đã xác thực chưa
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
      { expiresIn: '2d' }
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
// ! end login

// ! reset password
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
      console.error('Reset password error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});
  // ! end reset password

// ! update profile
app.put('/user/profile/update', verifyToken, uploadAvatar.single('avatar'), async (req, res) => {
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
      // Xóa avatar cũ nếu có và không phải là URL từ Google/Facebook
      if (userToUpdate.avatar && !userToUpdate.avatar.startsWith('http')) {
        const oldAvatarPath = path.join(uploadAvt, userToUpdate.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          try {
            fs.unlinkSync(oldAvatarPath);
          } catch (err) {
            console.error("Lỗi xóa ảnh cũ:", err);
          }
        }
      }
      userToUpdate.avatar = req.file.filename;
      console.log("New avatar uploaded:", req.file.filename);
    }

    const updatedUser = await userToUpdate.save();

    const { password_hash: _, ...userWithoutPassword } = updatedUser.toObject();
    res.json({
      message: 'Cập nhật thông tin thành công',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error("Update profile error:", error);
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
        return res.status(400).json({ message: 'Email này đã được sử dụng.' });
    }
    if (error.message.includes('Chỉ cho phép file ảnh')) {
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi server khi cập nhật thông tin', error: error.message });
  }
});
// ! end update profile

// ! user
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
// ! end user

app.get("/", (req, res) => {res.json("{'thongbao':'API NodeJS'}")});

// ! login Google
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Tạo JWT token cho user
    const token = jwt.sign(
      { userId: req.user._id, username: req.user.username, role: req.user.role },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '1d' }
    );
    // Redirect về frontend kèm token
    res.redirect(`https://fe-vclock.vercel.app/auth/google/success?token=${token}`);
  }
);
// ! end login Google

// ! login FB
app.get('/auth/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login', session: false }),
  (req, res) => {
    // Tạo JWT token cho user
    const token = jwt.sign(
      { userId: req.user._id, username: req.user.username, role: req.user.role },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '1d' }
    );
    // Redirect về frontend kèm token
    res.redirect(`https://fe-vclock.vercel.app/auth/facebook/success?token=${token}`);
  }
);
// Facebook Data Deletion Callback
app.post('/auth/facebook/delete-data', async (req, res) => {
  const signedRequest = req.body.signed_request;
  if (!signedRequest) {
    return res.status(400).send('Invalid request');
  }

  try {
    // 1. Tách và giải mã signed_request
    const [encodedSig, payload] = signedRequest.split('.');
    const sig = Buffer.from(encodedSig.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
    const data = JSON.parse(Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString());

    // 2. Xác thực chữ ký
    const crypto = require('crypto');
    const expectedSig = crypto.createHmac('sha256', process.env.FACEBOOK_APP_SECRET).update(payload).digest();

    if (!crypto.timingSafeEqual(sig, expectedSig)) {
      console.error('Facebook Deletion Callback: Invalid signature.');
      return res.status(400).send('Invalid signature');
    }

    // 3. Xóa dữ liệu người dùng
    const userIdToDelete = data.user_id;
    await User.findOneAndDelete({ facebookId: userIdToDelete });

    // 4. Phản hồi cho Facebook
    const confirmationCode = `delete_confirm_${userIdToDelete}`;
    res.json({
      url: `https://bevclock-production.up.railway.app/auth/facebook/deletion-status/${confirmationCode}`,
      confirmation_code: confirmationCode,
    });

  } catch (error) {
    console.error('Error processing Facebook data deletion:', error);
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
// ! end login FB

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Email gửi đi
    pass: process.env.EMAIL_PASS  // Mật khẩu ứng dụng (App Password)
  }
});

// ! contact
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

        // Gửi email đến admin
        const adminMailOptions = {
          from: `"V.CLOCK Contact Form" <${process.env.EMAIL_USER}>`,
          to: process.env.EMAIL_USER, // Email admin
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

        // Gửi email xác nhận cho khách hàng
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

        // Gửi cả hai email
        await Promise.all([
          transporter.sendMail(adminMailOptions),
          transporter.sendMail(customerMailOptions)
        ]);

        res.status(200).json({ 
          message: 'Tin nhắn của bạn đã được gửi thành công! Chúng tôi sẽ liên hệ lại sớm.',
          success: true 
        });

      } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ 
          message: 'Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.',
          error: error.message 
        });
      }
  });
// !end contact

// ! checkout
// thanh toán onl
const client_id = process.env.client_id;
const api_key = process.env.api_key;
const checksum_key = process.env.checksum_key;

const PayOS = require('@payos/node');

const payos = new PayOS(client_id,api_key,checksum_key);
app.use(exp.static('public'));

const TempOrderSchema = require("./model/schemaTempOrder");

const TempOrderModel = conn.model("TempOrders", TempOrderSchema);


const YOUR_DOMAIN = "http://localhost:3005";

app.post("/create-payment-link", verifyOptionalToken, async (req, res) => {
  try {
    const { orderData, amount, description, orderCode } = req.body;
    const user_id = req.user?.userId || null;

    const fullOrderData = {
      ...orderData,
      user_id 
    };

    const tempOrder = await TempOrderModel.create({
      orderCode,
      orderData: fullOrderData, 
      created_at: new Date()
    });

    const order = {
      amount: 2000,
      description,
      orderCode,
      returnUrl: `${YOUR_DOMAIN}/checkout-success`,
      cancelUrl: `${YOUR_DOMAIN}/checkout-cancel`,
    };

    const paymentLink = await payos.createPaymentLink(order);

    res.json({ checkoutUrl: paymentLink.checkoutUrl });
  } catch (err) {
    console.error("Lỗi tạo payment link:", err);
    res.status(500).json({ success: false, message: "Lỗi tạo link thanh toán" });
  }
});

//  https://5b22b1ff34f8.ngrok-free.app/receive-hook
app.post("/receive-hook", async (req, res) => {
  const data = req.body?.data;
  const status = req.body?.code; // mã "00" nghĩa là thành công

  console.log("📩 Nhận webhook:\n", JSON.stringify(req.body, null, 2));

  if (status !== "00") {
    return res.status(200).json({ message: "Bỏ qua trạng thái không thành công" });
  }

  const orderCode = data?.orderCode;
  if (!orderCode) {
    return res.status(400).json({ message: "Thiếu orderCode trong webhook" });
  }

  try {
    const temp = await TempOrderModel.findOne({ orderCode });
    if (!temp) return res.status(404).json({ message: "Không tìm thấy đơn tạm" });

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
      order_status: "paid",
      created_at: new Date(),
      updated_at: new Date()
    });

    if (voucher_id && user_id) {
       await VoucherUserModel.updateOne({ voucher_id, user_id }, { $set: { used: true } });
    }

    const items = orderData.cart.map(i => ({
      order_id: newOrder._id,
      product_id: i._id,
      quantity: i.so_luong,
      price: i.sale_price > 0 ? i.sale_price : i.price
    }));

    await OrderDetailModel.insertMany(items);
    res.status(200).json({ message: "Tạo đơn hàng thành công" });
  } catch (err) {
    console.error("❌ Lỗi xử lý webhook:", err);
    res.status(500).json({ message: "Lỗi xử lý webhook" });
  }
});

// http://localhost:3000/api/checkout
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

    let finalAddressId = address_id;

    if (!address_id && new_address) {
      const newAddr = await AddressModel.create({
        ...new_address,
        user_id: user_id || null,
        created_at: new Date(),
        updated_at: new Date()
      });
      finalAddressId = newAddr._id;
    }

    const newOrder = await OrderModel.create({
      orderCode: orderCode || null, // thêm dòng này nếu bạn muốn lưu mã đơn
      user_id: user_id || null,
      voucher_id: voucher_id || null,
      address_id: finalAddressId,
      payment_method_id: payment_method_id,
      shipping_fee: 0,
      note: note || "",
      total_amount: total_amount,
      discount_amount: discount_amount || 0,
      order_status: "pending", // Trạng thái đơn hàng ban đầu
      created_at: new Date(),
      updated_at: new Date()
    });

    if (voucher_id && user_id) {
      await VoucherUserModel.deleteOne({ voucher_id, user_id });
    }
    const orderItems = cart.map((item) => ({
      order_id: newOrder._id,
      product_id: item._id,
      quantity: item.so_luong,
      price: item.sale_price > 0 ? item.sale_price : item.price
    }));

    await OrderDetailModel.insertMany(orderItems);

    return res.status(200).json({ message: "Đặt hàng thành công", order_id: newOrder._id });
  } catch (err) {
    console.error("Lỗi khi tạo đơn hàng:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
});

app.post('/checkout/addresses', verifyOptionalToken, async (req, res) => {
  try {
    const { receiver_name, phone, address } = req.body;
    const userId = req.user?.userId || null;  // Có thể là null nếu là khách

    if (!receiver_name || !phone || !address) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    }

    const newAddress = new AddressModel({
      user_id: userId,  // Cho phép null
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
// ! end checkout

// ! products
// http://localhost:3000/api/product/6833ff0acc1ed305e8513aae
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

    // Tạo slug từ tên sản phẩm (không cần lưu DB)
    const productData = product[0];
    const slug = slugify(productData.name, { lower: true, locale: 'vi' });

    // Tăng views
    await ProductModel.updateOne({ _id: objectId }, { $inc: { views: 1 } });

    res.json({
      ...productData,
      slug: `${slug}-${productData._id}`,
    });    
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ', details: err.message });
  }
});

// http://localhost:3000/api/products/top-rated?limit=6
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

    // Filter theo brand
    if (brand) {
      const brandObj = await BrandModel.findOne({ name: brand });
      if (brandObj) {
        filter.brand_id = brandObj._id;
      } else {
        return res.json({ products: [], total: 0, totalPages: 0, currentPage: 1 });
      }
    }

    // Lọc theo giá - sử dụng logic phức tạp hơn để xử lý cả price và sale_price
    if (minPrice || maxPrice) {
      const minPriceNum = minPrice ? Number(minPrice) : 0;
      const maxPriceNum = maxPrice ? Number(maxPrice) : Number.MAX_SAFE_INTEGER;
      
      // Tạo điều kiện phức tạp: sử dụng sale_price nếu có và > 0, ngược lại sử dụng price
      filter.$or = [
        // Trường hợp 1: sale_price > 0 và nằm trong khoảng giá
        {
          $and: [
            { sale_price: { $gt: 0 } },
            { sale_price: { $gte: minPriceNum, $lte: maxPriceNum } }
          ]
        },
        // Trường hợp 2: sale_price = 0 hoặc null, sử dụng price và nằm trong khoảng giá
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
      // Sắp xếp theo giá tăng dần: ưu tiên sale_price nếu có, ngược lại dùng price
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
      // Sắp xếp theo giá giảm dần: ưu tiên sale_price nếu có, ngược lại dùng price
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
      { $match: { 'brand.brand_status': 0 } }, // Chỉ lấy sản phẩm của thương hiệu đang hoạt động
      { $addFields: { main_image: { $arrayElemAt: ['$main_image', 0] } } }
    ];

    // Thêm logic sắp xếp
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

// http://localhost:3000/api/sp_moi
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
      { $match: { 'brand.brand_status': 0 } }, // Chỉ lấy sản phẩm của thương hiệu đang hoạt động
      { $sort: { createdAt: -1 } },
      { $addFields: { main_image: { $arrayElemAt: ['$main_image', 0] } } },
      { $limit: limit },
      // ✅ Project chỉ các trường cần thiết
    {
      $project: {
        name: 1,
        price: 1,
        sale_price: 1,
        createdAt: 1,
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

// http://localhost:3000/api/sp_giam_gia
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
    { $match: { 'brand.brand_status': 0 } }, // Chỉ lấy sản phẩm của thương hiệu đang hoạt động
    { $addFields: { main_image: { $arrayElemAt: ['$main_image', 0] } } },
      {
        $sort: { sale_price: 1 }
      },
      { $limit: limit },
      // ✅ Project chỉ các trường cần thiết
    {
      $project: {
        name: 1,
        price: 1,
        sale_price: 1,
        createdAt: 1,
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

// http://localhost:3000/api/sp_lien_quan/6833ff0acc1ed305e8513aae
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
          name: 1,
          price: 1,
          sale_price: 1,
          createdAt: 1,
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
// ! end product

// ! brand
// http://localhost:3000/api/brand
app.get('/api/brand', async function (req, res) {
  try {
    const brandsWithProductCount = await BrandModel.aggregate([
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
          products: 0
        }
      }
    ]);

    res.json(brandsWithProductCount);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi lấy danh sách thương hiệu', details: err.message });
  }
});

// // http://localhost:3000/api/brand/6831eb9c5c1a8be3463e4603
// app.get('/api/brand/:id', async function(req, res) { 
//     const brandId = new ObjectId(req.params.id);

//     try {
//       const brand = await BrandModel.findById(brandId, { _id: 1, name: 1, description: 1, image: 1, alt: 1, brand_status: 1 });
//       if (!brand) {
//         return res.status(404).json({ error: 'Thương hiệu không tồn tại' });
//       }
//       res.json(brand);
//     } catch (err) {
//       res.status(500).json({ error: 'Lỗi lấy thương hiệu', details: err });
//     }
// });

// // http://localhost:3000/api/brand/6831eb9c5c1a8be3463e4603/products?limit=10
// app.get('/api/brand/:id/products', async function(req, res) {
//     const brandId = new ObjectId(req.params.id);
//     const limit = parseInt(req.query.limit, 10) || 10;
    
//     try {
//       const products = await ProductModel.aggregate([
//         { $match: { brand_id: new ObjectId(brandId) } },
//         {
//           $lookup: {
//             from: 'product_images',
//             let: { productId: '$_id' },
//             pipeline: [
//               { $match: { $expr: { $and: [
//                 { $eq: ['$product_id', '$$productId'] },
//                 { $eq: ['$is_main', true] }
//               ] } } },
//               { $project: { image: 1, _id: 0 } }
//             ],
//             as: 'main_image'
//           }
//         },
//         {
//           $addFields: {
//             main_image: { $arrayElemAt: ['$main_image.image', 0] }
//           }
//         },
//         { $limit: limit }
//       ]);
  
//       res.json(products);
//     }
//     catch (err) {
//       res.status(500).json({ error: 'Lỗi lấy sản phẩm theo thương hiệu', details: err });
//     }
// });
// ! end brand

// ! category
app.get('/api/category', async (req, res) => {
  try {
    const categories = await CategoryModel.find({ category_status: 0 }); // Chỉ lấy danh mục đang hoạt động
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi lấy danh mục', details: err });
  }
});
// ! end category


// ! addresses
// http://localhost:3000/api/user/addresses/68838bd7ebd5c2b81602d086/set-default
app.put('/api/user/addresses/:id/set-default', verifyToken, async (req, res) => {
  const userId = req.user.userId;
  const addressId = req.params.id;

  try {
    // Kiểm tra địa chỉ có thuộc về user không
    const address = await AddressModel.findOne({ _id: addressId, user_id: userId });
    if (!address) {
      return res.status(404).json({ message: "Không tìm thấy địa chỉ hoặc không có quyền." });
    }

    // Bỏ mặc định tất cả
    await AddressModel.updateMany({ user_id: userId }, { is_default: false });

    // Đặt mặc định địa chỉ được chọn
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
    console.error('Error updating address:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.delete('/user/addresses/:id', verifyToken, async (req, res) => {
  try {
    const addressId = req.params.id;
    const userId = req.user.userId;

    // Kiểm tra xem địa chỉ có thuộc về user này không
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
// ! end addresses

// ! search
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

      // Tìm kiếm trong brands
      const brands = await BrandModel.find({
        name: { $regex: q, $options: 'i' }
      }).limit(3);

      // Tìm kiếm trong categories
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
      console.error('Search suggestions error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/search', async (req, res) => {
    try {
      const { q, brand, category, priceRange, sortBy } = req.query;
      
      let query = {};
      
      // Tìm kiếm theo từ khóa
      if (q) {
        query.$or = [
          { name: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { brand: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } }
        ];
      }

      // Filter theo brand
      if (brand) {
        query.brand = { $regex: brand, $options: 'i' };
      }

      // Filter theo category
      if (category) {
        query.category = { $regex: category, $options: 'i' };
      }

      // Filter theo price range
      if (priceRange) {
        const [min, max] = priceRange.split('-');
        if (max === '+') {
          query.price = { $gte: parseInt(min) };
        } else {
          query.price = { $gte: parseInt(min), $lte: parseInt(max) };
        }
      }

      // Sort options
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
          sort = { createdAt: -1 };
      }

      const products = await ProductModel.find(query)
        .sort(sort)
        .limit(50)
        .lean(); // Sử dụng lean() để tối ưu performance

      // Lấy ảnh cho từng sản phẩm
      const productsWithImages = await Promise.all(
        products.map(async (product) => {
          const images = await ProductImageModel.find({ 
            product_id: product._id 
          }).sort({ is_main: -1 }).lean(); // Sắp xếp ảnh chính lên đầu
          
          return {
            ...product,
            images: images.map(img => img.image)
          };
        })
      );

      res.json({ products: productsWithImages });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  // ! end search

// ! news
// http://localhost:3000/api/news
app.get('/api/news', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const news = await NewsModel.aggregate([
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

    const total = await NewsModel.countDocuments();

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

// http://localhost:3000/api/news/66567228a1b2c3d4e5f6b71e
app.get('/api/news/:id', async (req, res) => {
  try {
    const newsId = new ObjectId(req.params.id);
    const news = await NewsModel.aggregate([
      { $match: { _id: newsId } },
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

    // Increment views
    await NewsModel.updateOne({ _id: newsId }, { $inc: { views: 1 } });

    res.json(news[0]);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi lấy tin tức', details: err.message });
  }
});

// app.post('/api/news/:id/increment-view', async (req, res) => {
//   try {
//     const newsId = new ObjectId(req.params.id);
  
//     const result = await NewsModel.findByIdAndUpdate(
//       newsId,
//       { $inc: { views: 1 } },
//       { new: true }
//     );

//     if (!result) {
//       return res.status(404).json({ error: 'Không tìm thấy tin tức' });
//     }

//     res.json({ 
//       message: 'Đã tăng lượt xem',
//       views: result.views 
//     });
//   } catch (err) {
//     res.status(500).json({ error: 'Lỗi tăng lượt xem', details: err.message });
//   }
// });

app.get('/api/news/category/:categoryId', async (req, res) => {
  try {
    const categoryId = new ObjectId(req.params.categoryId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const news = await NewsModel.aggregate([
      { $match: { categorynews_id: categoryId } },
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

    const total = await NewsModel.countDocuments({ categorynews_id: categoryId });

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
    const categories = await CategoryNewsModel.find({ status: 0 }) // Chỉ lấy danh mục đang hoạt động
      .sort({ created_at: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi lấy danh mục tin tức', details: err });
  }
});
// ! news

// ! wishlist
app.get('/user/wishlist', verifyToken, async (req, res) => {
  try {
      const userId = req.user.userId;
      const wishlistItems = await WishlistModel.find({ user_id: userId })
          .populate('product_id', 'name price main_image description')
          .sort({ created_at: -1 });

      // Lấy main_image nếu thiếu
      const result = await Promise.all(wishlistItems.map(async item => {
          let main_image = item.product_id.main_image;
          if (!main_image) {
              // Nếu chưa có main_image, lấy từ bảng product_images
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

      res.json(result);
  } catch (error) {
      console.error('Error fetching wishlist:', error);
      res.status(500).json({ message: 'Lỗi khi lấy danh sách yêu thích' });
  }
});

app.post('/user/wishlist/:productId', verifyToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const productId = req.params.productId;

        // Check if product exists
        const product = await ProductModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }

        // Check if product is already in wishlist
        const existingWishlistItem = await WishlistModel.findOne({
            user_id: userId,
            product_id: productId
        });

        if (existingWishlistItem) {
            return res.status(400).json({ message: 'Sản phẩm đã có trong danh sách yêu thích' });
        }

        // Create new wishlist item
        const wishlistItem = new WishlistModel({
            user_id: userId,
            product_id: productId
        });

        await wishlistItem.save();
        res.status(201).json({ message: 'Đã thêm vào danh sách yêu thích' });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({ message: 'Lỗi khi thêm vào danh sách yêu thích' });
    }
});

app.delete('/user/wishlist/:productId', verifyToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const productId = req.params.productId;

        // Find and delete the wishlist item
        const result = await WishlistModel.findOneAndDelete({
            user_id: userId,
            product_id: productId
        });

        if (!result) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm trong danh sách yêu thích' });
        }

        res.json({ message: 'Đã xóa khỏi danh sách yêu thích' });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({ message: 'Lỗi khi xóa khỏi danh sách yêu thích' });
    }
});
// ! end wishlist

// ! payment-method
// http://localhost:3000/api/payment-method
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
// ! end payment-method

// ! views-order
// http://localhost:3000/api/orders?user_id=6852bc7cdbb9b28715884c6f
app.get("/api/orders", async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ message: "Thiếu user_id" });
  }

  try {
    const orders = await OrderModel.find({ user_id })
      .populate("payment_method_id", "name") // lấy trường name của payment method
      .populate("address_id") // nếu cần thêm address
      .populate("voucher_id") // nếu cần thêm thông tin voucher
      .sort({ created_at: -1 });

    res.json(orders);
  } catch (err) {
    console.error("Lỗi khi lấy đơn hàng theo user_id:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// http://localhost:3000/api/order-details/6833ff0acc1ed305e8513ab1
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

// http://localhost:3000/api/cancel-order/685b4e8f29e55eefd9a43262
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

    // Chỉ cho hủy nếu trạng thái là "processing"
    if (order.order_status !== "processing" && order.order_status !== "pending") {
      return res.status(400).json({
        message: `Không thể hủy đơn hàng khi đang ở trạng thái: ${order.order_status}.`
      });
    }

    // Cập nhật trạng thái đơn hàng
    order.order_status = "cancelled";
    order.updated_at = new Date();
    await order.save();

    res.json({ message: "Đơn hàng đã được hủy thành công." });
  } catch (error) {
    console.error("Lỗi khi hủy đơn hàng:", error);
    res.status(500).json({ message: "Lỗi khi hủy đơn hàng." });
  }
});
// ! end views-order

// ! refund
// API trả hàng (return order)
app.put("/api/return-order/:order_id", async (req, res) => {
  const { order_id } = req.params;
  const { reason } = req.body;

  try {
    const order = await OrderModel.findById(order_id);
    if (!order) return res.status(404).json({ error: "Đơn không tồn tại" });

    // Chỉ cho trả nếu trạng thái là delivered
    if (order.order_status !== "delivered") {
      return res.status(400).json({ error: "Chỉ được trả đơn đã giao" });
    }

    // Kiểm tra thời gian
    const now = new Date();
    const deliveredAt = order.updated_at; // hoặc order.delivered_at nếu có field riêng
    const diffTime = now.getTime() - deliveredAt.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24); // chuyển ra ngày

    if (diffDays > 3) {
      return res.status(400).json({ error: "Đơn hàng đã giao quá 3 ngày, không thể trả" });
    }

    // Cập nhật trạng thái và note
    order.order_status = "returned";
    order.note = (order.note || "") + `\nTrả hàng: ${reason}`;
    await order.save();

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Lỗi khi xử lý trả hàng:", err);
    return res.status(500).json({ error: "Có lỗi xảy ra, thử lại sau" });
  }
});

// ! end refund


// ! reviews
// http://localhost:3000/api/reviews/user/6852bc7cdbb9b28715884c6f
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

// http://localhost:3000/api/reviews/6833ff0acc1ed305e8513aae
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
    { $match: { 'order_details.product_id': objectId } }, // so sánh string
    { $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'user'
    }},
    { $unwind: '$user' },
    { $project: {
        rating: 1,
        comment: 1,
        created_at: 1,
        order_detail_id: 1,
        'user._id': 1,
        'user.avatar': 1,
        'user.username': 1,
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

// http://localhost:3000/api/reviews/stats/6833ff0acc1ed305e8513aae
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

// http://localhost:3000/api/reviews
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
// ! end reviews

// !voucher
// http://localhost:3000/api/voucher-user
app.get("/voucher-user", verifyToken, async (req, res) => {
  try {
    const user_id = req.user.userId;
    // Lấy tất cả voucher_user của user
    const savedVoucherLinks = await VoucherUserModel.find({ user_id });
    const voucherIds = savedVoucherLinks.map((vu) => vu.voucher_id);
    const vouchers = await VoucherModel.find({ _id: { $in: voucherIds } });
    // Gắn thêm _id của voucher_user và trạng thái used để frontend biết
    const result = vouchers.map((v) => {
      const link = savedVoucherLinks.find((vu) => vu.voucher_id.toString() === v._id.toString());
      return { ...v.toObject(), _id: v._id, voucher_user_id: link?._id, used: link?.used };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy voucher đã lưu" });
  }
});

// API lưu voucher cho user
app.post("/api/voucher-user/save", verifyToken, async (req, res) => {
  try {
    const { voucher_id } = req.body;
    const user_id = req.user.userId;

    // Kiểm tra voucher có tồn tại không
    const voucher = await VoucherModel.findById(voucher_id);
    if (!voucher) {
      return res.status(404).json({ message: "Không tìm thấy voucher" });
    }

    // Kiểm tra voucher đã hết hạn chưa
    if (new Date() > new Date(voucher.end_date)) {
      return res.status(400).json({ message: "Voucher đã hết hạn" });
    }

    // Kiểm tra user đã lưu voucher này chưa (bất kể used true/false)
    const existingVoucher = await VoucherUserModel.findOne({ user_id, voucher_id });
    if (existingVoucher) {
      return res.status(400).json({ message: "Bạn đã lưu voucher này rồi!" });
    }

    // Lưu voucher cho user (used: false)
    await VoucherUserModel.create({ user_id, voucher_id, used: false });

    res.json({ message: "Lưu voucher thành công!" });
  } catch (error) {
    console.error("Lỗi khi lưu voucher:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi lưu voucher" });
  }
});
// ! end voucher

// ! <== Admin ==>
// ! <== Search ALl =>
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

// ! <== End Search All =>
// ! <== Category ==>
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
    const { name, alt, category_status } = req.body;
    const image = req.file ? `${req.file.filename}` : null;

    try {
      const newLoai = new CategoryModel({
        name,
        image,
        alt,
        category_status:
          category_status == undefined ? 0 : parseInt(category_status),
        created_at: new Date(),
        updated_at: new Date(),
      });

      await newLoai.save();
      res.status(200).json({ message: "Thêm loại sản phẩm thành công!" });
    } catch (error) {
      res.status(500).json({ error: "Tên danh mục đã tồn tại!" });
    }
  }
);

app.put(
  "/api/admin/categoryProduct/sua/:id",
  uploadCateProduct.single("image"),
  async function (req, res) {
    const id = req.params.id;
    const { name, alt, category_status } = req.body;
    const image = req.file ? `${req.file.filename}` : req.body.image_cu;

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
// ! <== End Category ==>

// ! <== Product ==>
app.get("/api/admin/product", async function (req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const searchTerm = req.query.searchTerm || "";
  const statusFilter = req.query.statusFilter;
  const categoryFilter = req.query.categoryFilter;
  const brandFilter = req.query.brandFilter;
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
    if (statusFilter == "0") {
      query.quantity = 0;
    } else if (statusFilter == "1") {
      query.quantity = { $gt: 0 };
    }
  }

  if (categoryFilter && categoryFilter != "all") {
    const categoryMappings = await ProductCategoriesModel.find({
      category_id: categoryFilter,
    });
    const productIds = categoryMappings.map((item) => item.product_id);
    query._id = { $in: productIds };
  }

  if (brandFilter && brandFilter != "all") {
    query.brand_id = brandFilter;
  }

  try {
    const total = await ProductModel.countDocuments(query);
    const products = await ProductModel.find(query)
      .populate({
        path: "brand_id",
        model: "brands",
        select: "name",
      })
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    const list = await Promise.all(
      products.map(async (product) => {
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

        return {
          ...product.toObject(),
          main_image,
          categories,
          sold: sold_count,
        };
      })
    );

    res.json({ list, total });
  } catch (error) {
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

    // * Số lượng đã bán
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

      const existingProduct = await ProductModel.findOne({ name: name.trim() });
      if (existingProduct) {
        return res.status(400).json({ error: "Tên sản phẩm đã tồn tại!" });
      }

      const newProduct = await ProductModel.create({
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
        created_at: new Date(),
        updated_at: new Date(),
      });

      const productId = newProduct._id;

      if (req.files["main_image"]?.length) {
        const main = req.files["main_image"][0];
        await ProductImageModel.create({
          product_id: productId,
          image: main.filename,
          is_main: true,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }

      if (req.files["sub_images"]?.length) {
        const subImgs = req.files["sub_images"];
        const subDocs = subImgs.map((img) => ({
          product_id: productId,
          image: img.filename,
          is_main: false,
          created_at: new Date(),
          updated_at: new Date(),
        }));
        await ProductImageModel.insertMany(subDocs);
      }

      const categories = category_ids?.split(",") || [];
      await Promise.all(
        categories.map((categoryId) =>
          ProductCategoriesModel.create({
            product_id: productId,
            category_id: categoryId,
          })
        )
      );

      res.status(200).json({ message: "Thêm sản phẩm thành công!" });
    } catch (error) {
      res.status(500).json({ error: "Lỗi khi thêm sản phẩm." });
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
          image: mainImg.filename,
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
          image: img.filename,
          is_main: false,
          created_at: new Date(),
          updated_at: new Date(),
        }));
        await ProductImageModel.insertMany(subDocs);
      }

      const categories = category_ids?.split(",") || [];
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
// ! <== End Products ==>

// ! <== User admin ==>
// * Role chắc để user = 0, admin = 1, admin cấp cao = 2.
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
  uploadUser.single("image"),
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
              console.log("Deleted old avatar:", oldImagePath);
            }
          }

          updateData.avatar = req.file.filename;
          console.log("New avatar uploaded:", req.file.filename);
        } catch (error) {
          console.error("Error handling image upload:", error);
        }
      }

      const updatedUser = await UserModel.findByIdAndUpdate(id, updateData, {
        new: true,
      }).select("-password_hash -refresh_token");

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      if (error.code == 11000) {
        return res.status(400).json({ error: "Tên đăng nhập đã tồn tại" });
      }
      res.status(500).json({ error: "Lỗi server khi cập nhật người dùng" });
    }
  }
);

// * Cái này chỉ admin cấp cao mới tạo đc admin, k cho tạo admin cấp cao
app.post(
  "/api/admin/user/add",
  verifyToken,
  uploadUser.single("image"),
  async (req, res) => {
    try {
      const currentUser = req.user;

      if (!currentUser || Number(currentUser.role) != 2) {
        return res
          .status(403)
          .json({ message: "Bạn không có quyền tạo admin." });
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

// * Đặt lại mật khẩu
app.post("/api/admin/user/doiMk/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  const currentUser = req.user;

  if (Number(currentUser.role) != 2) {
    return res
      .status(403)
      .json({ message: "Bạn không có quyền reset mật khẩu" });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID không hợp lệ" });
  }

  try {
    const targetUser = await UserModel.findById(id);
    if (!targetUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    if (targetUser._id.equals(currentUser._id)) {
      return res
        .status(400)
        .json({ message: "Không thể tự reset mật khẩu của chính mình" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await UserModel.findByIdAndUpdate(id, {
      password_hash: hashed,
      updated_at: new Date(),
    });

    res.json({ message: "Đặt lại mật khẩu thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

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

// ! <== End User ==>

// ! <== start User address admin ==>\
app.get("/api/admin/user/addresses", verifyToken, async (req, res) => {
  try {
    const { user_id } = req.query;
    const requestUserId = req.user.userId;
    const userRole = req.user.role;

    if (user_id) {
      if (userRole < 1 && user_id != requestUserId) {
        return res.status(403).json({
          message: "Bạn không có quyền xem địa chỉ của người dùng này",
          error: "PERMISSION_DENIED",
        });
      }

      const addresses = await AddressModel.find({ user_id: user_id });
      res.json(addresses);
    } else {
      const addresses = await AddressModel.find({ user_id: requestUserId });
      res.json(addresses);
    }
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi lấy danh sách địa chỉ",
      error: error.message,
    });
  }
});

app.get("/api/admin/user/addresses/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const requestUserId = req.user.userId;
    const userRole = req.user.role;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: "ID địa chỉ không hợp lệ",
        error: "INVALID_ADDRESS_ID",
      });
    }

    const address = await AddressModel.findById(id);

    if (!address) {
      return res.status(404).json({
        message: "Không tìm thấy địa chỉ",
        error: "ADDRESS_NOT_FOUND",
      });
    }

    if (userRole < 1 && address.user_id != requestUserId) {
      return res.status(403).json({
        message: "Bạn không có quyền xem địa chỉ này",
        error: "PERMISSION_DENIED",
      });
    }

    const responseData = {
      _id: address._id,
      user_id: address.user_id,
      receiver_name: address.receiver_name,
      phone: address.phone,
      address: address.address,
      created_at: address.created_at,
      updated_at: address.updated_at,
    };

    res.json({
      message: "Lấy chi tiết địa chỉ thành công",
      data: responseData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi lấy chi tiết địa chỉ",
      error: error.message,
    });
  }
});

app.put("/api/admin/user/addresses/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { receiver_name, phone, address } = req.body;
    const requestUserId = req.user.userId;
    const userRole = req.user.role;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: "ID địa chỉ không hợp lệ",
        error: "INVALID_ADDRESS_ID",
      });
    }

    if (!receiver_name && !phone && !address) {
      return res.status(400).json({
        message: "Cần ít nhất một trường để cập nhật",
        error: "MISSING_FIELDS",
      });
    }

    if (
      phone &&
      (isNaN(phone) ||
        phone.toString().length < 10 ||
        phone.toString().length > 11)
    ) {
      return res.status(400).json({
        message: "Số điện thoại không hợp lệ (10-11 chữ số)",
        error: "INVALID_PHONE",
      });
    }

    const addressToUpdate = await AddressModel.findById(id);
    if (!addressToUpdate) {
      return res.status(404).json({
        message: "Không tìm thấy địa chỉ",
        error: "ADDRESS_NOT_FOUND",
      });
    }

    if (userRole < 1 && addressToUpdate.user_id != requestUserId) {
      return res.status(403).json({
        message: "Bạn không có quyền cập nhật địa chỉ này",
        error: "PERMISSION_DENIED",
      });
    }

    if (receiver_name != undefined) {
      addressToUpdate.receiver_name = receiver_name;
    }
    if (phone != undefined) {
      addressToUpdate.phone = phone;
    }
    if (address != undefined) {
      addressToUpdate.address = address;
    }

    addressToUpdate.updated_at = new Date();

    await addressToUpdate.save();

    const responseData = {
      _id: addressToUpdate._id,
      user_id: addressToUpdate.user_id,
      receiver_name: addressToUpdate.receiver_name,
      phone: addressToUpdate.phone,
      address: addressToUpdate.address,
      created_at: addressToUpdate.created_at,
      updated_at: addressToUpdate.updated_at,
    };

    res.json({
      message: "Cập nhật địa chỉ thành công",
      data: responseData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi cập nhật địa chỉ",
      error: error.message,
    });
  }
});

app.post("/api/admin/user/addresses", verifyToken, async (req, res) => {
  try {
    const { receiver_name, phone, address, user_id } = req.body;
    const requestUserId = req.user.userId;

    const targetUserId = user_id || requestUserId;

    if (req.user.role < 1 && targetUserId != requestUserId) {
      return res.status(403).json({
        message: "Bạn không có quyền tạo địa chỉ cho người khác",
        error: "PERMISSION_DENIED",
      });
    }

    if (!receiver_name && !phone && !address) {
      return res.status(400).json({
        message: "Cần ít nhất một trường để tạo địa chỉ",
        error: "MISSING_FIELDS",
      });
    }

    if (
      phone &&
      (isNaN(phone) ||
        phone.toString().length < 10 ||
        phone.toString().length > 11)
    ) {
      return res.status(400).json({
        message: "Số điện thoại không hợp lệ (10-11 chữ số)",
        error: "INVALID_PHONE",
      });
    }

    const newAddress = new AddressModel({
      user_id: targetUserId,
      receiver_name: receiver_name || "",
      phone: phone || null,
      address: address || "",
      created_at: new Date(),
      updated_at: new Date(),
    });

    await newAddress.save();

    res.status(201).json({
      message: "Tạo địa chỉ thành công",
      data: newAddress,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi tạo địa chỉ",
      error: error.message,
    });
  }
});
// ! <== end user address admin ==>

// ! <== Order ==>
app.get("/api/admin/order", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const searchTerm = req.query.searchTerm || "";
  const statusFilter = req.query.statusFilter;
  const paymentStatusFilter = req.query.paymentStatusFilter;
  const sortOption = req.query.sort || "newest";

  let query = {};
  let sortQuery = {};

  if (statusFilter && statusFilter != "all") {
    query.order_status = statusFilter;
  }

  if (paymentStatusFilter && paymentStatusFilter != "all") {
    query.payment_status = paymentStatusFilter;
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

    const allOrders = await OrderModel.find({}).lean();

    const countByStatus = (orders) => {
      return orders.reduce((acc, order) => {
        acc[order.order_status] = (acc[order.order_status] || 0) + 1;
        return acc;
      }, {});
    };

    const countByPaymentStatus = (orders) => {
      return orders.reduce((acc, order) => {
        acc[order.payment_status] = (acc[order.payment_status] || 0) + 1;
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
    console.error("Order API error:", error);
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

  try {
    const updated = await OrderModel.findByIdAndUpdate(
      id,
      { order_status, payment_status, updated_at: new Date() },
      { new: true }
    );

    if (updated) {
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
// ! <== End Order ==>

// ! <== News ==>
app.get("/api/admin/news", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
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

      const image = req.file ? req.file.filename : null;

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

    const image = req.file ? req.file.filename : null;

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
// ! <== End News ==>

// ! <== Category News ==>
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
// ! <== End Category News ==>

// ! <== Voucher ==>
app.get("/api/admin/voucher", async (req, res) => {
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
    status,
  } = req.body;

  try {
    const newVoucher = await VoucherModel.create({
      voucher_name,
      voucher_code,
      start_date,
      end_date,
      discount_type,
      discount_value,
      minimum_order_value: minimum_order_value || 0,
      max_discount: max_discount || 0,
      status: status == undefined ? 0 : parseInt(status),
      created_at: new Date(),
      updated_at: new Date(),
    });

    res.json({
      message: "Thêm voucher thành công!",
      voucher: newVoucher,
    });
  } catch (error) {
    res.status(500).json({ error: "Mã khuyến mãi đã tồn tại!" });
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
    status,
  } = req.body;

  try {
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
        max_discount: max_discount || null,
        status: status == undefined ? 0 : parseInt(status),
        updated_at: new Date(),
      },
      { new: true }
    );

    if (updated) {
      res.json({
        message: "Cập nhật voucher thành công!",
        voucher: updated,
      });
    } else {
      res.status(404).json({ error: "Không tìm thấy voucher với ID này." });
    }
  } catch (error) {
    res.status(500).json({ error: "Mã khuyến mãi đã tồn tại!" });
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
// ! <== End Voucher ==>

// ! <== Brand ==>
app.get("/api/admin/brand", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
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
    const { name, alt, brand_status, description } = req.body;
    const image = req.file ? `${req.file.filename}` : null;

    try {
      const newLoai = new BrandModel({
        name,
        image,
        alt,
        description,
        brand_status: brand_status == undefined ? 0 : parseInt(brand_status),
        created_at: new Date(),
        updated_at: new Date(),
      });

      await newLoai.save();
      res.status(200).json({ message: "Thêm thương hiệu thành công!" });
    } catch (error) {
      res.status(500).json({ error: "Tên thương hiệu đã tồn tại!" });
    }
  }
);

app.put(
  "/api/admin/brand/edit/:id",
  uploadCateBrand.single("image"),
  async function (req, res) {
    const id = req.params.id;
    const { name, alt, brand_status, description } = req.body;
    const image = req.file ? `${req.file.filename}` : req.body.image_cu;

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
// ! <== End Brand ==>

// ! <== Review ==>
app.get("/api/admin/review", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const search = req.query.search || "";
  const ratingFilter = req.query.rating || "all";
  const sortBy = req.query.sortBy || "created_at";
  const sortOrder = req.query.sortOrder || "desc";

  try {
    let matchQuery = {};
    if (ratingFilter != "all") {
      matchQuery.rating = parseInt(ratingFilter);
    }

    const pipeline = [
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user_id",
          pipeline: [{ $project: { username: 1 } }],
        },
      },
      { $unwind: { path: "$user_id", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "order_details",
          localField: "order_detail_id",
          foreignField: "_id",
          as: "order_detail_id",
          pipeline: [
            {
              $lookup: {
                from: "products",
                localField: "product_id",
                foreignField: "_id",
                as: "product_id",
                pipeline: [{ $project: { name: 1 } }],
              },
            },
            { $unwind: "$product_id" },
            { $project: { product_id: 1 } },
          ],
        },
      },
      {
        $unwind: { path: "$order_detail_id", preserveNullAndEmptyArrays: true },
      },

      { $match: matchQuery },

      ...(search
        ? [
            {
              $match: {
                $or: [
                  { comment: { $regex: search, $options: "i" } },
                  {
                    "order_detail_id.product_id.name": {
                      $regex: search,
                      $options: "i",
                    },
                  },
                  { "user_id.username": { $regex: search, $options: "i" } },
                ],
              },
            },
          ]
        : []),

      {
        $sort: {
          [sortBy]: sortOrder == "desc" ? -1 : 1,
        },
      },
    ];

    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await ReviewModel.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;
    const dataPipeline = [...pipeline, { $skip: skip }, { $limit: limit }];

    const list = await ReviewModel.aggregate(dataPipeline);

    const populatedList = await Promise.all(
      list.map(async (review) => {
        const productId = review?.order_detail_id?.product_id?._id;
        let main_image = null;

        if (productId) {
          main_image = await ProductImageModel.findOne({
            product_id: productId,
            is_main: true,
          }).select("image alt is_main");
        }

        return {
          ...review,
          order_detail_id: {
            ...review.order_detail_id,
            product_id: {
              ...review.order_detail_id.product_id,
              main_image,
            },
          },
        };
      })
    );

    res.json({
      list: populatedList,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách đánh giá." });
  }
});
// ! <== End Review ==>

// ! <== Payment Method ==>
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

    const icon_url = req.file ? req.file.filename : null;

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

    const image = req.file ? req.file.filename : null;

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
// ! <== End Payment Method ==>

// ! <== Start edit account admin ==>
app.put(
  "/api/admin/account/edit/:id",
  uploadUser.single("image"),
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

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username.trim())) {
      return res.status(400).json({
        success: false,
        message: "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới",
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
        avatarPath = `${req.file.filename}`;
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
// ! <== End edit account admin ==>


server.listen(port, () => {
  console.log(`🚀 Server đang chạy trên port ${port}`);
  console.log(`📡 MongoDB URI: ${MONGODB_URI}`);
  console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3005'}`);
});