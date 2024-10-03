const Employee = require('../models/employee.model'); // Import your Mongoose model
const Project = require('../models/project.model'); // Import your Mongoose model for projects
const ProjectMember = require('../models/projectMember.model'); // Import your Mongoose model for project members
const employeeModel = require('../models/employee.model');
const workloadModel = require('../models/workload.model');

const weekNumber = require('../utils/getWeekNumber');

const { errServerResponse, successDataResponse, badRequest } = require('../utils/response');
async function getProjects(req, res) {
    
    const leadId = req.query.leadId || "";
    try {
        console.log("getProjects");

        if (!leadId) {
            return badRequest('leadId is required');
        }
        
        const currentDate = new Date();
        const currentWeek = weekNumber.getWeekNumber(currentDate);
        console.log("currentWeek : ", currentWeek);

        const projects = await Project.find({lead: leadId});
        const workloads = await workloadModel.find({ pId: { $in: projects.map(projects => projects.id) }});

        let result = [];
        for (const project of projects) {
            let data = {
                id: project.id,
                projectName: project.projectName,
                lead: project.lead,
                progress: project.progress,
                startDate: project.startDate,
                completeDate: project.completeDate,
                workloads: workloads.filter(workload => workload.pId == project.pId)
            }
            result.push(data);
        }
                
        return successDataResponse(result);
    } catch (error) {
        console.error(error);

        // return res.status(500).json({
        //     error: true,
        //     message: "Internal Server Error"
        // });
        return errServerResponse("Internal Server Error");
    }
}

async function getProjectByUser(req, res) {
    const userId = req.query.userId || "";

    try {
        if (!userId) {
            return res.status(400).json({
                error: true,
                message: "userId is required"
            });
        }

        // const userProjects = await Employee.find({ eId: userId });
        const userMembers = await ProjectMember.find({ eId: userId });
        const employees = await employeeModel.find({ eId: { $in: userMembers.map(member => member.eId) } });

        return successDataResponse(employees);
    } catch (error) {
        console.error(error);

        // return res.status(500).json({
        //     error: true,
        //     message: "Internal Server Error"
        // });
        return errServerResponse("Internal Server Error");
    }
}

async function getUserByProject(req, res) {
    const projectId = req.query.pId || "";

    try {
        if (!projectId) {
            return badRequest('projectId is required');
        }

        // const userProjects = await Employee.find({ eId: userId });
        const userMembers = await ProjectMember.find({ pId: projectId });
        const employees = await employeeModel.find({ eId: { $in: userMembers.map(member => member.eId) } });

        return {
            error: false,
            result: employees
        };
    } catch (error) {
        console.error(error);

        // return res.status(500).json({
        //     error: true,
        //     message: "Internal Server Error"
        // });

        return errServerResponse("Internal Server Error");
    }
}

// Export the function
module.exports = {
    getProjectByUser, 
    getProjects, 
    getUserByProject
};