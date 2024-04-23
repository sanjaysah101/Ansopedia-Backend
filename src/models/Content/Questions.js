const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    question_title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    options: [{ type: Object, required: true }],
  },
  { timestamps: true }
);

//Model
const QuestionsModel = mongoose.model('questions', questionSchema);

module.exports = { QuestionsModel };
