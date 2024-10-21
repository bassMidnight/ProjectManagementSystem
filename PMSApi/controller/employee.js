const employeeModel = require("../models/employee.model");
const { weeklyMemberProjectQueryByWeek, weeklyMemberQueryByWeek, weeklyQueryByPId } = require("../utils/weeklyQuery");
const { getWeekNumber } = require("../utils/getWeekNumber");
const workloadModel = require("../models/workload.model");
const e = require("express");
const projectModel = require("../models/project.model");
const projectMemberModel = require("../models/projectMember.model");

async function GetEmployees(req, res, next) {
    if (req.query.eId) {
        return GetEmployeeById(req, res, next);
    }
    try {
        const employees = await employeeModel.find().lean();
        res.send({
            status: 200,
            message: "success",
            data: employees,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

async function GetEmployeeById(req, res, next) {
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
        return res.status(500).json({ message: error.message });
    }
}

async function CreateEmployee (req, res, next) {

    let {
        eId,
        name,
        surname,
        shortname,
        branch,
        position,
        department,
        one_mail,
        role,
        startDate
    } = req.body;

    if (!eId) {
        return res.status(400).json({ message: 'eId is required' });
    }

    if (!one_mail) {
        return res.status(400).json({ message: 'one_mail is required' });
    }

    if (!name || !surname) {
        return res.status(400).json({ message: 'name and surname are required' });
    }

    if (!startDate) {
        return res.status(400).json({ message: 'startDate is required' });
    }

    const startDateObj = new Date(startDate);
    
    try {
        const employee = await employeeModel.create({
            eId,
            name,
            surname,
            shortname,
            branch,
            position,
            department,
            one_mail,
            role,
            startDate: startDateObj
        });
        res.send({
            status: 200,
            message: "success",
            data: employee,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

async function UpdateEmployeeById(req, res, next) {
    const eId = req.body.eId;
    if (!eId) {
        return res.status(400).json({ message: "required eId" });
    }
    const one_mail = req.body.one_mail;
    if (!one_mail) {
        return res.status(400).json({ message: "required one_mail" });
    }
    try {
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
        return res.status(500).json({ message: error.message });
    }
}


async function DeleteEmployeeById(req, res, next) {
    try {
        const eId = req.query.eId;
        const employee = await employeeModel.delete({ eId });
        if (!employee) {
            return res.status(404).json({ message: "employee not found" });
        }
        res.send({
            status: 200,
            message: "success",
            data: employee,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

async function restoreEmployeeById(req, res) {
    const eId = req.query.eId;
    if (!eId) {
        return res.status(400).json({ message: "required employee id" });
    }
    try {
        const restoredEmployee = await employeeModel.restore({ eId });
        if (!restoredEmployee) {
            return res.status(404).json({ message: "employee not found" });
        }
        res.send({
            status: 200,
            message: "success",
            data: restoredEmployee,
        })
        
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: error.message });
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
        return res.status(500).json({ message: error.message });
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
        return res.status(500).json({ message: error.message });
    }
}


// Get Employee Workload by eId
async function GetEmployeeWorkloadHistory(req, res, next) {
    const { employeeId, projectId } = req.query;

    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    let offset = (page - 1) * size;

    try {
        if (!employeeId) {
            throw new Error("Employee ID is required.");
        }

        const workloadQuery = { eId: employeeId };
        if (projectId) {
            workloadQuery.pId = projectId;
        }

        const workloads = await workloadModel.find(workloadQuery)
            .skip(offset)
            .limit(size)
            .sort({ createdAt: -1 });

        const workloadTotal = await workloadModel.countDocuments(workloadQuery);

        const employee = await employeeModel.findOne({ eId: employeeId });

        const projectIds = [...new Set(workloads.map(workload => workload.pId))];
        const projects = await projectModel.find({ id: { $in: projectIds } });

        const result = workloads.map(workload => {
            const project = projects.find(p => p.id === workload.pId);
            return {
                id: workload._id,
                desc: workload.desc,
                notation: workload.notation,
                createdAt: workload.createdAt,
                employeeId: workload.eId,
                employeeFullName: employee ? `${employee.name} ${employee.surname}` : "",
                employeeShortName: employee ? employee.shortname : "",
                projectName: project ? project.projectName : "",
                projectId: workload.pId,
                workload: workload.workload,
                weekofyear: workload.weekOfYear
            };
        });

        return res.status(200).json({
            error: false,
            message: "success",
            data: {
                result: result,
                total: result.length,
                totalAll: workloadTotal,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: error.message });
    }
}


module.exports = {
    GetEmployees,
    GetEmployeeById,
    UpdateEmployeeById,
    CreateEmployee,
    DeleteEmployeeById,
    restoreEmployeeById,
    GetEmployeeAllProject,
    GetEmployeeProjectMemberWorkload,
    GetEmployeeWorkloadHistory
}