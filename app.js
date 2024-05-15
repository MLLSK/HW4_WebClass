var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db/sqlite.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQlite database.');
});

app.get('/api/quotes', (req, res) => {
    db.all('SELECT * FROM transactions', (err, rows) => {
        if (err) {
            console.error(err.message);
        }
        res.json(rows);
    });
});

app.get('/api/search', (req, res) => {
    let { date, price } = req.query;
    let sql = 'SELECT * FROM transactions WHERE 1=1';
    let params = [];

    if (date) {
        sql += ' AND strftime("%Y-%m", transaction_date) = ?';
        params.push(date);
    }
    if (price) {
        sql += ' AND average_price = ?';
        params.push(price);
    }

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.send(rows);
    });
});



module.exports = app;
