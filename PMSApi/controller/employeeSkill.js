const EmployeeSkillModel = require('../models/EmployeeSkill.model');
const skillModel = require('../models/skill.model');
const EmployeeModel = require('../models/employee.model');

async function GetEmployeeSkills (req, res, next) {
    const eId = req.query.eId ;
    if (!eId) {
        return res.status(400).json({
            message: 'employee id is required'
        });
    }
    try {
        const checkEmployee = await EmployeeModel.findOne({ eId });
        if (!checkEmployee) {
            return res.status(404).json({ message: 'employee not found' });
        }
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
        return res.status(500).json({ message: error.message });
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
        const checkEmployee = await EmployeeModel.findOne({ eId });
        if (!checkEmployee) {
            return res.status(404).json({ message: 'employee not found' });
        }
        const checkSkill = await skillModel.findOne({ id: sId });
        if (!checkSkill) {
            return res.status(404).json({ message: 'skill not found' });
        }

        const checkSkillEmployee = await EmployeeSkillModel.findOne({ eId: eId, sId: sId });
        if (checkSkillEmployee) {
            return res.status(400).json({ message: 'employee skill already exists' });
        }

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
        return res.status(500).json({ message: error.message });
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
        return res.status(500).json({ message: error.message });
    }
}

module.exports = {
    GetEmployeeSkills,
    AddEmployeeSkill,
    RemoveEmployeeSkill
}