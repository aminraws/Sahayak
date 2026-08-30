const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    createReview,
    getWorkerReviews
} = require("../controllers/reviewController");


router.post(
    "/",
    authMiddleware,
    roleMiddleware("customer"),
    createReview
);


router.get(
    "/worker/:workerId",
    getWorkerReviews
);


module.exports = router;