const express = require('express'); 
const User = require('../models/user');
const Sale = require('../models/sale');
const catchErrors = require('../lib/async-error');


const router = express.Router();

router.get('/', catchErrors(async (req, res, next) => {

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;

  var query = {};
  var sales = await Sale.paginate(query, {
    sort: {end: -1}, 
    page: page, limit: limit
  })
  res.render('saleLists/index', {sales: sales});
}));

router.get('/1', (req, res, next) => {
    res.render('saleLists/test');
});

module.exports = router;