const express = require('express');
const router = express.Router();
var skillController = require('../controller/skill.js');

router.get('/', skillController.GetAllSkills);

router.get('/:id', skillController.GetSkillById);

router.post('/', skillController.CreateSkill);

router.put('/:id', skillController.UpdateSkillById);

router.delete('/:id', skillController.DeleteSkillById);

module.exports = router;
