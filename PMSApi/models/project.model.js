const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    id : String,
    projectName : String,
    lead : String,
    progress: {type: Float32Array, default: 0},
    startDate: Date,
    completeDate: Date,
    
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
