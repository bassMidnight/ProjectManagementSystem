var express = require('express');
var router = express.Router();

const controller = require('../controller/member.js');


// Adding a route for /api/
router.get('/', async function(req, res) {
    await controller.GetAllMembers(req, res);
});

router.get('/bydate', async function(req, res){
    await controller.GetAllMembersByDate(req, res);
});

router.get('/allprojects', async function(req, res){
    await controller.GetAllProjectsAndWorkload(req, res);
});

router.get('/allprojectsbydate', async function(req, res){
    await controller.GetAllProjectsAndWorkloadByDate(req, res);
});

router.get('/memberworkloadoverview', async function(req, res){
    await controller.GetMemberWorkloadOverview(req, res);
});

router.get('/memberworkloadoverviewmonthly', async function(req, res){
    await controller.GetMemberWorkloadOverviewMonthly(req, res);
});


//--------------------------------------------------------------------------------//

router.get('/currentworkload/:eid', async function(req, res){
    await controller.GetEmployeeCurrentWeeklyWorkload(req, res);
});

router.post('/currentworkload', async function(req, res){
    await controller.GetEmployeesCurrentWeeklyWorkload(req, res);
});

module.exports = router;