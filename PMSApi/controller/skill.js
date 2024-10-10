const skillModel = require('../models/skill.model');

async function GetAllSkills(req, res) {
    if (req.query.sId) {
        await GetSkillById(req, res);
    }
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
        return res.status(400).json({
            message: 'Skill id is required'
        });
    }
    try {
        const skill = await skillModel.find({id: id});
        if (!skill) {
            return res.status(404).json({
                message: 'Skill not found'
            });
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
        return res.status(400).json({
            message: 'Skill name is required'
        })
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
        return res.status(400).json({
            message: 'Skill id is required'
        })
    }
    try {
        const skill = await skillModel.findOneAndUpdate({ id: id }, req.body, { new: true });
        if (!skill) {
            return res.status(404).json({
                message: 'Skill not found'
            })
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
        return res.status(400).json({
            message: 'Skill id is required'
        })
    }
    try {
        const skill = await skillModel.findOneAndDelete({ id: id});
        if (!skill) {
            return res.status(404).json({
                message: 'Skill not found'
            })
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
