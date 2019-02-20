const mongoose = require('mongoose');
const  mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const crypto = require('crypto');

var schema = new Schema({
  name: {type: String, required: true, trim: true},
  email: {type: String, required: true, index: true, unique: true, trim: true},
  password: {type: String},
  naver: {id: String, token:String},
  kakao: {id: String, token:String},
  google: {id: String, token:String},
  // facebook: {id: String, token:String},
  brandLike: {type: String},
  categoryLike: {type: String},
  productLike: {type: String},
  
  salt: {type: String},
  createdAt: {type: Date, default: Date.now},
  isAdmin: {type: Boolean, default: false}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
schema.plugin(mongoosePaginate);


schema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

schema.methods.generateHash = function(password){
  return bcrypt.hash(password, 10);
};

var User = mongoose.model('User', schema);

module.exports = User;