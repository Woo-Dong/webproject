const LocalStrategy = require('passport-local').Strategy;
const KakaoStrategy = require('passport-kakao').Strategy;
const NaverStrategy = require('passport-naver').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const User = require('../models/user');
const Notice = require('../models/notice');
const Sale = require('../models/sale');


function func(userId, eachId) { 
  var isDuplicate = Notice.find(
  { 'user_id': userId, 'target_id': eachId});
    return isDuplicate;
}

Array.prototype.remove = function() {
  var what, a = arguments, L = a.length, ax;
  while (L && this.length) {
      what = a[--L];
      while ((ax = this.indexOf(what)) !== -1) {
          this.splice(ax, 1);
      }
  }
  return this;
};

function checkAlarm(user) {

  // var brandLike = user.brandLike;
  // var productLike = user.productLike;

  var categoryLike = user.categoryLike;

  if(categoryLike){

    var tmpCate = new Array();
    tmpCate = categoryLike.split(",");
    
    tmpCate.forEach(async function(eachCate) {
      await Sale.find({'category': eachCate}, function(err, docs) {
        
        //각 카테고리별 일치하는 세일 화장품 찾기
        if (!err){ 
          
          docs.forEach(async function(eachSale) {
            
              var result = await func(user._id, eachSale._id);
                if(result.length != 0){
                }
                else{

                  var newAlarm = new Notice({     // 새 알람 만들기
                    user_id: user._id,
                    target_id: eachSale._id,
                    content: eachSale.name,
                    category: "세일"
                  });
                  await newAlarm.save();

                  // 사용자 스키마에 알람 대상 id 추가
                  if(user.notiTarget_id){
                    var bool = true;
                    var temp = new Array(); 
                    temp = user.notiTarget_id.split(",");
                    var challenger = eachSale._id;
                    temp.forEach(function(ggon) {
                      if (challenger==ggon){
                        bool = false;
                      }
                    }) 
                    if(bool){
                      temp.push(eachSale._id);
                      user.notiTarget_id = temp;
                    }
                  }
                  else{
                    user.notiTarget_id = eachSale._id;
                    
                  } 
                  user.alarmcheckNum += 1;
                  await user.save();
                  
                }
              })

        } // if (!err){ end 
        
      });
    })

  } // if(categoryLike){ end
  return user;
}

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
      var user = await User.findOne({email: email});
      if (user && await user.validatePassword(password)) {
        
        
        user = await checkAlarm(user);
        
        if(user.alarmcheckNum  > 0){
          var str = user.alarmcheckNum + '개의 할인 정보가 있습니다.';
          return done(null, user, req.flash('success', str) );
        }
        return done(null, user, req.flash('success', '정상적으로 로그인되었습니다!'));
      }
      return done(null, false, req.flash('danger', '이메일 혹은 비밀번호가 일치하지 않습니다.'));
    } catch(err) {
      done(err);
    }
  }));

  passport.use(new NaverStrategy({
    clientID: '45a3VlIZkF7VifHlC6KG',  
    clientSecret: 'moGk6fZa2N',   
    callbackURL: 'https://heeburndeuk.herokuapp.com/auth/naver/callback'  

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
    callbackURL: 'https://heeburndeuk.herokuapp.com/auth/kakao/callback' 
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

    callbackURL: 'https://heeburndeuk.herokuapp.com/auth/google/callback' 

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

};