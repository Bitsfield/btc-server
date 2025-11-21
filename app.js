
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const compression = require('compression');

const utils = require('./modules/utils.js');
const processor = require('./modules/processor.js');
const dispatcher = require('./modules/dispatcher.js');

const app = express();

app.use(helmet());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//default homepage
app.get('/', function(req, res) { res.send("Hello Friend!"); } );

//default homepage
app.get('/test', async function(req, res) 
{
	console.log("testing!!!!!!!1");
	try {
		const response = await dispatcher.test();
		res.json({code: 0, status:'completed!', data: response});
	} catch (error) {
		console.error('Test endpoint error:', error);
		res.status(500).json({code: 1, status: 'error', description: error.message, data: null});
	}
	// res.send("testing.....!!!!!!!");
});

//get app status
app.get('/status', function(req, res)
{
	utils.doTestCrypt();
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
	const params = request.params;
	console.log("Request Params : " + params);
	if(!utils.validateRequest(params))
	{
		response.status(400).json(utils.returnFailedResponse('bad request', null));
	}
	else
	{
		response.json(utils.returnSuccessfulResponse('token generated successfully!', {"token": utils.getToken(params)}));
	}
});

//get active address
app.get('/addy/active', async function(req, res)
{
	try {
		const active = await processor.getActiveAddys();
		res.json({'addys': active});
	} catch (error) {
		console.error('Get active addys error:', error);
		res.json({'status' : 'error!'});
	}
});

//post transaction endpoint
app.post('/transaction', async function(request, response)
{
	const data = request.body;
	if(!utils.validateRequest(data))
	{
		response.status(400).json(utils.returnFailedResponse('Bad Request', null));
	}
	else
	{
		if(typeof request.ip != 'undefined') data.ip = request.ip;
		else
		{
			data.ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
		}
		if(data.ip == null || typeof data.ip == 'undefined')
			response.status(500).json(utils.returnFailedResponse('Could not retrieve client address!', null));

		else
		{
			let token = request.get('Authorization');

			if(typeof token == 'undefined' || token.indexOf("EKOINX") == -1)
			{
				response.status(400).json(utils.returnFailedResponse('bad request', null));
			}
			else
			{
				try {
					await processor.saveRequest(token, data);
					response.json(utils.returnSuccessfulResponse('Transaction received!', null));
				} catch (error) {
					console.error('Save request error:', error);
					if (error.message === 'Unauthorized - token mismatch') {
						response.status(401).json(utils.returnFailedResponse('Unauthorized', null));
					} else {
						response.status(500).json(utils.returnFailedResponse('Internal server error: ' + error.message, null));
					}
				}
			}
		}
	}
});

Date.prototype.toMysqlFormat = function()
{
    return this.getUTCFullYear() 
    + "-" + utils.twoDigits(1 + this.getUTCMonth()) 
    + "-" + utils.twoDigits(this.getUTCDate()) + " " 
    + utils.twoDigits(this.getUTCHours()) + ":" 
    + utils.twoDigits(this.getUTCMinutes()) + ":" 
    + utils.twoDigits(this.getUTCSeconds());
};

// const CronJob = require('cron').CronJob;
// const dispatcher = require('./modules/dispatcher.js');
// const cron = '0/1 * * * * * *';

// new CronJob(
// 	cron,
// 	function()
// 	{
// 		console.log('Job triggered! every five minutes!', new Date());
// 		dispatcher.dispatch({console.log("Dispatch Completed Successfully!!!!!!!!!!")});
// 	},
// 	function()
// 	{
// 		console.log("The dispatcher job has stopped!!!!! Someone should investigate why!");
// 	}, 
// 	true, //start this job right away!
// 	'Africa/Lagos'	//that's the timezone baybee!
// );

app.listen(process.env.PORT, () => console.log('EKOINX BTC SERVER RUNNING. LISTENING ON PORT: ' + process.env.PORT));

