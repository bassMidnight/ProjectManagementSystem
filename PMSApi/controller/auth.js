const jwt = require("jsonwebtoken");
const config = require("../config/auth.config");
const oneApi = require("../utils/one_api");
const decodeJWT = require("../middleware/jwt_decoder");

const employeeModel = require("../models/employee.model");
const EmployeeSkillModel = require('../models/EmployeeSkill.model');
const Skill = require("../models/skill.model");
exports.loginHandler = async (req, res) => {
    let tag = "loginWithOne: ";
    const { username, password } = req.body;

    if(!username || !password){
        return res.status(400).send({ 
            error: true,
            message: "Require username/password in field."
        });
    }

    try {
        await oneApi.loginWithUsername(username, password, async (error, result) => {
            if (error) {
                console.error(tag, "error.message=", error.message);
                return res.status(500).send({ 
                    error: true,
                    message: error.message
                });
            } else if (result.data.result === 'Success') {

                let { access_token } = result.data;
                
                //get user data from one id
                await oneApi.getProfileWithShareToken(access_token, async (error_profile, result_profile) => {
                    if (error_profile) {
                        console.error(tag, "error_profile = ", error_profile.message);
                    } else {
                        const { id, thai_email, account_title_th, first_name_th, last_name_th } = result_profile;
                        // console.log(result_profile);
                        
                        //check existing user
                        // const user = await employeeModel.findOne({ one_id: id });
                        const user = await employeeModel.findOne({ one_mail: thai_email });
                        
                        if (user) {
                            const token = jwt.sign({ id: user.id, oneId: user.one_id, roleName: user.role_name }, config.secret, { 
                                algorithm: 'HS256',
                                allowInsecureKeySizes: true,
                                expiresIn: "1d"
                            });
                            
                            req.session.token = token;

                            return res.status(200).send({
                                error: false,
                                message: 'Authorized.',
                                user: {
                                    userId: user.id || "",
                                    eId: user.eId || "",
                                    oneId: user.one_id || "",
                                    oneMail: user.one_mail || "",
                                    firstName: first_name_th || "",
                                    lastName: last_name_th || "",
                                    roleName: user.role || "",
                                    phoneNumber: user.phoneNumber || "",
                                    access_token: access_token
                                },
                                token,
                            });
                        } else {

                            return res.status(401).send({
                                error: true,
                                message: "Unauthorized",
                                detail: "user not found."
                            });

                            // const user = await employeeModel.create({
                            //     one_id: id,
                            //     one_mail: thai_email,
                            //     title: account_title_th,
                            //     name: first_name_th,
                            //     surname: last_name_th,
                            //     role: "dev",
                            // });

                            // const token = jwt.sign({ id: user.id, oneId: user.one_id, roleName: user.role_name }, config.secret, { 
                            //     algorithm: 'HS256',
                            //     allowInsecureKeySizes: true,
                            //     expiresIn: "1d" 
                            // });

                            // req.session.token = token;

                            // return res.status(200).send({
                            //     error: false,
                            //     message: 'Authorized.',
                            //     user: {
                            //         userId: user.id || "",
                            //         eId: user.eId || "",
                            //         oneId: user.one_id || "",
                            //         oneMail: user.one_mail || "",
                            //         firstName: first_name_th || "",
                            //         lastName: last_name_th || "",
                            //         roleName: user.role || "",
                            //         phoneNumber: user.phoneNumber || "",
                            //         access_token: access_token
                            //     },
                            //     token,
                            // });
                        }
                    }
                })
            } else {
                return res.status(401).send({
                    error: true,
                    message: "Unauthorized",
                    detail: "login failed."
                });
            }
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            error: true,
            message: error.message
        });
    }
};

exports.changeRole = async (req, res) => {
    const { employeeId, roleName } = req.body;

    if (!employeeId || !roleName) {
        return res.status(400).send({
            error: true,
            message: "Require employeeId/roleName in field.",
        });
    }

    if (roleName !== 'dev' && roleName !== 'lead' && roleName !== 'admin') {
        return res.status(400).send({
            error: true,
            message: "Invalid roleName.",
        });
    }

    try {
        const user = await employeeModel.findOneAndUpdate(
            { eId: employeeId },
            { roleName },
            { new: true },
        );

        if (!user) {
            return res.status(404).send({
                error: true,
                message: "User not found.",
            });
        }

        res.status(200).send({
            error: false,
            message: 'Change role success.',
            user,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: true,
            message: error.message,
        });
    }
};

exports.getProfile = async (req, res) => {
    const one_id = req.query.one_id;
    if (!one_id) {
        console.log("one id is required");
        return res.status(400).json({ error: true, message: "No one id provided" });
    }

    try {
        
        const users = await employeeModel.find({
            one_id 
        });
        const skillEmployee = await EmployeeSkillModel.find({
            eId : {$in: users.map(users => users.eId)}
        })
        const skills = await Skill.find({
            id : {$in: skillEmployee.map(skillEmployee => skillEmployee.sId)}
        })

        let result = {}
        for (const user of users) {
            result.eId = user.eId || ""
            result.name = user.name || ""
            result.surname = user.surname || ""
            result.shortname = user.shortname || ""
            result.branch = user.branch || ""
            result.position = user.position || ""
            result.department = user.department || ""
            result.one_mail = user.one_mail || ""
        }

        let skilldata = []
        for (const skill of skills) {
            let data = {
                id: skill.id,
                name: skill.name,
                description: skill.description
            }
            skilldata.push(data)
        }

        result.skill = skilldata

        return res.status(200).json({ error: false, data: result });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: error.message });
    }
}

exports.updateProfile = async (req, res) => {
    const {
        one_id,
        eId,
        branch,
        position,
        department,
        shortname
    } = req.body;

    if (!one_id) {
        return res.status(400).json({ error: true, message: "No one id provided" });
    }

    if (!eId) {
        return res.status(400).json({ error: true, message: "No employee id provided" });
    }

    if (!branch) {
        return res.status(400).json({ error: true, message: "No branch provided" });
    }

    if (!position) {
        return res.status(400).json({ error: true, message: "No position provided" });
    }

    if (!department) {
        return res.status(400).json({ error: true, message: "No department provided" });
    }

    try {
        const user = await employeeModel.findOneAndUpdate(
            { one_id },
            {
                eId,
                branch,
                position,
                department,
                shortname
            },
            { new: true }
        ).exec();

        if (!user) {
            return res.status(404).json({ error: true, message: "User not found" });
        }

        return res.status(200).json({ error: false, message: "Update profile data success", data: user });
    } catch (error) {
        return res.status(500).json({ error: true, message: error.message });
    }
}
