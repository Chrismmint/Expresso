//express and middleware
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
//const errorhandler = require('errorhandler');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
// create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'})
//api apiRouter
const apiRouter = require('./api/apiRouter')

//database
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

//port
const PORT = process.env.PORT || 4001;

//middleware usage
app.use(morgan('combined', {stream: accessLogStream}));
app.use(bodyParser.json());
app.use(cors());
//app.use(errorhandler())
app.use(express.static('public'));

//initial routing
app.use('/api', apiRouter);





//start server
app.listen(PORT, () => {
  console.log('Listening on port: ' + PORT);
});



module.exports = app;
