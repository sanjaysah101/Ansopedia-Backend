const {QuestionModel} = require("../../models/Content/Questions");

class questionsController {
    static addQuestion = async (req, res) => {
        const { question_title, description, options} = req.body;
        let statusCode, message, questionId;
        if (question_title && options) {
            const questionExists = await QuestionModel.findOne({ "question_title": question_title.toLowerCase() });
            if (questionExists) {
                statusCode = 403;
                message = `${question_title} already exists`;
            } else {
                try {
                    const newQuestion = new QuestionModel({ "question_title": question_title.toLowerCase(), description, options});
                    await newQuestion.save();
                    statusCode = 200;
                    message = `${question_title} created success`;
                    questionId = await QuestionModel.findOne({ "question_title": req.body.question_title.toLowerCase() });
                } catch (err) {
                    statusCode = 500;
                    message = `Unable to Create`;
                    console.log(err);
                }
            }
        } else {
            statusCode = 400;
            message = `question_title && options is required`;
        }
        return {statusCode, message, questionId}
    }
}
module.exports = {questionsController};