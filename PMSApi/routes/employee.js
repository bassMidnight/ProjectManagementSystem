var express = require('express');
var router = express.Router();
var employeeController = require('../controller/employee.js');
var employeeSkillController = require('../controller/employeeSkill.js');

//Employee
router.get('/', employeeController.GetEmployees);
router.get('/:id', employeeController.GetEmployeeById);
router.post('/', employeeController.CreateEmployee);
router.put('/:id', employeeController.UpdateEmployeeById);
router.delete('/:id', employeeController.DeleteEmployeeById);

//EmployeeSkill
router.get('/:id/skills', employeeSkillController.GetEmployeeSkills);
router.post('/:eId/skills', employeeSkillController.AddEmployeeSkill);
router.delete('/:eid/skills', employeeSkillController.RemoveEmployeeSkill);

module.exports = router;
