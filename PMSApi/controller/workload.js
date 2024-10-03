const ProjectModel = require('../models/project.model');
const EmployeeModel = require('../models/employee.model'); // Import your Mongoose model
const WorkloadModel = require('../models/workload.model'); // Import your Mongoose model

async function GetEmployeeWorkload (req, res, next) {
    const projectId = req.query.projectId;
    const employeeId = req.query.employeeId;
    try {
        const project = await ProjectModel.findOne({ pId: projectId });
        if (!project) {
            return res.status(404).send({
                status: 404,
                message: "project not found",
            });
        }
        const employee = await EmployeeModel.findOne({ eId: employeeId });
        if (!employee) {
            return res.status(404).send({
                status: 404,
                message: "employee not found",
            });
        }
        const workload = await WorkloadModel.findOne({pId: projectId, eId: employeeId });
        if (!workload) {
            return res.status(404).send({
                status: 404,
                message: "workload not found",
            });
        }
        res.send({
            status: 200,
            message: "success",
            data: workload,
        });
    } catch (error) {
        next(error);
    }
}

async function CreateEmployeeWorkload (req, res, next) {
    try {
        const pId = req.query.pId;
        const eId = req.query.eId;

        const project = await ProjectModel.findOne({ pId });
        if (!project) {
            return res.status(404).send({
                status: 404,
                message: "project not found",
            });
        }
        const employee = await EmployeeModel.findOne({ eId });
        if (!employee) {
            return res.status(404).send({
                status: 404,
                message: "employee not found",
            });
        }
        const workload = await WorkloadModel.create(req.body);
        res.send({
            status: 200,
            message: "success",
            data: workload,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    GetEmployeeWorkload,
    CreateEmployeeWorkload
}