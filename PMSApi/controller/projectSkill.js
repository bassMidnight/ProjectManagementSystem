const Skill = require('../models/skill.model');
const projectModel = require('../models/project.model');
const projectSkillModel = require('../models/projectSkill.model');
async function GetProjectSkills(req, res) {
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

async function AddProjectSkill(req, res) {
    const projectId = req.query.projectId;
    if (!projectId) {
        return res.status(400).json({ message: 'project id is required' });
    }
    const skillId = req.query.skillId;
    if (!skillId) {
        return res.status(400).json({ message: 'skill id is required' });
    }
    try {

        const checkSkill = await Skill.findOne({ id: skillId });
        if (!checkSkill) {
            return res.status(400).json({ message: 'skill not found' });
        }

        const project = await projectModel.findOne({ id: projectId });
        if (!project) {
            return res.status(400).json({ message: 'project not found' });
        }
        
        const projectSkill = await projectSkillModel.create({
            pId: projectId,
            sId: skillId
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

async function RemoveProjectSkill(req, res) {
    const pId = req.query.pId;
    if (!pId) {
        return res.status(400).json({ message: 'pId is required' });
    }
    const sId = req.query.sId;
    if (!sId) {
        return res.status(400).json({ message: 'sId is required' });
    }
    try {
        const projectSkill = await projectSkillModel.delete({ pId: pId, sId: sId });
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

async function restoreProjectSkill(req, res) {
    const pId = req.query.pId;
    if (!pId) {
        return res.status(400).json({ message: 'pId is required' });
    }
    const sId = req.query.sId;
    if (!sId) {
        return res.status(400).json({ message: 'sId is required' });
    }
    try {
        const projectSkill = await projectSkillModel.restore({ pId: pId, sId: sId });
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
    RemoveProjectSkill,
    restoreProjectSkill
}