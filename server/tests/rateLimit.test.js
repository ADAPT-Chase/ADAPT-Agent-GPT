const request = require('supertest');
const { app } = require('../server');
const { User } = require('../config/database').models;
const sequelize = require('../config/database');

let userToken;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  // Create a test user
  const user = await User.create({
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'password123',
    isVerified: true
  });
  const response = await request(app)
    .post('/api/v1/users/login')
    .send({
      email: 'testuser@example.com',
      password: 'password123'
    });
  userToken = response.body.token;
});

describe('Rate Limiting', () => {
  it('should allow requests within the rate limit', async () => {
    for (let i = 0; i < 100; i++) {
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('x-auth-token', userToken);
      expect(res.statusCode).toBe(200);
    }
  });

  it('should block requests exceeding the rate limit', async () => {
    for (let i = 0; i < 101; i++) {
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('x-auth-token', userToken);
      if (i === 100) {
        expect(res.statusCode).toBe(429);
        expect(res.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
      }
    }
  });
});

afterAll(async () => {
  await sequelize.close();
});