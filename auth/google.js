const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../model/User');
const bcrypt = require('bcrypt');
require('dotenv').config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_URL?.replace(/\/$/, '')}/auth/google/callback`
  },
  async (accessToken, refreshToken, profile, done) => {
    try {

      let user = await User.findOne({ googleId: profile.id });
      
      if (!user) {

        user = await User.findOne({ email: profile.emails[0].value });
        
        if (user) {

          user.googleId = profile.id;
          if (!user.fullname) user.fullName = profile.displayName;
          if (!user.avatar && profile.photos && profile.photos.length > 0) {
            user.avatar = profile.photos[0].value;
          }
          await user.save();
        } else {

          const randomPassword = Math.random().toString(36).slice(-10) + Date.now().toString(36);
          const password_hash = await bcrypt.hash(randomPassword, 10);
          
        user = await User.create({
          googleId: profile.id,
          username: profile.emails[0].value,
          email: profile.emails[0].value,
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
      console.error('Lỗi Google OAuth:', err);
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