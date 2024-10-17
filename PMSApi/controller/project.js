const Employee = require('../models/employee.model'); // Import your Mongoose model
const Project = require('../models/project.model'); // Import your Mongoose model for projects
const ProjectMember = require('../models/projectMember.model'); // Import your Mongoose model for project members
const employeeModel = require('../models/employee.model');
async function getProjects(req, res) {
    try {
        const projects = await Project.find();
        const projectMembers = await ProjectMember.find();
        const employees = await Employee.find();

        const result = projects.map(project => ({
            id: project.id,
            projectName: project.projectName,
            lead: project.lead,
            projectMembers: projectMembers
                .filter(member => member.pId === project.id)
                .map(member => ({
                    id: member.id,
                    eId: member.eId,
                    pId: member.pId,
                    employee: employees.find(employee => employee.eId === member.eId),
                })),
        }));

        return res.status(200).json({ error: false, message: "success", data: result });
    } catch (error) {
        return res.status(500).json({ error: true, message: error.message });
    }
}

async function getProjectsByUser(req, res) {
    const userId = req.query.userId;

    if (!userId) {
        return res.status(400).json({ error: true, message: 'userId is required' });
    }

    try {
        const projectMembers = await ProjectMember.find({ eId: userId });
        const projects = await Project.find({ id: { $in: projectMembers.map(member => member.pId) } });

        return res.status(200).json({ error: false, message: 'success', data: projects });
    } catch (error) {
        return res.status(500).json({ error: true, message: error.message });
    }
}

async function getUserByProject(req, res) {
    const projectId = req.query.projectId;

    if (!projectId) {
        return res.status(400).json({ error: true, message: 'projectId is required' });
    }

    try {
        const projectMembers = await ProjectMember.find({ pId: projectId });
        const employeeIds = projectMembers.map(member => member.eId);
        const employees = await employeeModel.find({ eId: { $in: employeeIds } });

        return res.status(200).json({ error: false, message: 'success', data: employees });
    } catch (error) {
        return res.status(500).json({ error: true, message: error.message });
    }
}

// Create a new project
async function CreateProject(req, res) {
    const projectName = req.body.projectName;
    const lead = req.body.lead;
    const startDate = req.body.startDate||'';
    const completeDate = req.body.completeDate||'';
    var id = req.body.id||'';
    if (!projectName || !lead) {
        return res.status(400).json({ error: true, message: 'projectName and lead are required' });
    }
    if (!id) {
        let random = Math.floor(Math.random() * 9000) + 1000;
        id = projectName.slice(0, 3) + random;
        let idcheck = await Project.findOne({id});
        while (idcheck) {
            random = Math.floor(Math.random() * 9000) + 1000;
            id = projectName.slice(0, 3) + random;
            idcheck = await Project.findOne({id});
        }
    }
    try {
        const idcheck2 = await Project.findOne({id});
        if (idcheck2) {
            return res.status(400).json({ error: true, message: 'id already exist' });
        }
        const newProject = await Project.create({ id, projectName, lead ,startDate, completeDate});
        return res.status(200).json({error: false, message: 'Create success', data: newProject });
    } catch (error) {
        return res.status(500).json({error: true, message: error.message });
    }
}

async function UpdateProject(req, res) {
    const projectName = req.body.projectName;
    const lead = req.body.lead;
    const startDate = req.body.startDate||'';
    const completeDate = req.body.completeDate||'';
    const projectId = req.query.projectId;


    if (!projectId) {
        return res.status(400).json({ error: true, message: 'id is required' });
    }
    try {
        const pId = req.body.id;
        const idcheck = await Project.findOne({id: pId});
        if (idcheck) {
            return res.status(400).json({ error: true, message: 'projectId already exist, please use new id' });
        }
        const updatedProject = await Project.findOneAndUpdate({id: projectId}, { id: pId, projectName, lead ,startDate, completeDate}, { new: true });
        return res.status(200).json({error: false, message: 'Update success', data: updatedProject });
    } catch (error) {
        return res.status(500).json({error: true, message: error.message });
    }
}

async function DeleteProject(req, res) {
    const id = req.query.id;
    if (!id) {
        return res.status(400).json({ error: true, message: 'id is required' });
    }
    try {
        const deletedProject = await Project.findOneAndDelete({id});
        if (!deletedProject) {
            return res.status(404).json({error: true, message: 'Project not found' });
        }
        return res.status(200).json({error: false, message: 'Delete success', data: deletedProject });
    } catch (error) {
        return res.status(500).json({error: true, message: error.message });
    }
}

// Export the function
module.exports = {
    getProjects,
    getProjectsByUser,
    getUserByProject,

    CreateProject,
    UpdateProject,
    DeleteProject
};