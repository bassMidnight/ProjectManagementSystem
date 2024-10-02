var express = require('express');
var router = express.Router();
var employeeController = require('../controller/employee.js');
var employeeSkillController = require('../controller/employeeSkill.js');
var workloadController = require('../controller/workload.js');

//Employee
router.get('/', employeeController.GetEmployees);
router.get('/:id', employeeController.GetEmployeeById);
router.post('/', employeeController.CreateEmployee);
router.put('/:id', employeeController.UpdateEmployeeById);
router.delete('/:id', employeeController.DeleteEmployeeById);



router.get('/workload', workloadController.GetEmployeeWorkloadWeek);
// router.get('/workload/:pId/:eId', workloadController.GetEmployeeWorkloadByProjectId);
// router.post('/workload/:pId/:eId', workloadController.CreateEmployeeWorkload);
// router.put('/workload/:pId/:eId', workloadController.UpdateEmployeeWorkload);
// router.delete('/workload/:pId/:eId', workloadController.DeleteEmployeeWorkload);


router.get('/:id/skills', employeeSkillController.GetEmployeeSkills);

router.post('/skills', employeeSkillController.CreateEmployeeSkill);

module.exports = router;
