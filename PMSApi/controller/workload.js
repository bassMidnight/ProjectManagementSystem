const employeeModel = require('../models/employee.model');
const projectMemberModel = require('../models/projectMember.model');
const workloadModel = require('../models/workload.model');

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
        const workload = await workloadModel.create({
            pId: req.params.pId,
            eId: req.params.eId,
            workload: req.body.workload,
            desc: req.body.desc,
            date: Date.now(),
            notation: req.body.notation
        });
        res.status(200).json({message:"created successfully", data: workload});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function UpdateEmployeeWorkload(req, res) {
    try {
        const workload = await workloadModel.findOneAndUpdate({ eId: req.params.eId, pId: req.params.pId },
            req.body, { new: true });
        res.status(200).json({message:"updated successfully", data: workload});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function DeleteEmployeeWorkload(req, res) {
    try {
        const workload = await workloadModel.findOneAndDelete({ eId: req.params.eId, pId: req.params.pId });
        res.status(200).json("deleted successfully");
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// async function GetProjectMember(req, res) {
//     try {
//         // Find all project members with the given project ID
//         const members = await projectMemberModel.find({ pId: req.params.pId });
//         // Find all employees that are project members
//         const employees = await employeeModel.find({ eId: { $in: members.map(member => member.eId) } });
//         res.status(200).json({message:"success", data: employees});
//     }catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// }

module.exports = {
    GetEmployeeWorkload,
    CreateEmployeeWorkload,
    UpdateEmployeeWorkload,
    DeleteEmployeeWorkload
}