const express = require('express'); 
const User = require('../models/user');
const Cosmetic = require('../models/cosmetic');
const Sale = require('../models/sale');
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

  var termTotal = "";
  var termCategory;
  var termBrand = "";
  var termName = "";

  var cosmetics;
  var cosmetics_cate;
  var cosmetics_brand;
  var cosmetics_name;
  
  if(req.query.selectForm){

    if(!req.query.term){
      req.query.term = "";
    }

    termSelectArr = req.query.selectForm;

    if(typeof(termSelectArr) == "object"){
      for(let i=0; i<termSelectArr.length; i++){
        var termSelect = termSelectArr[i];
        if(termSelect == "total"){
          termCategory = req.query.term;
          termBrand = req.query.term;
          termName = req.query.term;
        }
        else if(termSelect == "category"){
          termCategory = req.query.term;
        }
        else if(termSelect == "brand"){
          termBrand = req.query.term;
        }
        else if(termSelect == "name"){
          termName = req.query.term;
        }
      }
    }


    else if(typeof(termSelectArr) == "string"){
      if(termSelectArr == "total"){
        termCategory = req.query.term;
        termBrand = req.query.term;
        termName = req.query.term;
      }
      else if(termSelectArr == "category"){
        termCategory = req.query.term;
      }
      else if(termSelectArr == "brand"){
        termBrand = req.query.term;
      }
      else if(termSelectArr == "name"){
        termName = req.query.term;
      }
    }
  }

  if(req.query.termCategory){
    termCategory = req.query.termCategory;
  }

  
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;

  var query;
  // const termTotal = req.query.termTotal;
  if (termTotal) {
    query = {$or: [
      {name: {'$regex': termTotal, '$options': 'i'}},
      {category: {'$regex': termTotal, '$options': 'i'}},
      {shop: {'$regex': termTotal, '$options': 'i'}},
      {brand: {'$regex': termTotal, '$options': 'i'}},
      {detail_descrpt: {'$regex': termTotal, '$options': 'i'}}
    ]};
    cosmetics = await Cosmetic.paginate(query, {
      sort: {name: -1}, 
      page: page, limit: limit
    });
    var strQuery = termTotal;
  }

  // const termCategory = req.query.termCategory;
  if(termCategory) {
    query = {category: {$in:termCategory} };
    cosmetics_cate = await Cosmetic.paginate(query, {
      sort: {category: -1}, 
      page: page, limit: limit
    });
    var strQuery_cate = "";
    if( (typeof termCategory) != "object"){
      for(let i=0; i<termCategory.length; i++){
        strQuery_cate += termCategory[i] + ", ";
      }
      strQuery_cate = strQuery_cate.slice(0, -2);
    }
    else{
      strQuery_cate = termCategory;
    }
  }
  // const termBrand = req.query.termBrand;
  if(termBrand) {
    query = {brand: {'$regex': termBrand, '$options': 'i'} };
    var strQuery_brand = termBrand;
    cosmetics_brand = await Cosmetic.paginate(query, {
      sort: {brand: -1}, 
      page: page, limit: limit
    });
  }

  if(termName) {
    query = {name: {'$regex': termName, '$options': 'i'} };
    var strQuery_name = query;
    cosmetics_name = await Cosmetic.paginate(query, {
      sort: {name: -1}, 
      page: page, limit: limit
    });

    var strQuery_name = termName;
  }

  if(!query){
    query = {};
    var strQuery = query;
    cosmetics = await Cosmetic.paginate(query, {
    sort: {name: -1}, 
    page: page, limit: limit
    });
  }
  
  res.render('cosmetics/index', 
    {cosmetics: cosmetics, cosmetics_cate: cosmetics_cate, 
      cosmetics_brand: cosmetics_brand, cosmetics_name: cosmetics_name, 
      query: req.query, strQuery: strQuery, strQuery_cate: strQuery_cate,strQuery_brand: strQuery_brand, strQuery_name: strQuery_name});

}));

router.get('/:id', (req, res, next) => {
  Cosmetic.findById(req.params.id, function(err, cosmetic) {
    if (err) {
      return next(err);
    }

    if(cosmetic){

      var name = cosmetic.name;
    
      var regexr = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
      var SC=regexr.test(name);
      var name2 = name
      if (SC){
        while (SC){

          if (/\(/ig.test(name2)){          
            var idx1=name2.search(/\(/ig);
            var idx2=name2.search(/\)/ig);
            var head=name2.substring(0,idx1);
            var tail=name2.substring(idx2+1,name2.length);
            var name2=head+tail
          }
          else if (/\[/ig.test(name2)){
            var idx1=name2.search(/\[/ig);
            var idx2=name2.search(/\]/ig);
            var head=name2.substring(0,idx1);
            var tail=name2.substring(idx2+1,name2.length);
            var name2=head+tail

          }
          else if (/\{/ig.test(name2)){
            var idx1=name2.search(/\{/ig);
            var idx2=name2.search(/\}/ig);
            var head=name2.substring(0,idx1);
            var tail=name2.substring(idx2+1,name2.length);
            var name2=head+tail

          }
          else if (/\-/ig.test(name2)){
            var idx1=name2.search(/\-/ig);
            var head=name2.substring(0,idx1);
            var name2=head

          }
          SC=regexr.test(name2);
        }
      }
      if (cosmetic) {
        query = {$or: [
          {name: {'$regex': name, '$options': 'i'}},
          {name: {'$regex': name, '$options': 'x'}},
          {name: {'$regex': name2, '$options': 'i'}},
          {name: {'$regex': name2, '$options': 'x'}}
        ]};
      }
      Sale.find(query, function(err, sales){
        if (err) {
          return next(err);
        }
        res.render('cosmetics/show', {cosmetic: cosmetic, sales: sales});
      });
    }
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
  
  const cosmetic = await Cosmetic.findById(req.params.id);
  if (!cosmetic) {
    return next({status: 404, msg: 'Not exist product!'});
  }
  const user = await User.findById(req.user._id);
  var bool = true;
  if(user.productLike){
    var temp = new Array(); 
    temp = user.productLike.split(",");
    var challenger = cosmetic.id;

    temp.forEach(function(ggon) {
      if (challenger==ggon){
        bool = false;
      }
    }) 
    if(bool){
      temp.push(cosmetic.id);
      user.productLike = temp;
    }
    else{
      temp.remove(challenger);
      user.productLike = temp;
    }
  }
  else{
    user.productLike = cosmetic.id;
  }

  await user.save();
  return res.json(user);
}));

module.exports = router;