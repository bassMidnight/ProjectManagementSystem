const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    eId : String,
    name : String,
    surname : String,
    shortname: String,
    branch : String,
    position : String,
    department: String,
    startDate : Date,
    onBoard : Boolean,
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
