const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

const port = 3000;


module.exports = app;
const SECRET_KEY = '**************';

app.use(cors({
  origin: 'http://localhost:4200',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
}));
app.use(bodyParser.json());

let revokedTokens = [];

let db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite.');
  }
});

let events = [];

function initializeEvents() {
  db.all('SELECT * FROM events', [], (err, rows) => {
    if (err) {
      console.error('Error al obtener los eventos:', err.message);
      return;
    }
    events = rows;
    console.log('Eventos cargados:', events);
  });
}

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)");
  db.run("CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY, title TEXT, date TEXT, description TEXT, location TEXT, userId INTEGER)");
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);

  db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], function(err) {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.status(201).send({ id: this.lastID });
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).send('Invalid credentials');
    }

    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '1h' });
    res.status(200).send({ token });
  });
});

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(403).send('No token provided');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(403).send('No token provided');
  }

  if (revokedTokens.includes(token)) {
    return res.status(401).send({ auth: false, message: 'Token has been revoked.' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        const newToken = jwt.sign({ id: decoded.id }, SECRET_KEY, { expiresIn: '15m' });
        res.setHeader('Authorization', `Bearer ${newToken}`);
      } else {
        console.error('Error al verificar token:', err.message);
        return res.status(500).send('Failed to authenticate token');
      }
    } else {
      req.userId = decoded.id;
      next();
    }
  });
}

app.post('/events', verifyToken, (req, res) => {
  const { title, date, description, location } = req.body;
  const dateTime = new Date(date).toISOString(); 

  db.get(`SELECT * FROM events WHERE date = ? AND location = ? AND userId = ?`, [dateTime, location, req.userId], (err, row) => {
    if (err) {
      console.error('Error checking availability:', err.message);
      return res.status(500).send('Error checking availability');
    }
    if (row) {
      return res.status(400).send('La ubicación ya está siendo utilizada en la fecha seleccionada');
    }

    db.run(`INSERT INTO events (title, date, description, location, userId) VALUES (?, ?, ?, ?, ?)`, [title, dateTime, description, location, req.userId], function(err) {
      if (err) {
        console.error('Error al crear evento:', err.message);
        return res.status(500).send('Error al crear evento');
      }
      res.status(201).send({ id: this.lastID });
    });
  });
});

app.get('/events', verifyToken, (req, res) => {
  db.all("SELECT * FROM events WHERE userId = ?", [req.userId], (err, rows) => {
    if (err) {
      console.error('Error al obtener eventos:', err.message);
      return res.status(500).send('Error al obtener eventos');
    }
    rows.forEach(row => {
      row.date = new Date(row.date).toISOString();
    });
    res.status(200).json(rows);
  });
});

app.get('/events/:id', verifyToken, (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM events WHERE id = ? AND userId = ?", [id, req.userId], (err, row) => {
    if (err) {
      console.error('Error al obtener evento:', err.message);
      return res.status(500).send('Error al obtener evento');
    }
    if (row) {
      row.date = new Date(row.date).toISOString();
    }
    res.status(200).json(row);
  });
});

app.put('/events/:id', verifyToken, (req, res) => {
  const id = req.params.id;
  const { title, date, description, location } = req.body;
  const dateTime = new Date(date).toISOString(); 

  db.run(`UPDATE events SET title = ?, date = ?, description = ?, location = ? WHERE id = ? AND userId = ?`, [title, dateTime, description, location, id, req.userId], function(err) {
    if (err) {
      console.error('Error al actualizar evento:', err.message);
      return res.status(500).send('Error al actualizar evento');
    }
    res.status(200).send({ changes: this.changes });
  });
});

app.delete('/events/:id', verifyToken, (req, res) => {
  const id = req.params.id;
  db.run(`DELETE FROM events WHERE id = ? AND userId = ?`, [id, req.userId], function(err) {
    if (err) {
      console.error('Error al eliminar evento:', err.message);
      return res.status(500).send('Error al eliminar evento');
    }
    res.status(200).send({ changes: this.changes });
  });
});


app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const db = new sqlite3.Database('./database.db');

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) return res.status(500).send('Error on the server.');
    if (!user) return res.status(404).send('No user found.');

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });

    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '1h' });
    res.status(200).send({ auth: true, token: token });
  });

  db.close();
});

app.post('/logout', verifyToken, (req, res) => {
  const token = req.headers['authorization'];
  revokedTokens.push(token);
  res.status(200).send({ message: 'Logout successful' });
});

app.post('/renew-token', verifyToken, (req, res) => {
  const newToken = jwt.sign({ id: req.userId }, SECRET_KEY, { expiresIn: '15m' });
  res.status(200).send({ token: newToken });
});

app.post('/check-availability', verifyToken, (req, res) => {
  const { date, location } = req.body;

  const eventDate = new Date(date);
  
  const formattedDate = eventDate.toISOString().split('T')[0];  

  console.log('Date received:', date); 
  console.log('Formatted date:', formattedDate); 
  db.get(
    `SELECT * FROM events WHERE location = ? AND DATE(date) = ? AND userId = ?`,
    [location, formattedDate, req.userId],
    (err, row) => {
      if (err) {
        console.error('Error checking availability:', err);
        return res.status(500).json({ error: 'Error checking availability' });
      }
      if (row) {
        console.log('Event already exists:', row);  
        return res.status(200).json({ available: false });
      } else {
        console.log('No event found, location is available');
        return res.status(200).json({ available: true });
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
