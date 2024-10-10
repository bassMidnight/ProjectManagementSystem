var express = require('express');
var router = express.Router();
const skillController = require('../controller/skill.js');

router.get('/', async function(req, res) {
    await skillController.GetAllSkills(req, res);
});
router.get('/byID', async function(req, res) {
    await skillController.GetSkillById(req, res);
});
router.post('/', async function(req, res) {
    await skillController.CreateSkill(req, res);
});
router.put('/', async function(req, res) {
    await skillController.UpdateSkillById(req, res);
});
router.delete('/', async function(req, res) {
    await skillController.DeleteSkillById(req, res);
});

module.exports = router;
