var express = require('express'); 
  User = require('../models/user');
var router = express.Router();
var Cosmetic = require('../models/cosmetic');
// var Sale = require('../models/sale');

router.get('/', (req, res, next) => {
    res.render('cosmetics/show');
});


router.get('/:id', (req, res, next) => {
  Cosmetic.findById(req.params.id, function(err, cosmetic) {
    if (err) {
      return next(err);
    }
    res.render('cosmetics/show', {cosmetic: cosmetic});
  });
});

module.exports = router;