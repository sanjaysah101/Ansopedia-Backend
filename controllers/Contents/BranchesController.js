const {BranchModel} = require("../../models/Content/Branch");


class BranchController {
    // static createContent = async (req, res) => {
    //     const { title, description, branch } = req.body;
    //     console.log(req.body);
    //     if (title) {
    //         const content = await ContentsModel.findOne({ "title": title.toLowerCase() });
    //         console.log(content);
    //         if (content) {
    //             await res.status(403).json([{ "status": "failed", "message": `${title} already exists` }]); //conflict
    //         } else {
    //             try {
    //                 const newContent = new ContentsModel({ "title": title.toLowerCase(), description, branch });
    //                 await newContent.save();
    //                 res.status(201).json([{ "status": "sucess", "message": `${title} Created Successfully`, newContent }])
    //             } catch (err) {
    //                 console.log(err);
    //                 res.json([{ "status": "failed", "message": "Unable to Create" }])
    //             }
    //         }
    //     } else {
    //         res.json([{ "status": "failed", "message": "Title is required" }]);
    //     }
    // }
    static addBranch = async (req, res) => {
        const { branch_name, description, color, image } = req.body;
        let statusCode, message, branchId;
        // console.log(branch_name);
        if (branch_name) {
            const branch = await BranchModel.findOne({ "branch_name": branch_name.toLowerCase() });
            if (branch) {
                // console.log(branch);
                statusCode = 403;
                message = `${branch_name} already exists`;
                // res.status(403).json([{ "status": "failed", "message": `${branch_name} already exists` }]); //conflict
            } else {
                try {
                    const newContent = new BranchModel({ "branch_name": branch_name.toLowerCase(), description, color, image });
                    await newContent.save();
                    statusCode = 200;
                    message = `${branch_name} created success`;
                    branchId = await BranchModel.findOne({ "branch_name": req.body.branch_name.toLowerCase() });
                } catch (err) {
                    statusCode = 500;
                    message = `Unable to Create`;
                    console.log(err);
                    // res.status(500).json([{ "status": "failed", "message": "Unable to Create" }])
                }
            }
        } else {
            statusCode = 400;
            message = `branch_name is required`;
            // res.status(400).json([{ "status": "failed", "message": "branch_name is required" }]);
        }
        return {statusCode, message, branchId}
    }
    static updateContents = async (req, res) => {
        const id = req.params.id;
        if (id) {
            const { title, description, branch } = req.body;
            try {
                await ContentsModel.findByIdAndUpdate(id, { "title": title.toLowerCase(), description, branch });
                res.status(200).json({ "status": "success", "message": `${title} Updated Success` })
            } catch (err) {
                res.status(200).json({ "status": "failed", "message": "failed" })
            }
        } else {
            res.status(200).json([{ "status": "failed", "message": "id not provided" }])
        }
    }
    // static insertContent = async (req, res) => {
    //     const { title, description, branch } = req.body;
    //     if(title && description && branch ){
    //         console.log(title)
    //         // try {
    //         //     // const { stream, branch, subject, chapter } = req.params;
    //         //     await ContentsModel.insertMany([{ "title": title.toLowerCase(), description, branch  }]);

    //         //     // if(stream){
    //         //     // }
    //         // }catch(err){
    //         //     console.log(err);
    //         //     res.json([{ "status": "failed", "message": "failed" }]);
    //         // }
    //     }else{
    //         res.status(400).json([{ "status": "failed", "message": "all field is required" }]);
    //     }
    // }
    static getContent = async (req, res) => {
        try {
            const { stream, branch, subject, chapter } = req.params;
            if (stream) {
                const found_stream = await ContentsModel.findOne({ title: stream.toLowerCase() }).select("-_id");
                // console.log(found_stream)
                if (found_stream) {
                    if (branch) {
                        let found_branch = found_stream.branch.filter(branches => branches.branch_name.toLowerCase() === branch.toLowerCase());
                        found_branch.forEach(b => found_branch = b)
                        if (!isObjEmpty(found_branch)) {
                            if (subject) {
                                let found_subject = found_branch.subjects.filter(f => f.subject_name.toLowerCase() === subject.toLowerCase());
                                found_subject.forEach(s => found_subject = s);
                                if (!isObjEmpty(found_subject)) {
                                    if (chapter) {
                                        let found_chapter = found_subject.chapters.filter(f => f.chapter_name.toLowerCase() === chapter.toLowerCase());
                                        found_chapter.forEach(c => found_chapter = c);
                                        if (!isObjEmpty(found_chapter)) {
                                            res.json([found_chapter]);
                                        } else {
                                            res.json([{ "status": "success", "message": `${chapter} not found` }]);
                                        }

                                    } else {
                                        res.json([found_subject]);
                                    }
                                }
                                else {
                                    res.json([{ "status": "success", "message": `${subject} not found` }]);
                                }
                            } else {
                                res.json([found_branch]);
                            }
                        } else {
                            res.json([{ "status": "success", "message": `${branch} not found` }]);
                        }
                    } else {
                        res.json([found_stream]);
                    }
                } else {
                    res.json([{ "status": "failed", "message": `${stream} not found` }]);
                }
            } else {
                const found_Content = await ContentsModel.find({}).select("-_id");
                res.json(found_Content);
                // ContentsModel.find().populate("branch").exec((err, result) => {
                //     if (err) throw (err);
                //     res.json(result);
                // })
            }
        } catch (err) {
            res.json([{ "status": "failed", "message": "failed" }]);
        }
    }
}
function isObjEmpty(obj) {
    return Object.keys(obj).length === 0;
}
module.exports = {BranchController};