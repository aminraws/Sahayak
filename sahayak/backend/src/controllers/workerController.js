const Worker = require("../models/Worker");

const createWorkerProfile = async (req, res) => {
    try {
        const {
            skills,
            experience,
            location,
            hourlyRate,
            description
        } = req.body;

        const existingWorker = await Worker.findOne({
            user: req.user.userId
        });

        if (existingWorker) {
            return res.status(400).json({
                message: "Worker profile already exists"
            });
        }

        const worker = await Worker.create({
            user: req.user.userId,
            skills,
            experience,
            location,
            hourlyRate,
            description
        });

        res.status(201).json({
            message: "Worker profile created successfully",
            worker
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


const getWorkers = async (req, res) => {
    try {
        const { skill, location, maxRate } = req.query;

        const filter = {};

        if (skill) {
            filter.skills = {
                $regex: skill,
                $options: "i"
            };
        }

        if (location) {
            filter.location = {
                $regex: location,
                $options: "i"
            };
        }

        if (maxRate) {
            filter.hourlyRate = {
                $lte: Number(maxRate)
            };
        }

        const workers = await Worker.find(filter)
            .populate("user", "name email phone");

        res.status(200).json({
            count: workers.length,
            workers
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch workers",
            error: error.message
        });
    }
};


const getWorkerById = async (req, res) => {
    try {
        const worker = await Worker.findById(req.params.id)
            .populate("user", "name email phone");

        if (!worker) {
            return res.status(404).json({
                message: "Worker not found"
            });
        }

        res.status(200).json({
            worker
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch worker",
            error: error.message
        });
    }
};
const getMyWorkerProfile = async (req, res) => {
    try {
        const worker = await Worker.findOne({
            user: req.user.userId
        }).populate("user", "name email phone");

        if (!worker) {
            return res.status(404).json({
                message: "Worker profile not found"
            });
        }

        res.status(200).json({
            worker
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch worker profile",
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

        // Only the customer or assigned worker can view it
        const worker = await Worker.findOne({
            user: req.user.userId
        });

        const isCustomer =
            booking.customer._id.toString() === req.user.userId.toString();

        const isWorker =
            worker && booking.worker._id.toString() === worker._id.toString();

        if (!isCustomer && !isWorker) {
            return res.status(403).json({
                message: "You are not authorized to view this booking"
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
    createWorkerProfile,
    getWorkers,
    getWorkerById,
    getMyWorkerProfile,
    getBookingById
};

