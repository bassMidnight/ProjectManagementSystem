const ProjectMember = require("../models/projectMember.model")
const Project = require("../models/project.model")
const Employee = require("../models/employee.model") // Assuming you have this model
const { getWeekNumber } = require("../utils/getWeekNumber")
const Workload = require("../models/workload.model")
const { weeklyQueryByEId, weeklyQueryByEIds, 
        weeklyQueryWorkloadByPIds, weeklyQueryByEIdAndPId,
        weeklyMemberQueryByWeek, weeklyMemberProjectQueryByWeek} = require("../utils/weeklyQuery")

async function GetAllMembers(req, res) {
    try {
        let lead = req.query.lead;
        let date = req.query.date;
        let currentWeek = getWeekNumber(date ? new Date(date) : new Date());
        const members = await weeklyMemberQueryByWeek(lead,currentWeek);

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
async function GetAllProjectsAndWorkload(req, res) {
    try {
        let eId = req.query.eid;
        let date = req.query.date;
        let currentWeek = getWeekNumber(date ? new Date(date) : new Date());
        
        const projects = await weeklyMemberProjectQueryByWeek(eId, currentWeek);

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


// Helper function to get the week number

module.exports = {
    GetAllMembers,
    GetAllMembersByDate,
    GetAllProjectsAndWorkload,
    GetAllProjectsAndWorkloadByDate,
    GetEmployeeCurrentWeeklyWorkload,
    GetEmployeesCurrentWeeklyWorkload,
}
