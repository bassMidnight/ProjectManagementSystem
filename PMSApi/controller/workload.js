const projectMemberModel = require('../models/projectMember.model');
const workloadModel = require('../models/workload.model');

let {getWeekNumber} = require('../utils/getWeekNumber');
async function GetEmployeeWorkload(req, res) {
    const pId = req.query.pId;
    const eId = req.query.eId;

    let page = req.query.page || 1
    let size = req.query.size || 10

    size = parseInt(size);
    const offset = (page - 1) * size;

    if (!eId) {
        return res.status(400).json({ message: 'eId is required' });
    }
    try {
        const workload = await workloadModel.find(
            { eId, ...(pId ? { pId } : {}) }).skip(offset).limit(size);
        if (!workload) {
            return res.status(404).json({ message: 'workload not found' });
        }

        const workloadTotal = await workloadModel.find(
            { eId, ...(pId ? { pId } : {}) }).countDocuments();
        if (!workload) {
            return res.status(404).json({ message: 'workload not found' });
        }

        
        return res.status(200).json({ data: workload, total: workload.length, total_all: workloadTotal });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function CreateEmployeeWorkload(req, res) {
    const eId = req.body.eId;
    if (!eId) {
        return res.status(400).json({ message: 'eId is required' });
    }

    const pId = req.body.pId;
    if (!pId) {
        return res.status(400).json({ message: 'pId is required' });
    }

    const workload = req.body.workload;
    if (!workload) {
        return res.status(400).json({ message: 'workload is required' });
    }
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
            return res.status(200).json({ data: null });
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
        const workload = await workloadModel.findOneAndUpdate({ pId: pId, eId: eId, weekOfYear: currentWeek, updatedAt: { $gte: new Date(currentYear, 0, 1) } }, req.body, { new: true, upsert: true });
        if (!workload) {
            return res.status(404).json({ message: 'workload not found' });
        }
        res.status(200).json({message:"successfully", data: workload});
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