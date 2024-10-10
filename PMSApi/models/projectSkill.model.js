const mongoose = require('mongoose');

const projectSkillSchema = new mongoose.Schema({
    pId : String,
    sId : String
    
}, { timestamps: true });

module.exports = mongoose.model('ProjectSkill', projectSkillSchema);
