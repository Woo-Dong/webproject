var mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    Schema = mongoose.Schema;


var schema = new Schema({
  name: {type: String, required: true, trim: true},
  category: {type: String, default: '기타'},
  
  volume: {type: String},
  brand: {type: String},
  shop: {type: String},
  price: {type: String, default: 0},
  detail_descrpt: {type: String},
  latestSale: {type: String},
  pictName: {type: String},
  
  minPrice: {type: Number},
  maxSalePer: {type: Number}
  
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
schema.plugin(mongoosePaginate);
var Cosmetic = mongoose.model('Cosmetic', schema);

module.exports = Cosmetic;