var express = require('express');
var router = express.Router();
const workloadController = require('../controller/workload.js');


router.get('/weekly/:page', workloadController.GetEmployeeWorkload)
router.post('/weekly', workloadController.CreateEmployeeWorkload)

module.exports = router;
