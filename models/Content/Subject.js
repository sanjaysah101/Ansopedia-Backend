const mongoose = require("mongoose");

//Defining Schema
const SubjectSchema = new mongoose.Schema({
    subject_name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    color: { type: String, trim: true },
    image: { type: String, trim: true },
    chapters: [
        { type: mongoose.Schema.Types.ObjectId, ref: "chapters" }
    ]

}, { timestamps: true });

//Model
const SubjectModel = mongoose.model("subjects", SubjectSchema);

module.exports = {SubjectModel};