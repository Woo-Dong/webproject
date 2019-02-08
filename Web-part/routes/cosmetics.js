const express = require('express'); 
const Cosmetic = require('../models/cosmetic');
const User = require('../models/user');
const catchErrors = require('../lib/async-error');

const router = express.Router();

// var Sale = require('../models/sale');

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

router.get('/:id/error', catchErrors(async (req, res, next) => {
  Cosmetic.findById(req.params.id, function(err, cosmetic) {
    if (err) {
      return next(err);
    }
    res.render('cosmetics/error', {cosmetic: cosmetic});
  });
}));

// 똥 싸놓은 부분
router.post('/:id/like', catchErrors (async (req, res, next) => {
 const user = await User.findById({_id: req.user.id});
 if (!(req.params.id in user.productLike)){
   var newProductLike = user.productLike;
   newProductLike.push(req.params.id);
   user.productLike = newProductLike;
 } 
 await user.save();
 req.flash('success', '성공적으로 당신의 취향이 저장되었다.');
 res.redirect('back');
}));


module.exports = router;