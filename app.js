
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const compression = require('compression');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const utils = require('./modules/utils.js');
const processor = require('./modules/processor.js');
const dispatcher = require('./modules/dispatcher.js');

const app = express();

app.use(helmet());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//default homepage
/**
 * @swagger
 * /:
 *   get:
 *     summary: Default homepage
 *     responses:
 *       200:
 *         description: Hello Friend!
 */
app.get('/', function(req, res) { res.send("Hello Friend!"); } );

//default homepage
/**
 * @swagger
 * /test:
 *   get:
 *     summary: Test endpoint
 *     responses:
 *       200:
 *         description: Test response with data from dispatcher
 */
app.get('/test', async function(req, res) 
{
	console.log("testing!!!!!!!1");
	const response = await dispatcher.test();
	res.json({code: 0, status:'completed!', data: response});
});

//get app status
/**
 * @swagger
 * /status:
 *   get:
 *     summary: Get app status
 *     responses:
 *       200:
 *         description: App status active
 */
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
/**
 * @swagger
 * /token/{value}/{addy}/{userId}/{email}:
 *   get:
 *     summary: Generate token
 *     parameters:
 *       - in: path
 *         name: value
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: addy
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Token generated successfully
 *       400:
 *         description: Bad request
 */
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
/**
 * @swagger
 * /addy/active:
 *   get:
 *     summary: Get active addresses
 *     responses:
 *       200:
 *         description: List of active addresses
 */
app.get('/addy/active', async function(req, res)
{
        try {
                const active = await processor.getActiveAddys();
                res.json({'addys': active});
        } catch (e) {
                res.json({'status' : 'error!'});
        }

});

//post transaction endpoint
/**
 * @swagger
 * /transaction:
 *   post:
 *     summary: Submit transaction
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: EKOINX token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: number
 *               addy:
 *                 type: string
 *               userId:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transaction received
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
app.post('/transaction', async function(request, response)
{
	const data = request.body;
	if(!utils.validateRequest(data))
	{
		response.status(400).json(utils.returnFailedResponse('Bad Request', null));
		return;
	}
	let ip = request.ip;
	if(typeof ip == 'undefined') {
		ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
	}
	data.ip = ip;
	if(!data.ip) {
		response.status(500).json(utils.returnFailedResponse('Could not retrieve client address!', null));
		return;
	}
	let token = request.get('Authorization');
	if(typeof token == 'undefined' || token.indexOf("EKOINX") == -1)
	{
		response.status(400).json(utils.returnFailedResponse('bad request', null));
		return;
	}
	try {
		await processor.saveRequest(token, data);
		response.json(utils.returnSuccessfulResponse('Transaction received!', null));
	} catch (e) {
		response.status(401).json(utils.returnFailedResponse('Unauthorized', null));
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

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ekoinx Bitcoin Server API',
      version: '1.0.0',
      description: 'API for managing Bitcoin transactions and addresses',
    },
  },
  apis: ['./app.js'],
};

const specs = swaggerJsdoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.listen(process.env.PORT, () => console.log('EKOINX BTC SERVER RUNNING. LISTENING ON PORT: ' + process.env.PORT));

