var mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    Schema = mongoose.Schema;

var schema = new Schema( {
    name: {type: String, trim: true},
    brand: {type: String, trim: true},
    price: {type: String, trim: true},
    salePrice: {type: String, trim: true},
    shop: {type: String, trim: true},
    shopURL: {type: String, trim: true},
    detail_descrpt: {type: String},
    comment: {type: String},

    userName: {type: String, trim: true},
    cosmeticName: {type: String, trim: true},

    category:{type: String, default:'??'},
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