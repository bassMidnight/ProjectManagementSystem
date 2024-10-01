const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
    id : String,
    name : String,
    description: String
}, { timestamps: true });

module.exports = mongoose.model('Skill', skillSchema);
