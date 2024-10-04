const Employee = require('../models/employee.model'); // Import your Mongoose model
const Project = require('../models/project.model'); // Import your Mongoose model for projects
const ProjectMember = require('../models/projectMember.model'); // Import your Mongoose model for project members
const employeeModel = require('../models/employee.model');
const workloadModel = require('../models/workload.model');

const formarDate = require('../utils/formatDate');
const weekNumber = require('../utils/getWeekNumber');

const { errServerResponse, successDataResponse, badRequest } = require('../utils/response');

async function getProjects(req, res) {
    
    const leadId = req.query.leadId || "";
    let date = req.query.date;
    try {
        console.log("getProjects");

        if (!leadId) {
            return badRequest('leadId is required');
        }
        
        const currentDate = new Date(date);
        const currentYear = currentDate.getFullYear();
        let { startOfYear, endOfYear } = formarDate.getStartEndDateFromYear(currentYear);  
        // console.log(startOfYear, endOfYear);

        let currentWeek = weekNumber.getWeekNumber(currentDate);
        // console.log("currentWeek : ", currentWeek);

        const projects = await Project.find({lead: leadId});
        // console.log("projects : ", projects);
        
        let aggregatedWorkloads = await workloadModel.aggregate([
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
        
                  
        let result = [];
        for (const project of projects) {
            let data = {
                id: project.id,
                projectName: project.projectName,
                workload: "0"
            }
            
            for (const workload of aggregatedWorkloads) {
                if (project.id == workload._id) {
                    data.workload = workload.avgWorkload.toFixed(2)
                }
            }
            result.push(data);
        }
                
        return successDataResponse({
            result: result, 
        });
    } catch (error) {
        console.error(error);

        // return res.status(500).json({
        //     error: true,
        //     message: "Internal Server Error"
        // });
        return errServerResponse("Internal Server Error");
    }
}

async function getGraph(req, res) {
    const projectId = req.query.pId || "";
    const graphMode = req.query.graphMode || "month";

    try {
        if (!projectId) {
            return badRequest('project id is required');
        }
        
        let workloads;

        if (graphMode === "month") {
            const currentDate = new Date();
            const currentWeek = weekNumber.getWeekNumber(currentDate);
            const currentYear = currentDate.getFullYear();
            let { startOfYear, endOfYear } = formarDate.getStartEndDateFromYear(currentYear);  
            workloads = await workloadModel.aggregate([
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

            workloads = await workloadModel.aggregate([
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

        return successDataResponse(workloads);
    } catch (error) {
        console.error(error);

        // return res.status(500).json({
        //     error: true,
        //     message: "Internal Server Error"
        // });
        return errServerResponse("Internal Server Error");
    }
}

async function getProjectMenberList(req, res) {
    const projectId = req.query.pId || "";

    try {
        if (!projectId) {
            return badRequest('project id is required');
        }

        const currentDate = new Date();
        const currentWeek = weekNumber.getWeekNumber(currentDate);
        
        const members = await ProjectMember.find({ pId: projectId });
        const employees = await employeeModel.find({ eId: { $in: members.map(member => member.eId) } });
        // console.log("employees : ", employees.map(employee => employee.eId));
        
        const workloads = await workloadModel.find({ 
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
async function getWorkLoad(req, res) {
    const eId = req.query.eId || "";
    const pId = req.query.pId || "";

    try {
        if (!eId) {
            return badRequest('employee id is required');
        }

        if (!pId) {
            return badRequest('project id is required');
        }

        const currentDate = new Date();
        const currentWeek = weekNumber.getWeekNumber(currentDate);
        const workloads = await workloadModel.find(
            { 
                eId: eId,
                pId: pId,
                weekOfYear: currentWeek,
            }
        );


        return successDataResponse(workloads);
    } catch (error) {
        console.error(error);

        // return res.status(500).json({
        //     error: true,
        //     message: "Internal Server Error"
        // });
        return errServerResponse("Internal Server Error");
    }

}

async function updateWorkLoad(req, res) {
    // const eId = req.query.eId;
    // const pId = req.query.pId;
    let {
        eId,
        pId,
        workload,
        detail,
        notations
    } = req.body

    try {
        
        const currentDate = new Date()
        const currentWeek = weekNumber.getWeekNumber(currentDate);

        const insertOrUpdate = await workloadModel.updateOne(
            { 
                pId: pId,
                eId: eId,
                weekOfYear: currentWeek 
            }, // เงื่อนไขในการค้นหา
            { $set: {
                    eId: eId,
                    pId: pId,
                    workLoad : workload,
                    desc: detail,
                    notation: notations
                } 
            }, // การอัปเดตข้อมูล
            { upsert: true } // ถ้าไม่พบเอกสาร จะทำการสร้างเอกสารใหม่
        );

        // console.log("insertOrUpdate : ", insertOrUpdate);
        
        return successDataResponse({
            message : `insert or update success`
        });
    } catch (error) {
        console.error(error);
        return errServerResponse("Internal Server Error");
    }
}

async function getEmpDropdown(req, res) {
    const leadId = req.query.leadId
    try {

        if (!leadId) {
            return badRequest("lead id requried.")
        }

        const projects = await Project.find({
            lead: leadId
        })
        // console.log("projects : ", projects);
        

        const members = await ProjectMember.find(
            { pId : {$in : projects.map(project => project.id)} }
        )
        // console.log("members : ", members);
        

        const employees = await employeeModel.find(
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

        return successDataResponse(result);
    } catch (error) {
        console.error(error);
        return errServerResponse("Internal Server Error");
    }
}

async function getProjectDropdown(req, res) {
    const leadId = req.query.leadId || ""
    try {

        if (!leadId) {
            return badRequest('lead id requried.')
        }
        const projects = await Project.find({
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

        return successDataResponse(workloads);
    } catch (error) {
        console.error(error);
        return errServerResponse("Internal Server Error");
    }
}

async function getWorkLoadHistory(req, res) {
    const { leadId, projectId, employeeId } = req.query;

    try {
        if (!leadId) {
            return badRequest('leadId is required.');
        }

        const projects = await Project.find({ lead: leadId });
        const workloadQuery = { pId: { $in: projects.map(project => project.id) } };
        if (projectId) {
            workloadQuery.id = projectId;
        }
        if (employeeId) {
            workloadQuery.eId = employeeId;
        }

        const workloads = await workloadModel.find(workloadQuery).sort({ createdAt: -1 });

        const employees = await employeeModel.find({ eId: { $in: workloads.map(workload => workload.eId) } });
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

        return successDataResponse(result);
    } catch (error) {
        return errServerResponse("Internal Server Error");
    }
}

async function getworkloadHistoryDetail(req, res) {
    const workloadId = req.query.workloadId || ""

    try {
        if (!workloadId) {
            return badRequest('workload id is required.');
        }
        
        const workload = await workloadModel.findOne({
            _id: workloadId
        })

        return successDataResponse(workload);
    } catch (error) {
        return errServerResponse("Internal Server Error");
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
    getworkloadHistoryDetail
};