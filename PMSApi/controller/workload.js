const workloadModel = require('../models/workload.model');

let {getWeekNumber} = require('../utils/getWeekNumber');
async function GetEmployeeWorkload(req, res) {
    const eId = req.query.eId;
    if (!eId) {
        return res.status(400).json({ message: 'eId is required' });
    }
    const pId = req.query.pId;
    if (!pId) {
        return res.status(400).json({ message: 'pId is required' });
    }
    try {
        const workload = await workloadModel.find({ eId: eId, pId: pId });
        if (!workload) {
            return res.status(404).json({ message: 'workload not found' });
        }
        return res.status(200).json({ data: workload });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function CreateEmployeeWorkload(req, res) {
    try {
        let currentWeek = getWeekNumber(new Date());
        const workload = await workloadModel.create({
            pId: req.body.pId,
            eId: req.body.eId,
            workload: req.body.workload,
            desc: req.body.desc,
            notation: req.body.notation,
            weekOfYear: currentWeek
        });
        return res.status(200).json({message:"created successfully", data: workload});
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

async function UpdateEmployeeWorkload(req, res) {
    const eId = req.query.eId;
    if (!eId) {
        return res.status(400).json({ message: 'eId is required' });
    }
    const pId = req.query.pId;
    if (!pId) {
        return res.status(400).json({ message: 'pId is required' });
    }
    try {
        const workload = await workloadModel.findOneAndUpdate({ eId: eId, pId: pId }, req.body, { new: true });
        if (!workload) {
            return res.status(404).json({ message: 'workload not found' });
        }
        return res.status(200).json({message:"updated successfully", data: workload});
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

async function DeleteEmployeeWorkload(req, res) {
    const eId = req.query.eId;
    if (!eId) {
        return res.status(400).json({ message: 'eId is required' });
    }
    const pId = req.query.pId;
    if (!pId) {
        return res.status(400).json({ message: 'pId is required' });
    }
    try {
        const workload = await workloadModel.findOneAndDelete({ eId: eId, pId: pId });
        if (!workload) {
            return res.status(404).json({ message: 'workload not found' });
        }
        res.status(200).json({message:"deleted successfully", data: workload});
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports = {
    GetEmployeeWorkload,
    CreateEmployeeWorkload,
    UpdateEmployeeWorkload,
    DeleteEmployeeWorkload
}