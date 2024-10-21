const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const employeeSchemaSkillSchema = new mongoose.Schema({
    eId : String,
    sId : String

}, { timestamps: true });

employeeSchemaSkillSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });

module.exports = mongoose.model('EmployeeSkill', employeeSchemaSkillSchema);
