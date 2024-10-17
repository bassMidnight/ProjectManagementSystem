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
    one_id : String,
    one_mail : String,
    role: {
        type: String,
        enum: ['dev', 'lead', 'admin'], // ตัวเลือกที่เป็นไปได้
        default: 'dev' // กำหนดค่าเริ่มต้น
    },
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
