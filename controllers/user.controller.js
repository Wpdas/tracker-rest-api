const UserModel = require('../models/user.model');

const newUser = (req, res) => {
  const { username } = req.body;

  if (username === '') {
    res.status(400).json({ error: 'Username cannot be blank' });
  } else if (username.length > 10) {
    res
      .status(400)
      .json({ error: 'Username cannot be greater than 10 characters' });
  } else {
    const newUser = new UserModel({ username });

    newUser.save((err, data) => {
      if (err) {
        if (err.name === 'MongoError' && err.code === 11000) {
          res
            .status(409)
            .json({ error: 'Duplicate username, try a different username' });
        } else {
          res
            .status(500)
            .json({ error: 'There was an error while saving user' });
        }
      } else {
        const dataResponse = {
          username: data.username,
          _id: data._id
        };
        res.json(dataResponse);
      }
    });
  }
};

const getUsers = (req, res) => {
  UserModel.find({}, { _id: 1, username: 1 }, (error, users) => {
    if (error) {
      return res
        .status(500)
        .json({ error: 'There was an error while getting users' });
    }

    res.json(users);
  });
};

module.exports = {
  newUser,
  getUsers
};
