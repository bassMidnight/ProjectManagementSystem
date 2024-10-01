const fs = require('node:fs');
const csv = require('csv-parser');
const Employee = require('../models/employee.model'); // Import your Mongoose model

async function csvToDatabase() {
    const results = [];
    const existingIds = new Set();

    // Load existing employee IDs into a Set
    const existingEmployees = await Employee.find({}, { eId: 1 }); // Fetch only eId
    existingEmployees.forEach(emp => existingIds.add(emp.eId));

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
        fs.createReadStream("./data2.csv", { encoding: 'utf8' }) // Added encoding option
            .pipe(csv())
            .on('data', (data) => {
                //console.log('Raw CSV Data:', data); // Log raw data for debugging
                const mappedData = {};
                for (const csvKey in columnMapping) {
                    if (data[csvKey]) {
                        //console.log(csvKey);
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

                // Check for duplicates using the Set
                if (!existingIds.has(mappedData.eId)) {
                    results.push(mappedData);
                }
            })
            .on('end', async () => {
                // Insert mapped data into MongoDB
                try {
                    if (results.length > 0) {
                        await Employee.insertMany(results);
                        console.log('Data inserted successfully'); // Log successful insertion
                    } else {
                        console.log('No data to insert'); // Log if results is empty
                    }
                    resolve(results); // Return the inserted data
                } catch (err) {
                    console.error('Insertion Error:', err); // Log insertion errors
                    reject(err); // Reject the promise on error
                }
            })
            .on('error', async (err) => {
                console.error('Stream Error:', err); // Log stream errors
                reject(err); // Reject the promise on error
            });
    });
}

// Export the function
module.exports = csvToDatabase;