var express = require('express');
var router = express.Router();
var controller = require('../controller/workload.js');

router.get('/:eId', controller.GetEmployeeWorkload);

router.post('/:pId/:eId', controller.CreateEmployeeWorkload);

router.put('/:pId/:eId', controller.UpdateEmployeeWorkload);

router.delete('/:pId/:eId', controller.DeleteEmployeeWorkload);

module.exports = router;
