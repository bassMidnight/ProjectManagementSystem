const Employee = require('../models/employee.model'); // Import your Mongoose model
const Project = require('../models/project.model'); // Import your Mongoose model for projects
const ProjectMember = require('../models/projectMember.model'); // Import your Mongoose model for project members
const employeeModel = require('../models/employee.model');

const { errServerResponse, successDataResponse } = require('../function/response');
async function getProjects(req, res) {
    try {
        console.log("getProjects");
        
        const projects = await Project.find();
        const projectmember = await ProjectMember.find();
        const employees = await Employee.find();
        
        let result = [];
        for (const project of projects) {
            
            let data = {
                id: project.id,
                projectName: project.projectName,
                lead: project.lead,
            }
            for (const Member of projectmember) {
                let dataMember = []
                if (project.id == Member.pId) {
                    
                    let memberData = {
                        id: Member.id,
                        eId: Member.eId,
                        pId: Member.pId,
                    }

                    let dataEmployee = []
                    let i = 0
                    for (const employee of employees) {
                        if (Member.eId == employee.eId) {
                            console.log(employee.eId);
                            console.log(employee.name);
                            console.log(employee.surname);
                            
                            let employeeData = {
                                eId: employee.eId,
                                name: employee.name,
                                surname: employee.surname,
                            }
                            dataEmployee.push(employeeData)
                            i++
                        }
                    }
                    console.log("-------------------------------------");
                    
                    // console.log("i = " + i);
                    
                    memberData.employee = dataEmployee
                    dataMember.push(memberData)

                }
                data.projectmember = dataMember
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