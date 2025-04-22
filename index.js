const express = require('express');
app = express();
require('dotenv').config()

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(express.urlencoded({
    extended: true
}))

const path = require('path');
const public = path.join(__dirname, 'public');
app.use(express.static(public));

app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));

const mustache = require('mustache-express');
app.engine('mustache', mustache());
app.set('view engine', 'mustache');

const router = require('./routes/danceClassRoutes');
app.use('/', router);

app.listen(3000, ()=> {
    console.log('Server started. Ctrl^c to quit.');
})