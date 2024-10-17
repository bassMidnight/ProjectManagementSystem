const skillModel = require('../models/skill.model');

async function GetAllSkills(req, res) {
    if (req.query.sId) {
        return GetSkillById(req, res);
    }
    try {
        const skills = await skillModel.find();
        res.send({
            status: 200,
            message: "success",
            data: skills,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

async function GetSkillById(req, res, next) {
    const id = req.query.sId;
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
        res.status(500).json({ message: error.message });
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
        // const id = req.body.name.slice(0, 4).toLowerCase()+"001";
        const skill = await skillModel.create({
            // id: id,
            name: name,
            description: req.body.description || "",
        });
        res.send({
            status: 200,
            message: "success",
            data: skill,
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

async function UpdateSkillById(req, res, next) {
    const id = req.query.sId;
    if (!id) {
        return res.status(400).json({
            message: 'Skill id is required'
        })
    }
    try {
        const data = {
            "name": req.body.name,
            "description": req.body.description||""
        }
        if (!data.name.trim()) {
            return res.status(400).json({
                message: 'Skill name is required'
            })
        }
        const skill = await skillModel.findOneAndUpdate({ id: id }, data, { new: true });
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
        return res.status(500).json({ message: error.message });
    }
}

async function DeleteSkillById(req, res, next) {
    const id = req.query.sId;
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
        return res.status(500).json({ message: error.message });
    }
}


module.exports = {
    GetAllSkills,
    GetSkillById,
    CreateSkill,
    UpdateSkillById,
    DeleteSkillById
}
