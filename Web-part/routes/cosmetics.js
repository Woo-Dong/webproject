const express = require('express'); 
const User = require('../models/user');
const Cosmetic = require('../models/cosmetic');
const Complain = require('../models/complain');
const catchErrors = require('../lib/async-error');

const router = express.Router();

function needAuth(req, res, next) {
  if (req.isAuthenticated() ) {
    next();
  } else {
    req.flash('danger', '다시 로그인해 주세요.');
    res.redirect('/signin');
  }
}

router.get('/', catchErrors(async (req, res, next) => {

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;

  var query = {};
  const termTotal = req.query.termTotal;
  if (termTotal) {
    query = {$or: [
      {name: {'$regex': termTotal, '$options': 'i'}},
      {category: {'$regex': termTotal, '$options': 'i'}},
      {shop: {'$regex': termTotal, '$options': 'i'}},
      {brand: {'$regex': termTotal, '$options': 'i'}},
      {detail_descrpt: {'$regex': termTotal, '$options': 'i'}}
    ]};
  }

  const termCategory = req.query.termCategory;
  if(termCategory) {
    query = {category: {'$regex': termCategory, '$options': 'i'}};
  }
  const termBrand = req.query.termBrand;
  if(termBrand) {
    query = {brand: {'$regex': termBrand, '$options': 'i'}};
  }
  const cosmetics = await Cosmetic.paginate(query, {
    sort: {name: -1}, 
    page: page, limit: limit
  });
  res.render('cosmetics/index', {cosmetics: cosmetics, query: req.query});

}));

router.get('/:id', (req, res, next) => {
  Cosmetic.findById(req.params.id, function(err, cosmetic) {

    if (err) {
      return next(err);
    }
    res.render('cosmetics/show', {cosmetic: cosmetic});
  });
});

router.get('/:id/error', needAuth,(req, res, next) => {
  Cosmetic.findById(req.params.id, function(err, cosmetic) {
    if (err) {
      return next(err);
    }
    res.render('cosmetics/error', {cosmetic: cosmetic});
  });
});

router.post('/', needAuth, (req, res, next) => {
  Complain.findOne({name: req.body.name}, function(err,complain) {

    if (err) {
      return next(err);
    }
    if (complain) {
      req.flash('danger', '이게 뭔지');
      return res.redirect('back');
    }

    req.flash('신고 접수 중');
    
    var newComplain = new Complain({
      category : req.body.errorCate,
      name: req.body.nameC,
      brand: req.body.brand,
      price: req.body.price,
      shop: req.body.shop,
      shopURL: req.body.shopURL,
      detail_descrpt: req.body.detail_descrpt,
      comment: req.body.comment,
      cosmeticId: req.body.id,
      userId: req.user.id,
      userName: req.user.name,
      cosmeticName: req.body.name
    });

    newComplain.save(function(err) {
      if (err) {
        return next(err);
      }
      req.flash('접수 완료!', '조금만 기다려 주시면 금방 고치겠습니다.^^7');
      res.redirect('back');
    });
  });
});

router.post('/:id/like', catchErrors (async (req, res, next) => {
  const cosmetic = await Cosmetic.findById(req.params.id);
  if (!cosmetic) {
    return next({status: 404, msg: 'Not exist product!'});
  }
  const user = await User.findById(req.user._id);
  var bool =true;
  if(user.productLike){
    if(Array.isArray(user.productLike) ){
      
      for(var prd in user.productLike){
        if (cosmetic.id == prd){
          bool = false;
        }
      }
      if(bool){
        var newProductLike = user.productlike;
        newProductLike.push(cosmetic.id);
        user.productLike = newProductLike;
      }
    }
    else{
      var productArr = new Array();
      productArr[0] = user.productLike;
      productArr.push(cosmetic.id);
      user.productLike = productArr;
    }
  }
  else{
    user.productLike = cosmetic.id;
  }
  // user.productLike = cosmetic.name;
  await user.save();
  return res.json(user);
}));

module.exports = router;