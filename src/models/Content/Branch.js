const mongoose = require("mongoose");

//Defining Schema
const BranchSchema = new mongoose.Schema({
    branch_name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    color: { type: String, trim: true },
    image: { type: String, trim: true },
    subjects: [
        { type: mongoose.Schema.Types.ObjectId, ref: "subjects" }
    ]

}, { timestamps: true });

//Model
const BranchModel = mongoose.model("branches", BranchSchema);

module.exports = {BranchModel};