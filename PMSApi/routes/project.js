var express = require('express');
var router = express.Router();

const controller = require('../controller/project.js');
const projectSkillController = require('../controller/projectSkill.js');

// Adding a route for /api/
router.get('/', controller.getProjects);

router.get('/projectByUser', controller.getProjectsByUser);

router.get('/userByProject', controller.getUserByProject);

//project skill route
router.get('/projectskill', async function(req, res) {
    const response = await projectSkillController.GetProjectSkills(req, res);
    res.status(200).json(response);
});

router.post('/projectskill', async function(req, res) {
    const response = await projectSkillController.AddProjectSkill(req, res);
    res.status(200).json(response);
});

router.delete('/projectskill', async function(req, res) {
    const response = await projectSkillController.RemoveProjectSkill(req, res);
    res.status(200).json(response);
});

module.exports = router;
