const skillModel = require('../models/skill.model');

async function GetAllSkills(req, res) {
    try {
        const skills = await skillModel.find();
        res.send({
            status: 200,
            message: "success",
            data: skills,
        });
    } catch (error) {
        next(error);
    }
}

async function GetSkillById(req, res, next) {
    try {
        const skill = await skillModel.find({id: req.params.id});
        if (!skill) {
            return next(new Error('Skill not found'));
        }
        res.send({
            status: 200,
            message: "success",
            data: skill,
        });
    } catch (error) {
        next(error);
    }
}

async function CreateSkill (req, res, next) {
    try {
        const name = req.body.name;
        if (!name) {
            return next(new Error('Skill name is required'));
        }
        const id = req.body.name.slice(0, 4).toUpperCase()+"001";
        const skill = await skillModel.create({
            id: id,
            name: name,
            description: req.body.description || "",
        });
        res.send({
            status: 200,
            message: "success",
            data: skill,
        });
    } catch (error) {
        next(error);
    }
}

async function UpdateSkillById(req, res, next) {
    try {
        const skill = await skillModel.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        if (!skill) {
            return next(new Error('Skill not found'));
        }
        res.send({
            status: 200,
            message: "success",
            data: skill,
        });
    } catch (error) {
        next(error);
    }
}

async function DeleteSkillById(req, res, next) {
    try {
        const skill = await skillModel.findOneAndDelete({ id: req.params.id });
        if (!skill) {
            return next(new Error('Skill not found'));
        }
        res.send({
            status: 200,
            message: "success",
        });
    } catch (error) {
        next(error);
    }
}


module.exports = {
    GetAllSkills,
    GetSkillById,
    CreateSkill,
    UpdateSkillById,
    DeleteSkillById
}
