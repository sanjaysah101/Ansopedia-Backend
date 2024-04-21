const mongoose = require("mongoose");

//Defining Schema
const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "fullname not provided. Cannot create user without fullname "],
        lowercase: true,
        trim: true,
    },
    message: { type: String, trim: true, require: true },
    time: {
        type: Date, default: Date.now()
    },
    scope: {
        type: String,
        required: true,
        lowercase: true,
        enum: ['global', 'solo'],
        default: "solo"
    }  //solo => for single user
}, { timestamps: true });

//Model
const NotificationModel = mongoose.model("notifications", notificationSchema);

module.exports = { NotificationModel };