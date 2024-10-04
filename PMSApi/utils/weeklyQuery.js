const Workload = require('../models/workload.model');
const Project = require('../models/project.model');
const ProjectMember = require('../models/projectMember.model');


async function weeklyMemberQueryByWeek(lead,weekOfYear) {
    const members = await Project.aggregate([
        {
            $match: lead ? { lead: lead } : {}
        },
        {
            $lookup: {
                from: "projectmembers",
                localField: "id",
                foreignField: "pId",
                as: "members"
            }
        },
        {
            $unwind: "$members"
        },
        {
            $lookup: {
                from: "employees",
                localField: "members.eId",
                foreignField: "eId",
                as: "employeeDetails"
            }
        },
        {
            $unwind: "$employeeDetails"
        },
        {
            $lookup: {
                from: "workloads",
                let: { eId: "$members.eId" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$eId", "$$eId"] },
                                    { $eq: ["$weekOfYear", weekOfYear] }
                                ]
                            }
                        }
                    }
                ],
                as: "workload"
            }
        },
        {
            $group: {
                _id: "$members.eId",
                employeeName: { $first: "$employeeDetails.name" },
                employeeSurname: { $first: "$employeeDetails.surname" },
                employeeShortName: { $first: "$employeeDetails.shortname" },
                employeePosition: { $first: "$employeeDetails.position" },
                employeeStartDate: { $first: "$employeeDetails.startDate" },
                workload: {
                    $sum: {
                        $cond: [
                            { $eq: [{ $size: "$workload" }, 0] },
                            0,
                            { $sum: "$workload.workload" }
                        ]
                    }
                }
            }
        }
    ]);
    return members;
}


async function weeklyMemberProjectQueryByWeek(eId, weekOfYear) {
    const memberProjects = await ProjectMember.aggregate([
        {
            $group: {
                _id: "$pId",
                numberOfMembers: { $sum: 1 },
                members: { $push: "$eId" }
            }
        },
        {
            $match: eId ? { members: eId } : {}
        },
        {
            $lookup: {
                from: "projects",
                localField: "_id",
                foreignField: "id",
                as: "projectDetails"
            }
        },
        { $unwind: "$projectDetails" },
        {
            $lookup: {
                from: "workloads",
                let: { projectId: "$_id", week: weekOfYear },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$pId", "$$projectId"] },
                                    { $eq: ["$weekOfYear", "$$week"] }
                                ]
                            }
                        }
                    }
                ],
                as: "workload"
            }
        },
        {
            $addFields: {
                totalWorkload: { $sum: "$workload.workload" }
            }
        },
        {
            $project: {
                _id: 1,
                projectName: "$projectDetails.projectName",
                lead: "$projectDetails.lead",
                numberOfMembers: 1,
                totalWorkload: 1
            }
        }
    ]);
    return memberProjects;
}

//------------------------------------------------------------------------------//
async function weeklyQueryByEId(eId, weekOfYear) {
    try {
        const workloads = await Workload.aggregate([
            {
                $match: {
                    eId: eId,
                    weekOfYear: weekOfYear
                }
            },
            {
                $group: {
                    _id: null,
                    totalWorkload: { $sum: "$workload" }
                }
            },
            {
                $project: {
                    _id: 0,
                    employeeId: eId,
                    workload: "$totalWorkload"
                }
            }
        ]);

        let responseData;
        if (workloads.length === 0) {
            responseData = { employeeId: eId, workload: 0 };
        } else {
            responseData = workloads[0];
        }
        return responseData;
    } catch (error) {
        console.error("Error in weeklyQueryByEId:", error);
        throw error;
    }
}

async function weeklyQueryByPId(pId, weekOfYear) {
    try {
        const workloads = await Workload.aggregate([
            {
                $match: {
                    pId: pId,
                    weekOfYear: weekOfYear
                }
            },
            {
                $group: {
                    _id: null,
                    totalWorkload: { $sum: "$workload" }
                }
            },
            {
                $project: {
                    _id: 0,
                    projectId: pId,
                    workload: "$totalWorkload"
                }
            }
        ]);

        let responseData;
        if (workloads.length === 0) {
            responseData = { projectId: pId, workload: 0 };
        } else {
            responseData = workloads[0];
        }
        return responseData;
    } catch (error) {
        console.error("Error in weeklyQueryByPId:", error);
        throw error;
    }
}

async function weeklyQueryByEIdAndPId(eId, pId, weekOfYear) {
    try {
        const workloads = await Workload.aggregate([
            {
                $match: {
                    eId: eId,
                    pId: pId,
                    weekOfYear: weekOfYear
                }
            },
            {
                $project: {
                    _id: 0,
                    employeeId: eId,
                    projectId: pId,
                    workload: "$workload"
                }
            }
        ]);

        let responseData;
        if (workloads.length === 0) {
            responseData = { employeeId: eId, projectId: pId, workload: 0 };
        } else {
            responseData = workloads[0];
        }
        return responseData;    
    } catch (error) {
        console.error("Error in weeklyQueryByEIdAndPId:", error);
        throw error;
    }
}

// multiple employee
async function weeklyQueryByEIds(eIds, weekOfYear) {
    try {
        const workloads = await Workload.aggregate([
            {
                $match: {
                    eId: { $in: eIds },
                    weekOfYear: weekOfYear
                }
            },
            {
                $group: {
                    _id: "$eId",
                    totalWorkload: { $sum: "$workload" }
                }
            },
            {
                $project: {
                    _id: 0,
                    employeeId: "$_id",
                    workload: "$totalWorkload"
                }
            }
        ]);

        return workloads;
    } catch (error) {
        console.error("Error in weeklyQueryByEIds:", error);
        throw error;
    }
}

// multiple project
async function weeklyQueryWorkloadByPIds(pIds, weekOfYear) {
    try {
        const workloads = await Workload.aggregate([
            {
                $match: {
                    pId: { $in: pIds },
                    weekOfYear: weekOfYear
                }
            },
            {
                $group: {
                    _id: "$pId",
                    //average workload
                    totalWorkload: { $avg: "$workload" }
                }
            },
            {
                $project: {
                    _id: 0,
                    projectId: "$_id",
                    workload: "$totalWorkload"
                }
            }
        ]);

        return workloads;
    } catch (error) {
        console.error("Error in weeklyQueryByPIds:", error);
        throw error;
    }
}



module.exports = {
    weeklyQueryByEId,
    weeklyQueryByPId,
    weeklyQueryByEIdAndPId,
    weeklyQueryByEIds,
    weeklyQueryWorkloadByPIds,
    weeklyMemberQueryByWeek,
    weeklyMemberProjectQueryByWeek
}
