const skillModel = require('../models/skill.model');
const { badRequest, dataNotFound } = require('../utils/response');

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
    const id = req.query.skillID;
    if (!id) {
        return badRequest('Skill id is required');
    }
    try {
        const skill = await skillModel.find({id: id});
        if (!skill) {
            return dataNotFound('Skill not found');
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
    const name = req.body.name;
    if (!name) {
        return badRequest('Skill name is required');
    }
    try {
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
    const id = req.query.skillID;
    if (!id) {
        return badRequest('Skill id is required');
    }
    try {
        const skill = await skillModel.findOneAndUpdate({ id: id }, req.body, { new: true });
        if (!skill) {
            return badRequest('Skill id was required');
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
    const id = req.query.skillID;
    if (!id) {
        return badRequest('Skill id is required');
    }
    try {
        const skill = await skillModel.findOneAndDelete({ id: id});
        if (!skill) {
            return badRequest('Skill id was required');
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
