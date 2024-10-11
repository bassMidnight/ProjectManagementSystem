const projectSkillModel = require('../models/projectSkill.model');

async function GetProjectSkills(req, res, next) {
    const pId = req.query.pId;
    if (!pId) {
        return res.status(400).json({ message: 'pId is required' });
    }
    try {
        const projectskills = await projectSkillModel.aggregate([
            {
                $lookup: {
                    from: 'skills',
                    localField: 'sId',
                    foreignField: 'id',
                    as: 'skills'
                }
            },
            {
                $unwind: '$skills'
            },
            {
                $match: { pId: pId }
            },
            {
                $project: {
                    _id: 1,
                    pId: 1,
                    sId: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    __v: 1,
                    skills: '$skills.name'
                }
            }
        ]);
        res.send({
            status: 200,
            message: "success",
            data: projectskills,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

async function AddProjectSkill(req, res, next) {
    const pId = req.query.pId;
    if (!pId) {
        return res.status(400).json({ message: 'pId is required' });
    }
    const sId = req.query.sId;
    if (!sId) {
        return res.status(400).json({ message: 'sId is required' });
    }
    try {
        const projectSkill = await projectSkillModel.create({
            pId: pId,
            sId: sId
        });
        res.send({
            status: 200,
            message: "success",
            data: projectSkill
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

async function RemoveProjectSkill(req, res, next) {
    const pId = req.query.pId;
    if (!pId) {
        return res.status(400).json({ message: 'pId is required' });
    }
    const sId = req.query.sId;
    if (!sId) {
        return res.status(400).json({ message: 'sId is required' });
    }
    try {
        const projectSkill = await projectSkillModel.findOneAndDelete({ pId: pId, sId: sId });
        if (!projectSkill) {
            return res.status(404).json({ message: 'project skill not found' });
        }
        res.send({
            status: 200,
            message: "success",
            data: projectSkill
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

module.exports = {
    GetProjectSkills,
    AddProjectSkill,
    RemoveProjectSkill
}