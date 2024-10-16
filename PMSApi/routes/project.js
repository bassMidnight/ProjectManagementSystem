var express = require('express');
var router = express.Router();

const controller = require('../controller/project.js');
const projectSkillController = require('../controller/projectSkill.js');

// Adding a route for /api/
router.get('/', controller.getProjects);

router.post('/', controller.CreateProject);

router.get('/projectByUser', controller.getProjectsByUser);

router.get('/userByProject', controller.getUserByProject);

//project skill route
router.get('/projectskill', async function(req, res) {
    await projectSkillController.GetProjectSkills(req, res);
});

router.post('/projectskill', async function(req, res) {
    await projectSkillController.AddProjectSkill(req, res);
});

router.delete('/projectskill', async function(req, res) {
    await projectSkillController.RemoveProjectSkill(req, res);
});

module.exports = router;
