var mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    Schema = mongoose.Schema;

var schema = new Schema({
  title: {type: String, trim: true},
  brand: {type: String, trim: true},
  start: {type: String, trim: true},
  end: {type: String, trim: true},
  link: {type: String, trim: true},
  img: {type: String},
  detailImg: {type: String},
  detail: {type: String}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true} 
});

schema.plugin(mongoosePaginate);

var Event = mongoose.model('Event', schema);



module.exports = Event;