const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const userController = require('./controllers/user.controller');
const exerciseController = require('./controllers/exercise.controller');

mongoose.connect(process.env.MLAB_URI);
const db = mongoose.connection;
db.on('error', error => console.log('Mongo DB Connection Error!', error));
db.on('open', () => console.log('Mongo DB Connection Success!'));

app.use(cors({ optionsSuccessStatus: 200 }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Routes
// Home
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// User
app.post('/api/exercise/new-user/', userController.newUser);
app.get('/api/exercise/users', userController.getUsers);

// Exercise
app.post('/api/exercise/add', exerciseController.newExercise);
app.get('/api/exercise/log', exerciseController.readExercise);

// Not found middleware
app.use((req, res, next) => {
  return next({ status: 404, message: 'not found' });
});

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage;

  if (err.errors) {
    // mongoose validation error
    errCode = 400; // bad request
    const keys = Object.keys(err.errors);
    // report the first validation error
    errMessage = err.errors[keys[0]].message;
  } else {
    // generic or custom error
    errCode = err.status || 500;
    errMessage = err.message || 'Internal Server Error';
  }
  res
    .status(errCode)
    .type('txt')
    .send(errMessage);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
