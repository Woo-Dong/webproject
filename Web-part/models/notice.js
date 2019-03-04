var mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    Schema = mongoose.Schema;

var schema = new Schema({
    user_id: {type: String},
    checked: {type: Boolean, default: false},
    content: {type: String},
    target_id: {type: String},
    category: {type: String},
    target: { type: Schema.Types.ObjectId, ref: 'Sale' }

}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true} 
});

schema.plugin(mongoosePaginate);

var Notice = mongoose.model('Notice', schema);



module.exports = Notice;