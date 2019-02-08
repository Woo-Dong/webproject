var express = require('express'); 
  User = require('../models/user');
var router = express.Router();
// var Cosmetic = require('../models/cosmetic');
var Sale = require('../models/sale');

router.get('/', (req, res, next) => {
    res.render('saleLists/index');
});

router.get('/1', (req, res, next) => {
    res.render('saleLists/test');
});

module.exports = router;