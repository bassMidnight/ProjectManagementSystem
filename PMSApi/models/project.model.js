const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const projectSchema = new mongoose.Schema({
    id : {type: String, unique: true},
    projectName : {type: String, unique: true},
    lead : String,
    progress: {type: Number, default: 0},
    startDate: Date,
    completeDate: Date,

}, { timestamps: true });

projectSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });

module.exports = mongoose.model('Project', projectSchema);
