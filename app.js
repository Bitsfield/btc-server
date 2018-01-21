const express = require('express');
const bodyParser = require('body-parser');
var helmet = require('helmet');
var compression = require('compression');
var crypter = require('./modules/crypt.js');
var save = require('./modules/save-transaction.js');

const app = express();

app.use(helmet());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//default homepage
app.get('/', function(req, res) { res.send("Hello Friend!"); } );

//get app status
app.get('/status', function(req, res)
{
	doTestCrypt();
	console.log("I'm Up!!!");
	res.json(
		{
			'Status':"Active"
		}
	);
});

//generate token endpoint
app.get('/token/:value/:addy/:userId/:email', function(request, response)
{
	var params = request.params;
	if(!validateRequest(params))
	{
		response.status(400).json({"code":"400","status":"failed","description":"bad request"});
	}
	else
	{
		response.json({
			"code":0,
			"status":"success",
			"description":"token generated successfully!",
			"data": {
				"token": getToken(params)
			}
		});
	}
});

app.use(save);
//post transaction endpoint
app.post('/transaction', function(request, response)
{
	var data = request.body;
	if(!validateRequest(data))
	{
		response.status(400).json({"code":"400","status":"failed","description":"bad request"});
	}
	else
	{
		data.ip = request.ip;
		var token = request.get('Authorization');

		if(typeof token == 'undefined' || token.indexOf("EKOINX") == -1)
		{
			response.status(400).json({"code":"400","status":"failed","description":"bad requst"});
		}
		else
		{
			data.token = token.replace("EKOINX ", "");
			var cipher = getToken(data);

			console.log("token: " + data.token);
			console.log('cipher: ' + cipher);

			if(data.token == cipher)
			{
				console.log(data);
				next();
		   	}
		    else
		    {
		    	response.status(401).json({"code":"401","status":"failed","description":"unathorized"});
		    }
		}
	}
});

var validateRequest = function(data)
{
	if(typeof data.value == 'undefined'
		|| typeof data.addy == 'undefined'
		|| typeof data.userId == 'undefined'
		|| typeof data.email == 'undefined')
	{
		return false;
	}
	else
	{
		return true;
	}
}

var getToken = function(data)
{
	console.log(data);
	var token = crypter.encrypt(data.value+data.addy+data.userId+data.email, data.addy.substr(0,32));
	return token;
}

var doTestCrypt = function()
{
	var textToEncrypt = 'My super secret information.';
	var secret = "My32charPasswordAndInitVectorStr"; //must be 32 char length

	var encryptedMessage = crypter.encrypt(textToEncrypt, secret);
	var decryptedMessage = crypter.decrypt(encryptedMessage, secret);

	console.log(encryptedMessage);
	console.log(decryptedMessage);
}

Date.prototype.toMysqlFormat = function()
{
    return this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getUTCHours()) + ":" + twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());
};

var twoDigits = function(d)
{
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d.toString();
}

var CronJob = require('cron').CronJob;
var dispatcher = require('./modules/dispatcher.js');
var cron = '* 0/5 * * * * *';

new CronJob(
	cron,
	function()
	{
		console.log('Job triggered! every five minutes!');
		dispatcher.dispatch();
	},
	function()
	{
		console.log("The dispatcher job has stopped!!!!! Someone should investigate why!");
	}, 
	true, //start this job right away!
	'Africa/Lagos'	//that's the timezone baybee!
);

app.listen(process.env.PORT, () => console.log('EKOINX BTC SERVER RUNNING. LISTENING ON PORT: ' + process.env.PORT));

