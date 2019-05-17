const mongoose = require('mongoose');
const shortid = require('shortid');
const Schema = mongoose.Schema;

const exerciseSchema = new Schema({
  userId: { type: String, default: shortid.generate },
  username: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, required: true }
});

module.exports = mongoose.model('exercise', exerciseSchema);
