const mongoose = require("mongoose");

//Defining Schema
const chapterSchema = new mongoose.Schema({
    chapter_name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    // questions: [
    //     { type: mongoose.Schema.Types.ObjectId, ref: "questions" }
    // ]
    questions : [{type: Object}]

}, { timestamps: true });

//Model
const ChapterModel = mongoose.model("chapters", chapterSchema);

module.exports = {ChapterModel};