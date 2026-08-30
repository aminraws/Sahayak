const Booking = require("../models/Booking");
const Worker = require("../models/Worker");

const getWorkerEarnings = async (req, res) => {
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
            worker: worker._id,
            status: "completed"
        });

        const totalEarnings = bookings.reduce(
            (total, booking) => total + booking.totalAmount,
            0
        );

        res.status(200).json({
            totalEarnings,
            completedBookings: bookings.length,
            bookings
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch earnings",
            error: error.message
        });
    }
};

module.exports = {
    getWorkerEarnings
};