const Workload = require('../models/workload.model');
const Project = require('../models/project.model');
const ProjectMember = require('../models/projectMember.model');
const Employee = require('../models/employee.model');

async function weeklyMemberQueryByWeek(lead, weekOfYear, year) {
    const matchCondition = year
        ? {
            $and: [
                { $eq: ["$weekOfYear", weekOfYear] },
                { $eq: [{ $year: "$createdAt" }, year] }
            ]
        }
        : { $eq: ["$weekOfYear", weekOfYear] };

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
                                    matchCondition
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

async function weeklyMemberQueryByWeekWithoutLead(weekOfYear, year) {
    const matchCondition = year
        ? {
            $and: [
                { $eq: ["$weekOfYear", weekOfYear] },
                { $eq: [{ $year: "$createdAt" }, year] }
            ]
        }
        : { $eq: ["$weekOfYear", weekOfYear] };

    const members = await Employee.aggregate([
        {
            $lookup: {
                from: "workloads",
                let: { eId: "$eId" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$eId", "$$eId"] },
                                    matchCondition
                                ]
                            }
                        }
                    }
                ],
                as: "workload"
            }
        },
        {
            $project: {
                _id: "$eId",
                employeeName: "$name",
                employeeSurname: "$surname",
                employeeShortName: "$shortname",
                employeePosition: "$position",
                employeeStartDate: "$startDate",
                workload: {
                    $cond: [
                        { $eq: [{ $size: "$workload" }, 0] },
                        0,
                        { $sum: "$workload.workload" }
                    ]
                }
            }
        }
    ]);
    return members;
}


async function weeklyMemberQueryByWeekByNameOrProject(lead, weekOfYear, year, projectName, name) {
    try {
        const matchCondition = year
            ? {
                weekOfYear: weekOfYear,
                createdAt: {
                    $gte: new Date(year, 0, 1),
                    $lt: new Date(year + 1, 0, 1)
                }
            }
            : { weekOfYear: weekOfYear };
        
        const projectMatchCondition = {
            $and: [
                lead ? { lead: lead } : {},
                projectName ? { projectName: { $regex: String(projectName), $options: 'i' } } : {}
            ]
        };

        const members = await Project.aggregate([
            { $match: projectMatchCondition },
            {
                $lookup: {
                    from: "projectmembers",
                    localField: "id",
                    foreignField: "pId",
                    as: "members"
                }
            },
            { $unwind: "$members" },
            {
                $lookup: {
                    from: "employees",
                    localField: "members.eId",
                    foreignField: "eId",
                    as: "employeeDetails"
                }
            },
            { $unwind: "$employeeDetails" },
            {
                $lookup: {
                    from: "workloads",
                    let: { eId: "$members.eId", pId: "$id" },
                    pipeline: [
                        {
                            $match: {
                                $and: [
                                    { $expr: { $eq: ["$eId", "$$eId"] } },
                                    { $expr: { $eq: ["$pId", "$$pId"] } },
                                    matchCondition
                                ]
                            }
                        }
                    ],
                    as: "workload"
                }
            },
            {
                $addFields: {
                    workload: {
                        $cond: [
                            { $eq: [{ $size: "$workload" }, 0] },
                            0,
                            { $sum: "$workload.workload" }
                        ]
                    }
                }
            },
            {
                $match: name ? {
                    $expr: {
                        $regexMatch: {
                            input: { $concat: ["$employeeDetails.name"," ", "$employeeDetails.surname"] },
                            regex: String(name),
                            options: "i"
                        }
                    }
                } : {}
            },
            {
                $project: {
                    _id: 0,
                    employeeId: "$members.eId",
                    employeeName: "$employeeDetails.name",
                    employeeSurname: "$employeeDetails.surname",
                    employeeShortName: "$employeeDetails.shortname",
                    employeePosition: "$employeeDetails.position",
                    employeeStartDate: "$employeeDetails.startDate",
                    projectName: 1,
                    lead: 1,
                    workload: 1
                }
            }
        ]);

        console.log(`Found ${members.length} members`);
        return members;
    } catch (error) {
        console.error("Error in weeklyMemberQueryByWeekByNameOrProject:", error);
        throw new Error("An error occurred while fetching all members by name or project");
    }
}


async function weeklyMemberProjectQueryByWeek(eId, weekOfYear, year) {
    const matchCondition = year
        ? {
            $and: [
                { $eq: ["$weekOfYear", weekOfYear] },
                { $eq: [{ $year: "$createdAt" }, year] }
            ]
        }
        : { $eq: ["$weekOfYear", weekOfYear] };

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
                let: { projectId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$pId", "$$projectId"] },
                                    { $eq: ["$eId", eId] },
                                    matchCondition
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
                totalWorkload: { $avg: "$workload.workload" }
            }
        },
        {
            $project: {
                _id: 1,
                projectName: "$projectDetails.projectName",
                lead: "$projectDetails.lead",
                numberOfMembers: 1,
                totalWorkload: 1,
                projectId : "$projectDetails.id"
            }
        }
    ]);
    return memberProjects;
}

async function weeklyMemberProjectQueryByWeeks(eId, weeks, year) {
    const matchCondition = year
        ? {
            $and: [
                { $in: ["$weekOfYear", weeks] },
                { $eq: [{ $year: "$createdAt" }, year] }
            ]
        }
        : { $in: ["$weekOfYear", weeks] };

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
                let: { projectId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$pId", "$$projectId"] },
                                    matchCondition
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
                totalWorkload: { $avg: "$workload.workload" }
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

async function MemberWorkloadOverview(eId, weeks, year) {
    const matchCondition = year
        ? {
            $and: [
                { weekOfYear: { $in: weeks } },
                { $expr: { $eq: [{ $year: "$createdAt" }, year] } }
            ]
        }
        : { weekOfYear: { $in: weeks } };

    const workloads = await Workload.aggregate([
        {
            $match: {
                eId: eId,
                ...matchCondition
            }
        },
        {
            $group: {
                _id: "$weekOfYear",
                workload: { $sum: "$workload" }
            }
        },
        {
            $project: {
                _id: 0,
                weekOfYear: "$_id",
                workload: 1
            }
        }
    ]);
    return workloads;
}

async function MemberWorkloadOverviewMonthly(eId, months, year) {   
    const workloads = await Workload.aggregate([
        {
            $match: {
                eId: eId,
                $expr: { 
                    $and: [
                        { $in: [{ $month: "$createdAt" }, months] },
                        { $eq: [{ $year: "$createdAt" }, year] }
                    ]
                }
            }
        },
        {
            $project: {
                pId: 1,
                month: { $month: "$createdAt" },
                year: { $year: "$createdAt" },
                workload: 1
            }
        },
        {
            $group: {
                _id: { pId: "$pId", month: "$month" },
                year: { $first: "$year" },
                avgWorkload: { $avg: "$workload" }
            }
        },
        {
            $group: {
                _id: "$_id.month",
                year: { $first: "$year" },
                totalWorkload: { $sum: "$avgWorkload" }
            }
        },
        {
            $project: {
                _id: 0,
                month: "$_id",
                year: 1,
                workload: "$totalWorkload"
            }
        },
        {
            $sort: { month: 1 }
        }
    ]);
    return workloads;
}

async function MemberWorkloadOverviewTwelveMonths(eId, year) {
    const workloads = await Workload.aggregate([
        {
            $match: {
                eId: eId,
                $expr: { $eq: [{ $year: "$createdAt" }, year] }
            }
        }
    ]);
}

//------------------------------------------------------------------------------//
async function weeklyQueryByEId(eId, weekOfYear, year) {
    const matchCondition = year
        ? {
            eId: eId,
            weekOfYear: weekOfYear,
            $expr: { $eq: [{ $year: "$createdAt" }, year] }
        }
        : { eId: eId, weekOfYear: weekOfYear };

    try {
        const workloads = await Workload.aggregate([
            {
                $match: matchCondition
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

async function weeklyQueryByPId(pId, weekOfYear, year) {
    try {
        const workloads = await Workload.aggregate([
            {
                $match: {
                    pId: pId,
                    weekOfYear: weekOfYear,
                    $expr: { $eq: [{ $year: "$createdAt" }, year] }
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
    weeklyMemberQueryByWeekWithoutLead,
    weeklyMemberProjectQueryByWeek,
    weeklyMemberProjectQueryByWeeks,
    MemberWorkloadOverview,
    MemberWorkloadOverviewMonthly,
    MemberWorkloadOverviewTwelveMonths,
    weeklyMemberQueryByWeekByNameOrProject
}