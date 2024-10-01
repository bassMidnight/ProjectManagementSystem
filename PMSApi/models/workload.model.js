const mongoose = require('mongoose');

const workloadSchema = new mongoose.Schema({
    eId : String,
    pId : String,
    workload : Number,
    desc : String,
    date : Date,
    notation : String,
    
}, { timestamps: true });

module.exports = mongoose.model('Workload', workloadSchema);
