const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        minLength: 3
    },
    username: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: true,
    },
    password: { type: String, required: true, trim: true, minlength: 8 },
    mobile: {
        type: String,
        trim: true,
        validate: {
            validator: function (v) {
                return /^[0-9]{10}/.test(v);
            },
            message: '{VALUE} is not a valid 10 digit number!'
        }
    },
    coins: {
        totalCoins: { type: Number, default: 100 },
    },
    notifications: [
        { type: mongoose.Schema.Types.ObjectId, ref: "notifications" }
    ],
    designation: { type: String, trim: true },
    roles: [
        { type: mongoose.Schema.Types.ObjectId, ref: "roles" }
    ],
    avatar: { type: Object },
    isAccountVerified: {type: Boolean},
    isProfileComplete: {type: Boolean, default : false},
    tokens: [{ type: Object }],
    otp: { type: Object },
    tc: { type: Boolean, required: true }
}, { timestamps: true });

//Model
const UserModel = mongoose.model("users", userSchema);

module.exports = { UserModel };
// export default UserModel;