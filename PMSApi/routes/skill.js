var express = require('express');
var router = express.Router();
const skillController = require('../controller/skill.js');
const middleware = require('../middleware/auth.js');

router.get('/', middleware.tokenValidator ,async function(req, res) {
    await skillController.GetAllSkills(req, res);
});
router.get('/byID', middleware.tokenValidator, async function(req, res) {
    await skillController.GetSkillById(req, res);
});
router.post('/', middleware.tokenValidator, async function(req, res) {
    await skillController.CreateSkill(req, res);
});
router.put('/', middleware.tokenValidator, async function(req, res) {
    await skillController.UpdateSkillById(req, res);
});
router.delete('/', middleware.tokenValidator, async function(req, res) {
    await skillController.DeleteSkillById(req, res);
});
router.put('/restore', middleware.tokenValidator, async function(req, res) {
    await skillController.DeleteSkillById(req, res);
});
module.exports = router;
