var express = require('express');
var router = express.Router();
const readfile = require('../utils/readfile.js'); // Importing the function

// Adding a route for /api/
router.get('/', function(req, res, next) {
  res.send('API root endpoint');
});

// Existing route for /v1
router.get('/readfile', async function(req, res, next) {
    try {
        const data = await readfile(); // Await the imported function
        console.log(data);
        res.send(data);
    } catch (error) {
        next(error); // Forward error to the error handler
    }
});

// router.get('/v1/home/products', async (req, res) => {
//     try {
//       const products = await productSchema.find().lean().select('name price amount description image');
//       res.status(200).json(statusBlock(200, "OK", products));
//     } catch (error) {
//       res.status(500).json(statusBlock(500, "Internal Server Error", error.message));
//     }
//   }); 

module.exports = router;
