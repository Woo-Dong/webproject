const express = require('express');
const  User = require('../models/user');
const  Cosmetic = require('../models/cosmetic');
const catchErrors = require('../lib/async-error');

module.exports = io => {
  const router = express.Router();
  function needAuth(req, res, next) {
      if ( req.isAuthenticated() ) {
        next();     
      } else {
        req.flash('danger', '다시 로그인해 주세요.');
        res.redirect('/signin');
      }
  }

  function validateForm(form, options) {
    var name = form.name || "";
    var email = form.email || "";
    name = name.trim();
    email = email.trim();

    if (!name) {
      return 'Name is required.';
    }

    if (!email) {
      return 'Email is required.';
    }

    if (!form.password && options.needPassword) {
      return 'Password is required.';
    }

    if (form.password !== form.passwordconf) {
      return 'Passsword do not match.';
    }

    if (form.password.length < 6) {
      return 'Password must be at least 6 characters.';
    }

    return null;
  }

  router.get('/', needAuth, catchErrors(async (req, res, next) => {
    User.find({}, function(err, users) {
      if (err) {
        return next(err);
      }
      res.render('users/index', {users: users});
    });
  }));

  router.get('/new', (req, res, next) => {
    res.render('users/signup', {messages: req.flash()});
  });

  router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    res.render('users/edit', {user: user});
  }));

  router.put('/:id', needAuth, catchErrors(async(req, res, next) => {
    // var err = validateForm(req.body);
    // if (err) {
    //   req.flash('danger', err);
    //   return res.redirect('back');
    // }
    const user = await User.findById({_id: req.params.id});
    if (!user) {
      req.flash('danger', '해당하는 회원이 존재하지 않습니다..');
      return res.redirect('back');
    }
    if(req.body.password){
      if (!await user.validatePassword(req.body.current_password)) {
        req.flash('danger', '비밀번호가 다릅니다.');
        return res.redirect('back');
      }
      user.password = await user.generateHash(req.body.password);
    }
    user.name = req.body.name;
    user.email = req.body.email;
    user.isAdmin = req.body.isAdmin;
    await user.save();
    req.flash('success', '성공적으로 회원정보가 수정되었습니다.');
    res.redirect('back');
  }));

  router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
    const user = await User.findOneAndRemove({_id: req.params.id});
    req.flash('success', '성공적으로 회원탈퇴 하였습니다.');
    res.redirect('/');
  }));

  router.get('/:id', catchErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    var cosmetics = new Array();
    if(user.productLike){
        var userPrdLike = user.productLike;
      userPrdLkArr = userPrdLike.split(",");
      for(let i=0; i<userPrdLkArr.length; i++){
        cosmetic = await Cosmetic.findById(userPrdLkArr[i]);
        cosmetics.push(cosmetic);
      }
    }
    console.log(cosmetics);

    res.render('users/show', {user: user, cosmetics: cosmetics});
  }));

  router.post('/', catchErrors(async (req, res, next) => {
    var err = validateForm(req.body, {needPassword: true});
    if (err) {
      req.flash('danger', err);
      return res.redirect('back');
    }
    var user = await User.findOne({email: req.body.email});
    if (err) {
      return next(err);
    }
    if (user) {
      req.flash('danger', '이미 동일한 이메일이 존재합니다.');
      return res.redirect('back');
    }
    user = new User({
      name: req.body.name,
      email: req.body.email,
    });
    user.password = await user.generateHash(req.body.password);
    await user.save();
    req.flash('success', '성공적으로 등록되었습니다. 다시 로그인 해주세요.');
    res.redirect('/signin');
  }));
  return router;
}