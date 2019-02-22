const express = require('express');

const router = express.Router();

const Sale = require('../models/sale');
const Event = require('../models/event');
const catchErrors = require('../lib/async-error');


const aws = require('aws-sdk');
const S3_BUCKET = process.env.S3_BUCKET;
const uuidv4 = require('uuid/v4');


router.get('/s3', function(req, res, next) {
  const s3 = new aws.S3({region: 'ap-northeast-2'});
  const filename = req.query.filename;
  const type = req.query.type;
  const uuid = uuidv4();
  const params = {
    Bucket: S3_BUCKET,
    Key: uuid + '/' + filename,
    Expires: 900,
    ContentType: type,
    ACL: 'public-read'
  };
  console.log(params);
  s3.getSignedUrl('putObject', params, function(err, data) {
    if (err) {
      console.log(err);
      return res.json({err: err});
    }
    res.json({
      signedRequest: data,
      url: `https://${S3_BUCKET}.s3.amazonaws.com/${uuid}/${filename}`
    });
  });
});



/* GET home page. */
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
  eventsArr = events.docs;
  var eventMain = new Array();
  for(let i=0; i<3; i++){
    eventMain.push(eventsArr[i]);
  }
  res.render('index', {sales: sales, events: events, eventMain: eventMain});
}));

module.exports = router;
