const Employee = require('../models/employee.model'); // Import your Mongoose model
const Project = require('../models/project.model'); // Import your Mongoose model for projects
const ProjectMember = require('../models/projectMember.model'); // Import your Mongoose model for project members

async function getProjects(req, res) {
    try {
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
                    // console.log("project.id : ", project.id);
                    console.log("Member.pId : ", Member._id);
                    console.log("Member.eId : ", Member.eId);
                    console.log("Member.pId : ", Member.pId);
                    
                    dataMember.push({
                        id: Member.id,
                        eId: Member.eId,
                        pId: Member.pId,
                    })

                    for (const employee of employees) {
                        if (Member.eId == employee.eId) {
                            dataMember.push({
                                name: employee.name,
                                surname: employee.surname,
                            })
                        }
                    }
                }
                data.projectmember = dataMember
            }
            result.push(data);
        }
        
        return {
            error: false,
            message: `success`,
            result: result
        };
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: true,
            message: "Internal Server Error"
        });
    }
}

async function getProjectByUser(req, res) {
    const userId = req.query.userId;

    try {
        const userProjects = await Employee.find({ eId: userId });

        return {
            error: false,
            result: userProjects
        };
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: true,
            message: "Internal Server Error"
        });
    }
}

// Export the function
module.exports = {getProjectByUser, getProjects};