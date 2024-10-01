var express = require('express');
var router = express.Router();
var controller = require('../controller/employee.js');

router.get('/employee/:id', controller.GetEmployeeById);

router.post('/employee', controller.CreateEmployee);

router.put('/employee/:id', controller.UpdateEmployeeById);



module.exports = router;
