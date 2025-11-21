const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const compression = require('compression');

// Mock modules before requiring app
jest.mock('../modules/utils.js');
jest.mock('../modules/processor.js');
jest.mock('../modules/dispatcher.js');

const utils = require('../modules/utils.js');
const processor = require('../modules/processor.js');
const dispatcher = require('../modules/dispatcher.js');

describe('Express App API Endpoints', () => {
  let app;

  beforeAll(() => {
    // Create express app similar to app.js
    app = express();
    app.use(helmet());
    app.use(compression());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // Setup routes
    app.get('/', function(req, res) { res.send("Hello Friend!"); });

    app.get('/test', async function(req, res) {
      try {
        const response = await dispatcher.test();
        res.json({code: 0, status:'completed!', data: response});
      } catch(error) {
        res.status(500).json(utils.returnFailedResponse('Internal server error', null));
      }
    });

    app.get('/status', function(req, res) {
      utils.doTestCrypt();
      res.json({'Status':"Active"});
    });

    app.get('/token/:value/:addy/:userId/:email', function(request, response) {
      const params = request.params;
      if(!utils.validateRequest(params)) {
        response.status(400).json(utils.returnFailedResponse('bad request', null));
      } else {
        response.json(utils.returnSuccessfulResponse('token generated successfully!', {"token": utils.getToken(params)}));
      }
    });

    app.get('/addy/active', async function(req, res) {
      try {
        const active = await processor.getActiveAddys();
        res.json({'addys': active});
      } catch(error) {
        res.status(500).json({'status' : 'error!', 'message': error.message});
      }
    });

    app.post('/transaction', async function(request, response) {
      try {
        const data = request.body;
        if(!utils.validateRequest(data)) {
          response.status(400).json(utils.returnFailedResponse('Bad Request', null));
        } else {
          if(typeof request.ip != 'undefined') data.ip = request.ip;
          else {
            data.ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
          }
          if(data.ip == null || typeof data.ip == 'undefined') {
            response.status(500).json(utils.returnFailedResponse('Could not retrieve client address!', null));
          } else {
            let token = request.get('Authorization');
            if(typeof token == 'undefined' || token.indexOf("EKOINX") == -1) {
              response.status(400).json(utils.returnFailedResponse('bad request', null));
            } else {
              try {
                await processor.saveRequest(token, data);
                response.json(utils.returnSuccessfulResponse('Transaction received!', null));
              } catch(err) {
                response.status(401).json(utils.returnFailedResponse('Unauthorized', null));
              }
            }
          }
        }
      } catch(error) {
        response.status(500).json(utils.returnFailedResponse('Internal server error', null));
      }
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    utils.validateRequest.mockImplementation((data) => {
      return !!(data.value && data.addy && data.userId && data.email);
    });
    
    utils.returnSuccessfulResponse.mockImplementation((desc, data) => ({
      code: 0,
      status: 'success',
      description: desc,
      data: data
    }));
    
    utils.returnFailedResponse.mockImplementation((desc, data) => ({
      code: 2,
      status: 'failed',
      description: desc,
      data: data
    }));

    utils.getToken.mockReturnValue('mocked-token-12345');
    utils.doTestCrypt.mockReturnValue(undefined);
  });

  describe('GET /', () => {
    test('should return Hello Friend!', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Hello Friend!');
    });
  });

  describe('GET /status', () => {
    test('should return status active', async () => {
      const response = await request(app).get('/status');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ Status: 'Active' });
      expect(utils.doTestCrypt).toHaveBeenCalled();
    });
  });

  describe('GET /token/:value/:addy/:userId/:email', () => {
    test('should generate token for valid params', async () => {
      const response = await request(app)
        .get('/token/100/test-address/user123/test@test.com');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.description).toBe('token generated successfully!');
      expect(response.body.data.token).toBe('mocked-token-12345');
    });

    test('should reject request with invalid params', async () => {
      utils.validateRequest.mockReturnValue(false);
      
      const response = await request(app)
        .get('/token/100/test-address/user123/test@test.com');
      
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('failed');
    });
  });

  describe('GET /test', () => {
    test('should return test response', async () => {
      dispatcher.test.mockResolvedValue('test-data');
      
      const response = await request(app).get('/test');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        code: 0,
        status: 'completed!',
        data: 'test-data'
      });
    });

    test('should handle errors', async () => {
      dispatcher.test.mockRejectedValue(new Error('Test error'));
      
      const response = await request(app).get('/test');
      
      expect(response.status).toBe(500);
      expect(response.body.status).toBe('failed');
    });
  });

  describe('GET /addy/active', () => {
    test('should return active addresses', async () => {
      const mockAddresses = [
        { id: 1, addy: 'addr1', active: true },
        { id: 2, addy: 'addr2', active: true }
      ];
      processor.getActiveAddys.mockResolvedValue(mockAddresses);
      
      const response = await request(app).get('/addy/active');
      
      expect(response.status).toBe(200);
      expect(response.body.addys).toEqual(mockAddresses);
    });

    test('should handle errors', async () => {
      processor.getActiveAddys.mockRejectedValue(new Error('Database error'));
      
      const response = await request(app).get('/addy/active');
      
      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error!');
    });
  });

  describe('POST /transaction', () => {
    test('should accept valid transaction', async () => {
      processor.saveRequest.mockResolvedValue(true);
      
      const response = await request(app)
        .post('/transaction')
        .set('Authorization', 'EKOINX test-token')
        .send({
          value: 100,
          addy: 'test-address',
          userId: 'user123',
          email: 'test@test.com'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.description).toBe('Transaction received!');
    });

    test('should reject transaction without Authorization header', async () => {
      const response = await request(app)
        .post('/transaction')
        .send({
          value: 100,
          addy: 'test-address',
          userId: 'user123',
          email: 'test@test.com'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('failed');
    });

    test('should reject transaction with invalid Authorization header', async () => {
      const response = await request(app)
        .post('/transaction')
        .set('Authorization', 'INVALID test-token')
        .send({
          value: 100,
          addy: 'test-address',
          userId: 'user123',
          email: 'test@test.com'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('failed');
    });

    test('should reject transaction with invalid data', async () => {
      utils.validateRequest.mockReturnValue(false);
      
      const response = await request(app)
        .post('/transaction')
        .set('Authorization', 'EKOINX test-token')
        .send({
          value: 100
        });
      
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('failed');
    });

    test('should handle unauthorized requests', async () => {
      processor.saveRequest.mockRejectedValue(new Error('Unauthorized'));
      
      const response = await request(app)
        .post('/transaction')
        .set('Authorization', 'EKOINX test-token')
        .send({
          value: 100,
          addy: 'test-address',
          userId: 'user123',
          email: 'test@test.com'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.status).toBe('failed');
      expect(response.body.description).toBe('Unauthorized');
    });
  });
});

