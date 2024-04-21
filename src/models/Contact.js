const mongoose = require("mongoose");

//Defining Schema
const contactSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
}, { timestamps: true });

//Model
const ContactModel = mongoose.model("contact", contactSchema);

module.exports = { ContactModel };