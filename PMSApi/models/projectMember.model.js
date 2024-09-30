const mongoose = require('mongoose');

const projectMemberSchema = new mongoose.Schema({
    pId : String,
    eId : String
    
}, { timestamps: true });

module.exports = mongoose.model('ProjectMember', projectMemberSchema);
