const workloadModel = require('../models/workload.model');

async function GetEmployeeWorkloadWeek(req, res) {
    try {
        console.log(req.query);
        res.status(200).json({message:"success", data: req.query});
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "gafgsgd"});
    }
}


async function GetEmployeeWorkloadByProjectId(req, res) {
    try {
        const workload = await workloadModel.find({ pId: req.params.pId, eId: req.params.eId });
        res.status(200).json({message:"success", data: workload});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function CreateEmployeeWorkload(req, res) {
    try {
        const workload = await workloadModel.create({
            pId: req.params.pId,
            eId: req.params.eId,
            workload: req.body.workload,
            desc: req.body.desc,
            date: Date.now(),
            notation: req.body.notation
        });
        res.status(200).json({message:"created successfully", data: workload});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function UpdateEmployeeWorkload(req, res) {
    try {
        const workload = await workloadModel.findOneAndUpdate({ eId: req.params.eId, pId: req.params.pId },
            req.body, { new: true });
        res.status(200).json({message:"updated successfully", data: workload});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function DeleteEmployeeWorkload(req, res) {
    try {
        await workloadModel.findOneAndDelete({ eId: req.params.eId, pId: req.params.pId });
        res.status(200).json("deleted successfully");
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}




module.exports = {
    GetEmployeeWorkloadWeek,
    CreateEmployeeWorkload,
    UpdateEmployeeWorkload,
    DeleteEmployeeWorkload,

    GetEmployeeWorkloadByProjectId
}