jest.mock('../modules/dispatcher.js', () =>
{
	return {
		test: jest.fn(),
		dispatch: jest.fn()
	};
});

jest.mock('../modules/processor.js', () =>
{
	return {
		getActiveAddys: jest.fn(),
		saveRequest: jest.fn()
	};
});

const request = require('supertest');
const app = require('../app');
const dispatcher = require('../modules/dispatcher.js');
const processor = require('../modules/processor.js');

describe('application routes', () =>
{
	beforeEach(() =>
	{
		jest.clearAllMocks();
	});

	test('GET / responds with welcome text', async () =>
	{
		const response = await request(app).get('/');
		expect(response.status).toBe(200);
		expect(response.text).toBe('Hello Friend!');
	});

	test('GET /test returns dispatcher payload', async () =>
	{
		dispatcher.test.mockResolvedValue('done');
		const response = await request(app).get('/test');
		expect(response.status).toBe(200);
		expect(response.body.data).toBe('done');
	});

	test('GET /token generates a token when params are valid', async () =>
	{
		const response = await request(app).get('/token/1/12345678901234567890123456789012/user/email@example.com');
		expect(response.status).toBe(200);
		expect(response.body.data.token).toBeDefined();
	});

	test('GET /addy/active returns active addresses', async () =>
	{
		const active = [{ addy: 'addr-1' }];
		processor.getActiveAddys.mockResolvedValue(active);
		const response = await request(app).get('/addy/active');
		expect(response.status).toBe(200);
		expect(response.body).toEqual({ addys: active });
	});

	test('POST /transaction validates request body', async () =>
	{
		const response = await request(app)
			.post('/transaction')
			.send({ invalid: true });
		expect(response.status).toBe(400);
	});

	test('POST /transaction validates authorization header', async () =>
	{
		const payload = {
			value: 10,
			addy: '12345678901234567890123456789012',
			userId: 'user',
			email: 'user@example.com'
		};

		const response = await request(app)
			.post('/transaction')
			.send(payload);

		expect(response.status).toBe(400);
	});

	test('POST /transaction returns 401 on unauthorized save', async () =>
	{
		const payload = {
			value: 10,
			addy: '12345678901234567890123456789012',
			userId: 'user',
			email: 'user@example.com'
		};

		processor.saveRequest.mockRejectedValue(new Error('Unauthorized'));

		const response = await request(app)
			.post('/transaction')
			.set('Authorization', 'EKOINX token')
			.send(payload);

		expect(response.status).toBe(401);
	});

	test('POST /transaction returns success when request is valid', async () =>
	{
		const payload = {
			value: 10,
			addy: '12345678901234567890123456789012',
			userId: 'user',
			email: 'user@example.com'
		};

		processor.saveRequest.mockResolvedValue({});

		const response = await request(app)
			.post('/transaction')
			.set('Authorization', 'EKOINX token')
			.send(payload);

		expect(response.status).toBe(200);
		expect(response.body.status).toBe('success');
	});
});

