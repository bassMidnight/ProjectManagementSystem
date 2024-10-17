const ProjectModel = require("../models/project.model");
const ProjectMemberModel = require("../models/projectMember.model");
const EmployeeModel = require("../models/employee.model");
const WorkloadModel = require("../models/workload.model");

const formatDate = require("../utils/formatDate");
const { getWeekNumber, getWeekStartAndEnd } = require("../utils/getWeekNumber");
const { getStartEndDateFromYear } = require("../utils/formatDate");

async function getProjects(req, res) {
  const leadId = req.query.leadId || "";
  let date = req.query.date;
  try {
    if (!leadId) {
      throw new Error(`leader id is required`);
    }

    const currentDate = new Date(date);
    const currentYear = currentDate.getFullYear();
    let { startOfYear, endOfYear } =
      formatDate.getStartEndDateFromYear(currentYear);
    let currentWeek = getWeekNumber(currentDate);
    const projects = await ProjectModel.find({ lead: leadId });

    let aggregatedWorkloads = await WorkloadModel.aggregate([
      {
        $match: {
          pId: { $in: projects.map((project) => project.id) },
          weekOfYear: { $eq: currentWeek },
          createdAt: { $gte: startOfYear, $lt: endOfYear },
        },
      },
      {
        $group: {
          _id: "$pId", // กลุ่มข้อมูลตาม pId
          avgWorkload: { $avg: "$workload" }, // คำนวณค่าเฉลี่ยของ workload
        },
      },
    ]);

    let result = [];
    for (const project of projects) {
      let data = {
        id: project.id,
        projectName: project.projectName,
        workload: "0.00",
      };

      for (const workload of aggregatedWorkloads) {
        if (project.id == workload._id) {
          workload_data = workload.avgWorkload || 0.0;
          workload_data = workload_data.toFixed(2);
          data.workload = workload_data;
        }
      }
      result.push(data);
    }
    res.status(200).json({
      error: false,
      message: "Success",
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: true, message: error.message });
  }
}

async function getGraph(req, res) {
    const projectId = req.query.projectId;
    const graphMode = req.query.graphMode;
    const date = req.query.date;

    if (!projectId) {
        return res
        .status(400)
        .json({ error: true, message: "Project ID is required" });
    }

    if (!graphMode) {
        return res
        .status(400)
        .json({ error: true, message: "Graph mode is required" });
    }

    try {
        let workloads;
        if (graphMode === "month") {
        workloads = await getWorkloadsForGraphMonth(projectId, date);
        } else if (graphMode === "year") {
        workloads = await getGraphYear(projectId, date);
        } else {
        return res
            .status(400)
            .json({ error: true, message: "Invalid graph mode" });
        }

        return res
        .status(200)
        .json({ error: false, message: "Success", data: workloads });
    } catch (error) {
        console.error(error);
        return res
        .status(500)
        .json({ error: true, message: "Internal Server Error" });
    }
}

async function getWorkloadsForGraphMonth(projectId, date) {
  const currentDate = date ? new Date(date) : new Date();
  const currentWeek = getWeekNumber(currentDate);
  const currentYear = currentDate.getFullYear();
  const { startOfYear, endOfYear } = getStartEndDateFromYear(currentYear);

  const workloads = await WorkloadModel.aggregate([
    {
      $match: {
        pId: projectId,
        weekOfYear: { $gte: currentWeek - 11, $lte: currentWeek },
        createdAt: { $gte: startOfYear, $lt: endOfYear },
      },
    },
    {
      $group: {
        _id: {
          weekOfYear: "$weekOfYear",
          year: { $year: "$createdAt" }, // เพิ่มฟิลด์ year ในการจัดกลุ่ม
        },
        avgWorkload: { $avg: "$workload" },
      },
    },
    {
      $sort: { "_id.weekOfYear": 1 }, // จัดเรียงตาม weekOfYear
    },
    {
      $project: {
        weekOfYear: "$_id.weekOfYear", // นำ weekOfYear ออกมาแสดง
        year: "$_id.year", // นำ year ออกมาแสดง
        avgWorkload: 1, // แสดง avgWorkload
      },
    },
  ]);

  const result = workloads.map((workload) => ({
    name: `${
      getWeekStartAndEnd(workload._id.weekOfYear, workload._id.year).startDate
    } - ${
      getWeekStartAndEnd(workload._id.weekOfYear, workload._id.year).endDate
    }`,
    avgWorkload: workload.avgWorkload
      ? workload.avgWorkload.toFixed(2)
      : `0.00`,
  }));

  return result;
}

async function getGraphYear(projectId, date) {
  let currentDate;
  if (!date) {
    currentDate = new Date();
  } else {
    currentDate = new Date(date);
  }

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(currentDate.getFullYear() - 1); // วันที่ย้อนหลัง 12 เดือน

  const workloadsByMonth = await WorkloadModel.aggregate([
    {
      $match: {
        pId: projectId,
        createdAt: {
          $gte: oneYearAgo,
          $lte: currentDate,
        },
      },
    },
    {
      $addFields: {
        month: { $month: "$createdAt" }, // ดึงเดือนจาก createdAt
        year: { $year: "$createdAt" }, // ดึงปีจาก createdAt
      },
    },
    {
      $group: {
        _id: { year: "$year", month: "$month" }, // กลุ่มตามปีและเดือน
        avgWorkload: { $avg: "$workload" }, // ค่าเฉลี่ยของ workload ในแต่ละเดือน
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 }, // เรียงจากเดือนปัจจุบันไปย้อนหลัง
    },
    {
      $limit: 12, // จำกัดจำนวนข้อมูลย้อนหลัง 12 เดือน
    },
  ]);

  // console.log(workloadsByMonth);

  let result = workloadsByMonth.map((workload) => ({
    name: `${workload._id.month}-${workload._id.year}`,
    avgWorkload: workload.avgWorkload.toFixed(2),
  }));

  return result;
}

async function getProjectMenberList(req, res) {
  const projectId = req.query.pId || "";
  const date = req.query.date || "";
  try {
    if (!projectId) {
      throw new Error(`project id is required`);
    }

    let currentDate;
    if (!date) {
      currentDate = new Date();
    } else {
      currentDate = new Date(date);
    }

    const currentWeek = getWeekNumber(currentDate);
    const members = await ProjectMemberModel.find({ pId: projectId });
    const employees = await EmployeeModel.find({
      eId: { $in: members.map((member) => member.eId) },
    });
    const { startOfYear, endOfYear } = getStartEndDateFromYear(
      currentDate.getFullYear()
    );

    const workloads = await WorkloadModel.find({
      weekOfYear: currentWeek,
      eId: { $in: employees.map((employee) => employee.eId) }, // กรอง workload.eId ที่ตรงกับ employees.eId
      createdAt: {
        $gte: startOfYear,
        $lte: endOfYear,
      },
    });

    // console.log("workloads : ", workloads);

    const result = employees.map((employee) => {
      const workload = workloads.find(
        (workload) => workload.eId === employee.eId
      );
      return {
        id: employee.eId,
        name: employee.name,
        surname: employee.surname,
        position: employee.position,
        department: employee.department,
        workload: workload ? workload.workload.toFixed(2) : `0.00`,
      };
    });

    return res
      .status(200)
      .json({ error: false, message: "success", data: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: true, message: error.message });
  }
}
async function getWorkLoad(req, res) {
  const eId = req.query.eId || "";
  const pId = req.query.pId || "";

  try {
    if (!eId) {
      throw new Error("employee id is required");
    }

    if (!pId) {
      throw new Error("project id is required");
    }

    const currentDate = new Date();
    const currentWeek = getWeekNumber(currentDate);
    const workloads = await WorkloadModel.find({
      eId: eId,
      pId: pId,
      weekOfYear: currentWeek,
    });

    return res
      .status(200)
      .json({ error: false, message: "success", data: workloads });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: true, message: error.message });
  }
}

async function updateWorkLoad(req, res) {
  let { eId, pId, workload, desc, notation } = req.body;

  try {
    const currentDate = new Date();
    const currentWeek = getWeekNumber(currentDate);

    await WorkloadModel.updateOne(
      {
        pId: pId,
        eId: eId,
        weekOfYear: currentWeek,
        $expr: { $eq: [{ $year: "$createdAt" }, currentYear] },
      },
      {
        $set: {
          eId: eId,
          pId: pId,
          workLoad: workload,
          desc: desc,
          notation: notation,
        },
      },
      { upsert: true }
    );

    return res
      .status(200)
      .json({ error: false, message: "insert or update success" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: true, message: error.message });
  }
}

async function getEmployeeDropdown(req, res) {
  const leadId = req.query.leadId;
  try {
    if (!leadId) {
      throw new Error("lead id is required");
    }

    const projects = await ProjectModel.find({ lead: leadId });
    const projectIds = projects.map((project) => project.id);
    const projectMembers = await ProjectMemberModel.find({
      pId: { $in: projectIds },
    });
    const employeeIds = projectMembers.map((member) => member.eId);
    const employees = await EmployeeModel.find({ eId: { $in: employeeIds } });

    const result = employees.map((employee) => ({
      eId: employee.eId,
      fullName: `${employee.name} ${employee.surname}`,
    }));

    return res
      .status(200)
      .json({ error: false, message: "success", data: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: true, message: error.message });
  }
}

async function getProjectDropdown(req, res) {
  const leadId = req.query.leadId || "";
  try {
    if (!leadId) {
      // return badRequest('lead id requried.')
      throw new Error("leader id requried.");
    }
    const projects = await ProjectModel.find({
      lead: leadId,
    });

    let result = [];
    for (const project of projects) {
      data = {
        pId: project.id,
        projectName: project.projectName,
      };
      result.push(data);
    }

    // return successDataResponse(result);
    return res
      .status(200)
      .json({ error: false, message: "success", data: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: true, message: error.message });
  }
}

async function getWorkLoadHistory(req, res) {
  const { leadId, projectId, employeeId, date } = req.query;

  const page = parseInt(req.query.page) || 1;
  const size = parseInt(req.query.size) || 10;
  let offset = (page - 1) * size;

  try {
    if (!leadId) {
      throw new Error("leader id is required.");
    }

    if (date) {
      var dateObj = new Date(date);
      var currentWeek = getWeekNumber(dateObj);
      var { startOfYear, endOfYear } = getStartEndDateFromYear(
        dateObj.getFullYear()
      );
    }

    const projects = await ProjectModel.find({ lead: leadId });
    const workloadQuery = {
      pId: { $in: projects.map((project) => project.id) },
    };
    if (projectId) {
      workloadQuery.pId = projectId;
    }
    if (employeeId) {
      workloadQuery.eId = employeeId;
    }

    if (date) {
      workloadQuery.createdAt = {
        $gte: startOfYear,
        $lte: endOfYear,
      };
      workloadQuery.weekOfYear = currentWeek;
    }

    const workloads = await WorkloadModel.find(workloadQuery)
      .skip(offset)
      .limit(size)
      .sort({ createdAt: -1 });
    const workloadtotal = await WorkloadModel.countDocuments(workloadQuery);

    const employees = await EmployeeModel.find({
      eId: { $in: workloads.map((workload) => workload.eId) },
    });
    // console.log(employees);

    const result = workloads.map((workload) => ({
      id: workload._id,
      desc: workload.desc,
      createdAt: workload.createdAt,
      eFullName: employees.find((employee) => employee.eId === workload.eId)
        ? `${
            employees.find((employee) => employee.eId === workload.eId).name
          } ${
            employees.find((employee) => employee.eId === workload.eId).surname
          }`
        : "",
      eShortName: employees.find((employee) => employee.eId === workload.eId)
        ? employees.find((employee) => employee.eId === workload.eId).shortname
        : "",
      projectName: projects.find((project) => project.id === workload.pId)
        ? projects.find((project) => project.id === workload.pId).projectName
        : "",
    }));

    return res.status(200).json({
      error: false,
      message: "success",
      data: {
        result: result,
        total: result.length,
        totalAll: workloadtotal,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: true, message: error.message });
  }
}

async function getworkloadHistoryDetail(req, res) {
  const workloadId = req.query.workloadId || "";

  try {
    if (!workloadId) {
      throw new Error("workload id is required.");
    }

    const workload = await WorkloadModel.findOne({
      _id: workloadId,
    });

    return res
      .status(200)
      .json({ error: false, message: "success", data: workload });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: true, message: error.message });
  }
}

async function addEmployeeToProject(req, res) {
  const employeeId = req.query.eId;
  const projectId = req.query.pId;

  if (!employeeId) {
    throw new Error("Employee ID is required.");
  }

  if (!projectId) {
    throw new Error("Project ID is required.");
  }

  try {
    const employee = await EmployeeModel.findOne({ eId: employeeId });
    if (!employee) {
      throw new Error("Employee not found.");
    }

    const project = await ProjectModel.findOne({ id: projectId });
    if (!project) {
      throw new Error("Project not found.");
    }

    const newEmployeeProject = await ProjectMemberModel.create({
      eId: employeeId,
      pId: projectId,
    });

    if (!newEmployeeProject) {
      return errServerResponse("Failed to add employee to project.");
    }

    return res
      .status(200)
      .json({
        error: false,
        message: "Employee added to project successfully.",
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: true, message: error.message });
  }
}

async function deleteEmployeeFromProject(req, res) {
  const employeeId = req.query.eId;
  const projectId = req.query.pId;

  if (!employeeId) {
    throw new Error("Employee ID is required.");
  }

  if (!projectId) {
    throw new Error("Project ID is required.");
  }

  try {
    const employee = await EmployeeModel.findOne({ eId: employeeId });
    if (!employee) {
      throw new Error("Employee not found.");
    }

    const project = await ProjectModel.findOne({ id: projectId });
    if (!project) {
      throw new Error("Project not found.");
    }

    const deleteResult = await ProjectMemberModel.findOneAndDelete({
      eId: employeeId,
      pId: projectId,
    });

    if (!deleteResult) {
      throw new Error("Failed to delete employee from project.");
    }

    return res
      .status(200)
      .json({
        error: false,
        message: "Employee deleted from project successfully.",
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: true, message: error.message });
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
         
        return res.status(200).json({ error: false, message: "success", data: result });
    } catch (error) { 
        console.error(error);
        return res.status(500).json({ error: true, message: error.message });
    }
}

async function addEmployeesListToProject(req, res) {
    const employeeIds = req.body.eIds;  // Expecting a list of employee IDs in the request body
    const projectId = req.body.pId;

    if (!employeeIds || employeeIds.length === 0) {
        return res.status(400).json({ error: true, message: 'Employee IDs are required.' });
    }

    if (!projectId) {
        return res.status(400).json({ error: true, message: 'Project ID is required.' });
    }

    try {
        const project = await ProjectModel.findOne({ id: projectId });
        if (!project) {
            throw new Error('Project not found.');
        }

        const failedEmployees = [];
        const addedEmployees = [];

        for (let employeeId of employeeIds) {
            const employee = await EmployeeModel.findOne({ eId: employeeId });
            if (!employee) {
                failedEmployees.push(employeeId);  // Record failed employees
                continue;
            }

            const newEmployeeProject = await ProjectMemberModel.create({
                eId: employeeId,
                pId: projectId
            });

            if (newEmployeeProject) {
                addedEmployees.push(employeeId);  // Record successful additions
            } else {
                failedEmployees.push(employeeId);
            }
        }

        return res.status(200).json({
            error: false,
            message: "Employees processed successfully.",
            addedEmployees,
            failedEmployees
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: error.message });
    }
}

async function deleteEmployeesListFromProject(req, res) {
    const employeeIds = req.body.eIds;  // Expecting a list of employee IDs in the request body
    const projectId = req.body.pId;

    console.log(employeeIds);
    console.log(projectId);

    if (!employeeIds || employeeIds.length === 0) {
        return res.status(400).json({ error: true, message: 'Employee IDs are required.' });
    }

    if (!projectId) {
        return res.status(400).json({ error: true, message: 'Project ID is required.' });
    }

    try {
        const project = await ProjectModel.findOne({ id: projectId });
        if (!project) {
            throw new Error('Project not found.');
        }

        const failedEmployees = [];
        const deletedEmployees = [];

        for (let employeeId of employeeIds) {
            const employee = await EmployeeModel.findOne({ eId: employeeId });
            if (!employee) {
                failedEmployees.push(employeeId);  // Record failed deletions
                continue;
            }

            const deleteResult = await ProjectMemberModel.findOneAndDelete({
                eId: employeeId,
                pId: projectId
            });

            if (deleteResult) {
                deletedEmployees.push(employeeId);  // Record successful deletions
            } else {
                failedEmployees.push(employeeId);
            }
        }

        return res.status(200).json({
            error: false,
            message: "Employees processed successfully.",
            deletedEmployees,
            failedEmployees
        });
    } catch (error) {
        console.error(error);
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
    getEmployeeDropdown,
    getProjectDropdown,
    getWorkLoadHistory,
    getworkloadHistoryDetail,
    addEmployeeToProject,
    deleteEmployeeFromProject,
    getAllEmployee,

    addEmployeesListToProject,
    deleteEmployeesListFromProject
};
