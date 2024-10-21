const ProjectMember = require("../models/projectMember.model")
const Project = require("../models/project.model")
const Employee = require("../models/employee.model")
const EmployeeSkillModel = require('../models/EmployeeSkill.model');
const Skill = require("../models/skill.model")
const Workload = require("../models/workload.model")

const { getWeekNumber } = require("../utils/getWeekNumber")
const { weeklyQueryByEId, weeklyQueryByEIds, 
        weeklyQueryWorkloadByPIds, weeklyQueryByEIdAndPId,
        weeklyMemberQueryByWeek, weeklyMemberProjectQueryByWeek,
        weeklyMemberProjectQueryByWeeks, MemberWorkloadOverview,
        MemberWorkloadOverviewMonthly, MemberWorkloadOverviewTwelveMonths,
        weeklyMemberQueryByWeekByNameOrProject, weeklyMemberQueryByWeekWithoutLead
    } = require("../utils/weeklyQuery");
const workloadModel = require("../models/workload.model");

async function GetAllMembers(req, res) {
    try {
        let lead = req.query.lead;
        let date = req.query.date;
        let members = [];
        let currentWeek = getWeekNumber(date ? new Date(date) : new Date());
        if (!lead){
            members = await weeklyMemberQueryByWeekWithoutLead(currentWeek,date ? new Date(date).getFullYear() : new Date().getFullYear());
        
        }
        else{
            members = await weeklyMemberQueryByWeek(lead,currentWeek,date ? new Date(date).getFullYear() : new Date().getFullYear());
        }
        res.status(200).json({
            status: "200",
            message: "success",
            data: {length:members.length,members:members}

        });
    } catch (err) {
        console.error("Error in GetAllMembers:", err);
        res.status(500).json({ status: "500", message: "An error occurred while fetching all members" });
    }
}

async function GetAllMembersByNameOrProject(req,res){
    try {
        let lead = req.query.lead;
        let name = req.query.name;
        console.log(name);
        
        let projectName = req.query.projectName;
        let date = req.query.date;
        let currentWeek = getWeekNumber(date ? new Date(date) : new Date());
        const members = await weeklyMemberQueryByWeekByNameOrProject(lead,currentWeek,date ? new Date(date).getFullYear() : new Date().getFullYear(),projectName,name);
        res.status(200).json({
            status: "200",
            message: "success",
            data: {length:members.length,members:members}
        });
    }
    catch (err) {
        console.error("Error in GetAllMembersByNameOrProject:", err);
        res.status(500).json({ status: "500", message: "An error occurred while fetching all members by name or project" });
    }
}

async function GetAllProjectsAndWorkload(req, res) {
    try {
        let eId = req.query.eid;
        let date = req.query.date;
        let currentWeek = getWeekNumber(date ? new Date(date) : new Date());
        
        const projects = await weeklyMemberProjectQueryByWeek(eId, currentWeek,date ? new Date(date).getFullYear() : new Date().getFullYear());

        res.status(200).json({
            status: "200",
            message: "success",
            data: projects
        });
    } catch (err) {
        console.error("Error in GetAllProjectsAndWorkload:", err);
        res.status(500).json({ status: "500", message: "An error occurred while fetching all projects and their workloads" });
    }
}

async function GetMemberWorkloadOverview(req, res) {
    try {
        // get member workload overview for a specific member in 12 weeks for every project and average workload
        
        let eId = req.query.eid;
        let mode = req.query.mode;
        let currentWeek = getWeekNumber(new Date());
        let year = new Date().getFullYear();
        let weeks = [];
        for (let i = 0; i < 12; i++) {
            weeks.push(currentWeek - i);
        }

        const projects = await MemberWorkloadOverview(eId, weeks, year);

        res.status(200).json({
            status: "200",
            message: "success",
            data: projects
        });

    } catch (err) {
        console.error("Error in GetMemberWorkloadOverview:", err);
        res.status(500).json({ status: "500", message: "An error occurred while fetching member workload overview" });
    }
}

async function GetMemberWorkloadOverviewMonthly(req, res) {
    try {
        let eId = req.query.eid;
        let date = req.query.date? new Date(req.query.date) : new Date();
        let month = date.getMonth() + 1;
        let months = [];
        for (let i = 0; i < 12; i++) {
            months.push(month - i);
        }
        console.log(month);
        let year = date.getFullYear();
        console.log(year);
        const projects = await MemberWorkloadOverviewMonthly(eId, months ,year);
        res.status(200).json({
            status: "200",
            message: "success",
            data: projects
        });
    } catch (err) {
        console.error("Error in GetMemberWorkloadOverviewMonthly:", err);
        res.status(500).json({ status: "500", message: "An error occurred while fetching member workload overview monthly" });
    }
}


//--------------------------------------------------------------------------------//


// get all project with workload
async function GetAllMembersByDate(req, res) {
    try {
        // yyyy-mm-dd
        let date = req.query.date;
        let lead = req.query.lead;
        let Week = getWeekNumber(new Date(date));
        // Join projects and project members and get employee details no workload
        const members = await weeklyMemberQueryByWeek(lead,Week);

        res.status(200).json({
            status: "200",
            message: "success",
            data: {length:members.length,members:members}

        });
    } catch (err) {
        console.error("Error in GetAllMembers:", err);
        res.status(500).json({ status: "500", message: "An error occurred while fetching all members" });
    }
}

async function GetAllProjectsAndWorkloadByDate(req, res) {
    try {
        let date = req.query.date;
        let eId = req.query.eid;
        let Week = getWeekNumber(new Date(date));
        
        const projects = await weeklyMemberProjectQueryByWeek(eId, Week);

        res.status(200).json({
            status: "200",
            message: "success",
            data: projects
        });
    } catch (err) {
        console.error("Error in GetAllProjectsAndWorkloadByDate:", err);
        res.status(500).json({ status: "500", message: "An error occurred while fetching all projects and their workloads by date" });
    }   
}



async function GetEmployeeCurrentWeeklyWorkload(req, res) {
    try {
        const eId = req.params.eid;
        if(!eId){
            return res.status(400).json({
                status: "400",
                message: "No employee id provided",
                data: []
            });
        }
        const today = new Date();
        const currentWeek = getWeekNumber(today);

        const responseData = await weeklyQueryByEId(eId, currentWeek);

        const safeResponse = {
            status: "200",
            message: "success",
            data: {
                employeeId: responseData.employeeId,
                workload: responseData.workload
            }
        };

        res.status(200).json(safeResponse);
    } catch (err) {
        console.error("Error in GetEmployeeWeeklyWorkload:", err);
        res.status(500).json({ status: "500", message: "An error occurred while fetching employee's weekly workload" });
    }
}

async function GetEmployeesCurrentWeeklyWorkload(req, res) {
    try {
        const eIds = req.body.eIds;
        if(!eIds){
            return res.status(400).json({
                status: "400",
                message: "No employee id provided",
                data: []
            });
        }
        const today = new Date();
        const currentWeek = getWeekNumber(today);

        const responseData = await weeklyQueryByEIds(eIds, currentWeek);

        const safeResponse = {
            status: "200",
            message: "success",
            data: responseData
        };

        res.status(200).json(safeResponse);
    } catch (err) {
        console.error("Error in GetEmployeeCurrentWeeklyWorkload:", err);
        res.status(500).json({ status: "500", message: "An error occurred while fetching employee's weekly workload" });
    }
}

async function getAllMembersAndWorkload(req, res) {
    try {
        const members = await ProjectMember.find();
        const workloads = await Promise.all(members.map(member => GetEmployeeCurrentWeeklyWorkload(member.eId)));
        res.status(200).json({
            status: "200",
            message: "success",
            data: workloads
        });
    } catch (err) {
        console.error("Error in getAllMembersAndWorkload:", err);
        res.status(500).json({ status: "500", message: "An error occurred while fetching all members and their workloads" });
    }
}

async function GetMembersBySkill(req, res, next) {
    const sId = req.query.sId;
    if (!sId) {
        return res.status(400).json({
            message: 'skill id is required'
        })
    }
    try {
        const employeeBySkill = await EmployeeSkillModel.find({ sId: sId });
        const employeeIds = employeeBySkill.map(item => item.eId);
        const employees = await Employee.find({ eId: { $in: employeeIds } });
        const workloads = await workloadModel.find({ eId: { $in: employeeIds } });

        const result = {
            status: "200",
            message: "success",
            data: {
                length: employees.length,
                members: employees.map(employee => {
                    const employeeWorkloads = workloads.filter(w => w.eId === employee.eId);
                    return {
                        _id: employee.eId,
                        employeeName: employee.name,
                        employeeSurname: employee.surname,
                        employeeShortName: employee.shortname,
                        employeePosition: employee.position,
                        employeeStartDate: employee.startDate,
                        employeeOneId: employee.branch,
                        employeeDepartment: employee.department,
                        workload: employeeWorkloads.length > 0 
                            ? employeeWorkloads.reduce((sum, w) => sum + w.workload, 0) / employeeWorkloads.length 
                            : 0
                    };
                })
            }
        };

        res.send({
            status: 200,
            message: "success",
            data: result,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// Helper function to get the week number

module.exports = {
    GetAllMembers,
    GetAllMembersByDate,
    GetAllProjectsAndWorkload,
    GetAllProjectsAndWorkloadByDate,
    GetEmployeeCurrentWeeklyWorkload,
    GetEmployeesCurrentWeeklyWorkload,
    GetMemberWorkloadOverview,
    GetMemberWorkloadOverviewMonthly,
    GetAllMembersByNameOrProject,
    GetMembersBySkill
}
