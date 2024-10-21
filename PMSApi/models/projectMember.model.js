const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const projectMemberSchema = new mongoose.Schema({
    pId : String,
    eId : String
    
}, { timestamps: true });

projectMemberSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });

module.exports = mongoose.model('ProjectMember', projectMemberSchema);
