var express = require('express');
var router = express.Router();
var controller = require('../controller/employee');
var employeeController = require('../controller/employee.js');
var employeeSkillController = require('../controller/employeeSkill.js');
const middleware = require('../middleware/auth.js');
//Employee
router.get('/', middleware.tokenValidator, async function(req, res) {
    await employeeController.GetEmployees(req, res);
});
router.get('/', middleware.tokenValidator, async function(req, res) {
    await employeeController.GetEmployeeById(req, res);
});
router.post('/', middleware.tokenValidator, async function(req, res) {
    await employeeController.CreateEmployee(req, res);
});
router.put('/', middleware.tokenValidator, async function(req, res) {
    await employeeController.UpdateEmployeeById(req, res);
});
router.delete('/', middleware.tokenValidator, async function(req, res) {
    await employeeController.DeleteEmployeeById(req, res);
});

//EmployeeSkill
router.get('/skills', middleware.tokenValidator, async function(req, res) {
    await employeeSkillController.GetEmployeeSkills(req, res);
});
router.post('/skills', middleware.tokenValidator, async function(req, res) {
    await employeeSkillController.AddEmployeeSkill(req, res);
});
router.delete('/skills', middleware.tokenValidator, async function(req, res) {
    await employeeSkillController.RemoveEmployeeSkill(req, res);
});

router.get('/workload', middleware.tokenValidator, async function(req, res) {
    await controller.GetEmployeeWorkload(req, res);
});
module.exports = router;
