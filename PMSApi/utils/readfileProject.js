// const fs = require('node:fs');
// const csv = require('csv-parser');
// const Employee = require('../models/employee.model'); // Import your Mongoose model

// async function csvToDatabase() {
//     const results = [];

//     // Define the mapping from CSV columns to Mongoose schema fields
//     const columnMapping = {
//         "รหัสพนักงาน": "eId",
//         "หัวหน้างาน": "lead",
//         "โปรเจกต์ที่กำลังทำ":"projectName",
//     };

//     return new Promise((resolve, reject) => {
//         fs.createReadStream("../data.csv")
//             .pipe(csv())
//             .on('data', async (data) => {
//                 const mappedData = {};
//                 const projectmappedData = {};
//                 let name, surname;
//                 let projectName;
//                 let lead;
//                 for (const csvKey in columnMapping) {
//                     if (data[csvKey]) {
//                         if (csvKey === "หัวหน้างาน") { // Assuming this is startDate
//                             name, surname = data[csvKey].split(" ");
//                             lead = await Employee.findOne({name:name, surname: surname});
//                         } else if (csvKey === "โปรเจกต์ที่กำลังทำ") { // Assuming this is onBoard
//                             projectName = data[csvKey];
//                         }
//                     }
//                 }

//                 const projectID = str.slice(0,3) + "001";

//                 // Check if eId already exists in the database
//                 const existingEmployee = await Employee.findOne({ eId: mappedData.eId });
//                 if (!existingEmployee) {
//                     results.push(mappedData); // Only push if it doesn't exist
//                 } else {
//                     //console.log(`Employee with eId ${mappedData.eId} already exists. Skipping...`);
//                 }
//             })
//             .on('end', async () => {
//                 try {
//                     // Insert mapped data into MongoDB
//                     if (results.length > 0) {
//                         await Employee.insertMany(results);
//                     }
//                     resolve(results); // Return the inserted data
//                 } catch (err) {
//                     console.error(err);
//                     reject(err); // Reject the promise on error
//                 }
//             })
//             .on('error', (err) => {
//                 console.error(err);
//                 reject(err); // Reject the promise on error
//             });
//     });
// }

// // Export the function
// module.exports = csvToDatabase;