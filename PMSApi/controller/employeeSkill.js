const EmployeeSkillModel = require('../models/EmployeeSkill.model');


async function GetEmployeeSkills (req, res, next) {
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
                $match: {eId: req.params.id}
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
    try {
        const employeeSkill = await EmployeeSkillModel.create({
            eId: req.params.eId,
            sId: req.query.sId
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
    try {
        const eId = req.query.eId ;
        const sId = req.query.sId ;
        const employeeSkill = await EmployeeSkillModel.findOneAndDelete({ eId: eId, sId: sId });
        if (!employeeSkill) {
            return res.status(404).send({
                status: 404,
                message: "employee skill not found",
            });
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