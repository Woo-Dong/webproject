var express = require('express');
var router = express.Router();

const aws = require('aws-sdk');

// aws.config.loadFromPath(__dirname + "/../config/awsconfig.json");
// const s3 = new aws.S3();
// const uuidv4 = require('uuid/v4');

// router.get('/s3', function(req, res, next) {
//   const filename = req.query.filename;
//   const type = req.query.type;
//   const uuid = uuidv4();
//   const params = {
//     Bucket: S3_BUCKET,
//     Key: uuid + '/' + filename,
//     Expires: 900,
//     ContentType: type,
//     ACL: 'public-read'
//   };
//   console.log(params);
//   s3.getSignedUrl('putObject', params, function(err, data) {
//     if (err) {
//       console.log(err);
//       return res.json({err: err});
//     }
//     res.json({
//       signedRequest: data,
//       url: `https://${S3_BUCKET}.s3.amazonaws.com/${uuid}/${filename}`
//     });
//   });
// });




/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

module.exports = router;
