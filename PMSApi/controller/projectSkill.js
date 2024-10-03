const projectSkillModel = require('../models/projectSkill.model');

async function GetProjectSkills(req, res, next) {
    try {
        const pId = req.query.pId || req.params.pId;
        if (!pId) {
            return res.status(400).send({
                status: 400,
                message: "project id is required",
            });
        }
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
                $match: {pId: pId}
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
    try {
        const project = req.params.pId;
        if (!project) {
            return res.status(400).send({
                status: 400,
                message: "project id is required",
            });
        }
        const sId = req.query.sId;
        if (!sId) {
            return res.status(400).send({
                status: 400,
                message: "skill id is required",
            });
        }
        const projectSkill = await projectSkillModel.create({
            pId: project,
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
    try {
        const pId = req.query.pId || req.params.pId;
        if (!pId) {
            return res.status(400).send({
                status: 400,
                message: "project id is required",
            });
        }
        const sId = req.query.sId;
        if (!sId) {
            return res.status(400).send({
                status: 400,
                message: "skill id is required",
            });
        }
        const projectSkill = await projectSkillModel.findOneAndDelete({ pId: pId, sId: sId });
        if (!projectSkill) {
            return res.status(404).send({
                status: 404,
                message: "project skill not found",
            });
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