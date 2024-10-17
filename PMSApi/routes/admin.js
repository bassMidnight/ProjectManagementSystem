var express = require('express');
var router = express.Router();

const controller = require('../controller/admin');
const middleware = require('../middleware/auth');
// senior Main pageconst 
router.get('/', middleware.tokenValidator,  controller.getProjectOrLead); 
router.get('/historyList', middleware.tokenValidator, controller.getHistory );
router.get('/employeeDropdown', middleware.tokenValidator, controller.getEmployeeDropdown );
router.get('/projectDropdown', middleware.tokenValidator, controller.getProjectDropdown );

module.exports = router;
