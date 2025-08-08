const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../model/User');
const bcrypt = require('bcrypt');
require('dotenv').config();

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: `${process.env.SERVER_URL}/auth/facebook/callback`,
    profileFields: ['id', 'displayName', 'emails', 'photos'] 
  },
  async (accessToken, refreshToken, profile, done) => {
    try {

      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      if (!email) {
        return done(new Error('Không thể lấy được địa chỉ email từ tài khoản Facebook của bạn.'), null);
      }

      let user = await User.findOne({ facebookId: profile.id });
      
      if (!user) {

        user = await User.findOne({ email: email });
        
        if (user) {

          user.facebookId = profile.id;
          user.fullName = profile.displayName; 
          if (!user.avatar && profile.photos && profile.photos.length > 0) {
            user.avatar = profile.photos[0].value;
          }
          await user.save();
        } else {

          const randomPassword = Math.random().toString(36).slice(-10) + Date.now().toString(36);
          const password_hash = await bcrypt.hash(randomPassword, 10);
          
          user = await User.create({
            facebookId: profile.id,
            username: email, 
            email: email,
            fullName: profile.displayName, 
            password_hash: password_hash,
            account_status: '1',
            role: '0',
            avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null
          });
        }
      }
      
      return done(null, user);
    } catch (err) {
      console.error('Lỗi Facebook OAuth:', err);
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});