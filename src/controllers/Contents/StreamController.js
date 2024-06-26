const { StreamModel } = require('../../models/Content/Stream');
const { BranchModel } = require('../../models/Content/Branch');
const { SubjectModel } = require('../../models/Content/Subject');
const { ChapterModel } = require('../../models/Content/Chapters');
const { BranchController } = require('./BranchesController');
const { SubjectsController } = require('./SubjectsController');
const { ChaptersController } = require('./ChaptersController');
const { QuestionController } = require('./QuestionController');
const { Logs } = require('../../middlewares/Logs');
const ApiModel = require('../../models/ApiModel');
const Enum = require('../../utils/Enum');
const { sendResponse } = require('../../utils/ResponseHandler');

const fetchData = async () =>
  await StreamModel.find()
    .select(['_id', 'title', 'description', 'color', 'image'])
    .populate({
      path: 'branch',
      select: ['branch_name', 'description', , 'subjects', 'color', 'image'],
      populate: {
        path: 'subjects',
        select: ['subject_name', 'description', 'chapters', 'color', 'image'],
        populate: {
          path: 'chapters',
          select: ['chapter_name', 'description', 'questions'],
          populate: {
            path: 'questions',
            select: ['question_title', 'description', 'options'],
          },
        },
      },
    });

class StreamController {
  // stream , branch , subject, chapter, questions

  static addStream = async (req, res) => {
    try {
      const { stream, branch, subject, chapter } = req.params;

      if (stream) {
        //if stream name is mentioned in the parameter
        const found_stream = await StreamModel.findOne({
          title: stream.toLowerCase(),
        });
        // console.log(found_stream)
        if (found_stream) {
          if (branch) {
            // If branch name is Model in the url then add subject
            const found_branch = await BranchModel.findOne({
              branch_name: branch.toLowerCase(),
            });
            if (found_branch) {
              if (subject) {
                // If subject name is mentioned in the url then add chapters
                // console.log(branch)
                const found_subject = await SubjectModel.findOne({
                  subject_name: subject.toLowerCase(),
                });
                // res.send(found_subject)
                // console.log(stream, branch, subject, found_subject);
                if (found_subject) {
                  if (chapter) {
                    // If chapter name is mentioned in the url then add questions
                    const found_chapter = await ChapterModel.findOne({
                      chapter_name: chapter.toLowerCase(),
                    });
                    // console.log(found_chapter)
                    if (found_chapter) {
                      // if chapter name is not mentioned in the url then add chapters
                      const { statusCode, message, questionId } =
                        await QuestionController.addQuestion(req);
                      // console.log(statusCode, message, questionId, found_chapter._id);
                      if (questionId) {
                        try {
                          const newQuestion =
                            await ChapterModel.findOneAndUpdate(
                              { _id: found_chapter._id },
                              { $push: { questions: questionId } },
                              { new: true }
                            );

                          if (!newQuestion) {
                            return res
                              .status(500)
                              .json(
                                ApiModel.getApiModel(
                                  Enum.status.FAILED,
                                  `something went wrong`
                                )
                              );
                          }

                          res
                            .status(statusCode)
                            .json(
                              ApiModel.getApiModel(Enum.status.SUCCESS, message)
                            );
                        } catch (error) {
                          res
                            .status(500)
                            .json(
                              ApiModel.getApiModel(
                                Enum.status.FAILED,
                                `something went wrong`
                              )
                            );
                        }
                      } else {
                        res
                          .status(statusCode)
                          .json(
                            ApiModel.getApiModel(Enum.status.FAILED, message)
                          );
                      }
                    } else {
                      res
                        .status(404)
                        .json(
                          ApiModel.getApiModel(
                            Enum.status.FAILED,
                            `${chapter} not found`
                          )
                        );
                    }
                  } else {
                    // if chapter name is not mentioned in the url then add chapters
                    const { statusCode, message, chapterId } =
                      await ChaptersController.addChapter(req);
                    if (chapterId) {
                      try {
                        const newChapter = await SubjectModel.findOneAndUpdate(
                          { _id: found_subject._id },
                          { $push: { chapters: chapterId } },
                          { new: true }
                        );

                        if (!newChapter) {
                          return res
                            .status(500)
                            .json(
                              ApiModel.getApiModel(
                                Enum.status.FAILED,
                                `something went wrong`
                              )
                            );
                        }

                        res
                          .status(statusCode)
                          .json(
                            ApiModel.getApiModel(Enum.status.SUCCESS, message)
                          );
                      } catch (error) {
                        res
                          .status(500)
                          .json(
                            ApiModel.getApiModel(
                              Enum.status.FAILED,
                              `something went wrong`
                            )
                          );
                      }
                    } else {
                      res
                        .status(statusCode)
                        .json(
                          ApiModel.getApiModel(Enum.status.FAILED, message)
                        );
                    }
                  }
                } else {
                  res
                    .status(404)
                    .json(
                      ApiModel.getApiModel(
                        Enum.status.FAILED,
                        `${subject} not found`
                      )
                    );
                }
              } else {
                // If subject is not mentioned in the url then add new subject
                const { statusCode, message, subjectId } =
                  await SubjectsController.addSubject(req, res);
                // console.log(statusCode, message, subjectId, found_branch._id);
                if (subjectId) {
                  try {
                    const newSubject = await BranchModel.findOneAndUpdate(
                      { _id: found_branch._id },
                      { $push: { subjects: subjectId } },
                      { new: true }
                    );

                    if (!newSubject) {
                      res
                        .status(500)
                        .json(
                          ApiModel.getApiModel(
                            Enum.status.FAILED,
                            `something went wrong`
                          )
                        );
                      return;
                    }

                    res
                      .status(statusCode)
                      .json(ApiModel.getApiModel(Enum.status.SUCCESS, message));
                  } catch (error) {
                    res
                      .status(500)
                      .json(
                        ApiModel.getApiModel(
                          Enum.status.FAILED,
                          `something went wrong`
                        )
                      );
                  }
                } else {
                  res
                    .status(statusCode)
                    .json(ApiModel.getApiModel(Enum.status.FAILED, message));
                }
              }
            } else {
              res
                .status(404)
                .json(
                  ApiModel.getApiModel(
                    Enum.status.FAILED,
                    `${branch} not found`
                  )
                );
            }
          } else {
            // If branch not mentioned then add branch
            const { statusCode, message, branchId } =
              await BranchController.addBranch(req);
            if (branchId) {
              try {
                const newBranch = await StreamModel.findOneAndUpdate(
                  { _id: found_stream._id },
                  { $push: { branch: branchId } },
                  { new: true }
                );

                if (!newBranch) {
                  res
                    .status(500)
                    .json(
                      ApiModel.getApiModel(
                        Enum.status.FAILED,
                        `something went wrong`
                      )
                    );
                  return;
                }

                res
                  .status(statusCode)
                  .json(ApiModel.getApiModel(Enum.status.SUCCESS, message));
              } catch (error) {
                res
                  .status(500)
                  .json(
                    ApiModel.getApiModel(
                      Enum.status.FAILED,
                      `something went wrong`
                    )
                  );
              }
            } else {
              res
                .status(statusCode)
                .json(ApiModel.getApiModel(Enum.status.FAILED, message));
            }
          }
        } else {
          res
            .status(404)
            .json(
              ApiModel.getApiModel(Enum.status.FAILED, `${stream} not found`)
            );
        }
      } else {
        // If stream is not mentioned in the url then add new stream
        const { title, description, color, image } = req.body;
        // console.log(req.body);
        if (title) {
          const isExistStream = await StreamModel.findOne({
            title: title.toLowerCase(),
          });
          // console.log(isExistStream);
          if (isExistStream) {
            await res
              .status(403)
              .json(
                ApiModel.getApiModel(
                  Enum.status.FAILED,
                  `${title} already exists`
                )
              ); //conflict
          } else {
            try {
              const newStream = new StreamModel({
                title: title.toLowerCase(),
                description,
                color,
                image,
              });
              await newStream.save();
              res
                .status(201)
                .json(
                  ApiModel.getApiModel(
                    Enum.status.FAILED,
                    `${title} Created Successfully`
                  )
                );
            } catch (err) {
              // console.log(err);
              res
                .status(500)
                .json(
                  ApiModel.getApiModel(Enum.status.FAILED, `unable to create`)
                );
            }
          }
        } else {
          res
            .status(400)
            .json(
              ApiModel.getApiModel(Enum.status.FAILED, `Title is required`)
            );
        }
      }
    } catch (err) {
      if (err) Logs.errorHandler(err, req, res);
    }
  };

  static getStream = async (req, res) => {
    const { stream, branch, subject, chapter } = req.params;
    try {
      const data = await fetchData();

      if (!stream) {
        sendResponse(res, 200, Enum.status.SUCCESS, 'There is content', data);
        return;
      }

      const streamData = data.find(
        (f) => f.title.toLowerCase() === stream?.toLowerCase()
      );

      if (!streamData) {
        sendResponse(
          res,
          404,
          Enum.status.NOTFOUND,
          `${stream} stream does not exist`
        );
        return;
      }

      if (!branch) {
        sendResponse(
          res,
          200,
          Enum.status.SUCCESS,
          `There is ${stream} stream`,
          streamData
        );
        return;
      }

      const branchData = streamData.branch.find(
        (f) => f.branch_name.toLowerCase() === branch?.toLowerCase()
      );

      if (!branchData) {
        sendResponse(
          res,
          404,
          Enum.status.NOTFOUND,
          `${branch} branch does not exist`
        );
        return;
      }

      if (!subject) {
        sendResponse(
          res,
          200,
          Enum.status.SUCCESS,
          `There is ${branch} branch`,
          branchData
        );
        return;
      }

      const subjectData = branchData.subjects.find(
        (f) => f.subject_name.toLowerCase() === subject?.toLowerCase()
      );

      if (!subjectData) {
        sendResponse(
          res,
          404,
          Enum.status.NOTFOUND,
          `${subject} subject does not exist`
        );
        return;
      }

      if (!chapter) {
        sendResponse(
          res,
          200,
          Enum.status.SUCCESS,
          `There is ${subject} subject`,
          subjectData
        );
        return;
      }

      const chapterData = subjectData.chapters.find(
        (f) => f.chapter_name.toLowerCase() === chapter?.toLowerCase()
      );

      if (!chapterData) {
        sendResponse(
          res,
          404,
          Enum.status.NOTFOUND,
          `${chapter} chapter does not exist`
        );
        return;
      }

      sendResponse(
        res,
        200,
        Enum.status.SUCCESS,
        `There is ${chapter} chapter`,
        chapterData
      );
    } catch (err) {
      if (err) Logs.errorHandler(err, req, res);
    }
  };
}

module.exports = { StreamController };
