const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
	"userId": String,
	"userName": String,
	"userPwd": Number,
	"cartList": Array
});

//connect schema with collections

module.exports = mongoose.model('Users',userSchema); 