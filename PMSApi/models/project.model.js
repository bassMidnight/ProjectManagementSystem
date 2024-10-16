const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    id : {type: String, unique: true},
    projectName : {type: String, unique: true},
    lead : String,
    progress: {type: Number, default: 0},
    startDate: Date,
    completeDate: Date,

}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
