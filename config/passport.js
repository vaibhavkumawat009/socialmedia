const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../model/user/userModel');

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'vaibhav',
};

const initializePassport = (passport) => {
  passport.use(
    new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
      try {
        console.log("this is running");
        console.log(jwtPayload, "payload");
        
        // Ensure that the parameter passed to findOne is an object
        const user = await User.findOne({ _id: jwtPayload.id });
        console.log(user,"user");
        
        if (user) {
            // console.log("i run ")
          return done(null, user);
        } else {
          return done(null, false);
        }
      } catch (error) {
        return done(error, false);
      }
    })
  );
};

module.exports = { initializePassport };
