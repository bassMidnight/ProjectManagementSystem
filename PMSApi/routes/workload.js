var express = require('express');
var router = express.Router();
var workloadcontroller = require('../controller/workload.js');

router.get('/', async function(req, res) {
    await workloadcontroller.GetEmployeeWorkload(req, res);
});

router.post('/', async function(req, res) {
    await workloadcontroller.CreateEmployeeWorkload(req, res);
});

router.put('/', async function(req, res) {
    await workloadcontroller.UpdateEmployeeWorkload(req, res);
});

router.delete('/', async function(req, res) {
    await workloadcontroller.DeleteEmployeeWorkload(req, res);
});

router.get('/latest', async function(req, res) {
    await workloadcontroller.GetlatestWorkload(req, res);
});

router.get('/memberworkload', async function(req, res) {
    await workloadcontroller.GetAllMembersAndWorkload(req, res);
});

router.get('/latestprojectworkload', async function(req, res) {
    await workloadcontroller.GetlatestProjectWorkload(req, res);
});

router.put('/edit', async function(req, res) {
    await workloadcontroller.DevWorkloadController(req, res);
});

module.exports = router;
