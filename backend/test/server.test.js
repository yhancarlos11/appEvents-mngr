const request = require('supertest');
const http = require('http');
const app = require('../server'); // Asegúrate de que la ruta a tu aplicación sea correcta

let server;
let token;
let eventId;

beforeAll((done) => {
  // Crear el servidor solo para las pruebas
  server = http.createServer(app);

  // Usamos .listen() para escuchar en un puerto para las pruebas
  server.listen(3001, async () => {
    // Registrar un usuario para obtener un token
    await request(app)
      .post('/register')
      .send({ username: 'testuser', password: 'testpassword' });
    
    // Iniciar sesión para obtener un token
    const res = await request(app)
      .post('/login')
      .send({ username: 'testuser', password: 'testpassword' });
    
    token = res.body.token;
    
    // Crear un evento para obtener su ID
    const eventRes = await request(app)
      .post('/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'New Event',
        date: new Date().toISOString(),
        description: 'This is a new event',
        location: 'New Location',
      });
    
    eventId = eventRes.body.id;
    done();
  });
});

afterAll((done) => {
  // Cerrar el servidor después de todas las pruebas
  server.close(() => done());
});

describe('CRUD API Endpoints', () => {
  it('should create a new event', async () => {
    const res = await request(app)
      .post('/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'New Event',
        date: new Date().toISOString(),
        description: 'This is a new event',
        location: 'New Location',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
  });

  it('should get all events', async () => {
    const res = await request(app)
      .get('/events')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('should get an event by id', async () => {
    const res = await request(app)
      .get(`/events/${eventId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id');
  });

  it('should update an event', async () => {
    const res = await request(app)
      .put(`/events/${eventId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated Event',
        date: new Date().toISOString(),
        description: 'This is an updated event',
        location: 'Updated Location',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('changes');
  });

  it('should delete an event', async () => {
    const res = await request(app)
      .delete(`/events/${eventId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('changes');
  });
});