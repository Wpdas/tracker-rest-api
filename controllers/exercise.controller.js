const UserModel = require('../models/user.model');
const ExerciseModel = require('../models/exercise.model');

const newExercise = (req, res) => {
  const { userId, description } = req.body;
  let { duration, date } = req.body;

  if (!(userId || description || duration)) {
    res.status(400).json({ error: 'Required Field(s) are missing.' });
  } else if (userId === '' || description === '' || duration === '') {
    res.status(400).json({ error: 'Required Field(s) are blank.' });
  } else if (userId.length > 9) {
    res
      .status(403)
      .json({ error: 'UserID cannot be greater than 9 characters' });
  } else if (description.length > 100) {
    res
      .status(403)
      .json({ error: 'Description cannot be greater than 100 characters' });
  } else if (isNaN(duration)) {
    res.status(400).json({ error: 'Duration must be a number' });
  } else if (Number(duration) > 1440) {
    res
      .status(400)
      .json({ error: 'Duration must be less than 1440 minutes (24 hours)' });
  } else if (date !== '' && isNaN(Date.parse(date)) === true) {
    res.status(400).json({ error: 'Date is not a valid date' });
  } else {
    // Get User details
    UserModel.findOne({ _id: userId }, (err, user) => {
      if (err) {
        res
          .status(500)
          .json({ error: 'Error while searching for username, try again' });
      } else if (!user) {
        res.status(404).json({ error: 'Username not found' });
      } else {
        const { username } = user;
        duration = Number(duration);

        if (date === '') {
          date = new Date();
        } else {
          date = Date.parse(date);
        }

        const newExercise = new ExerciseModel({
          userId,
          username,
          description,
          duration,
          date
        });

        newExercise.save((error, data) => {
          if (error) {
            res.status(500).json({
              error: `There was an error while saving exercise: ${error}`
            });
          } else {
            res.json(data);
          }
        });
      }
    });
  }
};

const readExercise = (req, res) => {
  const { userId, from, to, limit } = req.query;
  const query = {};
  if (userId) query.userId = userId;

  if (!userId) {
    res.status(400).json({ error: 'You must inform userId.' });
  } else if (userId === '') {
    res.status(400).json({ error: 'You must inform userId.' });
  } else if (userId.length > 10) {
    res
      .status(403)
      .json({ error: 'User id cannot be greater than 10 characters' });
  } else if (from !== undefined && isNaN(Date.parse(from)) === true) {
    res.status(400).json({ error: 'From is not a valid date' });
  } else if (to !== undefined && isNaN(Date.parse(to)) === true) {
    res.status(400).json({ error: 'To is not a valid date' });
  } else if (limit !== undefined && isNaN(limit) === true) {
    res.status(400).json({ error: 'Limit is not a valid number' });
  } else if (limit !== undefined && Number(limit) < 1) {
    res.status(400).json({ error: 'Limit must be greater than 0' });
  } else {
    // Get user details
    UserModel.findOne({ _id: userId }, (err, user) => {
      if (err) {
        res.send('Error while searching for username, try again');
      } else if (!user) {
        res.send('Username not found');
      } else {
        if (from !== undefined) {
          from = new Date(from);
          query.date = { $gte: from };
        }

        if (to !== undefined) {
          to = new Date(to);
          to.setDate(to.getDate() + 1);
          query.date = { $lt: to };
        }

        if (limit !== undefined) {
          limit = Number(limit);
        }

        ExerciseModel.find(query)
          .select('userId description date duration ')
          .limit(limit)
          .exec((err, exercises) => {
            if (err) {
              res.status(500).json({
                error: 'Error while searching for exercises, try again'
              });
            } else if (!user) {
              res.status(404).json({ error: 'Username not found' });
            } else {
              const responseData = {
                ...user,
                log: exercises
              };
              res.json(responseData);
            }
          });
      }
    });
  }
};

module.exports = {
  newExercise,
  readExercise
};
