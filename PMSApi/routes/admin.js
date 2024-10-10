var express = require('express');
var router = express.Router();

const controller = require('../controller/admin');

// senior Main page
router.get('/',  controller.getProjectOrLead ); 
router.get('/historyList', controller.getHistory );
router.get('/employeeDropdown', controller.getEmployeeDropdown );
router.get('/projectDropdown', controller.getProjectDropdown );

module.exports = router;
