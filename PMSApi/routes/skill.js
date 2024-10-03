var express = require('express');
var router = express.Router();
const skillController = require('../controller/skill.js');

router.get('/', skillController.GetAllSkills);
router.get('/:id', skillController.GetSkillById);
router.post('/', skillController.CreateSkill);
router.put('/:id', skillController.UpdateSkillById);
router.delete('/:id', skillController.DeleteSkillById);

module.exports = router;
