const fs = require('node:fs');
const csv = require('csv-parser');
const Employee = require('../models/employee.model'); // Import your Mongoose model
const Project = require('../models/project.model'); // Import your Mongoose model for projects
const ProjectMember = require('../models/projectMember.model'); // Import your Mongoose model for project members
const { set } = require('mongoose');

async function csvToDatabase() {
    const columnMapping = {
        "โปรเจกต์ที่กำลังทำ": "projectName",
        "รหัสพนักงาน": "eId",
        "หัวหน้างาน ": "lead",
        // Add other mappings as necessary
    };

    const projectData = []; // Array to hold project data temporarily
    const existingEmployees = await Employee.find({}, { eId: 1, name: 1, surname: 1 }); // Fetch eId, name, and surname
    const employeeMap = existingEmployees.reduce((acc, employee) => {
        const fullName = `${employee.name} ${employee.surname}`; // Combine name and surname
        acc[fullName] = employee.eId; // Map full name to eId
        return acc;
    }, {});

    return new Promise((resolve, reject) => {
        fs.createReadStream("./data.csv",)
            .pipe(csv())
            .on('data', async (data) => {
                const mappedData = {};
                let name, surname;
                let projectName;
                let lead;
                for (const csvKey in columnMapping) {
                    if (data[csvKey]) {
                        //console.log(csvKey)
                        if (csvKey === "หัวหน้างาน ") {
                            lead = employeeMap[data[csvKey]];
                        } else if (csvKey === "โปรเจกต์ที่กำลังทำ") {
                            projectName = data[csvKey];
                        } else if (csvKey === "รหัสพนักงาน") {
                            mappedData["eId"] = data[csvKey];
                        }
                    }
                }

                const projectID = projectName.slice(0, 3) + "001"; // Generate projectID
                projectData.push({ projectID, projectName, lead, eId: mappedData.eId }); // Store project data
            })
            .on('end', async () => {
                try {
                    for (const project of projectData) {
                        // Create or find the project
                        let projectDoc = await Project.findOne({ id: project.projectID }); // Check by projectID
                        if (!projectDoc) {
                            projectDoc = await Project.findOne({ projectName: project.projectName }); // Check by projectName
                        }
                        if (!projectDoc) { // Only create if it doesn't exist
                            projectDoc = new Project({ id: project.projectID, projectName: project.projectName, lead: project.lead }); // Create new project
                            await projectDoc.save();
                        }

                        // Create project member entry
                        const projectMember = new ProjectMember({ pId: projectDoc.id, eId: project.eId }); // Link member to project
                        await projectMember.save();
                    }

                    resolve(projectData); // Return the inserted data
                } catch (err) {
                    console.error(err);
                    reject(err); // Reject the promise on error
                }
            })
            .on('error', (err) => {
                console.error(err);
                reject(err); // Reject the promise on error
            });
    });
}
// Export the function
module.exports = csvToDatabase;