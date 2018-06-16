/* set up express and router*/ 
var express = require('express');
var router = express.Router();

/* require model and connect router by using mongoose */ 
//mongoose is set in index
var Users=require('../models/users');




/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


// status: 0: success, status 1: connection error, status 2: respond error, status 3: password is not correct; status: 1001  (not login)
router.post('/login',function(req,res,next){
	var params = {
		username: req.headers.username?req.headers.username:(req.body.username?req.body.username:null),
		userpwd: req.headers.userpwd?req.headers.userpwd:(req.body.userpwd?req.body.userpwd:null)
	};
	if(params.username && params.userpwd){
		    Users.findOne({userName: params.username},function(err, userRES){
				if(err){
					res.json({
						status: '1',
						msg: err.message
					})
				}else{
					if(userRES){
						// here is the result
						if(userRES.userPwd.toString() === params.userpwd.toString()){
							res.cookie("userId",userRES.userId);
							res.json({
								status: '0',
								result: {
									msg: ' correct, it is right',
									data: userRES
								}
							})	
						}else{
							res.json({
								status: '3',
								result: {
									msg: 'password is not correct'
								}
							})	
						}

					}else{
						//could not find the user
						 res.json({
							status: '2',
							result: {
								msg: 'No such a user'
							}
						})
					}
				}
		});
	}else{
		res.json({
			status: '1',
			msg: 'username and password cannot be empty'
		})
	};

});

router.post('/logout',function(req,res,next){
	res.cookie("userId",'');
	res.json({
		status: '0',
		result: {
			msg: 'logout successfully'
		}
	})
})

module.exports = router;
