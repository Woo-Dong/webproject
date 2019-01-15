var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var schema = new Schema({
  title: {type: String, required: true, trim: true},
  category: {type: String, required: true, default: '기타'},
  condiction: {type: String},
  salePer: {type: Number, default: 0},
  start: {type: Date},
  end: {type: Date},
  pictName: {type: String},
  cosCategory: {type: String, required: true},
  cosName: {type: String, required: true},
  onOff: {type: String, required: true, default: '온/오프라인'},
  place: {type: String, default: '전 지점'}
  
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true} 
});

var SaleList = mongoose.model('SaleList', schema);



module.exports = SaleList;