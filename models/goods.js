const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
	"productId": String,
	"productName": String,
	"salePrice": Number,
	"productImg": String,
	"productNum": Number
});

//connect schema with collections

module.exports = mongoose.model('Goods',productSchema); 