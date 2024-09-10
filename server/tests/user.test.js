const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const sequelize = require('../config/database');
const { sendEmail } = require('../config/emailService');

jest.mock('../config/emailService');

let adminToken, userToken, verificationToken;

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

describe('User API', () => {
  it('should register a new user', async () => {
    sendEmail.mockResolvedValue({ messageId: 'test-message-id' });

    const res = await request(app)
      .post('/api/v1/users/register')
      .send({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toContain('User registered');
    expect(sendEmail).toHaveBeenCalled();

    const user = await User.findOne({ where: { email: 'testuser@example.com' } });
    verificationToken = user.verificationToken;
  });

  it('should verify email', async () => {
    const res = await request(app)
      .get(`/api/v1/users/verify-email?token=${verificationToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toContain('Email verified successfully');

    const user = await User.findOne({ where: { email: 'testuser@example.com' } });
    expect(user.isVerified).toBe(true);
  });

  it('should not login unverified user', async () => {
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: 'testuser@example.com',
        password: 'password123'
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toContain('Please verify your email');
  });

  it('should login verified user', async () => {
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: 'testuser@example.com',
        password: 'password123'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    userToken = res.body.token;
  });

  it('should register an admin user', async () => {
    sendEmail.mockResolvedValue({ messageId: 'test-message-id' });

    const res = await request(app)
      .post('/api/v1/users/register')
      .send({
        username: 'adminuser',
        email: 'adminuser@example.com',
        password: 'adminpass123'
      });
    expect(res.statusCode).toEqual(201);

    // Manually set the user role to admin and verify email
    const adminUser = await User.findOne({ where: { email: 'adminuser@example.com' } });
    adminUser.role = 'admin';
    adminUser.isVerified = true;
    await adminUser.save();

    const loginRes = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: 'adminuser@example.com',
        password: 'adminpass123'
      });
    adminToken = loginRes.body.token;
  });

  it('should not register a user with invalid email', async () => {
    const res = await request(app)
      .post('/api/v1/users/register')
      .send({
        username: 'testuser2',
        email: 'invalidemail',
        password: 'password123'
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('errors');
  });

  it('should get user profile', async () => {
    const res = await request(app)
      .get('/api/v1/users/me')
      .set('x-auth-token', userToken);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('username', 'testuser');
    expect(res.body).toHaveProperty('email', 'testuser@example.com');
    expect(res.body).toHaveProperty('role', 'user');
  });

  it('should allow admin to get all users', async () => {
    const res = await request(app)
      .get('/api/v1/users/all')
      .set('x-auth-token', adminToken);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should not allow regular user to get all users', async () => {
    const res = await request(app)
      .get('/api/v1/users/all')
      .set('x-auth-token', userToken);
    expect(res.statusCode).toEqual(403);
  });

  it('should allow admin to change user role', async () => {
    const user = await User.findOne({ where: { email: 'testuser@example.com' } });
    const res = await request(app)
      .put(`/api/v1/users/role/${user.id}`)
      .set('x-auth-token', adminToken);
    expect(res.statusCode).toEqual(200);
    expect(res.body.user.role).toEqual('admin');
  });

  it('should not allow regular user to change user role', async () => {
    const user = await User.findOne({ where: { email: 'adminuser@example.com' } });
    const res = await request(app)
      .put(`/api/v1/users/role/${user.id}`)
      .set('x-auth-token', userToken);
    expect(res.statusCode).toEqual(403);
  });
});

afterAll(async () => {
  await sequelize.close();
});