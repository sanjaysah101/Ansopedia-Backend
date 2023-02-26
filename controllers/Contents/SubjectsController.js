const { SubjectModel } = require("../../models/Content/Subject");

class SubjectsController {
    static addSubject = async (req, res) => {
        const { subject_name, description, color, image } = req.body;
        let statusCode, message, subjectId;
        if (subject_name) {
            const subjectExists = await SubjectModel.findOne({ "subject_name": subject_name.toLowerCase() });
            if (subjectExists) {
                statusCode = 403;
                message = `${subject_name} already exists`;
            } else {
                try {
                    const newContent = new SubjectModel({ "subject_name": subject_name.toLowerCase(), description, color, image });
                    await newContent.save();
                    statusCode = 200;
                    message = `${subject_name} created success`;
                    subjectId = await SubjectModel.findOne({ "subject_name": req.body.subject_name.toLowerCase() });
                } catch (err) {
                    statusCode = 500;
                    message = `Unable to Create`;
                    console.log(err);
                }
            }
        } else {
            statusCode = 400;
            message = `subject_name is required`;
        }
        return { statusCode, message, subjectId }
    }
}
module.exports = { SubjectsController };