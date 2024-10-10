var express = require('express');
var router = express.Router();

const controller = require('../controller/project.js');

// Adding a route for /api/
router.get('/', controller.getProjects);

router.get('/projectByUser', controller.getProjectsByUser);

router.get('/userByProject', controller.getUserByProject);

module.exports = router;
