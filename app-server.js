//package declaration for usage
var express = require('express');
var app = express();
var router = express.Router();
var bodyParser = require('body-parser');
var ip = require('ip');

//------- services-------------------
var applicationService = require('./routes/application');
var answerService = require('./routes/answer');
var api = '/api/v1'

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//REST endppoint
router.use('/applications', applicationService);
router.use('/answers', answerService);
app.use(api, router);

// set dev port
var port = process.env.PORT || 5353;
var serverLoc = 'http://' + ip.address() + ':' + port;
// start server
app.listen(port);
console.log('\n=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*');
console.log('Services available on ' + serverLoc + api);
console.log('SERVER RUNNING');