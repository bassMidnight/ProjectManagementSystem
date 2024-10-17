var express = require('express');
var router = express.Router();

const controller = require('../controller/senior');
const middleware = require('../middleware/auth');

// senior Main page
router.get('/', middleware.tokenValidator,  controller.getProjects ); 
router.get('/projectGraph', middleware.tokenValidator, controller.getGraph );
router.get('/projectMemberList', middleware.tokenValidator, controller.getProjectMenberList );
router.get('/workloadMember', middleware.tokenValidator, controller.getWorkLoad );
router.put('/workloadMember', middleware.tokenValidator, controller.updateWorkLoad ); // 

// senior history page

router.get('/employeeDropdown', middleware.tokenValidator, controller.getEmployeeDropdown );
router.get('/projectDropdown', middleware.tokenValidator, controller.getProjectDropdown );
router.get('/workloadHistory', middleware.tokenValidator, controller.getWorkLoadHistory );
router.get('/workloadHistoryDetail', middleware.tokenValidator, controller.getworkloadHistoryDetail );

// add - remove employee from project

router.get('/allEmployee', middleware.tokenValidator, controller.getAllEmployee );
router.post('/employeeProject', middleware.tokenValidator, controller.addEmployeeToProject );
router.delete('/employeeProject', middleware.tokenValidator, controller.deleteEmployeeFromProject );

module.exports = router;
