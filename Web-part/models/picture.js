var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var schema = new Schema({
  name: {type: String, required: true, trim: true},
  category: {type: String, required: true, default: '기타'},
  url: {type: String, required: true}

}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});

var Picture = mongoose.model('Picture', schema);

module.exports = Picture;