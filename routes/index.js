//  /index route is set up in app.js
var express = require('express');
var router = express.Router();


/* require model and connect router by using mongoose */ 
var mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/mall');

mongoose.connection.on("connected",function(){
	console.log("mongodb conncted successfully")
});

mongoose.connection.on("error",function(){
	console.log("mongodb connect fail");
});

mongoose.connection.on("disconnected",function(){
	console.log("mongodb connection disconnected");
});



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
