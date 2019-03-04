const express = require('express'); 
const User = require('../models/user');
const Sale = require('../models/sale');
const Event = require('../models/event');
const catchErrors = require('../lib/async-error');


const router = express.Router();

router.get('/', catchErrors(async (req, res, next) => {

  var termTotal = "";
  var termSalePuct = "";
  var termEvent = "";

  var sales;
  var events;

  if(req.query.selectForm){

    if(!req.query.term){
      req.query.term = "";
    }

    termSelectArr = req.query.selectForm;
    if(typeof(termSelectArr) == "object"){
      for(let i=0; i<termSelectArr.length; i++){
        var termSelect = termSelectArr[i];
        if(termSelect == "total"){
          termTotal = req.query.term;
          termSalePuct = req.query.term;
          termEvent = req.query.term;
        }
        else if(termSelect == "salePuct"){
          termSalePuct = req.query.term;
        }
        else if(termSelect == "event"){
          termEvent = req.query.term;
        }
      }
    }

    else if(typeof(termSelectArr) == "string"){
      if(termSelectArr == "total"){
        termTotal = req.query.term;
        termSalePuct = req.query.term;
        termEvent = req.query.term;
      }
      else if(termSelectArr == "salePuct"){
        termSalePuct = req.query.term;
      }
      else if(termSelectArr == "event"){
        termEvent = req.query.term;
      }
    }
  }


  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;

  var query;

  if (termSalePuct) {
    query = {$or: [
      {name: {'$regex': termSalePuct, '$options': 'i'}},
      {shop: {'$regex': termSalePuct, '$options': 'i'}},
      {brand: {'$regex': termSalePuct, '$options': 'i'}},
    ]};
    sales = await Sale.paginate(query, {
      sort: {name: -1}, 
      page: page, limit: limit
    });
    var strQuery = termSalePuct;
  }

  if (termEvent) {
    query = {$or: [
      {title: {'$regex': termEvent, '$options': 'i'}},
      {brand: {'$regex': termEvent, '$options': 'i'}},
    ]};
    events = await Event.paginate(query, {
      sort: {name: -1}, 
      page: page, limit: limit
    });
    var strQuery = termEvent;
  }

  if(!query){
    query = {};
    var strQuery = query;
    sales = await Sale.paginate(query, {
    sort: {name: -1}, 
    page: page, limit: limit
    });
    events = await Event.paginate(query, {
      sort: {name: -1}, 
      page: page, limit: limit
    });
  }
  res.render('saleLists/index', 
    {sales: sales, events: events, query: req.query, strQuery: strQuery});

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