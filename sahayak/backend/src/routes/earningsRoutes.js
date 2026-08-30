const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    getWorkerEarnings
} = require("../controllers/earningsController");


router.get(
    "/",
    authMiddleware,
    roleMiddleware("worker"),
    getWorkerEarnings
);


module.exports = router;