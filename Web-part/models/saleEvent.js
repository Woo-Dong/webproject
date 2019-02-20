var mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    Schema = mongoose.Schema;

var schema = new Schema({
  title: {type: String, trim: true},
  brand: {type: String, trim: true},
  start: {type: Date, trim: true},
  end: {type: Date, trim: true},
  category: {type: String, default: "기타"},
  onOff: {type: String, trim: true, default: "online"},
  link: {type: String, trim: true},
  img: {type: String},
  detailImg: {type: String},
  detail: {type: String},
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true} 
});

schema.plugin(mongoosePaginate);

var SaleEvent = mongoose.model('SaleEvent', schema);



module.exports = SaleEvent;