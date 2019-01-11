var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var schema = new Schema({
  name: {type: String, required: true, trim: true},
  category: {type: String, required: true, default: '기타'},
  series: {type: String},
  company: {type: String, required:true},
  latestSale: {type: String},
  volume: {type: String, default: '없음'},
  brand: {type: String, required:true},
  shop: {type: String, required:true},
  pictName: {type: String},
  price: {type: Number, required:true, default: 0},
  minPrice: {type: Number, default: 0},
  maxSalePer: {type: Number, default: 0}
  
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});

var Cosmetic = mongoose.model('Cosmetic', schema);

module.exports = Cosmetic;