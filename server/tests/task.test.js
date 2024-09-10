const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Task = require('../models/Task');
const sequelize = require('../config/database');

let authToken;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  // Create a test user and get auth token
  const userRes = await request(app)
    .post('/api/v1/users/register')
    .send({
      username: 'taskuser',
      password: 'password123'
    });
  authToken = userRes.body.token;
});

describe('Task API', () => {
  it('should create a new task', async () => {
    const res = await request(app)
      .post('/api/v1/tasks')
      .set('x-auth-token', authToken)
      .send({
        title: 'Test Task',
        description: 'This is a test task',
        status: 'pending'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('title', 'Test Task');
  });

  it('should not create a task without a title', async () => {
    const res = await request(app)
      .post('/api/v1/tasks')
      .set('x-auth-token', authToken)
      .send({
        description: 'This is a test task',
        status: 'pending'
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('errors');
  });

  it('should get all tasks for the user', async () => {
    const res = await request(app)
      .get('/api/v1/tasks')
      .set('x-auth-token', authToken);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should update a task', async () => {
    const createRes = await request(app)
      .post('/api/v1/tasks')
      .set('x-auth-token', authToken)
      .send({
        title: 'Task to Update',
        status: 'pending'
      });
    
    const updateRes = await request(app)
      .put(`/api/v1/tasks/${createRes.body.id}`)
      .set('x-auth-token', authToken)
      .send({
        title: 'Updated Task',
        status: 'completed'
      });
    
    expect(updateRes.statusCode).toEqual(200);
    expect(updateRes.body).toHaveProperty('title', 'Updated Task');
    expect(updateRes.body).toHaveProperty('status', 'completed');
  });

  it('should delete a task', async () => {
    const createRes = await request(app)
      .post('/api/v1/tasks')
      .set('x-auth-token', authToken)
      .send({
        title: 'Task to Delete',
        status: 'pending'
      });
    
    const deleteRes = await request(app)
      .delete(`/api/v1/tasks/${createRes.body.id}`)
      .set('x-auth-token', authToken);
    
    expect(deleteRes.statusCode).toEqual(200);
    expect(deleteRes.body).toHaveProperty('message', 'Task removed');
  });
});

afterAll(async () => {
  await sequelize.close();
});