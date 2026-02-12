import request from 'supertest';
import app from '../src/app';

describe('Users API', () => {
  it('GET /health should return ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('GET /api/users should return list', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/users should create a user', async () => {
    const res = await request(app).post('/api/users').send({ name: 'Test', email: 'test@example.com' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Test');
  });
});
