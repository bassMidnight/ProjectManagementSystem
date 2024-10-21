const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

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

employeeSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });

module.exports = mongoose.model('Employee', employeeSchema);
