const ProjectModel = require('../models/project.model');
const EmployeeModel = require('../models/employee.model'); // Import your Mongoose model
const WorkloadModel = require('../models/workload.model'); // Import your Mongoose model

let {getWeekNumber} = require('../utils/getWeekNumber');
async function GetEmployeeWorkload(req, res) {
    try {
        const workload = await workloadModel.find({ eId: req.params.eId });
        res.status(200).json({message:"success", data: workload});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function CreateEmployeeWorkload(req, res) {
    try {

        let currentWeek = getWeekNumber(new Date());
        const workload = await workloadModel.create({
            pId: req.params.pId,
            eId: req.params.eId,
            workload: req.body.workload,
            desc: req.body.desc,
            date: Date.now(),
            notation: req.body.notation,
            weekOfYear: currentWeek
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