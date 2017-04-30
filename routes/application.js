/** Package declarations for usage **/
var express = require('express');
var router = express.Router();
var applicationModal = require('../modals/application-modal');
var mailer = require("nodemailer");
var fs = require('fs');
var PDFDocument = require('pdfkit');
var idAppender = "001-G8IAS3-72";

	/* Validates the credentials for the given sender id/password*/
	var smtpTransport = mailer.createTransport({
		service: "Gmail",
		auth: {
		    	//TODO; Fetch these credentials from the database
		        user: "umass.tbi@gmail.com",
		        pass: "tbi@umass"
		}
	});


/**------------- Configuring endpoints for GET on the <b>/applications</b> resource  -----------------**/

	/* Fetches an array of all Applications that exist in the <b>Application</b> table in the database. */
	router.get('/', function(request, response, next){
		applicationModal.getAll(function(error,count){
			  if(error)
				{
					console.log('Error: ' + error);
					response.statusCode = 400;
		  			response.statusMessage = "Bad Request";
					response.json({"message" : "Error while fetching Applications."});
				}
			  else
			  	{	
				  	response.json(count);	
					console.log(count);
			  	}
		});
	});	

	/* Fetches an array of all Answers and Questions saved for the given application id
	 	@ Path.Param --> id, indicates the unique ID of the application.
	*/
	router.get('/:id?', function(request, response, next){
		applicationModal.get(request.params.id,function(error,count){
			if(error)
			{
				console.log('Error: ' + error);
				response.statusCode = 400;
		  		response.statusMessage = "Bad Request";
				response.json({"message" : "Error while fetching Application."});
			}
		  	else
		  	{
			  	response.json(count);	
			}
		});
	});


/**------------- Configuring endpoints for POST on the <b>/applications</b> resource  -----------------**/

	/* Generates a PDF for the given application id. Fetches all Answers and Questions for the given application 
		from the table, creates and array and passes the data to the #createPdf function that generates the PDF and send to the desired email id.
	 	@ Path.Param --> 	id, indicates the unique ID of the application.
	 	@ Body  	 --> 	{"email" : "sample@example.com"}
	*/
	router.post('/:id/generate', function(request, response, next){
		var appid = request.params.id.toString();
		var id = appid.replace(idAppender, "");
		var email = request.body.email;
		applicationModal.get(parseInt(id), function(error,count){
		  if(error)
			{
				console.log('Error: ' + error);
				response.statusCode = 400;
		  		response.statusMessage = "Bad Request";
				response.json({"message" : "Error while emailing report. Please try again later."});
			}
		  else
		  	{	
		  		createPDF(appid, count, email, response);
		  		emailApplicationPDF(appid, email);
			  	response.json({"message" : "Worksheet emailed successfully."});	
		  	}
		});
	});	

	/* Creates an application object in the database and gives back the application id to the user.
	 	@ Body 		 -->  {"is_complete" : 0} //TODO : don't take this as body.
	*/
	router.post('/', function(request, response, next){
		applicationModal.create(request.body,function(error,count){
		  if(error)
			{
				console.log('Error: ' + error);
				response.statusCode = 400;
			  	response.statusMessage = "Bad Request";
				response.json({"message" : "Error while creating application."});	
			}
		  else
		  	{
		  		if(response.statusCode == 200){
			  		response.statusCode = 201;
			  		response.statusMessage = "Created";
			  		var appid = idAppender + count.insertId.toString();
			  		var res = {"id": appid, "creation_date" : new Date(), "message" : "Application created successfully."};
					response.json(res);
					console.log(res);
				}
		  }
		});
	});

	/* Sends an email to the respective user with his the generated application id.
	 	@ Path.Param -->   id, indicates the unique ID of the application.
	 	@ Body       -->   {"email" : "sample@example.com"}
	*/
	router.post('/:id/send', function(request, response, next){
		var email = request.body.email;
		var app_id = request.params.id;
		console.log(app_id);
		console.log("Sending email to . . . " + email);
		
		var mail = {
	    from: "Umass TBI <umass.tbi@gmail.com>",
	    to: email,
	    subject: "TBI Decision Aid: Application created",
	    text: "Hey there, \n\nThank you for registering. " + "Your application id is " + app_id
					+ ". Please note down your application number and use this to access your application in the future. We look forward to assisting you at every step. \n\nRegards,\nTBI team at UMass",
	    }

		smtpTransport.sendMail(mail, function(error, res){
			if(error){
				response.statusCode = 400;
		  		response.statusMessage = "Bad Request";
		  		var resp = {"message" : "Error while sending email."};
				response.json(resp);
			    console.log(error);
			}else{
				response.statusCode = 200;
		  		response.statusMessage = "OK";
		  		var resp = {"message" : "Email sent successfully.", "creation_date" : new Date()};
			    console.log("Email sent to " + email);
			    response.json(resp);
		    }
		smtpTransport.close();
		});
	});

/* Generate PDF using #nodemailer library with ustomized pages and texts. 
	@id 		-->  Indicates the application id.
	@jsonData   -->  Indicates the json data in the form of questions and answers for the given applucation id.
	@email 		-->  Indicates the emil id to send the email to.
	@response 	-->  Response object.
*/
	var createPDF = function(id, jsonData, response){
		var app_id = id;
		var array = jsonData;
		var todaysDate = new Date().toLocaleDateString('en-US');
		doc = new PDFDocument;
		// Adds name and location of the file.
		doc.pipe(fs.createWriteStream('../Content/tbi_report.pdf'));
		// Sets the application id and the date on the top.
		doc.fontSize(16).text('Application Number : #' + app_id);
		doc.fontSize(16).text('Date : ' + todaysDate);
		// Adding a blank space of 6 text lines.
		doc.moveDown();doc.moveDown();doc.moveDown();doc.moveDown();doc.moveDown();doc.moveDown();
		// Inserts logo of UMass in the centre of the file on the first page.
		doc.image('/Content/umass_logo.jpg', (doc.page.width - 240) /2 );
		// Inserts text exactly below the logo.
		doc.fontSize(20).text('Traumatic Brain Injury Decision Aid System', {align: 'center'});
		// Adding a blank space of 6 text lines.
		doc.moveDown();doc.moveDown();doc.moveDown();doc.moveDown();doc.moveDown();doc.moveDown();
		// Adding a footer with copyrights text.
		doc.fontSize(12).text('© 2017 University of Massachusetts Medical School', {align: 'center'});
		// Adds a new page to the existing document to list all questions and answers from the worksheet. 
		doc.addPage();
		//Add worksheet text.
		doc.fontSize(20).text('Worksheet Report');
		// Adding a blank space of 1 text line.
		doc.moveDown();
		//Iterates over the JSON data fetched from the database consisting of list of question and answers answered for the given application.
		for (var index = 0; index < array.length; ++index) {
		    var numb = index+1;
		    doc.fontSize(14);
		    // Adds a question.
		    doc.font('Times-Roman').text(numb.toString() + ". " + array[index].q_text, {align: 'justify'});
		    // Writes a corresponding answer.
		    doc.text("-- " + array[index].ans_text, {align: 'justify'});
			// Adding a blank space of 1 text line.
			doc.moveDown();
		}
		//Creates and closes the document.
		doc.end();
		console.log("PDF generated");
	}

/**------------- Helper functions. -----------------**/

	/* Send email using SMTP server which authenticates the google account of the sender. Send an email with the pdf generated for the given application id.
	   @email 	-->  Indicates the emil id to send the email to. **/
	var emailApplicationPDF = function(email){
		mailer.SMTP = {
		    use_authentication: false, 
		    //TODO; Fetch these from the database
		    user: 'umass.tbi@gmail.com', 
		    pass: 'tbi@umass'
		};

		var mail = {
	    from: "Umass TBI <umass.tbi@gmail.com>",
	    to: email,
	    subject: "TBI Decision Aid: Your Worksheet",
	    text: 'Hey there, \n\nThank you for time in going through the worksheet. Your application id is ' + app_id + '. Below attached is a document based on the inputs provided by you in your worksheet. Please take a printout of this PDF while visiting the physician. \n\nAlso, you can access your application and make changes to the same in the future using the above application reference number. We look forward to assisting you at every step. \n\nRegards,\nTBI team at UMass"',
	    attachments: [{'filename': 'TBI_Worksheet.pdf', 'path' : '../Content/tbi_report.pdf', 'content': 'application/pdf'}]
	    }

		smtpTransport.sendMail(mail, function(error, res){
			if(error){
			    console.log(error);
			}else{
		  		var resp = {"message" : "PDF emailed successfully.", "creation_date" : new Date()};
			    console.log("Email sent to " + email);
		    }
		smtpTransport.close();
		});
	}

module.exports = router;