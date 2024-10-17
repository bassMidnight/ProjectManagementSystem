var express = require('express');
var router = express.Router();
var workloadcontroller = require('../controller/workload.js');
const middleware = require('../middleware/auth.js');

router.get('/', middleware.tokenValidator, async function(req, res) {
    await workloadcontroller.GetEmployeeWorkload(req, res);
});

router.post('/', middleware.tokenValidator, async function(req, res) {
    await workloadcontroller.CreateEmployeeWorkload(req, res);
});

router.put('/', middleware.tokenValidator, async function(req, res) {
    await workloadcontroller.UpdateEmployeeWorkload(req, res);
});

router.delete('/', middleware.tokenValidator, async function(req, res) {
    await workloadcontroller.DeleteEmployeeWorkload(req, res);
});

router.get('/latest', middleware.tokenValidator, async function(req, res) {
    await workloadcontroller.GetlatestWorkload(req, res);
});

router.get('/memberworkload', middleware.tokenValidator, async function(req, res) {
    await workloadcontroller.GetAllMembersAndWorkload(req, res);
});

router.get('/latestprojectworkload', middleware.tokenValidator, async function(req, res) {
    await workloadcontroller.GetlatestProjectWorkload(req, res);
});

router.put('/edit', middleware.tokenValidator, async function(req, res) {
    await workloadcontroller.DevWorkloadController(req, res);
});

module.exports = router;
