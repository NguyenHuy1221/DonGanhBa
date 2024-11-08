const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/NguoiDungSchema");

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL:
        "https://imp-model-widely.ngrok-free.app/auth/facebook/callback",
      profileFields: ["id", "emails", "name", "picture.type(large)"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ facebookId: profile.id });

        if (!user) {
          const email =
            profile.emails && profile.emails.length > 0
              ? profile.emails[0].value
              : null;
          const photo =
            profile.photos && profile.photos.length > 0
              ? profile.photos[0].value
              : null;

          user = new User({
            tenNguoiDung: `${profile.name.givenName} ${profile.name.familyName}`,
            gmail: email,
            facebookId: profile.id,
            anhDaiDien: photo,
            isVerified: true,
          });
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        console.error("Lỗi trong quá trình xác thực Facebook:", err);
        return done(err, false);
      }
    }
  )
);

// Cấu hình chiến lược Google
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        "https://imp-model-widely.ngrok-free.app/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        if (!profile.id) {
          throw new Error("ID của profile Google bị thiếu");
        }

        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = new User({
            googleId: profile.id,
            tenNguoiDung: profile.displayName,
            gmail:
              profile.emails && profile.emails.length > 0
                ? profile.emails[0].value
                : null,
            isVerified: true,
          });
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        console.error("Lỗi trong quá trình xác thực Google:", error);
        return done(error, false);
      }
    }
  )
);

// serializeUser và deserializeUser chỉ cần định nghĩa một lần
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
