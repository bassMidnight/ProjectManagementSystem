const employeeModel = require("../models/employee.model");
const { dataNotFound } = require("../utils/response");
const employeeSkillModel = require("../models/EmployeeSkill.model");
const projectModel = require("../models/project.model");
const {weeklyMemberProjectQueryByWeek, weeklyMemberQueryByWeek, weeklyQueryByPId} = require("../utils/weeklyQuery");
const {getWeekNumber} = require("../utils/getWeekNumber");

async function GetEmployees (req, res, next) {
    if (req.query.eId) {
        return GetEmployeeById(req, res, next);
    }
    try {
        const employees = await employeeModel.find();
        res.send({
            status: 200,
            message: "success",
            data: employees,
        });
    } catch (error) {
        next(error);
    }
}

async function GetEmployeeById (req, res, next) {
    const eId = req.query.eId;
    const employee = await employeeModel.findOne({ eId });
    try {
        if (!employee) {
            return res.status(404).json({ message: "employee not found" });
        }
        res.send({
            status: 200,
            message: "success",
            data: employee,
        });
    } catch (error) {
        next(error);
    }
}

async function CreateEmployee (req, res, next) {
    try {
        const employee = await employeeModel.create(req.body);
        res.send({
            status: 200,
            message: "success",
            data: employee,
        });
    } catch (error) {
        next(error);
    }
}

async function UpdateEmployeeById (req, res, next) {
    try {
        const eId = req.query.eId;
        const employee = await employeeModel.findOneAndUpdate({ eId }, req.body, { new: true });
        if (!employee) {
            return res.status(404).json({ message: "employee not found" });
        }
        res.send({
            status: 200,
            message: "success",
            data: employee,
        });
    } catch (error) {
        next(error);
    }
}


async function DeleteEmployeeById (req, res, next) {
    try {
        const eId = req.query.eId;
        const employee = await employeeModel.findOneAndDelete({ eId });
        if (!employee) {
            return res.status(404).json({ message: "employee not found" });
        }
        res.send({
            status: 200,
            message: "success",
            data: employee,
        });
    } catch (error) {
        next(error);
    }
}


async function GetEmployeeAllProject(req, res, next) {
    try {
        const eId = req.query.id;
        if (!eId) {
            return res.status(400).json({ message: "required eId" });
        }
        const date = req.query.date;
        if (!date) {
            return res.status(400).json({ message: "required date" });
        }
        const week = getWeekNumber(new Date(date ? date : new Date()));
        const year = date ? new Date(date).getFullYear() : new Date().getFullYear();
        const projects = await weeklyMemberProjectQueryByWeek(eId, week, year);
        res.send({
            status: 200,
            message: "success",
            data: [projects],
        });
    } catch (error) {
        next(error);
    }
}

async function GetEmployeeProjectMemberWorkload(req, res, next) {
    try {
        const pId = req.query.id;
        if (!pId) {
            return res.status(400).json({ message: "required pId" });
        }
        const date = req.query.date;
        if (!date) {
            return res.status(400).json({ message: "required date" });
        }
        const week = getWeekNumber(new Date(date ? date : new Date()));
        const year = date ? new Date(date).getFullYear() : new Date().getFullYear();
        const projects = await weeklyQueryByPId(pId, week, year);
        res.send({
            status: 200,
            message: "success",
            data: [projects],
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    GetEmployees,
    GetEmployeeById,
    UpdateEmployeeById,
    CreateEmployee,
    DeleteEmployeeById,
    GetEmployeeAllProject,
    GetEmployeeProjectMemberWorkload
}