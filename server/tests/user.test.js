const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const sequelize = require('../config/database');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

describe('User API', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/v1/users/register')
      .send({
        username: 'testuser',
        password: 'password123'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should login an existing user', async () => {
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({
        username: 'testuser',
        password: 'password123'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should get user profile', async () => {
    const loginRes = await request(app)
      .post('/api/v1/users/login')
      .send({
        username: 'testuser',
        password: 'password123'
      });

    const res = await request(app)
      .get('/api/v1/users/me')
      .set('x-auth-token', loginRes.body.token);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('username', 'testuser');
  });
});

afterAll(async () => {
  await sequelize.close();
});