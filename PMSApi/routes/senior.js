var express = require('express');
var router = express.Router();

const controller = require('../controller/senior.js');

// senior Main page
router.get('/', async function(req, res) {
    const response = await controller.getProjects(req, res);
    res.status(200).json(response);
});

router.get('/projectGraph', async function(req, res) {
    const response = await controller.getGraph(req, res);
    res.status(200).json(response);
});

router.get('/projectMemberList', async function(req, res) {
    const response = await controller.getProjectMenberList(req, res);
    res.status(200).json(response);
});

router.get('/workloadMember', async function(req, res) {
    const response = await controller.getWorkLoad(req, res);
    res.status(200).json(response);
});

router.put('/workloadMember', async function (req, res) {
    const response = await controller.updateWorkLoad(req, res);
    res.status(200).json(response);
})

// senior history page

router.get('/employeeDropdown', async function (req, res) {
    const response = await controller.getEmpDropdown(req, res);
    res.status(200).json(response);
})

router.get('/projectDropdown', async function (req, res) {
    const response = await controller.getProjectDropdown(req, res);
    res.status(200).json(response);
})

router.get('/workloadHistory', async function (req, res) {
    const response = await controller.getWorkLoadHistory(req, res);
    res.status(200).json(response);
})

router.get('/workloadHistoryDetail', async function (req, res) {
    const response = await controller.getworkloadHistoryDetail(req, res);
    res.status(200).json(response);
})

module.exports = router;
