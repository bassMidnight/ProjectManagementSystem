const mongoose = require('mongoose');

const workloadSchema = new mongoose.Schema({
    eId : String,
    pId : String,
    workload : {type:Number, defualt:0},
    desc : String,
    date : Number,
    notation : String,
    
}, { timestamps: true });

module.exports = mongoose.model('Workload', workloadSchema);
