var express = require('express');
var router = express.Router();
var controller = require('../controller/employee');
var employeeController = require('../controller/employee.js');
var employeeSkillController = require('../controller/employeeSkill.js');

//Employee
router.get('/', async function(req, res) {
    await employeeController.GetEmployees(req, res);
});
router.get('/', async function(req, res) {
    await employeeController.GetEmployeeById(req, res);
});
router.post('/', async function(req, res) {
    await employeeController.CreateEmployee(req, res);
});
router.put('/', async function(req, res) {
    await employeeController.UpdateEmployeeById(req, res);
});
router.delete('/', async function(req, res) {
    await employeeController.DeleteEmployeeById(req, res);
});

//EmployeeSkill
router.get('/skills', async function(req, res) {
    await employeeSkillController.GetEmployeeSkills(req, res);
});
router.post('/skills', async function(req, res) {
    await employeeSkillController.AddEmployeeSkill(req, res);
});
router.delete('/skills', async function(req, res) {
    await employeeSkillController.DeleteEmployeeSkill(req, res);
});

router.get('/workload', async function(req, res) {
    await controller.GetEmployeeWorkload(req, res);
});
module.exports = router;
