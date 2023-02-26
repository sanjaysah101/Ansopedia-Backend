const mongoose = require("mongoose");

const rolesSchema = new mongoose.Schema({
    title: { type: String, required: true, lowercase: true, trim: true, unique: true },
    description: { type: String, required: true, trim: true },
    permissions: { type: Object }
}, { timestamps: true });

const RoleModel = mongoose.model("roles", rolesSchema);

module.exports = { RoleModel };