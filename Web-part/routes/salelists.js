const express = require('express'); 
const User = require('../models/user');
const Sale = require('../models/sale');
const Event = require('../models/event');
const catchErrors = require('../lib/async-error');


const router = express.Router();

router.get('/', catchErrors(async (req, res, next) => {

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;

  var query = {};
  var sales = await Sale.paginate(query, {
    sort: {end: 1}, 
    page: page, limit: limit
  });
  var query = {};
  var events = await Event.paginate(query, {
    sort: {end: 1},
    page: page, limit: limit
  });
  res.render('saleLists/index', {sales: sales, events: events});
}));

router.get('/:id',  (req, res, next) => {
  Event.findById(req.params.id, function(err, event) {
    if (err) {
      return next(err);
    }
    res.render('saleLists/show', {event: event});
  });
});
module.exports = router;