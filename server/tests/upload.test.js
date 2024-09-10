const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const sequelize = require('../config/database');
const path = require('path');
const fs = require('fs');

let authToken;
const testFilePath = path.join(__dirname, 'testfile.txt');

beforeAll(async () => {
  await sequelize.sync({ force: true });
  // Create a test file
  fs.writeFileSync(testFilePath, 'This is a test file');
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
  authToken = response.body.token;
});

describe('File Upload API', () => {
  it('should upload a file', async () => {
    const res = await request(app)
      .post('/api/v1/uploads')
      .set('x-auth-token', authToken)
      .attach('file', testFilePath);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'File uploaded successfully');
    expect(res.body).toHaveProperty('filename');
  });

  it('should not upload a file without authentication', async () => {
    const res = await request(app)
      .post('/api/v1/uploads')
      .attach('file', testFilePath);
    
    expect(res.statusCode).toEqual(401);
  });

  it('should not upload a file larger than 5MB', async () => {
    const largePath = path.join(__dirname, 'largefile.txt');
    const largeContent = Buffer.alloc(6 * 1024 * 1024); // 6MB file
    fs.writeFileSync(largePath, largeContent);

    const res = await request(app)
      .post('/api/v1/uploads')
      .set('x-auth-token', authToken)
      .attach('file', largePath);
    
    expect(res.statusCode).toEqual(500);
    fs.unlinkSync(largePath);
  });

  it('should download an uploaded file', async () => {
    const uploadRes = await request(app)
      .post('/api/v1/uploads')
      .set('x-auth-token', authToken)
      .attach('file', testFilePath);

    const filename = uploadRes.body.filename;

    const downloadRes = await request(app)
      .get(`/api/v1/uploads/${filename}`)
      .set('x-auth-token', authToken);

    expect(downloadRes.statusCode).toEqual(200);
    expect(downloadRes.header['content-type']).toBe('application/octet-stream');
    expect(downloadRes.header['content-disposition']).toContain('attachment');
  });
});

afterAll(async () => {
  // Clean up test file
  fs.unlinkSync(testFilePath);
  // Clean up uploaded files
  const uploadsDir = path.join(__dirname, '../uploads');
  fs.readdirSync(uploadsDir).forEach(file => fs.unlinkSync(path.join(uploadsDir, file)));
  await sequelize.close();
});