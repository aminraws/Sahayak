const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getMyProfile
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Register
router.post("/register", registerUser);

// Login
// Login
router.post("/login", loginUser);

// Protected profile route
router.get(
    "/profile",
    authMiddleware,
    getMyProfile
);

// Protected customer route
router.get(
    "/customer-only",
    authMiddleware,
    roleMiddleware("customer"),
    (req, res) => {
        res.json({
            message: "Customer route accessed"
        });
    }
);

module.exports = router;