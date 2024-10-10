var express = require('express');
var router = express.Router();
const skillController = require('../controller/skill.js');

router.get('/', skillController.GetAllSkills);
router.get('/byID', skillController.GetSkillById);
router.post('/', skillController.CreateSkill);
router.put('/', skillController.UpdateSkillById);
router.delete('/', skillController.DeleteSkillById);

module.exports = router;
