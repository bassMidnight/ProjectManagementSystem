var express = require('express');
var router = express.Router();

const controller = require('../controller/senior');

// senior Main page
router.get('/',  controller.getProjects ); 
router.get('/projectGraph', controller.getGraph );
router.get('/projectMemberList', controller.getProjectMenberList );
router.get('/workloadMember', controller.getWorkLoad );
router.put('/workloadMember', controller.updateWorkLoad ); // 

// senior history page

router.get('/employeeDropdown', controller.getEmployeeDropdown );
router.get('/projectDropdown', controller.getProjectDropdown );
router.get('/workloadHistory', controller.getWorkLoadHistory );
router.get('/workloadHistoryDetail', controller.getworkloadHistoryDetail );

// add - remove employee from project

router.get('/allEmployee', controller.getAllEmployee );
router.post('/employeeProject', controller.addEmployeeToProject );
router.delete('/employeeProject', controller.deleteEmployeeFromProject );

// add - remove employee from project list

router.post('/employeeListProject', controller.addEmployeesListToProject );
router.delete('/employeeListProject', controller.deleteEmployeesListFromProject );

module.exports = router;
