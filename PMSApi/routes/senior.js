var express = require('express');
var router = express.Router();

const controller = require('../controller/project.js');

// Adding a route for /api/
router.get('/', async function(req, res) {
    const response = await controller.getProjects(req, res);
    res.status(200).json(response);
});

router.get('/projectByUser', async function(req, res) {
    const response = await controller.getProjectByUser(req, res);
    res.status(200).json(response);
});

router.get('/userByProject', async function(req, res) {
    const response = await controller.getUserByProject(req, res);
    res.status(200).json(response);
});

module.exports = router;
