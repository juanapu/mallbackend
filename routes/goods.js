//  /index route is set up in app.js
var express = require('express');
var router = express.Router();
// var mongoose = require('../models/goods');
var mongoose = require('mongoose');
var Goods = require('../models/goods');
var Users = require('../models/users');

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

//  api: /good/
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

//api: /good/sort
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

// api  /good/cart
// req: productid , 
router.post("/cart",function(req,res,next){
	const prodid = req.body.productid?req.body.productid:req.headers.productid;

	const userId = '10001';
 
	Users.findOne({userId: userId},function(err,doc){

		if(err){
			res.json({
				status: '1',
				msg: err.message
			})
		}else{
			Goods.findOne({productId: prodid},function(inrErr,inrDoc){
				if(inrErr){
					res.json({
						status: '1',
						msg: inrErr.message
					})
				}else{
					var checkList = false; //check whether item is already in cart 

					var repeatIdx='';

					for(var i=0;i<doc.cartList.length;i++){
						if(doc.cartList[i].productId === inrDoc.productId){
							checkList = true;
							repeatIdx = i;
							break;
						}
					};
					// if there is a item, num++, else push a new item
					if(checkList){ 
						doc.cartList[repeatIdx].productNum++;
						 doc.markModified('cartList');

					}else{
						inrDoc.productNum = 1;
						doc.cartList.push(inrDoc);
					};

					doc.save(function(errSave,docSave){
						if(errSave){
							res.json({
								status: '1',
								msg: errSave.message
							})
						}else{

							res.json({
								status: '0',
								result: docSave
							})
						}
					});

				}
			});
		}
	})


});

module.exports = router;