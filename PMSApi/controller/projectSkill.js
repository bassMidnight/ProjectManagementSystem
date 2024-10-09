const projectSkillModel = require('../models/projectSkill.model');
const { badRequest, dataNotFound } = require('../utils/response');

async function GetProjectSkills(req, res, next) {
    const pId = req.query.pId;
    if (!pId) {
        return badRequest('project id is required');
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
        next(error);
    }
}

async function AddProjectSkill(req, res, next) {
    const pId = req.query.pId;
    if (!pId) {
        return badRequest('project id is required');
    }
    const sId = req.query.sId;
    if (!sId) {
        return badRequest('skill id is required');
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
        next(error);
    }
}

async function RemoveProjectSkill(req, res, next) {
    const pId = req.query.pId;
    if (!pId) {
        return badRequest('project id is required');
    }
    const sId = req.query.sId;
    if (!sId) {
        return badRequest('skill id is required');
    }
    try {
        const projectSkill = await projectSkillModel.findOneAndDelete({ pId: pId, sId: sId });
        if (!projectSkill) {
            return dataNotFound('project skill not found');
        }
        res.send({
            status: 200,
            message: "success",
            data: projectSkill
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    GetProjectSkills,
    AddProjectSkill,
    RemoveProjectSkill
}