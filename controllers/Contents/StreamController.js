const { StreamModel } = require("../../models/Content/Stream");
const { BranchModel } = require("../../models/Content/Branch");
const { SubjectModel } = require("../../models/Content/Subject");
const { ChapterModel } = require("../../models/Content/Chapters");
const { BranchController } = require("./BranchesController");
const { SubjectsController } = require("./SubjectsController");
const { ChaptersController } = require("./ChaptersController");
const { QuestionController } = require("./QuestionController")
const {Logs} = require("../../middlewares/Logs")

class StreamController {
    static addStream = async (req, res) => {
        try {
            const { stream, branch, subject, chapter } = req.params;
            if (stream) {
                //if stream name is mentioned in the parameter
                const found_stream = await StreamModel.findOne({ title: stream.toLowerCase() });
                // console.log(found_stream)
                if (found_stream) {
                    if (branch) {
                        // If branch name is mentioned in the url then add subject
                        const found_branch = await BranchModel.findOne({ branch_name: branch.toLowerCase() });
                        if (found_branch) {
                            if (subject) {
                                // If subject name is mentioned in the url then add chapters
                                // console.log(branch)
                                const found_subject = await SubjectModel.findOne({ subject_name: subject.toLowerCase() });
                                // res.send(found_subject)
                                // console.log(stream, branch, subject, found_subject);
                                if (found_subject) {
                                    if (chapter) {
                                        // If chapter name is mentioned in the url then add questions
                                        const found_chapter = await ChapterModel.findOne({ chapter_name: chapter.toLowerCase() });
                                        console.log(found_chapter)
                                        if (found_chapter) {
                                            // if chapter name is not mentioned in the url then add chapters
                                            const { statusCode, message, questionId } = await QuestionController.addQuestion(req);
                                            console.log(statusCode, message, questionId, found_chapter._id);
                                            if (questionId) {
                                                ChapterModel.findOneAndUpdate({ _id: found_chapter._id }, { $push: { questions: questionId } }, function (error, success) {
                                                    if (error) {
                                                        res.status(500).json([{ "status": "failed", "message": "something went wrong" }]);
                                                    } else {
                                                        res.status(statusCode).json([{ "status": "success", message }]);
                                                    }
                                                })
                                            }
                                            else {
                                                res.status(statusCode).json([{ "status": "failed", message }]);
                                            }
                                        } else {
                                            res.status(404).json([{ "status": "failed", "message": `${chapter} not found` }]);
                                        }
                                    } else {
                                        // if chapter name is not mentioned in the url then add chapters
                                        const { statusCode, message, chapterId } = await ChaptersController.addChapter(req);
                                        if (chapterId) {
                                            // console.log(statusCode, message, chapterId, found_branch._id);
                                            SubjectModel.findOneAndUpdate({ _id: found_subject._id }, { $push: { chapters: chapterId } }, function (error, success) {
                                                if (error) {
                                                    res.status(500).json([{ "status": "failed", "message": "something went wrong" }]);
                                                } else {
                                                    res.status(statusCode).json([{ "status": "success", message }]);
                                                }
                                            })
                                        }
                                        else {
                                            res.status(statusCode).json([{ "status": "failed", message }]);
                                        }

                                    }

                                } else {
                                    res.status(404).json([{ "status": "failed", "message": `${subject} not found` }]);
                                }
                            } else {
                                // If subject is not mentioned in the url then add new subject
                                const { statusCode, message, subjectId } = await SubjectsController.addSubject(req, res);
                                // console.log(statusCode, message, subjectId, found_branch._id);
                                if (subjectId) {
                                    BranchModel.findOneAndUpdate({ _id: found_branch._id }, { $push: { subjects: subjectId } }, function (error, success) {
                                        if (error) {
                                            res.status(500).json([{ "status": "failed", "message": "something went wrong" }]);
                                        } else {
                                            res.status(statusCode).json([{ "status": "success", message }]);
                                        }
                                    })
                                }
                                else {
                                    res.status(statusCode).json([{ "status": "failed", message }]);
                                }
                            }
                        } else {
                            res.status(404).json([{ "status": "failed", "message": `${branch} not found` }]);
                        }
                    } else {
                        // If branch not mentioned then add branch
                        const { statusCode, message, branchId } = await BranchController.addBranch(req);
                        if (branchId) {
                            StreamModel.findOneAndUpdate({ _id: found_stream._id }, { $push: { branch: branchId } }, function (error, success) {
                                if (error) {
                                    res.status(500).json([{ "status": "failed", "message": "something went wrong" }]);
                                } else {
                                    res.status(statusCode).json([{ "status": "success", message }]);
                                }
                            })
                        }
                        else {
                            res.status(statusCode).json([{ "status": "failed", message }]);
                        }
                    }
                } else {
                    res.status(404).json([{ "status": "failed", "message": `${stream} not found` }]);
                }
            } else {
                // If stream is not mentioned in the url then add new stream
                const { title, description, color, image } = req.body;
                // console.log(req.body);
                if (title) {
                    const isExistStream = await StreamModel.findOne({ "title": title.toLowerCase() });
                    // console.log(isExistStream);
                    if (isExistStream) {
                        await res.status(403).json([{ "status": "failed", "message": `${title} already exists` }]); //conflict
                    } else {
                        try {
                            const newStream = new StreamModel({ "title": title.toLowerCase(), description, color, image });
                            await newStream.save();
                            res.status(201).json([{ "status": "sucess", "message": `${title} Created Successfully` }])
                        } catch (err) {
                            // console.log(err);
                            res.status(500).json([{ "status": "failed", "message": "Unable to Create" }])
                        }
                    }
                } else {
                    res.status(400).json([{ "status": "failed", "message": "Title is required" }]);
                }
            }
        } catch (err) {
            if (err) Logs.errorHandler(err, req, res);
        }
    }
    static getStream = async (req, res) => {
        try {
            const { stream, branch, subject, chapter } = req.params;
            // console.log(stream, branch, subject, chapter)
            if (stream) {
                StreamModel.findOne({ title: stream.toLowerCase() }).select(["_id", "title", "description", "color", "image"]).populate({
                    path: "branch",
                    select: ["branch_name", "description", , "subjects", "color", "image"],
                    populate: {
                        path: "subjects",
                        select: ["subject_name", "description", "chapters", "color", "image"],
                        populate: {
                            path: "chapters",
                            select: ["chapter_name", "description", "questions"],
                            populate: {
                                path: "questions",
                                select: ["question_title", "description", "options"],
                            }
                        }
                    }
                }).exec((err, result) => {
                    if (err) Logs.errorHandler(err, req, res);
                    else if (result) {
                        if (branch) {
                            const found_branch = result.branch.filter(f => f.branch_name.toLowerCase() == branch.toLowerCase());
                            if (found_branch.length > 0) {
                                if (subject) {
                                    const found_subject = found_branch[0].subjects.filter(f => f.subject_name.toLowerCase() == subject.toLowerCase());
                                    if (found_subject.length > 0) {
                                        if(chapter){
                                            const found_chapter = found_subject[0].chapters.filter(f => f.chapter_name.toLowerCase() == chapter.toLowerCase());
                                            if(found_chapter.length > 0){
                                                res.json(found_chapter)
                                            }else{
                                                res.status(404).json([{ "status": "failed", "message": `${chapter} not found` }]);
                                            }
                                        }else{
                                            res.json(found_subject)
                                        }
                                    } else {
                                        res.status(404).json([{ "status": "failed", "message": `${subject} not found` }]);
                                    }
                                } else {
                                    res.json(found_branch)
                                }
                            } else {
                                res.status(404).json([{ "status": "failed", "message": `${branch} not found` }]);
                            }
                            // console.log(result.branch)
                        } else {
                            res.json(result)
                        }
                    }
                    else res.status(404).json([{ "status": "failed", "message": `${stream} not found` }]);
                })
            } else {
                StreamModel.find().select(["_id", "title", "description", "color", "image"]).populate({
                    path: "branch",
                    select: ["branch_name", "description", , "subjects", "color", "image"],
                    populate: {
                        path: "subjects",
                        select: ["subject_name", "description", "chapters", "color", "image"],
                        populate: {
                            path: "chapters",
                            select: ["chapter_name", "description", "questions"],
                            populate: {
                                path: "questions",
                                select: ["question_title", "description", "options"],
                            }
                        }
                    }
                }).exec((err, result) => {
                    if (err) throw (err);
                    else if (result.length > 0) { res.json(result) }
                    else res.status(404).json([{ "status": "failed", "message": `no data available to show` }]);;
                })
            }
        } catch (err) {
            if (err) Logs.errorHandler(err, req, res);
        }
    }
}
function isObjEmpty(obj) {
    return Object.keys(obj).length === 0;
}
module.exports = { StreamController };