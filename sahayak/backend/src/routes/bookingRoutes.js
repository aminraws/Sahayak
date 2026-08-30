const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    createBooking,
    getMyBookings,
    getWorkerBookings,
    updateBookingStatus,
    cancelBooking,
    getCustomerDashboard,
    getWorkerDashboard,
    getBookingById
} = require("../controllers/bookingController");

// Customer creates booking
router.post(
    "/",
    authMiddleware,
    roleMiddleware("customer"),
    createBooking
);

// Customer bookings
router.get(
    "/my",
    authMiddleware,
    roleMiddleware("customer"),
    getMyBookings
);

// Worker bookings
router.get(
    "/worker",
    authMiddleware,
    roleMiddleware("worker"),
    getWorkerBookings
);

// Customer dashboard
router.get(
    "/dashboard/customer",
    authMiddleware,
    roleMiddleware("customer"),
    getCustomerDashboard
);

// Worker dashboard
router.get(
    "/dashboard/worker",
    authMiddleware,
    roleMiddleware("worker"),
    getWorkerDashboard
);

// Worker updates status
router.patch(
    "/:id/status",
    authMiddleware,
    roleMiddleware("worker"),
    updateBookingStatus
);

// Customer cancels
router.patch(
    "/:id/cancel",
    authMiddleware,
    roleMiddleware("customer"),
    cancelBooking
);
router.get(
    "/:id",
    authMiddleware,
    getBookingById
);

module.exports = router;