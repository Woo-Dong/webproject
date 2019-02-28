var mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    Schema = mongoose.Schema;

var schema = new Schema({
  name: {type: String, trim: true, required: true},
  shop: {type: String},
  brand: {type: String},
  price: {type: Number, default: 0},
  salePrice: {type: Number, default: 0},
  salePer: {type: String},
  start: {type: String, trim: true},
  end: {type: String, trim: true},
  link: {type: String, trim: true},
  img: {type: String},
  saleTitle: {type: String},
  eventLink: {type: String},
  cosmetic_id: {type: Schema.Types.ObjectId, ref: 'Cosmetic'}  
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true} 
});

schema.plugin(mongoosePaginate);

var Sale = mongoose.model('Sale', schema);



module.exports = Sale;