const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        worker: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Worker",
            required: true
        },

        service: {
            type: String,
            required: true
        },

        date: {
            type: Date,
            required: true
        },

        address: {
            type: String,
            required: true
        },

        description: {
            type: String
        },

        status: {
            type: String,
            enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
            default: "pending"
        },

        totalAmount: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Booking", bookingSchema);