var express = require('express');
var router = express.Router();

const controller = require('../controller/project.js');
const projectSkillController = require('../controller/projectSkill.js');

const middleware = require('../middleware/auth.js');

// Adding a route for /api/
router.get('/', middleware.tokenValidator, controller.getProjects);

router.get('/projectByUser', middleware.tokenValidator, controller.getProjectsByUser);

router.get('/userByProject', middleware.tokenValidator, controller.getUserByProject);

//project skill route
router.get('/projectskill', middleware.tokenValidator, async function(req, res) {
    await projectSkillController.GetProjectSkills(req, res);
});

router.post('/projectskill', middleware.tokenValidator, async function(req, res) {
    await projectSkillController.AddProjectSkill(req, res);
});

router.delete('/projectskill', middleware.tokenValidator, async function(req, res) {
    await projectSkillController.RemoveProjectSkill(req, res);
});

module.exports = router;
