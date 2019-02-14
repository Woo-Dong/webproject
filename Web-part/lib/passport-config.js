const LocalStrategy = require('passport-local').Strategy;
const KakaoStrategy = require('passport-kakao').Strategy;
const NaverStrategy = require('passport-naver').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const FacebookStrategy = require('passport-facebook').Strategy;

const User = require('../models/user');

module.exports = function(passport) {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) =>  {
    User.findById(id, done);
  });

  passport.use('local-signin', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
  }, async (req, email, password, done) => {
    try {
      const user = await User.findOne({email: email});
      if (user && await user.validatePassword(password)) {
        return done(null, user, req.flash('success', '정상적으로 로그인되었습니다!'));
      }
      return done(null, false, req.flash('danger', '이메일 혹은 비밀번호가 일치하지 않습니다.'));
    } catch(err) {
      done(err);
    }
  }));

  passport.use(new NaverStrategy({
    clientID: 'OtLRDyKlBgPysJGsIJzs',
    clientSecret: 'CnKw6mh7Hj',
    callbackURL: 'http://127.0.0.1:3000/auth/naver/callback'
  }, async (token, refreshToken, profile, done) => {
    console.log('Naver', profile);
    try {
      var properties = profile._json;
      var email = properties.email;
      var name = properties.nickname; 
      if(!name){
        name = properties.email;
      }
      console.log(email, name);
      var user = await User.findOne({'naver.id': profile.id});
      if (!user) {
        if (email) {
          user = await User.findOne({email: email});
        }
        if (!user) {
          user = new User({name: name});
          user.email =  email ? email : `__unknown-${user._id}@naver.com`;
        }
        user.naver.id = profile.id;
      }
      user.naver.token = profile.token;
      await user.save();
      return done(null, user);
    } catch (err) {
      done(err);
    }
  }));

  passport.use(new KakaoStrategy({
    clientID: '84642e397324624c13023c0b133d7264',
    clientSecret: '831bcfbb9dcec678a26953db1c15df70',
    callbackURL: 'http://127.0.0.1:3000/auth/kakao/callback'
  }, async (token, refreshToken, profile, done) => {
    console.log('Kakao', profile);
    try {
      // var properties = profile._json;
      var email = profile.id;
      var name = profile.username; 
      if(!name){
        name = properties.email;
      }
      console.log("email, name: ", email, name);
      var user = await User.findOne({'kakao.id': profile.id});
      if (!user) {
        if (email) {
          user = await User.findOne({email: email});
        }
        if (!user) {
          user = new User({name: name});
          user.email =  email ? email : `__unknown-${user._id}@kakao.com`;
        }
        user.kakao.id = profile.id;
      }
      user.kakao.token = profile.token;
      await user.save();
      return done(null, user);
    } catch (err) {
      done(err);
    }
  }));

  passport.use(new GoogleStrategy({
    clientID: '207585647134-ph1s3pg9b7u34eusag71rn96vqp11h59.apps.googleusercontent.com',
    clientSecret: 'HV2zxj2LGs1lxoKvKUoCWuvB',
    callbackURL: 'http://127.0.0.1:3000/auth/google/callback'
  }, async (token, refreshToken, profile, done) => {
    console.log('google', profile);
    try {
      var email = profile.id;
      var name = profile.displayName; 
      console.log("email, name: ", email, name);
      var user = await User.findOne({'google.id': profile.id});
      if (!user) {
        if (email) {
          user = await User.findOne({email: email});
        }
        if (!user) {
          user = new User({name: name});
          user.email =  email ? email : `__unknown-${user._id}@gmail.com`;
        }
        user.google.id = profile.id;
      }
      user.google.token = profile.token;
      await user.save();
      return done(null, user);
    } catch (err) {
      done(err);
    }
  }));

  // passport.use(new FacebookStrategy({
  //   clientID : '2196214153961055',
  //   clientSecret : '461cefd65b33668a6eff5d384faaf73c',
  //   callbackURL : 'http://127.0.0.1:3000/auth/facebook/callback',
  //   profileFields : ['email', 'name']
  // }, async (token, refreshToken, profile, done) => {
  //   console.log('Facebook', profile);
  //   try {
  //     var email = (profile.emails && profile.emails[0]) ? profile.emails[0].value : '';
  //     var name = (profile.displayName) ? profile.displayName : 
  //       [profile.name.givenName, profile.name.middleName, profile.name.familyName]
  //         .filter(e => e).join(' ');
  //     console.log(email, name, profile.name);
  //     var user = await User.findOne({'facebook.id': profile.id});
  //     if (!user) {
  //       if (email) {
  //         user = await User.findOne({email: email});
  //       }
  //       if (!user) {
  //         user = new User({name: name});
  //         user.email =  email ? email : `__unknown-${user._id}@no-email.com`;
  //       }
  //       user.facebook.id = profile.id;
  //     }
  //     user.facebook.token = profile.token;
  //     await user.save();
  //     return done(null, user);
  //   } catch (err) {
  //     done(err);
  //   }
  // }));

};