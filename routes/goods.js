var express = require('express');
var router = express.Router();
// var mongoose = require('../models/goods');
var mongoose = require('mongoose');
var Goods = require('../models/goods');

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

router.get("/",function(req,res,next){
	Goods.find({},function(err,doc){
		if(err){
			res.json({
				status: '1',
				msg: err.message
			})
		}else{
			res.json({
				status: '0',
				result:{
					count: doc.length,
					list: doc
				}
			})
		}
	})
});

router.get("/sort",function(req,res,next){

	const param = parseInt(req.param('sort'));
	const pageSize = parseInt(req.param('pageSize')); //number of data in one page
	const pageNum = parseInt(req.param('pageNum'));  //the page's num
	const priceStart = req.param('priceStart'); //the start price for filtering 
	const priceEnd = req.param('priceEnd'); //the end price for filtering 

	const sort = {'prodcutPrice': param};
	// let param = req.param("param");
	let sortModel = '';
	if(priceStart!=='All'){
		sortModel = Goods.find({'prodcutPrice':{$gt:parseInt(priceStart),$lt:parseInt(priceEnd)}});
	}else{
		sortModel = Goods.find();
	}

	const skip = (pageNum-1)*pageSize; // the total numbers of skipped data

	sortModel.sort(sort).skip(skip).limit(pageSize);

	sortModel.exec({},function(err,doc){

		if(err){
			res.json({
				status: '1',
				msg: err.message
			})
		}else{
			//calculate the last page
			let lastPage = 1;
			if(priceStart!=='All'){
				Goods.find({'prodcutPrice':{$gt:parseInt(priceStart),$lt:parseInt(priceEnd)}},function(errinr,docinr){
					lastPage=Math.ceil(docinr.length/pageSize);
					res.json({
						status: '0',
						lastPage: '0',
						result:{
							count: doc.length,
							list: doc,
							lastPage: lastPage  
						}
					})
				});
			}else{
				Goods.find({},function(errinr,docinr){
					lastPage=Math.ceil(docinr.length/pageSize);
					res.json({
						status: '0',
						lastPage: '0',
						result:{
							count: doc.length,
							list: doc,
							lastPage: lastPage  
						}
					})
				});
			}
		}
	})
});

module.exports = router;