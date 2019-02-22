const express = require('express'); 
const User = require('../models/user');
const Cosmetic = require('../models/cosmetic');
const SaleList = require('../models/sale');
const Complain = require('../models/complain');
const catchErrors = require('../lib/async-error');  //async 함수에 대한 catch 대비

module.exports = io => {
  const router = express.Router();
  function needAuth(req, res, next) {
    if (req.isAuthenticated()) {
      next();
    } else {
      req.flash('danger', '로그인 후 이용해 주세요');
      res.redirect('/signin');
    }
  }

  function isAdmin(req, res, next) {
    next();
    // const user = req.user;
    // console.log(user.name);
    // if(user.isAdmin){
    //   next();
    // } else {
    //   req.flash('danger', '관리자 권한이 없습니다!');
    //   res.redirect('/');
    // }
  }

  // 화장품 추가 함수
  function validateForm(form) {
    var name = form.name || "";
    // var company = form.company || "";
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
    // if (!company) {
    //   return 'company is required.';
    // }
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

  router.get('/cosmetics/add', isAdmin, (req, res, next) => {
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
        // series: req.body.series,
        category: req.body.options2,
        brand: req.body.brand,
        shop: req.body.shop,
        volume: req.body.volume,
        price: req.body.price,
        detail_descrpt: req.body.detail_descrpt,
        img: req.body.img
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

  router.get('/cosmetics/:id', (req, res, next) => {
    Cosmetic.findById(req.params.id, function(err, Cosmetic) {
      if (err) {
        return next(err);
      }
      res.render('admin/Cosmetics', {Cosmetic: Cosmetic});
    });
  });

  router.delete('/cosmetics/:id', isAdmin, (req, res, next) => {
    Cosmetic.findOneAndRemove({_id: req.params.id}, function(err) {
      if (err) {
        return next(err);
      }
      req.flash('success', '화장품 정보 삭제');
      res.redirect('/admin/cosmetics');
    });
  });

  router.put('/cosmetics/:id', isAdmin,(req, res, next) => {
    Cosmetic.findById({_id: req.params.id}, function(err, Cosmetic) {
      if (err) {
        return next(err);
      }
      if (!Cosmetic) {
        req.flash('danger', '해당하는 화장품이 존재하지 않습니다..');
        return res.redirect('back');
      }
      Cosmetic.name = req.body.name;
      Cosmetic.category = req.body.options2;
      Cosmetic.brand = req.body.brand;
      Cosmetic.shop = req.body.shop;
      Cosmetic.volume = req.body.volume;
      Cosmetic.price = req.body.price;
      Cosmetic.detail_descrpt = req.body.detail_descrpt;
      Cosmetic.img = req.body.img;

      Cosmetic.save(function(err) {
        if (err) {
          return next(err);
        }
        req.flash('success', '성공적으로 정보가 수정되었습니다.');
        res.redirect('back');
      });
    });
  });

  router.get('/cosmetics/:id/edit', isAdmin,(req, res, next) => {
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

  
  router.get('/salelists/add', isAdmin, (req, res, next) => {
    res.render('admin/salelistsAdd', {messages: req.flash()});
  });

  router.post('/salelists', isAdmin,(req, res, next) => {
    req.flash('saving');
    salePer = (req.body.price-req.body.salePrice)/req.body.price*100;
    
    var newSaleList = new SaleList({
      cosName: req.body.cosName,
      price: req.body.price,
      salePrice: req.body.salePrice,
      salePer: salePer,
      start: req.body.start,
      end: req.body.end,
      cosCategory: req.body.options2,
      condiction: req.body.condiction,
      title: req.body.title,
      category: req.body.category,
      onOff: req.body.onOff
    });

    newSaleList.save(function(err) {
      if (err) {
        return next(err);
      } else {
        req.flash('success', 'Registered successfully.');
        res.redirect('back');
      }
    });
  });

  router.put('/salelists/:id', isAdmin,(req, res, next) => {
    SaleList.findById({_id: req.params.id}, function(err, SaleList) {
      if (err) {
        return next(err);
      }
      if (!SaleList) {
        req.flash('danger', '해당하는 화장품이 존재하지 않습니다..');
        return res.redirect('back');
      }
      salePer = (req.body.price-req.body.salePrice)/req.body.price*100;
      SaleList.price = req.body.price,
      SaleList.salePrice = req.body.salePrice,
      SaleList.salePer = salePer,
      SaleList.condiction = req.body.condiction,
      SaleList.category = req.body.category,
      SaleList.onOff = req.body.onOff
      SaleList.cosName = req.body.cosName;
      SaleList.title = req.body.title;
      SaleList.start = req.body.start;
      SaleList.end = req.body.end;
      SaleList.cosCategory = req.body.options2;

      SaleList.save(function(err) {
        if (err) {
          return next(err);
        }
        req.flash('success', '성공적으로 정보가 수정되었습니다.');
        res.redirect('back');
      });
    });
  });


  router.delete('/salelists/:id', isAdmin, (req, res, next) => {
    SaleList.findOneAndRemove({_id: req.params.id}, function(err) {
      if (err) {
        return next(err);
      }
      req.flash('success', '세일 삭제');
      res.redirect('back');
    });
  });

  router.get('/salelists/:id/edit', isAdmin, (req, res, next) => {
    SaleList.findById(req.params.id, function(err, SaleList) {
      if (err) {
        return next(err);
      }

      res.render('admin/salelistEdit', {SaleList: SaleList});
    });
  });

  router.get('/complains', isAdmin, catchErrors(async (req,res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    var query = {};
    
    // Join 방법
    // var complains = await Complain.find({}).populate('cosmeticId').populate('userId');
    // console.log(complains)
    
    complains = await Complain.paginate(query, {
      sort: {createdAt: -1},  
      page: page, limit: limit
    });
    res.render('admin/complain', {complains : complains, query: req.query});
  }));

  router.get('/complains/:id', isAdmin, (req, res, next) => {
    Complain.findById(req.params.id, function(err, Complain) {
      // var complains = await Complain.find({}).populate('cosmeticId').populate('userId');
      if (err) {
        return next(err);
      }

      res.render('admin/complainShow', {complain: Complain, cosmetic: Complain.cosmeticId});
    }).populate('cosmeticId').populate('userId');
  });


  router.put('/complains/:id', isAdmin,(req, res, next) => {
    Complain.findById({_id: req.params.id}, function(err, Complain) {
      if (err) {
        return next(err);
      }

      Complain.cosmeticName = req.body.name;
      Complain.checked = req.body.checked;
      Complain.latestUpdate = new Date();

      Cosmetic.findById(Complain.cosmeticId, function(err, Cosmetic) {
        if (err) {
          return next(err);
        }
        Cosmetic.name = req.body.name;
        Cosmetic.brand = req.body.brand;
        Cosmetic.price = req.body.price;
        Cosmetic.salePrice = req.body.salePrice;
        Cosmetic.shop = req.body.shop;
        Cosmetic.shopURL = req.body.shopURL;

        Cosmetic.save(function(err) {
          if (err) {
            return next(err);
          }
        });
      });
      
      Complain.save(function(err) {
        if (err) {
          return next(err);
        }
        req.flash('success', '성공적으로 정보가 수정되었습니다.');
        res.redirect('/admin/complains');
      });
    }).populate('cosmeticId').populate('userId');
  });



  router.delete('/complains/:id', isAdmin, (req, res, next) => {
    Complain.findOneAndRemove({_id: req.params.id}, function(err) {
      if (err) {
        return next(err);
      }
      req.flash('success', '신고 내용 삭제');
      res.redirect('back');
    });
  });



  return router;
}