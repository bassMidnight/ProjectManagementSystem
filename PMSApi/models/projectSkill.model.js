const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const projectSkillSchema = new mongoose.Schema({
    pId : String,
    sId : String
    
}, { timestamps: true });

projectSkillSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });

module.exports = mongoose.model('ProjectSkill', projectSkillSchema);
