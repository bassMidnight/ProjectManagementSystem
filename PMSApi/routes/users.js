var express = require('express');
const employeeModel = require('../models/employee.model');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/employee/:id', async function(req, res, next) {
  try {
    const id = req.params.id;
    const employee = await employeeModel.findOne({eId: id});
    if (!employee) {
      return res.status(404).send({
        status: 404,
        message: "employee not found",
      });
    }
    res.send({
      status: 200,
      message: "success",
      data: [employee],
    });
  }catch (error) {
    next(error);
  }

});

module.exports = router;
