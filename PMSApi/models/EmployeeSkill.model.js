const mongoose = require('mongoose');

const employeeSchemaSkillSchema = new mongoose.Schema({
    eId : String,
    sId : String

}, { timestamps: true });

module.exports = mongoose.model('EmployeeSkill', employeeSchemaSkillSchema);
