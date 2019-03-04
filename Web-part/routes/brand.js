const express = require('express'); 
const User = require('../models/user');
const Cosmetic = require('../models/cosmetic');
const Complain = require('../models/complain');
const catchErrors = require('../lib/async-error');

const router = express.Router();


router.get('/', catchErrors(async (req, res, next) => {

  var termBrand = "";

  var cosmetics;
  var cosmetics_brand;
  
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;

  var query="";
  // const termTotal = req.query.termTotal;
  
  termBrand = req.query.TermBrand; // 쿼리가 Value값으로 검색함!
  console.log(termBrand)
  if(termBrand) {

    query = {brand: { $in: termBrand } };
    cosmetics_brand = await Cosmetic.paginate(query, {
      sort: {brand: -1}, 
      page: page, limit: limit
    });
    
    var strQuery_brand="";
    console.log(typeof termBrand);
    strQuery_brand = termBrand;
  
  }


  if(!query){
    query = {};
    var strQuery = query;
    cosmetics = await Cosmetic.paginate(query, {
    sort: {name: -1}, 
    page: page, limit: limit
    });
  }
  
  res.render('cosmetics/brand', 
    {cosmetics: cosmetics, cosmetics_brand: cosmetics_brand,
    query: req.query, strQuery: strQuery,
    strQuery_brand: strQuery_brand});
      // strQuery_brand : 브랜드별 검색결과 밑에 뜨는 브랜드 이름
}));

module.exports = router;