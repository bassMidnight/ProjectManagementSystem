const mongoose = require('mongoose');

const DB_HOST = process.env.DB || '127.0.0.1';
const DB_PORT = process.env.DB_PORT || '27017';
const DB_NAME = process.env.DB_NAME || 'PMS';

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(`mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`);
  console.log("Connected to DB");

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}
