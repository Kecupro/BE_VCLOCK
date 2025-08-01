const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../model/User');
const bcrypt = require('bcrypt');
require('dotenv').config();


passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'emails', 'photos'] 
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Facebook trả về profile khác với Google
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      if (!email) {
        return done(new Error('Không thể lấy được địa chỉ email từ tài khoản Facebook của bạn.'), null);
      }

      // Kiểm tra user theo facebookId trước
      let user = await User.findOne({ facebookId: profile.id });
      
      if (!user) {
        // Nếu không tìm thấy theo facebookId, kiểm tra theo email
        user = await User.findOne({ email: email });
        
        if (user) {
          // Nếu user đã tồn tại với email này, cập nhật thêm facebookId
          user.facebookId = profile.id;
          user.fullName = profile.displayName; // Đảm bảo luôn có fullName
          if (!user.avatar && profile.photos && profile.photos.length > 0) {
            user.avatar = profile.photos[0].value;
          }
          await user.save();
        } else {
          // Tạo user mới nếu chưa tồn tại
          const randomPassword = Math.random().toString(36).slice(-10) + Date.now().toString(36);
          const password_hash = await bcrypt.hash(randomPassword, 10);
          
          user = await User.create({
            facebookId: profile.id,
            username: email, // Dùng email làm username mặc định
            email: email,
            fullName: profile.displayName, // Đúng tên schema
            password_hash: password_hash,
            account_status: '1',
            role: '0',
            avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null
          });
        }
      }
      
      return done(null, user);
    } catch (err) {
      console.error('Facebook OAuth error:', err);
      return done(err, null);
    }
  }
));

// Các hàm serialize và deserialize có thể dùng chung với Google,
// nên không cần định nghĩa lại ở đây nếu chúng đã có trong file index.js hoặc google.js
// Tuy nhiên, để file này độc lập, chúng ta cứ để ở đây.
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
}); 