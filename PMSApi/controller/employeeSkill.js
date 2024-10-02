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

async function CreateEmployeeSkill (req, res, next) {
    try {
        const employeeSkill = await EmployeeSkillModel.create(req.body);
        res.send({
            status: 200,
            message: "success",
            data: employeeSkill,
        });
    } catch (error) {
        next(error);
    }
}

async function UpdateEmployeeSkill(req, res, next) {
    try {
        const id = req.params.id;
        const employeeSkill = await EmployeeSkillModel.findOneAndUpdate({ _id: id }, req.body, { new: true });
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

async function DeleteEmployeeSkill(req, res, next) {
    try {
        const id = req.params.id;
        const employeeSkill = await EmployeeSkillModel.findOneAndDelete({ _id: id });
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
    CreateEmployeeSkill,
    UpdateEmployeeSkill,
    DeleteEmployeeSkill
}