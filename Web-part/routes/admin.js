const express = require('express'); 
const User = require('../models/user');
const Cosmetic = require('../models/cosmetic');
const SaleList = require('../models/sale');
const router = express.Router();
const catchErrors = require('../lib/async-error');  //async 함수에 대한 catch 대비

function needAuth(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.flash('danger', '로그인 후 이용해 주세요');
    res.redirect('/signin');
  }
}

function isAdmin(req, res, next) {
  const user = req.session.user;
  console.log(user.name);
  if(user.isAdmin){
    next();
  } else {
    req.flash('danger', '관리자 권한이 없습니다!');
    res.redirec('/');
  }
}
// 관리자 아이디 확인 절차 필요
router.get('/', needAuth, isAdmin, (req, res, next) => {
    res.render('admin/index');
});

router.get('/users', isAdmin, catchErrors(async (req,res, next) => {

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  var query = {};

  const users = await User.paginate(query, {
    sort: {createdAt: -1},  
    page: page, limit: limit
  });

  res.render('admin/users', {users : users, query: req.query});
}));

router.get('/cosmetics', isAdmin, catchErrors(async (req,res, next) => {

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  var query = {};

  const cosmetics = await Cosmetic.paginate(query, {
    sort: {createdAt: -1},  
    page: page, limit: limit
  });

  res.render('admin/cosmetics', {cosmetics : cosmetics, query: req.query});
}));



router.get('/salelists', isAdmin, catchErrors(async (req,res, next) => {

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  var query = {};

  const saleLists = await SaleList.paginate(query, {
    sort: {createdAt: -1},  
    page: page, limit: limit
  });

  res.render('admin/saleLists', {saleLists : saleLists, query: req.query});
}));


module.exports = router;