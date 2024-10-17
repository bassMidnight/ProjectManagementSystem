var express = require('express');
var router = express.Router();

const controller = require('../controller/member.js');
const middleware = require('../middleware/auth.js');

// Adding a route for /api/
router.get('/', middleware.tokenValidator, async function(req, res) {
    await controller.GetAllMembers(req, res);
});

router.get('/bydate', middleware.tokenValidator, async function(req, res){
    await controller.GetAllMembersByDate(req, res);
});

router.get('/allprojects', middleware.tokenValidator, async function(req, res){
    await controller.GetAllProjectsAndWorkload(req, res);
});

router.get('/allprojectsbydate', middleware.tokenValidator, async function(req, res){
    await controller.GetAllProjectsAndWorkloadByDate(req, res);
});

router.get('/memberworkloadoverview', middleware.tokenValidator, async function(req, res){
    await controller.GetMemberWorkloadOverview(req, res);
});

router.get('/memberworkloadoverviewmonthly', middleware.tokenValidator, async function(req, res){
    await controller.GetMemberWorkloadOverviewMonthly(req, res);
});

router.get('/findmember', middleware.tokenValidator, async function(req, res){
    await controller.GetAllMembersByNameOrProject(req, res);
});
//--------------------------------------------------------------------------------//

router.get('/currentworkload/:eid', middleware.tokenValidator, async function(req, res){
    await controller.GetEmployeeCurrentWeeklyWorkload(req, res);
});

router.post('/currentworkload', middleware.tokenValidator, async function(req, res){
    await controller.GetEmployeesCurrentWeeklyWorkload(req, res);
});



module.exports = router;