const {ChapterModel} = require("../../models/Content/Chapters");


class ChaptersController {
    static addChapter = async (req, res) => {
        const { chapter_name, description, questions} = req.body;
        let statusCode, message, chapterId;
        // console.log(branch_name);
        if (chapter_name) {
            const chapterExists = await ChapterModel.findOne({ "chapter_name": chapter_name.toLowerCase() });
            if (chapterExists) {
                // console.log(branch);
                statusCode = 403;
                message = `${chapter_name} already exists`;
                // res.status(403).json([{ "status": "failed", "message": `${branch_name} already exists` }]); //conflict
            } else {
                try {
                    const newChapter = new ChapterModel({ "chapter_name": chapter_name.toLowerCase(), description, questions});
                    await newChapter.save();
                    statusCode = 200;
                    message = `${chapter_name} created success`;
                    chapterId = await ChapterModel.findOne({ "chapter_name": chapter_name.toLowerCase() });
                } catch (err) {
                    statusCode = 500;
                    message = `Unable to Create`;
                    console.log(err);
                }
            }
        } else {
            statusCode = 400;
            message = `chapter_name is required`;
        }
        return {statusCode, message, chapterId}
    }
}
function isObjEmpty(obj) {
    return Object.keys(obj).length === 0;
}
module.exports = {ChaptersController};