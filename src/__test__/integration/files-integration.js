import request from 'supertest';
import app from '../../app';

// Some tests...
describe('GET /files', () => {
  beforeAll((done) => {
    done();
  });

  afterAll((done) => {
    done();
  });

  test('it should return bad request on invalid publicKey', async () => {
    const response = await request(app).get('/files/abc');
    expect(response.body).toEqual({ code: 'BadRequest', message: 'file does not exist' });
  });
});
