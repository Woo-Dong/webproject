const express = require('express'); 
const User = require('../models/user');
const Cosmetic = require('../models/cosmetic');
const catchErrors = require('../lib/async-error');

const router = express.Router();

// var Sale = require('../models/sale');


function subCategory(selector, apply){
    $("#this.selector").click(function(){
        if($("#this.selector").is(":checked")){
            $(".this.apply").prop("checked", true);
        }
        else{$(".this.apply").prop("checked", false);}
    });
  }

router.get('/', catchErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

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

router.get('/1', (req, res, next) => {

  res.render('cosmetics/product_sp');
});

router.get('/:id', (req, res, next) => {
  Cosmetic.findById(req.params.id, function(err, cosmetic) {
    if (err) {
      return next(err);
    }
    res.render('cosmetics/show', {cosmetic: cosmetic});
  });
});

router.get('/:id/error', (req, res, next) => {
  Cosmetic.findById(req.params.id, function(err, cosmetic) {
    if (err) {
      return next(err);
    }
    res.render('cosmetics/error', {cosmetic: cosmetic});
  });
});

// router.post('/', (req, req, next)=> {
//   const termCategoryList = req.body;
//   var  = await User.findOne({email: req.body.email});
//   if (err) {
//     return next(err);
//   }
//   if (user) {
//     req.flash('danger', 'Email address already exists.');
//     return res.redirect('back');
//   }
  

module.exports = router;