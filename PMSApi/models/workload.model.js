const mongoose = require('mongoose');

const workloadSchema = new mongoose.Schema({
    eId : String,
    pId : String,
    workload : {type:Float32Array, defualt:0},
    desc : String,
    date : Date,
    notation : String,
    
}, { timestamps: true });

module.exports = mongoose.model('Product', workloadSchema);
