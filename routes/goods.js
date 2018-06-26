//  /index route is set up in app.js
var express = require('express');
var router = express.Router();

//mongoose is set in index
var Goods = require('../models/goods');
var Users = require('../models/users');

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

	const userId = req.cookies.userId;
 
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

router.post("/cartList",function(req,res,next){
	const userId = req.cookies.userId;
	Users.findOne({userId: userId},function(err,doc){
		if(err){
			res.json({
				status: '1',
				msg: err.message
			})
		}else{
			res.json({
				status: '0',
				result: {
					data: doc.cartList
				}
			})	
		}

	})
})

// req:  productid, updele: update element, updeveval: update element value
// res: cartList data
router.post("/cartUpdate",function(req,res,next){
	const userId = req.cookies.userId;
	const productid = req.body.productid?req.body.productid:req.headers.productid;
	const updele = req.body.updele?req.body.updele:req.headers.updele;
	const updeleval = req.body.updeleval?req.body.updeleval:req.headers.updeleval;
	Users.findOne({userId: userId},function(err,doc){
		if(err){
			res.json({
				status: '1',
				msg: err.message
			})
		}else{
			const list  = doc.cartList;
			list.forEach(function(val){
				if(val.productId === productid){
						val[updele] = updeleval;
				}
			});

			doc.markModified('cartList');

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
	})
})


//productids : product id array [] 
router.post("/cartDelete",function(req,res,next){
	const userId = req.cookies.userId;
	const productidsStr = req.body.productids?req.body.productids:req.headers.productids;
	const productids = productidsStr.split('-');
	let deleteNum = 0;

	Users.findOne({userId: userId},function(err,doc){
		if(err){
			res.json({
				status: '1',
				msg: err.message
			})
		}else{
			const list = doc.cartList;
			let lstLength = list.length;
			let proLength = productids.length;

			for(let i=0;i<lstLength;i++){
				for(let j=0;j<proLength;j++){
					if(list[i].productId===productids[j]){
						deleteNum++;
						list.splice(i,1);
						productids.splice(j,1);
						lstLength--;
						proLength;
						i--;
						j--;
						break;
					}
				}
			}
			
			doc.markModified('cartList');

			doc.save(function(errSave,docSave){
				if(errSave){
					res.json({
						status: '1',
						msg: errSave.message
					})
				}else{
					if(deleteNum){
						res.json({
							status: '0',
							result: docSave
						})
					}else{
						res.json({
							status: '2',
							result:{
								msg: 'Can not find these data'
							}
						})	
					}
				}
			});
		}
	})
})

module.exports = router;