var mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    Schema = mongoose.Schema;
const crypto = require("crypto");


var schema = new Schema({
  name: {type: String, required: true, trim: true},
  email: {type: String, required: true, index: true, unique: true, trim: true},
  password: {type: String, required: true},
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

schema.methods.validPassword = function(password) {
  let inputPassword = password;
  let hashPassword = crypto.createHash("sha512").update(inputPassword + this.salt).digest("hex");
  if(hashPassword == this.password){
    return true;
  }
  else{
    return false;
  }
}
var User = mongoose.model('User', schema);

module.exports = User;