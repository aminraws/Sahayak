const Review = require("../models/Review");
const Booking = require("../models/Booking");

const createReview = async (req, res) => {
    try {
        const { booking, rating, comment } = req.body;

        // Find the booking
        const existingBooking = await Booking.findById(booking);

        if (!existingBooking) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        // Make sure the booking belongs to this customer
        if (
            existingBooking.customer.toString() !==
            req.user.userId.toString()
        ) {
            return res.status(403).json({
                message: "You are not authorized to review this booking"
            });
        }

        // Review only after completed work
        if (existingBooking.status !== "completed") {
            return res.status(400).json({
                message: "You can review only completed bookings"
            });
        }

        // Check if review already exists
        const alreadyReviewed = await Review.findOne({
            booking
        });

        if (alreadyReviewed) {
            return res.status(400).json({
                message: "This booking has already been reviewed"
            });
        }

        const review = await Review.create({
            customer: req.user.userId,
            worker: existingBooking.worker,
            booking,
            rating,
            comment
        });

        res.status(201).json({
            message: "Review created successfully",
            review
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


const getWorkerReviews = async (req, res) => {
    try {
        const reviews = await Review.find({
            worker: req.params.workerId
        })
            .populate("customer", "name")
            .sort({ createdAt: -1 });

        const totalReviews = reviews.length;

        const totalRating = reviews.reduce(
            (sum, review) => sum + review.rating,
            0
        );

        const averageRating =
            totalReviews > 0
                ? Number((totalRating / totalReviews).toFixed(1))
                : 0;

        res.status(200).json({
            totalReviews,
            averageRating,
            reviews
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch reviews",
            error: error.message
        });
    }
};

module.exports = {
    createReview,
    getWorkerReviews
};