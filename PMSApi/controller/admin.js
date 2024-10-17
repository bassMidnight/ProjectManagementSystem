const employeeModel = require("../models/employee.model");
const projectModel = require("../models/project.model");
const workloadModel = require("../models/workload.model");

const { getWeekNumber } = require("../utils/getWeekNumber");
const { getStartEndDateFromYear } = require("../utils/formatDate");

async function getProjectOrLead(req, res) {
    const queryDate = req.query.date;
    const currentDate = queryDate ? new Date(queryDate) : new Date();
    const currentWeek = getWeekNumber(currentDate);
    const Mode = req.query.Mode || "project";
    const Search = req.query.Search || "";
    try {
        
        if (Mode == "project") {
            var { projectTop3, projects } = await modeProject(Search, currentWeek, queryDate);
            
        } else if (Mode == "lead") {
            var { projectTop3, projects } = await modeLead(Search, currentWeek, queryDate);
        }

        res.status(200).json({
            error: false,
            message: "Success",
            data: {
                projectTop3,
                projects
            },
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: true, message: error.message });
    }
}

async function modeProject(Search ,currentWeek, queryDate) {

    const projectTop3 = await projectModel.aggregate([
        {
            $lookup: {
                from: "workloads", // Collection ของ workload
                let: { projectId: "$id" }, // ส่งค่า id ของ project
                pipeline: [
                    {
                        $match: {
                            $expr: { $and: [
                                { $eq: ["$pId", "$$projectId"] }, // กรองตาม pId ที่เชื่อมโยง
                                { $eq: ["$weekOfYear", currentWeek] }, // กรองตาม weekOfYear ที่ต้องการ
                                { $eq: [{ $year: "$createdAt" }, new Date(queryDate).getFullYear() ] }
                            ]}
                        }
                    }
                ],
                as: "workloadData" // เก็บผลลัพธ์ไว้ในฟิลด์ workloadData
            }
        },
        {
            $unwind: {
                path: "$workloadData", // แตกข้อมูล workloadData ออก
                preserveNullAndEmptyArrays: true // เก็บโปรเจกต์ที่ไม่มี workload ด้วย
            }
        },
        {
            $group: {
                _id: "$_id", // กลุ่มตาม id ของโปรเจกต์
                id: { $first: "$id" }, // เอาค่า id มาแสดง
                projectName: { $first: "$projectName" }, // เอาค่า projectName มาแสดง
                lead: { $first: "$lead" }, // เอาค่า lead มาแสดง
                avgWorkload: { $avg: "$workloadData.workload" } // คำนวณค่าเฉลี่ย workload
            }
        },
        {
            $addFields: {
                avgWorkload: { $ifNull: ["$avgWorkload", 0] } // ถ้า avgWorkload เป็น null ให้ใช้ค่า 0
            }
        },
        {
            $sort: {
                avgWorkload: -1 // จากมากไปน้อย
            }
        }
    ]).limit(3);
    
    const projects = await projectModel.aggregate([
        {
            
            $match: {
                projectName: { $regex: Search, $options: 'i' }, // กรองตามชื่อโปรเจกต์ โดยใช้ regex (กรณี projectNameFilter เป็นตัวแปรที่ส่งเข้ามา)
                // projectName: { $nin : projectTop3.map(project => project.projectName)},
            }
            
        },
        {
            $lookup: {
                from: "workloads", // Collection ของ workload
                let: { projectId: "$id" }, // ส่งค่า id ของ project
                pipeline: [
                    {
                        $match: {
                            $expr: { $and: [
                                { $eq: ["$pId", "$$projectId"] }, // กรองตาม pId ที่เชื่อมโยง
                                { $eq: ["$weekOfYear", currentWeek] }, // กรองตาม weekOfYear ที่ต้องการ
                                { $eq: [{ $year: "$createdAt" }, new Date(queryDate).getFullYear() ] }
                            ]}
                        }
                    }
                ],
                as: "workloadData" // เก็บผลลัพธ์ไว้ในฟิลด์ workloadData
            }
        },
        {
            $unwind: {
                path: "$workloadData", // แตกข้อมูล workloadData ออก
                preserveNullAndEmptyArrays: true // เก็บโปรเจกต์ที่ไม่มี workload ด้วย
            }
        },
        {
            $group: {
                _id: "$_id", // กลุ่มตาม id ของโปรเจกต์
                id: { $first: "$id" }, // เอาค่า id มาแสดง
                name: { $first: "$projectName" }, // เอาค่า projectName มาแสดง
                lead: { $first: "$lead" }, // เอาค่า lead มาแสดง
                avgWorkload: { $avg: "$workloadData.workload" } // คำนวณค่าเฉลี่ย workload
            }
        },
        {
            $addFields: {
                avgWorkload: { $ifNull: ["$avgWorkload", 0] } // ถ้า avgWorkload เป็น null ให้ใช้ค่า 0
            }
        },
        {
            $sort: {
                avgWorkload: -1 // จากมากไปน้อย
            }
        }
    ]);

    return { projectTop3, projects };
}

async function modeLead(leadSearch, currentWeek, queryDate) {

    const projectTop3 = await projectModel.aggregate([
        {
            $lookup: {
                from: "employees", // ค้นหาใน collection employees
                localField: "lead", // ใช้ฟิลด์ lead จาก project
                foreignField: "eId", // เชื่อมโยงกับ eId ใน employee
                as: "leadData" // เก็บผลลัพธ์ไว้ในฟิลด์ leadData
            }
        },
        {
            $unwind: "$leadData" // แตกข้อมูลของ leadData ออกเป็นแถว
        },
        {
            $lookup: {
                from: "workloads", // เชื่อมต่อกับ collection workloads
                let: { projectId: "$id" }, // ส่งค่า id ของ project
                pipeline: [
                    {
                        $match: {
                            $expr: { 
                                $and: [
                                    { $eq: ["$pId", "$$projectId"] }, // เชื่อมโยงกับ pId ใน workload
                                    { $eq: ["$weekOfYear", currentWeek] }, // กรองตาม weekOfYear ที่ต้องการ
                                    { $eq: [{ $year: "$createdAt" }, new Date(queryDate).getFullYear() ] }
                                ]
                            }
                        }
                    }
                ],
                as: "workloadData" // เก็บผลลัพธ์ไว้ในฟิลด์ workloadData
            }
        },
        {
            $unwind: {
                path: "$workloadData", // แตกข้อมูล workloadData ออกเป็นแถว
                preserveNullAndEmptyArrays: true // เก็บโปรเจกต์ที่ไม่มี workload ด้วย
            }
        },
        {
            $group: {
                _id: "$leadData._id", // กลุ่มข้อมูลตาม lead (_id ใน employee)
                eId: { $first: "$leadData.eId" },
                name: { $first: { $concat: ["$leadData.name", " ", "$leadData.surname"] } }, // นำชื่อของ lead มาแสดง
                avgWorkload: { $avg: "$workloadData.workload" }, // คำนวณค่าเฉลี่ยของ workload
                projectCount: { $sum: 1 } // นับจำนวนโปรเจกต์ที่เกี่ยวข้อง
            }
        },
        {
            $addFields: {
                avgWorkload: { $ifNull: ["$avgWorkload", 0] } // ถ้า avgWorkload เป็น null ให้ใช้ค่า 0
            }
        },
        {
            $sort: {
                avgWorkload: -1 // เรียงลำดับจากค่าเฉลี่ย workload มากไปน้อย
            }
        }
    ]).limit(3);

    const projects = await projectModel.aggregate([
        {
            $match: {
                id: { $nin : projectTop3.map(project => project.id)},
            }
        },
        {
            $lookup: {
                from: "employees", // ค้นหาใน collection employees
                localField: "lead", // ใช้ฟิลด์ lead จาก project
                foreignField: "eId", // เชื่อมโยงกับ eId ใน employee
                as: "leadData" // เก็บผลลัพธ์ไว้ในฟิลด์ leadData
            }
        },
        {
            $unwind: "$leadData" // แตกข้อมูลของ leadData ออกเป็นแถว
        },
        {
            $match: {
                $expr: {
                    $regexMatch: {
                        input: { $concat: ["$leadData.name", " ", "$leadData.surname"] }, // รวม name และ surname
                        regex: leadSearch, // ใช้เงื่อนไขค้นหาจาก lead
                        options: "i" // ทำการค้นหาแบบไม่สนใจตัวพิมพ์ใหญ่เล็ก
                    }
                }
            }
        },
        {
            $lookup: {
                from: "workloads", // เชื่อมต่อกับ collection workloads
                let: { projectId: "$id" }, // ส่งค่า id ของ project
                pipeline: [
                    {
                        $match: {
                            $expr: { 
                                $and: [
                                    { $eq: ["$pId", "$$projectId"] }, // เชื่อมโยงกับ pId ใน workload
                                    { $eq: ["$weekOfYear", currentWeek] }, // กรองตาม weekOfYear ที่ต้องการ
                                    { $eq: [{ $year: "$createdAt" }, new Date(queryDate).getFullYear() ] }
                                ]
                            }
                        }
                    }
                ],
                as: "workloadData" // เก็บผลลัพธ์ไว้ในฟิลด์ workloadData
            }
        },
        {
            $unwind: {
                path: "$workloadData", // แตกข้อมูล workloadData ออกเป็นแถว
                preserveNullAndEmptyArrays: true // เก็บโปรเจกต์ที่ไม่มี workload ด้วย
            }
        },
        {
            $group: {
                _id: "$leadData._id", // กลุ่มข้อมูลตาม lead (_id ใน employee)
                eId: { $first: "$leadData.eId" },
                name: { $first: { $concat: ["$leadData.name", " ", "$leadData.surname"] } }, // นำชื่อของ lead มาแสดง
                avgWorkload: { $avg: "$workloadData.workload" }, // คำนวณค่าเฉลี่ยของ workload
                projectCount: { $sum: 1 } // นับจำนวนโปรเจกต์ที่เกี่ยวข้อง
            }
        },
        {
            $addFields: {
                avgWorkload: { $ifNull: ["$avgWorkload", 0] } // ถ้า avgWorkload เป็น null ให้ใช้ค่า 0
            }
        },
        {
            $sort: {
                avgWorkload: -1 // เรียงลำดับจากค่าเฉลี่ย workload มากไปน้อย
            }
        }
    ]);
    
    return { projectTop3 , projects }
}

async function getEmployeeDropdown(req, res) {

    const employeeName = req.query.employeeName || "";

    try {

        const employees = await employeeModel.aggregate([
            {
                $match: {
                    $expr: {
                        $regexMatch: {
                            input: { $concat: ["$name", " ", "$surname"] },
                            regex: employeeName,
                            options: "i"
                        }
                    }
                }
            }
        ]);
        
        const result = employees.map(employee => ({
            _id: employee._id,
            id: employee.eId,
            name: `${employee.name} ${employee.surname}`
        }));

        res.status(200).json({
            error: false,
            message: "Success",
            data: result
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: true, message: error.message });
    }
}

async function getProjectDropdown(req, res) {

    const projectName = req.query.projectName || "";

    try {

        const projects = await projectModel.find({
            projectName: { $regex: projectName, $options: "i" }
        });

        const result = projects.map(project => ({
            _id: project._id,
            id: project.id,
            name: project.projectName
        }));

        res.status(200).json({
            error: false,
            message: "Success",
            data: result
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: true, message: error.message });
    }
}

async function getHistory(req, res) {
    let {
        employeeId,
        projectId,
        date,
        page = 1,
        size = 10
    } = req.query;

    size = parseInt(size);
    const offset = (page - 1) * size;

    try {
        const filterQuery = {
            ...(employeeId && { eId: employeeId }),
            ...(projectId && { pId: projectId })
        };

        const { startOfYear, endOfYear } = getStartEndDateFromYear(date);
        filterQuery.createdAt = { $gte: startOfYear, $lte: endOfYear };

        const workloads = await workloadModel.aggregate([
            { $match: filterQuery },
            {
                $lookup: {
                    from: "projects",
                    localField: "pId",
                    foreignField: "id",
                    as: "projectData"
                }
            },
            { $unwind: "$projectData" },
            {
                $lookup: {
                    from: "employees",
                    localField: "eId",
                    foreignField: "eId",
                    as: "employeeData"
                }
            },
            { $unwind: "$employeeData" },
            {
                $project: {
                    _id: 1,
                    pId: 1,
                    eId: 1,
                    workload: 1,
                    weekOfYear: 1,
                    desc: 1,
                    projectName: "$projectData.projectName",
                    employeeName: { $concat: ["$employeeData.name", " ", "$employeeData.surname"] },
                    shortname: "$employeeData.shortname",
                    createdAt: 1,
                    notation: 1,

                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: offset },
            { $limit: size }
        ]);

        const workloadCount = await workloadModel.countDocuments(filterQuery);

        const result = workloads.map(workload => ({
            id: workload._id,
            desc: workload.desc,
            notation: workload.notation,
            createdAt: workload.createdAt,
            eFullName: workload.employeeName,
            eShortName: workload.shortname,
            projectName: workload.projectName,
            pId: workload.pId,
            eId: workload.eId,
            workload: workload.workload,
            weekOfYear: workload.weekOfYear,
        }));

        res.status(200).json({
            error: false,
            message: "Success",
            data: {
                result: result,
                total: result.length,
                totalAll: workloadCount
            }
        });
    } catch (error) {
        res.status(500).json({ error: true, message: error.message });
    }
}

// {
//     "id": "66fe5691d0dda61d68f7e481",
//     "desc": "จัดการ API CRUD ของระบบจอง",
//     "eFullName": "กษิดิ์เดช ทองดอนเกื้อง",
//     "projectName": "Telemedecine",
//     "pId": "Tel001",
//     "eId": "67152",
//     "workload": 40,
//     "weekOfYear": 38
// },

// {
//     "id": "670de930a6f88c75f7966ea9",
//     "desc": "",
//     "notation": "",
//     "createdAt": "2024-10-15T04:01:52.156Z",
//     "eFullName": "เฉลิมพงศ์ สมศรี",
//     "eShortName": "แคน",
//     "projectName": "Nex Gen Commerce",
//     "eId": "66559",
//     "pId": "Nex001",
//     "workload": ""
// },

module.exports = {
    getProjectOrLead,
    getEmployeeDropdown,
    getProjectDropdown,
    getHistory,
}