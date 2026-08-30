const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    createWorkerProfile,
    getWorkers,
    getWorkerById,
    getMyWorkerProfile
} = require("../controllers/workerController");

router.post(
    "/profile",
    authMiddleware,
    roleMiddleware("worker"),
    createWorkerProfile
);

router.get(
    "/profile",
    authMiddleware,
    roleMiddleware("worker"),
    getMyWorkerProfile
);

router.get(
    "/",
    getWorkers
);

router.get(
    "/:id",
    getWorkerById
);

module.exports = router;