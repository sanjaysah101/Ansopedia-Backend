const mongoose = require("mongoose");

//Defining Schema
const streamSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    color: { type: String, trim: true },
    image: { type: String, trim: true },
    branch: [
        { type: mongoose.Schema.Types.ObjectId, ref: "branches" }
    ]

}, { timestamps: true });

//Model
const StreamModel = mongoose.model("stream", streamSchema);

module.exports = { StreamModel };