const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ahorcado_db'
});

// Ruta para obtener puntuaciones
app.get('/puntuaciones', (req, res) => {
    db.query('SELECT * FROM puntuaciones ORDER BY puntaje DESC LIMIT 10', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Ruta para agregar puntuación
app.post('/puntuaciones', (req, res) => {
    const { nombre, puntaje } = req.body;
    db.query('INSERT INTO puntuaciones (nombre, puntaje) VALUES (?, ?)', [nombre, puntaje], (err) => {
        if (err) throw err;
        res.sendStatus(201);
    });
});

// Iniciar servidor
app.listen(5000, () => {
    console.log('Servidor corriendo en el puerto 5000');
});
