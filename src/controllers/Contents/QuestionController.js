const { QuestionsModel } = require('../../models/Content/Questions');

class QuestionController {
  static addQuestion = async (req, res) => {
    const { question_title, description, options } = req.body;
    let statusCode, message, questionId;

    if (question_title && options) {
      const questionExists = await QuestionsModel.findOne({
        question_title: question_title.toLowerCase(),
      });
      if (questionExists) {
        statusCode = 403;
        message = `${question_title} already exists`;
      } else {
        try {
          const newQuestion = new QuestionsModel({
            question_title: question_title.toLowerCase(),
            description,
            options,
          });
          await newQuestion.save();
          statusCode = 200;
          message = `${question_title} created success`;
          questionId = await QuestionsModel.findOne({
            question_title: req.body.question_title.toLowerCase(),
          });
        } catch (err) {
          statusCode = 500;
          message = `Unable to Create`;
        }
      }
    } else {
      statusCode = 400;
      message = `question_title && options is required`;
    }
    return { statusCode, message, questionId };
  };
}
module.exports = { QuestionController };
