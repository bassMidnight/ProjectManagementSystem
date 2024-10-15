const projectMemberModel = require('../models/projectMember.model');
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
            weekOfYear: currentWeek || req.body.weekOfYear
        });
        return res.status(200).json({message:"created successfully", data: workload});
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

async function UpdateEmployeeWorkload(req, res) {
    const eId = req.query.eId || req.body.eId;
    if (!eId) {
        return res.status(400).json({ message: 'eId is required' });
    }
    const pId = req.query.pId || req.body.pId;
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

async function GetlatestWorkload(req, res) {
    const currentWeek = getWeekNumber(new Date());
    const currentYear = new Date().getFullYear();
    const eId = req.query.eId;
    if (!eId) {
        return res.status(400).json({ message: 'eId is required' });
    }
    const pId = req.query.pId;
    if (!pId) {
        return res.status(400).json({ message: 'pId is required' });
    }
    try {
        const workload = await workloadModel.findOne({eId: eId, pId: pId , weekOfYear: currentWeek, updatedAt: {$gte: new Date(currentYear, 0, 1)}});
        if (!workload) {
            await workloadModel.create({
                pId: pId,
                eId: eId,
                workload: 0,
                weekOfYear: currentWeek,
                desc: '',
                notation: '',
                updatedAt: new Date()
            })
            return res.status(200).json({ message: 'workload created' });
        }
        return res.status(200).json({ data: workload });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

async function GetAllMembersAndWorkload(req, res) {
    try {
        const pId = req.query.pId;
        if (!pId) {
            return res.status(400).json({ message: 'pId is required' });
        }
        const workloads = await workloadModel.find({ pId: pId }).sort({ updatedAt: -1 });
        return res.status(200).json({ data: workloads });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

async function GetlatestProjectWorkload(req, res) {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    let offset = (page - 1) * size;

    try {
        const workloads = await workloadModel.aggregate([
            {
                $group: {
                    _id: "$pId",
                    latestWorkload: { $last: "$$ROOT" }
                }
            },
            {
                $replaceRoot: { newRoot: "$latestWorkload" }
            },
            { $skip: offset },
            { $limit: size }
        ]);
        const total = await workloadModel.aggregate([
            {
                $group: {
                    _id: "$pId"
                }
            },
            { $count: "total" }
        ]);
        return res.status(200).json({ data: workloads, total: total[0] ? total[0].total : 0 });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

async function DevWorkloadController(req, res) {
    const currentWeek = getWeekNumber(new Date());
    const currentYear = new Date().getFullYear();
    try {
        const pId = req.query.pId;
        if (!pId) {
            return res.status(400).json({ message: 'pId is required' });
        }
        const eId = req.query.eId;
        if (!eId) {
            return res.status(400).json({ message: 'eId is required' });
        }
        const workload = await workloadModel.findOne({ eId: eId, pId: pId }, { weekOfYear: currentWeek, year: currentYear });
        if (!workload) {
            let newworkload = await workloadModel.create({
                pId: pId,
                eId: eId,
                weekOfYear: currentWeek,
                year: currentYear,
                workload: 0,
                desc: '',
                notation: ''
            })
            return res.status(200).json({ message: 'workload created successfully', data: newworkload });
        } else {
            let newworkload = await workloadModel.findOneAndUpdate({ eId: eId, pId: pId }, {
                $set: {
                    workload: req.body.workload,
                    desc: req.body.desc,
                    notation: req.body.notation
                }
            }, { new: true })
            return res.status(200).json({ message: 'workload updated successfully',data: newworkload });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports = {
    GetEmployeeWorkload,
    CreateEmployeeWorkload,
    UpdateEmployeeWorkload,
    DeleteEmployeeWorkload,

    GetlatestWorkload,
    GetAllMembersAndWorkload,
    GetlatestProjectWorkload,

    DevWorkloadController
}