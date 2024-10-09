var express = require('express');
var router = express.Router();
var controller = require('../controller/employee.js');

router.get('/id', controller.GetEmployees);

router.get('/id/:id', controller.GetEmployeeById);

router.post('/id', controller.CreateEmployee);

router.put('/id/:id', controller.UpdateEmployeeById);

router.delete('/id/:id', controller.DeleteEmployeeById);

router.get('/projects', controller.GetEmployeeAllProject);

router.get('/workload', controller.GetEmployeeProjectMemberWorkload);
module.exports = router;
