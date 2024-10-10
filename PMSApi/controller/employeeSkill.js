const EmployeeSkillModel = require('../models/EmployeeSkill.model');
const { badRequest, dataNotFound } = require('../utils/response');

async function GetEmployeeSkills (req, res, next) {
    const eId = req.query.eId ;
    if (!eId) {
        return res.status(400).json({
            message: 'employee id is required'
        });
    }
    try {
        const employeeSkills = await EmployeeSkillModel.aggregate([
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
                $match: {eId}
            },
            {
                $project: {
                    _id: 1,
                    eId: 1,
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
            data: employeeSkills,
        });
    } catch (error) {
        next(error);
    }
}


async function AddEmployeeSkill (req, res, next) {
    const eId = req.query.eId;
    if (!eId) {
        return res.status(400).json({
            message: 'employee id is required'
        })
    }
    const sId = req.query.sId;
    if (!sId) {
        return res.status(400).json({
            message: 'skill id is required'
        })
    }
    try {
        const employeeSkill = await EmployeeSkillModel.create({
            eId: eId,
            sId: sId
        });
        res.send({
            status: 200,
            message: "success",
            data: employeeSkill,
        });
    } catch (error) {
        next(error);
    }
}

async function RemoveEmployeeSkill(req, res, next) {
    const eId = req.query.eId;
    if (!eId) {
        return res.status(400).json({
            message: 'employee id is required'
        })
    }
    const sId = req.query.sId;
    if (!sId) {
        return res.status(400).json({
            message: 'skill id is required'
        })
    }
    try {
        const employeeSkill = await EmployeeSkillModel.findOneAndDelete({ eId: eId, sId: sId });
        if (!employeeSkill) {
            return res.status(404).json({
                message: 'employee skill not found'
            })
        }
        res.send({
            status: 200,
            message: "success",
            data: employeeSkill,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    GetEmployeeSkills,
    AddEmployeeSkill,
    RemoveEmployeeSkill
}