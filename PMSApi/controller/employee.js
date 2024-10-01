const employeeModel = require("../models/employee.model");

async function GetEmployeeById (req, res, next) {
    try {
        const id = req.params.id;
        const employee = await employeeModel.findOne({ eId: id });
        if (!employee) {
            return res.status(404).send({
                status: 404,
                message: "employee not found",
            });
        }
        res.send({
            status: 200,
            message: "success",
            data: [employee],
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
            data: [employee],
        });
    } catch (error) {
        next(error);
    }
}

async function UpdateEmployeeById (req, res, next) {
    try {
        const id = req.params.id;
        const employee = await employeeModel.findOneAndUpdate({ eId: id }, req.body, { new: true });
        if (!employee) {
            return res.status(404).send({
                status: 404,
                message: "employee not found",
            });
        }
        res.send({
            status: 200,
            message: "success",
            data: [employee],
        });
    } catch (error) {
        next(error);
    }
}


module.exports = {
    GetEmployeeById,
    UpdateEmployeeById,
    CreateEmployee
}