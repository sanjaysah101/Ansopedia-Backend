const mongoose = require("mongoose");

//Defining Schema
const assetsSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    created : {type:Date, require:true, default:Date.now()}
});

//Model
const AssetsModel = mongoose.model("assets", assetsSchema);

module.exports = { AssetsModel };