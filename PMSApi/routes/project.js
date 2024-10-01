var express = require('express');
var router = express.Router();
const readfile = require('../utils/readfile.js'); // Importing the function

const controller = require('../controller/project.js');

// Adding a route for /api/
router.get('/', function(req, res, next) {
  res.send('Project root endpoint');
});

router.get('/projectByUser', async function(req, res, next) {
    try {
        const data = await controller.getProjectByUser();
        // console.log(data);
        res.send(data);
    } catch (error) {
        next(error); 
    }
});


module.exports = router;
