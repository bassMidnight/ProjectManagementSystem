const fs = require('node:fs');
const csv = require('csv-parser');
const Employee = require('../models/employee.model'); // Import your Mongoose model

async function csvToDatabase() {
    const results = [];

    // Define the mapping from CSV columns to Mongoose schema fields
    const columnMapping = {
        "รหัสพนักงาน": "eId",
        "ชื่อ": "name",
        "นามสกุล": "surname",
        "ชื่อเล่น": "shortname",
        "ศูนย์": "branch",
        "ตำแหน่งงาน": "position",
        "ทีม": "department",
        "วันที่เริ่มงาน": "startDate",
        "Outsource": "onBoard",
    };

    return new Promise((resolve, reject) => {
        fs.createReadStream("../data.csv")
            .pipe(csv())
            .on('data', async (data) => {
                const mappedData = {};
                const projectmappedData = {};
                for (const csvKey in columnMapping) {
                    if (data[csvKey]) {
                        if (csvKey === "วันที่เริ่มงาน") { // Assuming this is startDate
                            const [day, month, year] = data[csvKey].split('-');
                            mappedData[columnMapping[csvKey]] = new Date(`${year}-${month}-${day}`);
                        } else if (csvKey === "Outsource") { // Assuming this is onBoard
                            mappedData[columnMapping[csvKey]] = data[csvKey] === "รับงานแล้ว" ? true : false;
                        } else {
                            mappedData[columnMapping[csvKey]] = data[csvKey];
                        }
                    }
                }

                // Check if eId already exists in the database
                const existingEmployee = await Employee.findOne({ eId: mappedData.eId });
                if (!existingEmployee) {
                    results.push(mappedData); // Only push if it doesn't exist
                } else {
                    //console.log(`Employee with eId ${mappedData.eId} already exists. Skipping...`);
                }
            })
            .on('end', async () => {
                try {
                    // Insert mapped data into MongoDB
                    if (results.length > 0) {
                        await Employee.insertMany(results);
                    }
                    resolve(results); // Return the inserted data
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