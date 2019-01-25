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

// 화장품 추가 함수
function validateForm(form) {
  var name = form.name || "";
  var company = form.company || "";
  var brand = form.brand || "";
  var shop = form.shop || "";
  var series = form.series || "";
  name = name.trim(); 
  series = series.trim();
  brand = brand.trim();
  shop = shop.trim();

  if (!name) {
    return 'Name is required.';
  }
  if (!company) {
    return 'company is required.';
  }
  if (!brand) {
    return 'brand is required.';
  }
  if (!shop) {
    return 'shop is required.';
  }
  return null;
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

//cosmetics 수정 관리
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

router.get('/cosmetics/add', (req, res, next) => {
  res.render('admin/cosmeticAdd', {messages: req.flash()});
});

router.post('/cosmetics', isAdmin,(req, res, next) => {
  var err = validateForm(req.body);
  if (err) {
    req.flash('danger', err);
    return res.redirect('admin/cosmetics');
  }
  Cosmetic.findOne({name: req.body.name}, function(err, cosmetic) {
    if (err) {
      return next(err);
    }
    if (cosmetic) {
      req.flash('danger', '같은 화장품 있음', '만들지 말고 수정해라');
      return res.redirect('back');
    }
    req.flash('saving');
    var newCosmetic = new Cosmetic({
      name: req.body.name,
      series: req.body.series,
      company: req.body.company,
      latestSale: req.body.latestSale,
      volume: req.body.volume,
      brand: req.body.brand,
      shop: req.body.shop,
      pictName: req.body.pictName,
      price: req.body.price,
      minPrice: req.body.minPrice,
      maxSalePer: req.body.maxSalePer,
    });

    newCosmetic.save(function(err) {
      if (err) {
        return next(err);
      } else {
        req.flash('success', 'Registered successfully.');
        res.redirect('back');
      }
    });
  });
});

router.put('/cosmetics/:id', isAdmin,(req, res, next) => {
  // var err = validateForm(req.body);
  // if (err) {
  //   req.flash('danger', err);
  //   return res.redirect('back');
  // }

  Cosmetic.findById({_id: req.params.id}, function(err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash('danger', '해당하는 화장품이 존재하지 않습니다..');
      return res.redirect('back');
    }

    Cosmetic.name = req.body.name;
    Cosmetic.email = req.body.company;
    Cosmetic.brand = req.body.brand;
    Cosmetic.series = req.body.series;
    Cosmetic.shop = req.body.shop;
    Cosmetic.price = req.body.price;

    Cosmetic.save(function(err) {
      if (err) {
        return next(err);
      }
      req.flash('success', '성공적으로 정보가 수정되었습니다.');
      res.redirect('back');
    });
  });
});

router.get('/cosmetics/:id/cosmeticEdit', isAdmin,(req, res, next) => {
  Cosmetic.findById(req.params.id, function(err, Cosmetic) {
    if (err) {
      return next(err);
    }
    res.render('admin/cosmeticEdit', {Cosmetic: Cosmetic});
  });
});



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


router.get('/complain', isAdmin, catchErrors(async (req,res, next) => {

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  var query = {};

  const complain = await SaleList.paginate(query, {
    sort: {createdAt: -1},  
    page: page, limit: limit
  });

  res.render('admin/complain', {complain : complain, query: req.query});
}));



module.exports = router;