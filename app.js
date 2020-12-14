const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

let credentials = JSON.parse(fs.readFileSync('credentials.json', 'utf8'));
let connection = mysql.createConnection(credentials);
connection.connect();

function rowToObject(row) {
    return {
            year: row.year,
            month: row.month,
            day: row.day,
            start_time: row.start_time,
            end_time: row.end_time,
            message: row.message,
            id: row.id,
        };
    }

app.get('/memories/:month/:day', (request, response) => {
        const query = 'SELECT year, month, day, start_time, end_time, message, id FROM memory WHERE is_deleted = 0 AND month = ? AND day = ? ORDER BY year DESC, updated_at DESC';
        const params = [request.params.month, request.params.day];
        connection.query(query, params, (error, rows) => {
                response.send({
                        ok: true,
                        memories: rows.map(rowToObject),
                });
        });
});
    
app.post('/memories', (request, response) => {
        const query = 'INSERT INTO memory(year, month, day, start_time, end_time, message) VALUES (?, ?, ?, ?, ?, ?)';
        const params = [request.body.year, request.body.month, request.body.day, request.body.start_time, request.body.end_time, request.body.message];
        connection.query(query, params, (error, result) => {
                response.send({
                        ok: true,
                        id: result.insertId,
            });
    });
});

app.patch('/memories/:id', (request, response) => {
        const query = 'UPDATE memory SET year = ?, month = ?, day = ?, start_time = ?, end_time = ?, message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
        const params = [request.body.year, request.body.month, request.body.day, request.body.start_time, request.body.end_time, request.body.message, request.params.id];
        connection.query(query, params, (error, result) => {
                response.send({
                        ok: true,
                });
        });
});

app.delete('/memories/:id', (request, response) => {
    const query = 'UPDATE memory SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    const params = [request.params.id];
    connection.query(query, params, (error, result) => {
            response.send({
                    ok: true,
            });
    });
});

const port = 3443;
app.listen(port, () => {
    console.log(`We're live on port ${port}!`);
});
