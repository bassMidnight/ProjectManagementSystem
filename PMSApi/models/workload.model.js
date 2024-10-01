const mongoose = require('mongoose');

const workloadSchema = new mongoose.Schema({
    eId : String,
    pId : String,
    workload : {type:Number, defualt:0},
    desc : String,
    date : Date,
    notation : String,
    
}, { timestamps: true });

module.exports = mongoose.model('Product', workloadSchema);
