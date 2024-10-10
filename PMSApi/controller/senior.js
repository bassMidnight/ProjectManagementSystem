const ProjectModel = require('../models/project.model');
const ProjectMemberModel = require('../models/projectMember.model');
const EmployeeModel = require('../models/employee.model');
const WorkloadModel = require('../models/workload.model');

const formarDate = require('../utils/formatDate');
const weekNumber = require('../utils/getWeekNumber');

const { errServerResponse, successDataResponse, badRequest } = require('../utils/response');

async function getProjects(req, res) {
    
    const leadId = req.query.leadId || "";
    let date = req.query.date;
    try {
        console.log("getProjects");

        if (!leadId) {
            throw new Error(`leader id is required`);
        }
        
        const currentDate = new Date(date);
        const currentYear = currentDate.getFullYear();
        let { startOfYear, endOfYear } = formarDate.getStartEndDateFromYear(currentYear);  
        // console.log(startOfYear, endOfYear);

        let currentWeek = weekNumber.getWeekNumber(currentDate);
        // console.log("currentWeek : ", currentWeek);

        const projects = await ProjectModel.find({lead: leadId});
        // console.log("projects : ", projects);
        
        let aggregatedWorkloads = await WorkloadModel.aggregate([
            {
                $match: {
                    pId: { $in: projects.map(project => project.id) },
                    weekOfYear: { $eq: currentWeek },
                    createdAt: { $gte: startOfYear, $lt: endOfYear }
                }
            },
            {
                $group: {
                    _id: "$pId", // กลุ่มข้อมูลตาม pId
                    avgWorkload: { $avg: "$workload" } // คำนวณค่าเฉลี่ยของ workload
                }
            }
        ]);
        // console.log(aggregatedWorkloads);
        
                  
        let result = [];
        for (const project of projects) {
            let data = {
                id: project.id,
                projectName: project.projectName,
                workload: "0.00"
            }
            
            for (const workload of aggregatedWorkloads) {
                if (project.id == workload._id) {
                    workload_data = workload.avgWorkload || 0.00
                    workload_data = workload_data.toFixed(2)
                    data.workload  = workload_data
                }
            }
            result.push(data);
        }
        res.status(200).json({
            error : false,
            message : "Success",
            data : result
        });
    } catch (error) {
        console.error(error);

        // return res.status(500).json({
        //     error: true,
        //     message: "Internal Server Error"
        // });
        // return errServerResponse("Internal Server Error");
        return res.status(500).json({ error: true, message: error.message });
    }
}

async function getGraph(req, res) {
    const projectId = req.query.pId || "";
    const graphMode = req.query.graphMode || "month";

    try {
        if (!projectId) {
            throw new Error(`project id is required`);
        }
        
        let workloads;

        if (graphMode === "month") {
            const currentDate = new Date();
            const currentWeek = weekNumber.getWeekNumber(currentDate);
            // console.log("currentWeek : ", currentWeek); 
            
            const currentYear = currentDate.getFullYear();
            let { startOfYear, endOfYear } = formarDate.getStartEndDateFromYear(currentYear);  
            workloads = await WorkloadModel.aggregate([
                {
                    $match: { 
                        pId: projectId , // กรองข้อมูลตาม pId ที่ต้องการ
                        weekOfYear: { $gte: currentWeek - 11 , $lte: currentWeek }, // กรองข้อมูลตาม 12 สัปดาห์ ย้อนหลัง
                        createdAt: { $gte: startOfYear, $lt: endOfYear }
                    } 
                },
                {
                    $group: {
                    _id: "$weekOfYear", // แบ่งข้อมูลตาม weekOfYear
                    avgWorkload: { $avg: "$workload" } // คำนวณค่าเฉลี่ยของ workload ในแต่ละ weekOfYear
                    }
                },
                {
                    $sort: { _id: 1 } // เรียงลำดับตาม weekOfYear จากมากไปน้อย
                }
            ]);
        } else if (graphMode === "year") {
            const twelveMonthsAgo = new Date();
            twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12); // 12 เดือนย้อนหลัง

            workloads = await WorkloadModel.aggregate([
                {
                    $match: {
                    pId: projectId, // กรองข้อมูลตาม pId ที่ต้องการ
                    datetime: { $gte: twelveMonthsAgo, $lte: new Date() } // กรองข้อมูล 12 เดือนย้อนหลังจากวันนี้
                    }
                },
                {
                    $group: {
                        _id: {
                          year: { $year: "$datetime" },
                          month: { $month: "$datetime" }
                        },
                        avgWorkload: { $avg: "$workload" }
                    }
                },
                {
                    $sort: { _id: 1 } // เรียงลำดับเดือนจากน้อยไปมาก (เก่าสุดไปใหม่สุด)
                }
            ]);
        }

        // return successDataResponse(workloads);
        res.status(200).json({ error: false, message: "success", data: workloads });
    } catch (error) {
        console.error(error);

        // return res.status(500).json({
        //     error: true,
        //     message: "Internal Server Error"
        // });
        // return errServerResponse("Internal Server Error");
        return res.status(500).json({ error: true, message: error.message });
    }
}

async function getProjectMenberList(req, res) {
    const projectId = req.query.pId || "";

    try {
        if (!projectId) {
            throw new Error(`project id is required`);
        }

        const currentDate = new Date();
        const currentWeek = weekNumber.getWeekNumber(currentDate);
        
        const members = await ProjectMemberModel.find({ pId: projectId });
        const employees = await EmployeeModel.find({ eId: { $in: members.map(member => member.eId) } });
        // console.log("employees : ", employees.map(employee => employee.eId));
        
        const workloads = await WorkloadModel.find({ 
            weekOfYear: currentWeek,
            eId: { $in: employees.map(employee => employee.eId) } // กรอง workload.eId ที่ตรงกับ employees.eId
        });

        // console.log("workloads : ", workloads);
        
        let result = [];
        for (const employee of employees) {
            let data = {
                id: employee.eId,
                name: employee.name,
                surname: employee.surname,
                position: employee.position,
                department: employee.department,
                workload: 0,
            }
            // for (const workload of workloads) {
            //     if(workload.eId == employee.eId) {
            //         data.workload = workload.workload;
            //     }
            // }
            for (let i = workloads.length - 1; i >= 0; i--) { // วนลูปย้อนกลับ
                if (workloads[i].eId == employee.eId) {
                    data.workload = workloads[i].workload;
                    workloads.splice(i, 1); // ลบค่าในตำแหน่งปัจจุบันออกจาก array
                }
            }
            

            result.push(data);
        }

        // return successDataResponse(result);
        res.status(200).json({ error: false, message: "success", data: result });
    } catch (error) {
        console.error(error);

        // return res.status(500).json({
        //     error: true,
        //     message: "Internal Server Error"
        // });
        // return errServerResponse("Internal Server Error");
        return res.status(500).json({ error: true, message: error.message });
    }

}
async function getWorkLoad(req, res) {
    const eId = req.query.eId || "";
    const pId = req.query.pId || "";

    try {
        if (!eId) {
            // return badRequest('employee id is required');
            throw new Error('employee id is required');
        }

        if (!pId) {
            // return badRequest('project id is required');
            throw new Error('project id is required');
        }

        const currentDate = new Date();
        const currentWeek = weekNumber.getWeekNumber(currentDate);
        const workloads = await WorkloadModel.find(
            { 
                eId: eId,
                pId: pId,
                weekOfYear: currentWeek,
            }
        );


        // return successDataResponse(workloads);
        return res.status(200).json({ error: false, message: "success", data: workloads });
    } catch (error) {
        console.error(error);

        // return res.status(500).json({
        //     error: true,
        //     message: "Internal Server Error"
        // });
        // return errServerResponse("Internal Server Error");
        return res.status(500).json({ error: true, message: error.message });
    }

}

async function updateWorkLoad(req, res) {
    // const eId = req.query.eId;
    // const pId = req.query.pId;
    let {
        eId,
        pId,
        workload,
        desc,
        notation
    } = req.body

    try {
        
        const currentDate = new Date()
        const currentWeek = weekNumber.getWeekNumber(currentDate);

        const insertOrUpdate = await WorkloadModel.updateOne(
            { 
                pId: pId,
                eId: eId,
                weekOfYear: currentWeek 
            }, // เงื่อนไขในการค้นหา
            { $set: {
                    eId: eId,
                    pId: pId,
                    workLoad : workload,
                    desc: desc,
                    notation: notation
                } 
            }, // การอัปเดตข้อมูล
            { upsert: true } // ถ้าไม่พบเอกสาร จะทำการสร้างเอกสารใหม่
        );

        // console.log("insertOrUpdate : ", insertOrUpdate);
        
        // return successDataResponse({
        //     message : `insert or update success`
        // });
        return res.status(200).json({ error: false, message: "insert or update success"});
    } catch (error) {
        console.error(error);
        // return errServerResponse("Internal Server Error");
        return res.status(500).json({ error: true, message: error.message });
    }
}

async function getEmpDropdown(req, res) {
    const leadId = req.query.leadId
    try {

        if (!leadId) {
            // return badRequest("lead id requried.")
            throw new Error("lead id requried.")
        }

        const projects = await ProjectModel.find({
            lead: leadId
        })
        // console.log("projects : ", projects);
        

        const members = await ProjectMemberModel.find(
            { pId : {$in : projects.map(project => project.id)} }
        )
        // console.log("members : ", members);
        

        const employees = await EmployeeModel.find(
            { eId : { $in : members.map(member => member.eId)}}
        )
        // console.log("employees : ", employees);
        

        let result = []
        for (const employee of employees) {
            let data = {
                eId : employee.eId,
                fullName : `${employee.name} ${employee.surname}`,
            }
            result.push(data)
        }

        // return successDataResponse(result);
        return res.status(200).json({ error: false, message: "success", data: result });
    } catch (error) {
        console.error(error);
        // return errServerResponse("Internal Server Error");
        return res.status(500).json({ error: true, message: error.message });
    }
}

async function getProjectDropdown(req, res) {
    const leadId = req.query.leadId || ""
    try {

        if (!leadId) {
            // return badRequest('lead id requried.')
            throw new Error('leader id requried.')
        }
        const projects = await ProjectModel.find({
            lead: leadId
        })

        let result = []
        for (const project of projects) {
            data = {
                pId : project.id,
                projectName : project.projectName
            }
            result.push(data)
        }

        // return successDataResponse(result);
        return res.status(200).json({ error: false, message: "success", data: result });
    } catch (error) {
        console.error(error);
        return errServerResponse("Internal Server Error");
    }
}

async function getWorkLoadHistory(req, res) {
    const { leadId, projectId, employeeId } = req.query;

    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    let offset = (page - 1) * size;

    try {
        if (!leadId) {
            // return badRequest('leadId is required.');
            throw new Error('leader id is required.');
        }

        const projects = await ProjectModel.find({ lead: leadId });
        const workloadQuery = { pId: { $in: projects.map(project => project.id) } };
        if (projectId) {
            workloadQuery.id = projectId;
        }
        if (employeeId) {
            workloadQuery.eId = employeeId;
        }

        const workloads = await WorkloadModel.find(workloadQuery).skip(offset).limit(size).sort({ createdAt: -1 });
        const workloadtotal = await WorkloadModel.countDocuments(workloadQuery);

        const employees = await EmployeeModel.find({ eId: { $in: workloads.map(workload => workload.eId) } });
        // console.log(employees);
        
        const result = workloads.map(workload => ({
            id: workload._id,
            desc: workload.desc,
            createdAt: workload.createdAt,
            eFullName: employees.find(employee => employee.eId === workload.eId)
                ? `${employees.find(employee => employee.eId === workload.eId).name} ${employees.find(employee => employee.eId === workload.eId).surname}`
                : '',
            eShortName: employees.find(employee => employee.eId === workload.eId)
                ? employees.find(employee => employee.eId === workload.eId).shortname
                : '',
            projectName: projects.find(project => project.id === workload.pId)
                ? projects.find(project => project.id === workload.pId).projectName
                : '',
        }));

        // return successDataResponse({
        //     result : result,
        //     total : result.length,
        //     totalAll : workloadtotal
        // });
        return res.status(200).json({ 
            error: false, 
            message: "success", 
            data: {
                result : result,
                total : result.length,
                totalAll : workloadtotal
            } 
        });
    } catch (error) {
        console.log(error);
        
        return errServerResponse("Internal Server Error");
    }
}

async function getworkloadHistoryDetail(req, res) {
    const workloadId = req.query.workloadId || ""

    try {
        if (!workloadId) {
            // return badRequest('workload id is required.');
            throw new Error('workload id is required.');
        }
        
        const workload = await WorkloadModel.findOne({
            _id: workloadId
        })

        // return successDataResponse(workload);
        return res.status(200).json({ error: false, message: "success", data: workload });
    } catch (error) {
        return errServerResponse("Internal Server Error");
    }
}

async function addEmployeeToProject(req, res) {
    const employeeId = req.query.eId;
    const projectId = req.query.pId;

    if (!employeeId) {
        // return badRequest('Employee ID is required.');
        throw new Error('Employee ID is required.');
    }

    if (!projectId) {
        // return badRequest('Project ID is required.');
        throw new Error('Project ID is required.');
    }

    try {
        const employee = await EmployeeModel.findOne({ eId: employeeId });
        if (!employee) {
            // return errServerResponse('Employee not found.');
            throw new Error('Employee not found.');
        }

        const project = await ProjectModel.findOne({ id: projectId });
        if (!project) {
            // return errServerResponse('Project not found.');
            throw new Error('Project not found.');
        }

        const newEmployeeProject = await ProjectMemberModel.create({
            eId: employeeId,
            pId: projectId
        });

        if (!newEmployeeProject) {
            return errServerResponse('Failed to add employee to project.');
        }

        // return successDataResponse({
        //     message: 'Employee added to project successfully.'
        // });
        return res.status(200).json({ error: false, message: "Employee added to project successfully."});
    } catch (error) {
        console.log(error);
        
        return errServerResponse('Internal Server Error');
    }
}

async function deleteEmployeeFromProject(req, res) {
    const employeeId = req.query.eId;
    const projectId = req.query.pId;

    if (!employeeId) {
        // return badRequest('Employee ID is required.');
        throw new Error('Employee ID is required.');
    }

    if (!projectId) {
        // return badRequest('Project ID is required.');
        throw new Error('Project ID is required.');
    }

    try {
        const employee = await EmployeeModel.findOne({ eId: employeeId });
        if (!employee) {
            return errServerResponse('Employee not found.');
        }

        const project = await ProjectModel.findOne({ id: projectId });
        if (!project) {
            return errServerResponse('Project not found.');
        }

        const deleteResult = await ProjectMemberModel.findOneAndDelete({
            eId : employeeId,
            pId : projectId
        });

        if (!deleteResult) {
            return errServerResponse('Failed to delete employee from project.');
        }

        // return successDataResponse({
        //     message: 'Employee deleted from project successfully.'
        // });
        return res.status(200).json({ error: false, message: "Employee deleted from project successfully."});
    } catch (error) {
        return errServerResponse('Internal Server Error');
    }
}

async function getAllEmployee(req, res) {
    const employeeName = req.query.employeeName;

    try {
        const employees = await EmployeeModel.aggregate([
            {
                $addFields: {
                    fullName: { $concat: ["$name", " ", "$surname"] } // รวม name กับ surname เข้าด้วยกัน
                }
            },
            {
                $match: {
                    fullName: { 
                        $regex: employeeName ? employeeName : '', // ค้นหาตาม employeeName
                        $options: 'i' // ไม่สนใจตัวพิมพ์เล็ก-ใหญ่
                    }
                }
            },
            {
                $project: {
                    eId : 1,
                    name : 1,
                    surname : 1,
                }
            }
        ]);

        let result = employees.map(employee => ({
            eId : employee.eId,
            fullName : `${employee.name} ${employee.surname}`,
        }));
        
        // return successDataResponse(result);
        return res.status(200).json({ error: false, message: "success", data: result });
    } catch (error) {
        // return errServerResponse('Internal Server Error');
        return res.status(500).json({ error: true, message: error.message });
    }
}

// Export the function
module.exports = {
    getProjects,
    getGraph,
    getProjectMenberList,
    getWorkLoad,
    updateWorkLoad,
    getEmpDropdown,
    getProjectDropdown,
    getWorkLoadHistory,
    getworkloadHistoryDetail,
    addEmployeeToProject,
    deleteEmployeeFromProject,
    getAllEmployee
};