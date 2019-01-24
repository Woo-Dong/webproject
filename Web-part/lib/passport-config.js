const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

module.exports = function(passport) {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) =>  {
    User.findById(id, done);
  });

  passport.use('local-signin', new LocalStrategy({
    usernameField : 'idname',
    passwordField : 'password',
    // session: true,
    passReqToCallback : true
  }, async (req, idname, password, done) => {
    try {
      const user = await User.findOne({idname: idname});
      if (user){
        if(await user.validPassword(password)){
          console.log("success local-signin");
          return done(null, user, req.flash('success', '로그인 되었습니다.'));
        } 
      }
      return done(null, false, req.flash('danger', 'Invalid id or password'));
    } catch(err) {
      done(err);
    }
  }));
};
