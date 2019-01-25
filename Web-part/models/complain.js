var mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    Schema = mongoose.Schema;

var schema = new Schema( {
    title: {type: String, required: true, trim: true},

    wrongContent: {type: String},
    correctContet: {type: String, required: true},
    category:{type: String, default:'기타'},
    createAt: {type: Date, default: Date.now},
    checked: {type: Boolean, default: false},
    latestUpdate: {type: Date, default: Date.now},

    cosmeticId: {type: Schema.Types.ObjectId, ref: 'Cosmetic'},
    saleId: {type: Schema.Types.ObjectId, ref: 'Sale'},
    userId: {type: Schema.Types.ObjectId, ref: 'User'}

}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});

schema.plugin(mongoosePaginate);

var Complain = mongoose.model('Complain', schema);

module.exports = Complain;