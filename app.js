
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const compression = require('compression');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const utils = require('./modules/utils.js');

const app = express();

app.use(helmet());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ekoinx BTC Server API',
      version: '1.0.0',
      description: 'API for handling Bitcoin transactions and addresses',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'EKOINX {token}'
        }
      }
    }
  },
  apis: ['./app.js'],
};

const specs = swaggerJsdoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

/**
 * @swagger
 * /:
 *   get:
 *     summary: Default homepage
 *     responses:
 *       200:
 *         description: Returns hello message
 */
app.get('/', async (req, res) => { res.send("Hello Friend!"); } );

/**
 * @swagger
 * /test:
 *   get:
 *     summary: Test dispatcher
 *     responses:
 *       200:
 *         description: Test completed with data
 *       500:
 *         description: Internal server error
 */
app.get('/test', async (req, res) => {
	try {
		console.log("testing!!!!!!!1");
		const dispatcher = require('./modules/dispatcher.js');
		const response = await dispatcher.test();
		res.json({code: 0, status:'completed!', data: response});
	} catch (err) {
		res.status(500).json({code: 2, status: 'failed', description: err.message});
	}
});

//get app status
/**
 * @swagger
 * /status:
 *   get:
 *     summary: Get application status
 *     responses:
 *       200:
 *         description: Returns active status and performs crypt test
 */
app.get('/status', async (req, res) => {
	utils.doTestCrypt();
	console.log("I'm Up!!!");
	res.json({
		'Status':"Active"
	});
});

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
app.get('/token/:value/:addy/:userId/:email', async (request, response) => {
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

/**
 * @swagger
 * /addy/active:
 *   get:
 *     summary: Get active addresses
 *     responses:
 *       200:
 *         description: List of active addys
 */
app.get('/addy/active', async (req, res) => {
	try {
		const processor = require('./modules/processor.js');
		const active = await processor.getActiveAddys();
		res.json({'addys': active});
	} catch (err) {
		res.json({'status' : 'error!'});
	}
});

/**
 * @swagger
 * /transaction:
 *   post:
 *     summary: Submit transaction request
 *     security:
 *       - bearerAuth: []
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
app.post('/transaction', async (request, response) => {
	const data = request.body;
	if(!utils.validateRequest(data)) {
		response.status(400).json(utils.returnFailedResponse('Bad Request', null));
		return;
	}
	if(typeof request.ip != 'undefined') data.ip = request.ip;
	else {
		data.ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
	}
	if(data.ip == null || typeof data.ip == 'undefined') {
		response.status(500).json(utils.returnFailedResponse('Could not retrieve client address!', null));
		return;
	}
	let token = request.get('Authorization');
	if(typeof token == 'undefined' || token.indexOf("EKOINX") == -1) {
		response.status(400).json(utils.returnFailedResponse('bad request', null));
		return;
	}
	try {
		const processor = require('./modules/processor.js');
		await processor.saveRequest(token, data);
		response.json(utils.returnSuccessfulResponse('Transaction received!', null));
	} catch (err) {
		if(err.message === 'Unauthorized') {
			response.status(401).json(utils.returnFailedResponse('Unauthorized', null));
		} else {
			response.status(500).json(utils.returnFailedResponse(err.message, null));
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

app.listen(process.env.PORT || 3000, () => console.log('EKOINX BTC SERVER RUNNING. LISTENING ON PORT: ' + (process.env.PORT || 3000)));

