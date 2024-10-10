var express = require('express');
var router = express.Router();
var controller = require('../controller/employee');
var employeeController = require('../controller/employee.js');
var employeeSkillController = require('../controller/employeeSkill.js');

//Employee
router.get('/', employeeController.GetEmployees);
router.get('/', employeeController.GetEmployeeById);
router.post('/', employeeController.CreateEmployee);
router.put('/', employeeController.UpdateEmployeeById);
router.delete('/', employeeController.DeleteEmployeeById);

//EmployeeSkill
router.get('/skills', employeeSkillController.GetEmployeeSkills);
router.post('/skills', employeeSkillController.AddEmployeeSkill);
router.delete('/skills', employeeSkillController.RemoveEmployeeSkill);

router.get('/workload', controller.GetEmployeeProjectMemberWorkload);
module.exports = router;
