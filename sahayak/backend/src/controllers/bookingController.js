const Booking = require("../models/Booking");
const Worker = require("../models/Worker");
const Review = require("../models/Review");

const createBooking = async (req, res) => {
    try {
        const {
            worker,
            service,
            date,
            time,
            address,
            description,
            totalAmount
        } = req.body;

        const booking = await Booking.create({
            customer: req.user.userId,
            worker,
            service,
            date,
            time,
            address,
            description,
            totalAmount
        });

        res.status(201).json({
            message: "Booking created successfully",
            booking
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({
            customer: req.user.userId
        })
        .populate("worker");

        res.status(200).json({
            bookings
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch bookings",
            error: error.message
        });
    }
};
const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const worker = await Worker.findOne({
            user: req.user.userId
        });

        if (!worker) {
            return res.status(404).json({
                message: "Worker profile not found"
            });
        }

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        if (booking.worker.toString() !== worker._id.toString()) {
            return res.status(403).json({
                message: "You are not authorized to update this booking"
            });
        }

        const allowedTransitions = {
            pending: ["accepted", "rejected"],
            accepted: ["completed"]
        };

        const currentStatus = booking.status;

        if (
            !allowedTransitions[currentStatus] ||
            !allowedTransitions[currentStatus].includes(status)
        ) {
            return res.status(400).json({
                message: `Cannot change status from ${currentStatus} to ${status}`
            });
        }

        booking.status = status;

        await booking.save();

        res.status(200).json({
            message: "Booking status updated successfully",
            booking
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

const getWorkerBookings = async (req, res) => {
    try {
        const worker = await Worker.findOne({
            user: req.user.userId
        });

        if (!worker) {
            return res.status(404).json({
                message: "Worker profile not found"
            });
        }

        const bookings = await Booking.find({
            worker: worker._id
        })
        .populate("customer", "name email phone");

        res.status(200).json({
            bookings
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch worker bookings",
            error: error.message
        });
    }
};
const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        // Check that this booking belongs to the logged-in customer
        if (booking.customer.toString() !== req.user.userId.toString()) {
            return res.status(403).json({
                message: "You are not authorized to cancel this booking"
            });
        }

        // Don't allow cancellation after completion/rejection
        if (booking.status === "completed") {
            return res.status(400).json({
                message: "Completed booking cannot be cancelled"
            });
        }

        if (booking.status === "rejected") {
            return res.status(400).json({
                message: "Rejected booking cannot be cancelled"
            });
        }

        booking.status = "cancelled";

        await booking.save();

        res.status(200).json({
            message: "Booking cancelled successfully",
            booking
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};
const getCustomerDashboard = async (req, res) => {
    try {
        const bookings = await Booking.find({
            customer: req.user.userId
        });

        const stats = {
            total: bookings.length,
            pending: 0,
            accepted: 0,
            completed: 0,
            rejected: 0,
            cancelled: 0
        };

        bookings.forEach((booking) => {
            if (stats[booking.status] !== undefined) {
                stats[booking.status]++;
            }
        });

        res.status(200).json({
            stats
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch dashboard",
            error: error.message
        });
    }
};
const getWorkerDashboard = async (req, res) => {
    try {
        const worker = await Worker.findOne({
            user: req.user.userId
        });

        if (!worker) {
            return res.status(404).json({
                message: "Worker profile not found"
            });
        }

        const bookings = await Booking.find({
            worker: worker._id
        });

        const stats = {
            total: bookings.length,
            pending: 0,
            accepted: 0,
            completed: 0,
            rejected: 0,
            cancelled: 0
        };

        let totalEarnings = 0;

        bookings.forEach((booking) => {
            if (stats[booking.status] !== undefined) {
                stats[booking.status]++;
            }

            if (booking.status === "completed") {
                totalEarnings += booking.totalAmount || 0;
            }
        });

        const reviews = await Review.find({
            worker: worker._id
        });

        const totalReviews = reviews.length;

        const averageRating =
            totalReviews > 0
                ? Number(
                    (
                        reviews.reduce(
                            (sum, review) => sum + review.rating,
                            0
                        ) / totalReviews
                    ).toFixed(1)
                )
                : 0;

        res.status(200).json({
            stats,
            totalEarnings,
            totalReviews,
            averageRating
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch worker dashboard",
            error: error.message
        });
    }
};
const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate("customer", "name email phone")
            .populate("worker");

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        res.status(200).json({
            booking
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch booking",
            error: error.message
        });
    }
};
module.exports = {
    createBooking,
    getMyBookings,
    getWorkerBookings,
    updateBookingStatus,
    cancelBooking,
    getCustomerDashboard,
    getWorkerDashboard,
    getBookingById
};