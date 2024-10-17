const express = require("express");
const router = express.Router();
const controller = require("../controller/auth");
const middleware = require("../middleware/auth");

router.post("/login", controller.loginHandler);

router.put("/role", middleware.tokenValidator, controller.changeRole);

//--------------------------------------------------------------------------------//

router.get('/profile', middleware.tokenValidator, controller.getProfile );

router.put('/profile', middleware.tokenValidator, controller.updateProfile );

module.exports = router;