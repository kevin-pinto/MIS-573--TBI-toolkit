var express = require('express');
var router = express.Router();
var answerModal = require('../modals/answer-modal');
var idAppender = "001-G8IAS3-72";

/*------------Fetching all pain entries-------------------*/
router.get('/', function(request, response, next){
	answerModal.getAll(function(error,count){
	  if(error)
		{
			console.log('Error: ' + error);	
		}
	  else
	  	{
		  	response.json(count);	
			console.log(count);
	  }
	});
});	
/*------------Fetching a single pain entry-------------------*/
router.get('/:id?', function(request, response, next){
	answerModal.get(request.params.id,function(error,count){
		if(error)
		{
			console.log('Error: ' + error);
		}
	  else
	  	{
		  	response.json(count);	
			console.log(count);
	  }
	});
});

/*------------Create a pain entry-------------------*/
router.post('/', function(request, response, next){
	console.log(request.body);
	var appid = request.body.app_id.toString();
	appid = appid.replace(idAppender, "");
	console.log(appid);
	var req = {"app_id" : parseInt(appid), "q_id" : request.body.q_id, "ans_text" : request.body.ans_text};
	console.log(req);
	answerModal.create(req,function(error,count){
	  if(error)
		{
	  		//to update answer if duplicate
			if(error.code = 'ER_DUP_ENTRY'){
				answerModal.update(req, function(error,count){
					if(error){
						response.statusCode = 400;
	  					response.statusMessage = "Bad Request";
					}else{
						response.statusCode = 200;
						response.statusMessage = "OK";
						var res = {"updation_date" : new Date()};
						response.json(res);
						console.log(res);
						console.log(count);
					}

				});
			}else{
						response.statusCode = 400;
	  					response.statusMessage = "Bad Request";

			}
		}
	  else
	  	{
	  		if(response.statusCode == 200){
		  		response.statusCode = 201;
		  		response.statusMessage = "Created";
		  		var res = {"id": count.insertId, "creation_date" : new Date()};
				response.json(res);
				console.log(res);
	  		}
	  }
	});
});

module.exports = router;