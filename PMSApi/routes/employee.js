var express = require('express');
var router = express.Router();
var controller = require('../controller/employee.js');

router.get('/', controller.GetEmployees);

router.get('/:id', controller.GetEmployeeById);

router.post('/', controller.CreateEmployee);

router.put('/:id', controller.UpdateEmployeeById);

router.delete('/:id', controller.DeleteEmployeeById);



module.exports = router;
