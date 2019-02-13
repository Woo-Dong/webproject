var mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    Schema = mongoose.Schema;



var schema = new Schema({
  title: {type: String, required: true, trim: true},
  category: {type: String, default: '기타'},
  condiction: {type: String},
  price: {type: Number, default: 0},
  salePer: {type: Number, default: 0},
  salePrice: {type: Number, default: 0},
  start: {type: Date},
  end: {type: Date},
  pictName: {type: String},
  cosCategory: {type: String},
  cosName: {type: String},
  onOff: {type: String, default: '온/오프라인'},
  place: {type: String, default: '전 지점'}
  
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true} 
});

schema.plugin(mongoosePaginate);

var SaleList = mongoose.model('SaleList', schema);



module.exports = SaleList;